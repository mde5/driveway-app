# Driveway App — Developer Guide

## Authentication

### Files created

1. `context/AuthContext.tsx` — tracks who's logged in across the whole app
2. `app/login/page.tsx` — login page (email/password + Google)
3. `app/signup/page.tsx` — signup page
4. `app/dashboard/page.tsx` — a simple protected page to test auth works
5. `app/layout.tsx` — updated to wrap the app with the auth provider
6. `app/page.tsx` — replaced the template with a simple home page

### How it works

**`context/AuthContext.tsx`** — The heart of auth. It uses Firebase's `onAuthStateChanged` which fires automatically whenever someone logs in or out. We store that in React state and make it available everywhere via `useAuth()`. The `unsubscribe` cleanup is important — without it, the listener would keep running even after the component is gone.

**`app/login/page.tsx` & `app/signup/page.tsx`** — Both use `react-hook-form` to manage form state and validation. The `register()` function connects each input to the form, and `handleSubmit` runs validation before calling Firebase. Errors from Firebase (like "email already in use") get mapped to friendly messages.

**`app/dashboard/page.tsx`** — The protected route pattern: check `useAuth()`, and if there's no user, redirect to `/login`. The `if (loading || !user) return null` prevents a flash of content before the auth check completes.
