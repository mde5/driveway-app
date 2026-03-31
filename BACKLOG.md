# Backlog

Items to tackle in future sessions, roughly in priority order.

## Bugs / UX issues

- **"Must be signed in to book" UX** — Unauthenticated users who click Reserve get a generic "Could not start checkout. Please try again." message, with the real Firebase auth error only visible in the console. Fix options: show an informative message ("Please sign in to book") or redirect to the login page.

- **Price capping logic** — Day rate should kick in whenever the hourly total would exceed it, not just at 8+ hours. E.g. if day rate is $30 and hourly is $5, the cap should kick in at 6 hours.

## Bugs / UX issues

- **Responsive layout on /listings** — The sidebar+map split layout isn't right on both mobile and desktop. `w-2/5` is too wide on desktop but `w-1/5` is too narrow on mobile. Needs a proper responsive approach (e.g. stack vertically on small screens).

## Polish

- **Homepage/landing page copy** — Review and tighten wording. Decide on consistent terminology throughout the app ("private driveway" vs "parking spot").

- **Dashboard wording review** — Review all text on the dashboard page for clarity and consistency.

## Audits

- **Free tier quota review** — Audit all API integrations (Google Maps Geocoding, Maps JS, Places, Firebase Firestore reads/writes, Cloud Functions invocations) to confirm usage stays within free tier limits. Flag anything that could spike unexpectedly.
