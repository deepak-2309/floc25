/**
 * Payment-related type definitions for Floc (Razorpay integration)
 */

/**
 * Request data for creating a payment order.
 */
export interface CreateOrderRequest {
    amount: number;       // Amount in paise
    currency: string;
    activityId: string;
    activityName: string;
}

/**
 * Request data for verifying a payment.
 */
export interface VerifyPaymentRequest {
    razorpay_payment_id: string;
    razorpay_order_id: string;
    razorpay_signature: string;
    activityId: string;
}

