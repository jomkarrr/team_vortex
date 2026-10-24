# Edge Functions

Supabase Edge Functions (Deno) are the **only** place that calls third-party APIs.
The browser never calls an external API directly with a secret key.

## Rules

- One folder per function, with an `index.ts` inside.
- Response shape (every function): `{ ok: true, data }` or `{ ok: false, error }`.
  Errors are plain words, never stack traces or secret values.
- Cache aggressively (pincode/places results rarely change) and always have a
  fallback: if the external API is down, return cached data or a clear error —
  never hang, never return fake data as if it were live.
- Secrets live in Supabase secrets (`supabase secrets set NAME=value`), never here.

## Functions

| Function | Status |
|---|---|
| `pincode/` | Draft — code written, **not deployed yet**. Deploy with `supabase functions deploy pincode` once the shared Supabase project exists. Frontend keeps its manual state/district dropdown until this is live. |
| `places/` | Planned, not written. OpenStreetMap first. |
| `reference-data/` | Planned, not written. Dataset discovery first. |
| `govt-feed/` | Future adapter interface only. No open government API exists for this — never simulate it. |
