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
   - Copy `.env.example` to `.env`
   - Fill in your Firebase configuration values:
     - REACT_APP_FIREBASE_API_KEY
     - REACT_APP_FIREBASE_AUTH_DOMAIN
     - REACT_APP_FIREBASE_PROJECT_ID
     - REACT_APP_FIREBASE_STORAGE_BUCKET
     - REACT_APP_FIREBASE_MESSAGING_SENDER_ID
     - REACT_APP_FIREBASE_APP_ID

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