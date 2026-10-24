import { createClient } from '@supabase/supabase-js'

// Backend (optional in the prototype):
// - No env vars  -> app runs 100% on seeded demo data + localStorage.
// - Env vars set -> profiles / applications / status events sync to Supabase
//   (run supabase/schema.sql and supabase/seed.sql in the Supabase SQL editor).
const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = url && anonKey ? createClient(url, anonKey) : null
export const isBackendConnected = Boolean(supabase)
