# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Install dependencies
npm install

# Start development server (binds to 0.0.0.0 with host check disabled)
npm start

# Production build
npm run build

# Run tests (interactive watch mode)
npm test

# Run a single test file
npm test -- --testPathPattern=<filename>
```

The dev server runs on `http://localhost:3000`.

## Environment Setup

Create a `.env` file with:
```
REACT_APP_FIREBASE_API_KEY=
REACT_APP_FIREBASE_AUTH_DOMAIN=
REACT_APP_FIREBASE_PROJECT_ID=
REACT_APP_FIREBASE_STORAGE_BUCKET=
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=
REACT_APP_FIREBASE_APP_ID=
REACT_APP_RAZORPAY_KEY_ID=
REACT_APP_RAZORPAY_KEY_SECRET=
REACT_APP_RAZORPAY_WEBHOOK_SECRET=
```

Note: The `.env.example` file uses `VITE_` prefixes, but the actual app uses `REACT_APP_` prefixes (Create React App convention).

## Architecture Overview

**Floc** is a mobile-first React/TypeScript social activity app (max 480px width) where users create/join activities and connect with friends.

### Auth & Routing (`src/App.tsx`)

- Firebase Google Sign-In authentication
- Two route trees: unauthenticated (landing/login/legal/activity preview) and authenticated (my-plans/friends-activities/profile)
- On login, `updateUserData` is called to upsert the user doc in Firestore; default username derived from email prefix
- Routes are defined in a single `ROUTES` constant at the top of `App.tsx`

### Data Layer

**`src/firebase/`** — all Firestore interactions:
- `config.ts` — exports `auth`, `db`, `googleProvider`
- `authUtils.ts` — `getCurrentUserOrThrow()`, `getCurrentUserData()`, `updateUserData()`
- `activities/` — split into `crud.ts`, `queries.ts`, `joins.ts`, re-exported via `index.ts`
- `activityActions.ts` — higher-level activity actions used by hooks
- `userActions.ts` — user profile and connection operations
- `paymentService.ts` — Razorpay order creation and payment verification

**`src/services/razorpay/razorpayConfig.ts`** — Razorpay SDK initialization

### Custom Hooks (`src/hooks/`)

- `useActivities(options)` — fetches and manages activity lists; `source: 'user' | 'connections'`; exposes `reload`, `joinToggle`, `isJoined`
- `useConnections()` — manages the user's connections list
- `useAsyncAction()` — generic loading/error state wrapper for one-off async operations

### Components (`src/components/`)

Organized by domain, each folder has an `index.ts` barrel:
- `pages/` — top-level route components (MyActivities, FriendsActivities, Profile, ActivityPage, LandingPage, Login, LegalPage)
- `activities/` — ActivityCard, ActivityForm, CreateActivitySheet, EditActivitySheet, PastActivities
- `connections/` — AddConnectionDialog, ConnectionsList, DeleteConnectionDialog
- `landing/` — HeroSection, FeaturesGrid, Footer, SquashBallIcon
- `profile/` — UserProfile
- `shared/` — CollapsibleSection

### Types (`src/types/`)

Central barrel at `src/types/index.ts`. Key types:
- `Activity` — includes optional `isPaid`, `cost` (in paise), `joiners` map keyed by userId
- `ActivityJoiner` — includes optional `paymentStatus`, `razorpayOrderId`
- `Connection` / `UserConnection` / `UserProfile`

### Theme (`src/theme.ts`)

Material Design 3-inspired MUI theme. Primary color: `#0D9488` (teal). Secondary: `#F97316` (coral). Font: Inter. Global 480px max-width constraint is enforced in both `App.tsx` layout and `MuiDrawer` paper styles.

### Firestore Security Rules (`firestore.rules`)

- `users/{userId}` — authenticated users can read all; write/update own doc; update others' `connections` field only
- `activities/{activityId}` — authenticated read/create/list; update by owner (full) or anyone for `joiners`/`paymentDetails` fields; delete by owner only
- `payment_orders/{orderId}` — authenticated create; read/write own orders only
