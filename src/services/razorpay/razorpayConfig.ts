// Razorpay configuration and utilities
export const RAZORPAY_CONFIG = {
  keyId: process.env.REACT_APP_RAZORPAY_KEY_ID || '',
};

// Razorpay payment options interface
export interface RazorpayOptions {
  key: string;
  amount: number; // Amount in paise
  currency: string;
  name: string;
  description: string;
  order_id?: string; // Optional — only needed for server-created orders
  handler: (response: RazorpayResponse) => void;
  modal?: {
    ondismiss?: () => void;
  };
  prefill: {
    name: string;
    email: string;
    contact?: string;
  };
  theme: {
    color: string;
  };
}

// Razorpay payment response interface
// order_id and signature are only present when an order_id was passed to checkout
export interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id?: string;
  razorpay_signature?: string;
}

// Helper function to load Razorpay script (idempotent)
export const loadRazorpayScript = (): Promise<boolean> => {
  if (window.Razorpay) return Promise.resolve(true);
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

// Helper function to create Razorpay checkout options
export const createPaymentOptions = (
  amount: number,
  orderId: string,
  activityName: string,
  userEmail: string,
  userName: string,
  onSuccess: (response: RazorpayResponse) => void,
  onDismiss: () => void
): RazorpayOptions => {
  return {
    key: RAZORPAY_CONFIG.keyId,
    amount, // Amount in paise
    currency: 'INR',
    name: 'Floc',
    description: `Payment for ${activityName}`,
    order_id: orderId,
    handler: onSuccess,
    modal: {
      ondismiss: onDismiss,
    },
    prefill: {
      name: userName,
      email: userEmail,
    },
    theme: {
      color: '#0D9488',
    },
  };
};
