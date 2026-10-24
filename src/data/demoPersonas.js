// REMOVED — no longer used.
// Track Status used to show a shared list of demo personas. That violated the
// privacy rule: only the logged-in user's own details may appear.
// Status is now built per-user from the saved My Profile
// (see src/lib/storage.js getOrCreateMyApplication and src/pages/Status.jsx).
// This file is kept only so old imports fail loudly instead of silently
// re-introducing shared user data.

export const PERSONAS = []
