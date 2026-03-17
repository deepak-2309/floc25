const { onCall, HttpsError } = require('firebase-functions/v1/https');
const Razorpay = require('razorpay');

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

  const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });

  const order = await razorpay.orders.create({
    amount,
    currency,
    receipt: `floc_${activityId.slice(0, 20)}_${Date.now().toString().slice(-8)}`,
  });

  return { orderId: order.id };
});
