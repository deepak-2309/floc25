const { onCall, HttpsError } = require('firebase-functions/v1/https');
const admin = require('firebase-admin');
const Razorpay = require('razorpay');

if (!admin.apps.length) {
  admin.initializeApp();
}

const getRazorpay = () =>
  new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });

/**
 * Creates a Razorpay order server-side and returns the order ID to the frontend.
 * The frontend then passes this order ID to the Razorpay checkout modal.
 */
exports.createRazorpayOrder = onCall(async (data, context) => {
  if (!context.auth) {
    throw new HttpsError('unauthenticated', 'You must be logged in to make a payment.');
  }

  const { amount, currency = 'INR', activityId } = data;

  if (!amount || amount < 100) {
    throw new HttpsError('invalid-argument', 'Amount must be at least ₹1 (100 paise).');
  }

  if (!activityId) {
    throw new HttpsError('invalid-argument', 'activityId is required.');
  }

  const razorpay = getRazorpay();

  const order = await razorpay.orders.create({
    amount,
    currency,
    receipt: `floc_${activityId.slice(0, 20)}_${Date.now().toString().slice(-8)}`,
  });

  return { orderId: order.id };
});

/**
 * CUJ-4: Initiates a Razorpay refund for a single departed participant.
 * Called by the creator from the ParticipantManagement UI.
 * The client sets refundStatus to 'processing' and stores the refundId after this returns.
 */
exports.initiateRazorpayRefund = onCall(async (data, context) => {
  if (!context.auth) {
    throw new HttpsError('unauthenticated', 'You must be logged in.');
  }

  const { activityId, targetUserId, paymentId, amount } = data;

  if (!activityId || !targetUserId || !paymentId || !amount) {
    throw new HttpsError('invalid-argument', 'activityId, targetUserId, paymentId, and amount are required.');
  }

  const db = admin.firestore();
  const activityDoc = await db.collection('activities').doc(activityId).get();

  if (!activityDoc.exists) {
    throw new HttpsError('not-found', 'Activity not found.');
  }

  const activity = activityDoc.data();

  if (activity.userId !== context.auth.uid) {
    throw new HttpsError('permission-denied', 'Only the activity creator can issue refunds.');
  }

  const departed = activity.departedJoiners?.[targetUserId];
  if (!departed) {
    throw new HttpsError('not-found', 'Departed participant not found.');
  }
  if (departed.refundStatus !== 'pending') {
    throw new HttpsError('failed-precondition', 'Refund already initiated or not applicable.');
  }

  const razorpay = getRazorpay();
  const refund = await razorpay.payments.refund(paymentId, { amount });

  return { refundId: refund.id };
});

/**
 * CUJ-5: Soft-cancels an activity and issues Razorpay refunds for all paid participants.
 * Handles:
 *   - Active paid joiners: refunded and moved to departedJoiners
 *   - Departed joiners with refundStatus 'pending': refunded
 * Sets activity status to 'cancelled'.
 */
exports.cancelActivityAndRefund = onCall(async (data, context) => {
  if (!context.auth) {
    throw new HttpsError('unauthenticated', 'You must be logged in.');
  }

  const { activityId } = data;

  if (!activityId) {
    throw new HttpsError('invalid-argument', 'activityId is required.');
  }

  const db = admin.firestore();
  const activityRef = db.collection('activities').doc(activityId);
  const activityDoc = await activityRef.get();

  if (!activityDoc.exists) {
    throw new HttpsError('not-found', 'Activity not found.');
  }

  const activity = activityDoc.data();

  if (activity.userId !== context.auth.uid) {
    throw new HttpsError('permission-denied', 'Only the activity creator can cancel this event.');
  }

  if (activity.status === 'cancelled') {
    throw new HttpsError('failed-precondition', 'Activity is already cancelled.');
  }

  const razorpay = getRazorpay();
  const now = new Date().toISOString();
  const updates = { status: 'cancelled' };

  // Refund all active paid joiners (skip creator who paid 0)
  const joiners = activity.joiners || {};
  for (const [userId, joiner] of Object.entries(joiners)) {
    if (userId === activity.userId) continue;
    if (!joiner.paymentId || !joiner.paidAmount || joiner.paidAmount <= 0) continue;

    const refund = await razorpay.payments.refund(joiner.paymentId, { amount: joiner.paidAmount });

    updates[`departedJoiners.${userId}`] = {
      email: joiner.email,
      username: joiner.username || null,
      joinedAt: joiner.joinedAt,
      departedAt: now,
      departedReason: 'left',
      paidAmount: joiner.paidAmount,
      paymentId: joiner.paymentId,
      refundStatus: 'processing',
      refundId: refund.id,
    };
    updates[`joiners.${userId}`] = admin.firestore.FieldValue.delete();
  }

  // Refund departed joiners with pending refunds
  const departedJoiners = activity.departedJoiners || {};
  for (const [userId, departed] of Object.entries(departedJoiners)) {
    if (departed.refundStatus !== 'pending' || !departed.paymentId) continue;

    const refund = await razorpay.payments.refund(departed.paymentId, { amount: departed.paidAmount });

    updates[`departedJoiners.${userId}.refundStatus`] = 'processing';
    updates[`departedJoiners.${userId}.refundId`] = refund.id;
  }

  await activityRef.update(updates);

  return { success: true };
});
