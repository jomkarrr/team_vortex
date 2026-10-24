import { getOrCreateMyApplication } from './storage'

// Status service = the ONLY place that knows where status data comes from.
// It is per-user by design: it takes the logged-in user's saved profile and
// returns ONLY that user's application. It never returns a list of users and
// never reads shared demo personas.
// Prototype: the application is generated from the profile on this device.
// Production: replace the body with a Supabase query on
//   applications + application_status_events (see supabase/schema.sql),
// filtered by the logged-in user's application number —
// which is exactly what the interface of a UMANG / DBT status API would be.
// The UI never changes.

export function getMyApplicationStatus(profile, firstEligibleSchemeName) {
  return getOrCreateMyApplication(profile, firstEligibleSchemeName)
}
