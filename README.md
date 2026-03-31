# Driveway App — Developer Guide

## What this app is

A peer-to-peer driveway rental marketplace — like Airbnb but for parking spots. Renters search for parking near a destination, browse listings on a map, and pay by the hour or day. Hosts list their driveways, set prices, and manage their listings.

**Live URL:** https://driveway-app.web.app

---

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 16.2.1 (static export) |
| Auth | Firebase Authentication |
| Database | Firestore |
| File storage | Firebase Storage |
| Backend logic | Firebase Cloud Functions (Node.js) |
| Hosting | Firebase Hosting |
| Maps | Google Maps JavaScript API + Geocoding API |
| Payments | Stripe Checkout |
| Styling | Tailwind CSS v4 |

---

## Project structure

```
app/                        # Next.js pages and components
  page.tsx                  # Homepage / search page
  SearchForm.tsx            # Client component for the search form
  layout.tsx                # Root layout — wraps app with AuthProvider
  globals.css               # Global styles, Geist font setup
  dashboard/page.tsx        # Logged-in user hub
  login/page.tsx            # Suspense wrapper
  login/LoginContent.tsx    # Email/password + Google sign-in
  signup/page.tsx           # Account creation
  listings/
    page.tsx                # Suspense wrapper
    ListingsContent.tsx     # Search results — list + map
    MapView.tsx             # Google Maps component (dynamic import)
  listing/
    page.tsx                # Suspense wrapper
    ListingContent.tsx      # Listing detail, hours selector, Reserve button
  host/
    new/page.tsx            # Create a new listing (host flow)
    listings/page.tsx       # Manage your listings (host flow)
  booking/
    success/page.tsx        # Suspense wrapper
    success/SuccessContent.tsx  # Post-payment confirmation, saves booking
  bookings/page.tsx         # Renter's booking history

context/
  AuthContext.tsx           # Firebase auth state, useAuth() hook

lib/
  firebase.ts               # Firebase SDK init — exports auth, db, storage, functions

functions/
  src/index.ts              # Cloud Function: createCheckoutSession (Stripe)

scripts/
  seed.ts                   # One-time script to seed Toronto listings into Firestore
```

---

## How the key pieces work

### Authentication (`context/AuthContext.tsx`)
Firebase's `onAuthStateChanged` fires whenever a user logs in or out. We store that state in React context and expose it via `useAuth()`. Every protected page calls `useAuth()` and redirects to `/login` if there's no user. The `if (loading || !user) return null` pattern prevents a flash of content before the auth check resolves.

### Search flow (`app/page.tsx` + `app/SearchForm.tsx`)
The homepage uses Next.js's `<Form>` component with `action="/listings"`. On submit, it encodes the address and date as URL params and navigates to `/listings?address=...&date=...`. `SearchForm.tsx` is a separate client component purely so it can call `new Date()` at runtime to default the date field to today.

### Listings page (`app/listings/`)
`page.tsx` is a server component that wraps `ListingsContent` in `<Suspense>` — required by Next.js whenever a client component uses `useSearchParams()`.

`ListingsContent.tsx` does three things in sequence:
1. Reads `address` and `date` from URL params
2. Calls the Google Geocoding API to convert the address string into lat/lng coordinates
3. Fetches all listings from Firestore, filters to those within 10km using the Haversine formula, and sorts by distance

The map is in `MapView.tsx` and is dynamically imported with `ssr: false` because Google Maps requires browser APIs. The `APIProvider` from `@vis.gl/react-google-maps` loads the Maps JS API, and `AdvancedMarker` components render a custom price badge (e.g. "$8/hr") for each listing. Badges invert to dark when the corresponding listing is hovered in the sidebar. `AdvancedMarker` requires a Map ID (set via `NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID`).

### Listing detail (`app/listing/`)
Uses `?id=xxx` search params instead of a dynamic route segment (`[id]`) because the app uses `output: 'export'` (static HTML). Dynamic route segments would require pre-generating every listing page at build time, which doesn't work for database-driven content. The page fetches a single Firestore document by ID.

The hours input calculates the total in real time: hourly rate × hours, switching to the day rate whenever the hourly total would exceed it (e.g. a $30/day cap on a $5/hr listing kicks in at 6 hours).

### Payment flow
The **Reserve** button calls the `createCheckoutSession` Cloud Function via Firebase's `httpsCallable`. The function:
1. Verifies the user is authenticated
2. Creates a Stripe Checkout session with the listing details and price
3. Returns the Checkout URL

The client then redirects to Stripe's hosted payment page. After payment, Stripe redirects to `/booking/success?listingId=...&hours=...&total=...&date=...&address=...`.

The Cloud Function uses Firebase Secret Manager to store the Stripe secret key — it never touches the client or the codebase.

### Booking confirmation (`app/booking/success/`)
On mount, `SuccessContent` saves a booking document to Firestore. A `useRef` flag prevents double-saving on re-renders, and a `localStorage` key prevents re-saving if the user refreshes the page. The booking is saved with the user's `uid` so it appears in their booking history.

### Host flow (`app/host/`)
`host/new/page.tsx` geocodes the host's address automatically on submit (same Geocoding API as search), so hosts never deal with coordinates. If a photo is uploaded, it goes to Firebase Storage and the download URL is saved on the listing document. If no photo is provided, a placeholder Unsplash image is used.

`host/listings/page.tsx` queries Firestore with `where('ownerUid', '==', user.uid)` so hosts only see their own listings.

### Static export and Suspense pattern
The app uses `output: 'export'` in `next.config.ts`, which generates static HTML files deployed to Firebase Hosting. Any page that uses `useSearchParams()` must be a client component wrapped in `<Suspense>` by its parent server component. This is why several pages have a `page.tsx` (server, adds Suspense) and a `Content.tsx` (client, does the actual work).

---

## Environment variables

Stored in `.env.local` (never committed to git):

```
NEXT_PUBLIC_FIREBASE_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
NEXT_PUBLIC_FIREBASE_PROJECT_ID
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET        # driveway-app.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
NEXT_PUBLIC_FIREBASE_APP_ID
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID                 # Required for AdvancedMarker (price pins)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
STRIPE_SECRET_KEY                          # Also stored in Firebase Secret Manager for Cloud Functions
```

`NEXT_PUBLIC_` variables are baked into the static bundle at build time. The Stripe secret key is only used server-side in the Cloud Function.

---

## Firestore collections

| Collection | Key fields |
|---|---|
| `listings` | `ownerUid`, `address`, `neighbourhood`, `lat`, `lng`, `pricePerHour`, `pricePerDay`, `description`, `imageUrl`, `available` |
| `bookings` | `userId`, `listingId`, `listingAddress`, `hours`, `total`, `date`, `createdAt` |

The `bookings` collection has a composite index on `(userId ASC, createdAt DESC)` required for the booking history query.

---

## Running locally

```bash
npm run dev       # Start dev server at localhost:3000
```

To seed the database with test listings:
```bash
npx tsx --env-file=.env.local scripts/seed.ts
```

## Deploying

```bash
npm run build                                        # Generate static export in /out
npx -y firebase-tools@latest deploy                  # Deploy hosting + functions
npx -y firebase-tools@latest deploy --only hosting   # Hosting only (faster)
npx -y firebase-tools@latest deploy --only functions # Functions only
```
