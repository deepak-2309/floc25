# Mobile Activity App

A mobile-friendly web application built with React and Material-UI that allows users to track activities and connect with friends.

## Features

- Mobile-first design following Material Design guidelines
- Authentication system with Google Sign-in
- Bottom navigation with three main sections:
  - My Activities
  - Friends' Activities
  - Profile
- Sign out functionality
- **NEW: Paid Activities with Razorpay Integration**
  - Create paid activities with custom pricing
  - Secure UPI payments using Razorpay Turbo UPI
  - Payment status tracking and verification
  - Real-time payment collection analytics

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Firebase project (for authentication)

### Installation

1. Clone the repository
2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
   - Create a `.env` file in the root directory
   - Fill in your Firebase configuration values:
     - REACT_APP_FIREBASE_API_KEY
     - REACT_APP_FIREBASE_AUTH_DOMAIN
     - REACT_APP_FIREBASE_PROJECT_ID
     - REACT_APP_FIREBASE_STORAGE_BUCKET
     - REACT_APP_FIREBASE_MESSAGING_SENDER_ID
     - REACT_APP_FIREBASE_APP_ID
   - Add Razorpay configuration (for paid activities feature):
     - REACT_APP_RAZORPAY_KEY_ID
     - REACT_APP_RAZORPAY_KEY_SECRET
     - REACT_APP_RAZORPAY_WEBHOOK_SECRET

### Running the App

To start the development server:
```bash
npm start
```

The app will be available at [http://localhost:3000](http://localhost:3000)

### Building for Production

To create a production build:
```bash
npm run build
```

## Project Structure

```
src/
  ├── components/     # React components
  │   ├── Login.tsx
  │   ├── MyActivities.tsx
  │   ├── FriendsActivities.tsx
  │   └── Profile.tsx
  ├── App.tsx        # Main app component
  ├── index.tsx      # Entry point
  ├── firebase.ts    # Firebase configuration
  └── theme.ts       # Material-UI theme configuration
```

## Technologies Used

- React
- TypeScript
- Material-UI (MUI)
- React Router
- Firebase Authentication
- Firebase Firestore
- Razorpay (Payment Gateway)
- Razorpay Turbo UPI

## Paid Activities Setup

To enable paid activities with Razorpay integration:

1. **Create Razorpay Account**: Sign up at [Razorpay Dashboard](https://dashboard.razorpay.com/)

2. **Request Turbo UPI Feature**: Raise a request with Razorpay support to activate Turbo UPI on your account (as mentioned in the [Razorpay Turbo UPI documentation](https://razorpay.com/docs/payments/payment-methods/upi/turbo-upi/))

3. **Get API Keys**: 
   - Navigate to Settings > API Keys in Razorpay Dashboard
   - Generate Test/Live API keys
   - Add them to your `.env` file

4. **Configure Webhooks**: Set up webhook endpoints for payment verification (for production deployment)

5. **Test Payments**: Use Razorpay test mode for development and testing

## Note on Security

⚠️ **Important**: The current implementation includes simplified payment verification for demo purposes. For production use:

- Implement proper backend API for order creation
- Use server-side payment verification
- Set up Razorpay webhooks for payment confirmation
- Implement proper error handling and retry mechanisms 