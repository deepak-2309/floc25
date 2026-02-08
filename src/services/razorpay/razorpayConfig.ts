// Razorpay configuration and utilities
export const RAZORPAY_CONFIG = {
  // Get from Razorpay Dashboard
  keyId: process.env.REACT_APP_RAZORPAY_KEY_ID || '',
  keySecret: process.env.REACT_APP_RAZORPAY_KEY_SECRET || '',
  // Webhook secret for payment verification
  webhookSecret: process.env.REACT_APP_RAZORPAY_WEBHOOK_SECRET || '',
  // Base URL for your backend
  backendUrl: process.env.REACT_APP_BACKEND_URL || 'http://localhost:3001',
};

// Razorpay payment options interface
export interface RazorpayOptions {
  key: string;
  amount: number; // Amount in paise
  currency: string;
  name: string;
  description: string;
  order_id: string;
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
  method: {
    upi: boolean;
    card: boolean;
    netbanking: boolean;
    wallet: boolean;
  };
}

// Razorpay payment response interface
export interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

// Helper function to load Razorpay script
export const loadRazorpayScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

// Helper function to create Razorpay order options
export const createPaymentOptions = (
  orderId: string,
  amount: number,
  activityName: string,
  userEmail: string,
  userName: string,
  onSuccess: (response: RazorpayResponse) => void,
  onError: (error: any) => void
): RazorpayOptions => {
  return {
    key: RAZORPAY_CONFIG.keyId,
    amount: amount, // Amount in paise
    currency: 'INR',
    name: 'Floc',
    description: `Payment for ${activityName}`,
    order_id: orderId,
    handler: onSuccess,
    modal: {
      ondismiss: () => {
        console.log('Payment modal closed');
        onError('Payment cancelled by user');
      }
    },
    prefill: {
      name: userName,
      email: userEmail,
    },
    theme: {
      color: '#A06B89', // Using the app's primary color
    },
    method: {
      upi: true,
      card: true,
      netbanking: true,
      wallet: true,
    },
  };
}; 