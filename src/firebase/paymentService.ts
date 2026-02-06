import { doc, updateDoc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { db } from './config';
import { getCurrentUserData, getCurrentUserOrThrow } from './authUtils';
import {
  loadRazorpayScript,
  createPaymentOptions,
  RazorpayResponse
} from './razorpayConfig';

declare global {
  interface Window {
    Razorpay: any;
  }
}

// Interface for creating a payment order
export interface CreateOrderRequest {
  amount: number; // Amount in paise
  currency: string;
  activityId: string;
  activityName: string;
}

// Interface for payment verification
export interface VerifyPaymentRequest {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
  activityId: string;
}

/**
 * Creates a Razorpay order for payment processing
 * In a production app, this should be done via a secure backend API
 * For now, we'll simulate order creation on the frontend
 */
export const createPaymentOrder = async (orderData: CreateOrderRequest): Promise<string> => {
  // In production, this should call your backend API to create a Razorpay order
  // For demo purposes, we'll generate a mock order ID
  // Replace this with actual Razorpay order creation API call

  const mockOrderId = `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  // Store order details in Firestore for verification later
  const currentUser = getCurrentUserOrThrow();
  const orderRef = doc(db, 'payment_orders', mockOrderId);

  await setDoc(orderRef, {
    orderId: mockOrderId,
    amount: orderData.amount,
    currency: orderData.currency,
    activityId: orderData.activityId,
    userId: currentUser.uid,
    status: 'created',
    createdAt: serverTimestamp()
  });

  return mockOrderId;
};

/**
 * Initiates payment flow using Razorpay
 */
export const initiatePayment = async (
  activityId: string,
  activityName: string,
  amount: number
): Promise<void> => {
  const currentUser = getCurrentUserOrThrow();
  const userData = await getCurrentUserData();

  // Load Razorpay script
  const isScriptLoaded = await loadRazorpayScript();
  if (!isScriptLoaded) {
    throw new Error('Failed to load Razorpay SDK. Please check your internet connection.');
  }

  // Create payment order
  const orderId = await createPaymentOrder({
    amount,
    currency: 'INR',
    activityId,
    activityName
  });

  // Create payment options
  const options = createPaymentOptions(
    orderId,
    amount,
    activityName,
    currentUser.email || '',
    userData?.username || currentUser.email || 'User',
    async (response: RazorpayResponse) => {
      // Handle successful payment
      await handlePaymentSuccess(response, activityId);
    },
    (error: any) => {
      // Handle payment failure
      console.error('Payment failed:', error);
      throw new Error('Payment failed. Please try again.');
    }
  );

  // Create and open Razorpay checkout
  const razorpay = new window.Razorpay(options);
  razorpay.open();
};

/**
 * Handles successful payment response
 */
export const handlePaymentSuccess = async (
  paymentResponse: RazorpayResponse,
  activityId: string
): Promise<void> => {
  const currentUser = getCurrentUserOrThrow();
  const userData = await getCurrentUserData();

  // Verify payment (in production, this should be done on the backend)
  const isPaymentValid = await verifyPayment({
    razorpay_payment_id: paymentResponse.razorpay_payment_id,
    razorpay_order_id: paymentResponse.razorpay_order_id,
    razorpay_signature: paymentResponse.razorpay_signature,
    activityId
  });

  if (!isPaymentValid) {
    throw new Error('Payment verification failed');
  }

  // Update activity with payment information
  const activityRef = doc(db, 'activities', activityId);
  const activityDoc = await getDoc(activityRef);

  if (!activityDoc.exists()) {
    throw new Error('Activity not found');
  }

  const activityData = activityDoc.data();
  const updatedJoiners = {
    ...activityData.joiners,
    [currentUser.uid]: {
      email: currentUser.email,
      username: userData?.username || null,
      joinedAt: new Date().toISOString(),
      paymentStatus: 'completed',
      paymentId: paymentResponse.razorpay_payment_id,
      razorpayOrderId: paymentResponse.razorpay_order_id,
      paidAmount: activityData.cost,
      paidAt: new Date().toISOString()
    }
  };

  // Update payment details
  const currentParticipantCount = activityData.paymentDetails?.participantCount || 0;
  const currentTotalCollected = activityData.paymentDetails?.totalCollected || 0;

  await updateDoc(activityRef, {
    joiners: updatedJoiners,
    paymentDetails: {
      participantCount: currentParticipantCount + 1,
      totalCollected: currentTotalCollected + activityData.cost
    }
  });

  console.log('Payment successful and activity updated');
};

/**
 * Verifies payment signature (simplified version)
 * In production, this should be done on a secure backend
 */
export const verifyPayment = async (verificationData: VerifyPaymentRequest): Promise<boolean> => {
  // This is a simplified verification for demo purposes
  // In production, you should verify the payment signature on your backend
  // using Razorpay's webhook verification or their Node.js SDK

  try {
    // Get order details from Firestore
    const orderRef = doc(db, 'payment_orders', verificationData.razorpay_order_id);
    const orderDoc = await getDoc(orderRef);

    if (!orderDoc.exists()) {
      console.error('Order not found');
      return false;
    }

    const orderData = orderDoc.data();
    if (orderData.activityId !== verificationData.activityId) {
      console.error('Activity ID mismatch');
      return false;
    }

    // Update order status
    await updateDoc(orderRef, {
      status: 'completed',
      paymentId: verificationData.razorpay_payment_id,
      signature: verificationData.razorpay_signature,
      completedAt: serverTimestamp()
    });

    return true;
  } catch (error) {
    console.error('Payment verification error:', error);
    return false;
  }
};

/**
 * Checks if user has completed payment for an activity
 */
export const hasUserPaid = (activityData: any, userId: string): boolean => {
  const joiner = activityData.joiners?.[userId];
  return joiner?.paymentStatus === 'completed';
}; 