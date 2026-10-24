import { PERSONAS } from '../data/demoPersonas'

// Status service = the ONLY place that knows where status data comes from.
// Prototype: seeded demo applications (below).
// Production: replace the body with a Supabase query on
//   applications + application_status_events (see supabase/schema.sql),
// which is exactly what the interface of a UMANG / DBT status API would be.
// The UI never changes.

export async function listDemoApplications() {
  return PERSONAS.map((p) => ({ personaId: p.id, personaName: p.name, story: p.story, application: p.application }))
}

export async function getApplication(personaId) {
  const found = PERSONAS.find((p) => p.id === personaId)
  return found ? found.application : null
}
