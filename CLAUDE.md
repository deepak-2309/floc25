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

# Deploy Cloud Functions
cd functions && npm install
firebase deploy --only functions
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

Cloud Functions use server-side env vars (set via `firebase functions:config:set` or Firebase environment):
```
RAZORPAY_KEY_ID
RAZORPAY_KEY_SECRET
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
- `config.ts` — exports `auth`, `db`, `functions`, `googleProvider`
- `authUtils.ts` — `getCurrentUserOrThrow()`, `getCurrentUserData()`, `updateUserData()`
- `activities/` — split into `crud.ts`, `queries.ts`, `joins.ts`, re-exported via `index.ts`
  - `crud.ts` — `writeActivity`, `updateActivity`, `deleteActivity`, `cancelActivity` (soft-cancel)
  - `joins.ts` — `joinActivity` (with capacity + re-join checks), `leaveActivity` (moves to `departedJoiners`), `hasUserJoined`, `removeParticipant` (creator kick)
- `activityActions.ts` — barrel re-export of all activity operations; used by hooks and pages
- `userActions.ts` — user profile and connection operations
- `paymentService.ts` — `initiatePayment`, `handlePaymentSuccess`, `hasUserPaid`, `initiateRefund` (calls `initiateRazorpayRefund` Cloud Function)

**`src/services/razorpay/razorpayConfig.ts`** — Razorpay SDK initialization

### Cloud Functions (`functions/index.js`)

Three callable functions, all require Firebase auth:
- `createRazorpayOrder` — creates a Razorpay order server-side, returns `{ orderId }`
- `initiateRazorpayRefund` — creator-only; refunds a single departed participant via Razorpay, returns `{ refundId }`
- `cancelActivityAndRefund` — creator-only; refunds all paid active + pending-refund departed joiners, then soft-cancels the activity

### Custom Hooks (`src/hooks/`)

- `useActivities(options)` — fetches and manages activity lists; `source: 'user' | 'connections'`; exposes `reload`, `joinToggle`, `isJoined`
- `useConnections()` — manages the user's connections list
- `useAsyncAction()` — generic loading/error state wrapper for one-off async operations

### Components (`src/components/`)

Organized by domain, each folder has an `index.ts` barrel:
- `pages/` — top-level route components (MyActivities, FriendsActivities, Profile, ActivityPage, LandingPage, Login, LegalPage)
- `activities/` — ActivityCard, ActivityForm, CreateActivitySheet, EditActivitySheet, PastActivities, **ParticipantManagement**
- `connections/` — AddConnectionDialog, ConnectionsList, DeleteConnectionDialog
- `landing/` — HeroSection, FeaturesGrid, Footer, SquashBallIcon
- `profile/` — UserProfile
- `shared/` — CollapsibleSection

### Types (`src/types/`)

Central barrel at `src/types/index.ts`. Key types:
- `Activity` — `isPaid`, `cost` (in paise), `joiners` map, `departedJoiners` map, `status` ('active'|'cancelled'|'completed'), `maxParticipants`, `payoutStatus`
- `ActivityJoiner` — `paymentStatus`, `paymentId`, `paidAmount`, `paidAt`
- `DepartedJoiner` — `departedAt`, `departedReason` ('left'|'removed_by_creator'), `paidAmount`, `paymentId`, `refundStatus` ('n/a'|'pending'|'processing'|'completed'|'declined'), `refundId`
- `Connection` / `UserConnection` / `UserProfile` (UserProfile has `razorpayContactId`, `razorpayFundAccountId` for future payout use)

### Theme (`src/theme.ts`)

Material Design 3-inspired MUI theme. Primary color: `#0D9488` (teal). Secondary: `#F97316` (coral). Font: Inter. Global 480px max-width constraint is enforced in both `App.tsx` layout and `MuiDrawer` paper styles.

### Firestore Security Rules (`firestore.rules`)

- `users/{userId}` — authenticated users can read all; write/update own doc; update others' `connections` field only
- `activities/{activityId}` — authenticated read/create/list; owner can do full updates; non-owners can update `joiners`, `departedJoiners`, `paymentDetails` fields only; delete by owner only
- `payment_orders/{orderId}` — authenticated create; read/write own orders only

## Participant Management & Payment Lifecycle

This feature was implemented as part of the "Paid Activity Participant Management" CUJs. Key behaviours:

### Leaving a paid activity
- `leaveActivity` moves the user from `joiners` to `departedJoiners` with `refundStatus: 'pending'`
- Before calling leave, all three pages (MyActivities, FriendsActivities, ActivityPage) show a confirmation dialog: "You've paid ₹X. Refunds are at the creator's discretion."

### Re-joining
- Blocked if `departedJoiners[uid].refundStatus === 'pending'`
- Allowed (pays again) if `'completed'` or `'declined'`
- Free events: always allowed subject to capacity

### Capacity limits
- Optional `maxParticipants` field on Activity
- Join button shows "Full" and is disabled when at capacity
- Capacity check runs before Razorpay order is created

### Creator participant management (`ParticipantManagement` component)
- Rendered inside `EditActivitySheet` for the creator
- Shows active participants (creator pinned first, payment chips)
- Shows departed participants with refund status
- Kick flow: moves joiner to `departedJoiners` with reason `'removed_by_creator'`; creator chooses refund or no refund
- Refund flow: calls `initiateRefund` → Cloud Function → sets `refundStatus: 'processing'`

### Cancelling an event
- Free events / no paid participants: "Delete Activity" (hard delete)
- Paid events with paid participants: "Cancel Event" → calls `cancelActivityAndRefund` Cloud Function → bulk-refunds all paid active joiners + any pending-refund departed joiners → sets `status: 'cancelled'`

## What's Not Yet Implemented

**CUJ-6 — Creator payout after event completes.** Requires:
1. RazorpayX (Payouts) product activation on the Razorpay account
2. A scheduled Cloud Function to detect completed events and trigger payouts
3. Payout registration UI on the Profile page (UPI/bank via Razorpay Contacts + Fund Accounts API)
4. Platform fee % decision (TBD)
