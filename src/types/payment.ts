/**
 * Payment-related type definitions for Floc (Razorpay integration)
 */

/**
 * Request data for creating a payment order.
 * Kept for potential future server-side order creation.
 */
export interface CreateOrderRequest {
    amount: number;       // Amount in paise
    currency: string;
    activityId: string;
    activityName: string;
}
