# Migrations

Rules (see `backend/README.md` §2):

- Never edit `schema.sql` after it has been applied to the shared Supabase project.
- Every later change = a new file here, named `YYYY-MM-DD_<short-name>.sql`,
  applied in order in the Supabase SQL Editor.
- A migration that adds a column must also update RLS for that table.
- List every applied migration below, with date + who applied it.

## Applied migrations

| File | Applied on | Applied by | Notes |
|---|---|---|---|
| _(none yet)_ | — | — | Base schema is `backend/supabase/schema.sql` + `seed.sql`. |
