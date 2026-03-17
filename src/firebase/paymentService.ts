import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { db, functions } from './config';
import { getCurrentUserData, getCurrentUserOrThrow } from './authUtils';
import { loadRazorpayScript, createPaymentOptions, RazorpayResponse } from '../services/razorpay/razorpayConfig';

declare global {
  interface Window {
    Razorpay: any;
  }
}

/**
 * Records a completed payment and adds the user to the activity's joiners.
 * Called automatically after Razorpay reports a successful payment.
 */
export const handlePaymentSuccess = async (
  paymentResponse: RazorpayResponse,
  activityId: string
): Promise<void> => {
  const currentUser = getCurrentUserOrThrow();
  const userData = await getCurrentUserData();

  const activityRef = doc(db, 'activities', activityId);
  const activityDoc = await getDoc(activityRef);

  if (!activityDoc.exists()) {
    throw new Error('Activity not found');
  }

  const activityData = activityDoc.data();
  const currentParticipantCount = activityData.paymentDetails?.participantCount || 0;
  const currentTotalCollected = activityData.paymentDetails?.totalCollected || 0;

  await updateDoc(activityRef, {
    [`joiners.${currentUser.uid}`]: {
      email: currentUser.email,
      username: userData?.username || null,
      joinedAt: new Date().toISOString(),
      paymentStatus: 'completed',
      paymentId: paymentResponse.razorpay_payment_id,
      paidAmount: activityData.cost,
      paidAt: new Date().toISOString(),
    },
    paymentDetails: {
      participantCount: currentParticipantCount + 1,
      totalCollected: currentTotalCollected + activityData.cost,
    },
  });
};

/**
 * Opens the Razorpay payment modal and waits for the user to complete or cancel payment.
 * Resolves when payment succeeds and Firestore has been updated.
 * Rejects when the user cancels or payment fails.
 */
export const initiatePayment = (
  activityId: string,
  activityName: string,
  amount: number
): Promise<void> => {
  return new Promise(async (resolve, reject) => {
    try {
      const currentUser = getCurrentUserOrThrow();
      const userData = await getCurrentUserData();

      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) {
        reject(new Error('Failed to load Razorpay. Please check your internet connection.'));
        return;
      }

      // Get a real Razorpay order ID from the server
      const createOrder = httpsCallable<
        { amount: number; currency: string; activityId: string },
        { orderId: string }
      >(functions, 'createRazorpayOrder');
      const result = await createOrder({ amount, currency: 'INR', activityId });
      const orderId = result.data.orderId;

      const options = createPaymentOptions(
        amount,
        orderId,
        activityName,
        currentUser.email || '',
        userData?.username || currentUser.email || 'User',
        async (response: RazorpayResponse) => {
          try {
            await handlePaymentSuccess(response, activityId);
            resolve();
          } catch (err) {
            reject(err);
          }
        },
        () => {
          reject(new Error('Payment was cancelled.'));
        }
      );

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      reject(err);
    }
  });
};

/**
 * Checks if a user has already paid for an activity.
 */
export const hasUserPaid = (activityData: any, userId: string): boolean => {
  return activityData.joiners?.[userId]?.paymentStatus === 'completed';
};

/**
 * Initiates a refund for a departed participant via a Cloud Function.
 * Sets refundStatus to 'processing' in Firestore; the webhook/CF will update to 'completed'.
 */
export const initiateRefund = async (
  activityId: string,
  targetUserId: string
): Promise<void> => {
  const activityRef = doc(db, 'activities', activityId);
  const activityDoc = await getDoc(activityRef);

  if (!activityDoc.exists()) {
    throw new Error('Activity not found');
  }

  const activityData = activityDoc.data();
  const departed = activityData.departedJoiners?.[targetUserId];

  if (!departed) {
    throw new Error('Departed participant not found');
  }
  if (!departed.paymentId) {
    throw new Error('No payment ID found for this participant');
  }
  if (departed.refundStatus !== 'pending') {
    throw new Error('Refund already initiated or not applicable');
  }

  // Call the Cloud Function to trigger the Razorpay refund
  const triggerRefund = httpsCallable<
    { activityId: string; targetUserId: string; paymentId: string; amount: number },
    { refundId: string }
  >(functions, 'initiateRazorpayRefund');

  const result = await triggerRefund({
    activityId,
    targetUserId,
    paymentId: departed.paymentId,
    amount: departed.paidAmount,
  });

  // Mark as processing with the Razorpay refund ID
  await updateDoc(activityRef, {
    [`departedJoiners.${targetUserId}.refundStatus`]: 'processing',
    [`departedJoiners.${targetUserId}.refundId`]: result.data.refundId,
  });
};
