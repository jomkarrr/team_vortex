# Migration note — how this restructure reaches GitHub (read before pushing)

## What changed locally

The app was moved from a flat repo root into two sections:

- `frontend/` — the whole website (index.html, package.json, vite.config.js, src/)
- `backend/` — Supabase schema/seed/migrations + Edge Functions (pincode draft)

Build verified after the move: `cd frontend && npm install && npm run build` →
466 modules, `frontend/dist/` produced, same bundle as before (~363 kB JS).

## Why this file exists

A file move is a move + a delete. My GitHub connection can push new/changed
files in one commit, but it cannot delete the old root files in that same
commit. If the new folders were pushed without deleting the old ones, GitHub
would have **two copies** of the app (`src/` at root AND `frontend/src/`) —
exactly the confusion this restructure is meant to remove. So the old files
are **not** pushed yet. Do the move properly with git, once, at a checkpoint.

## Do this once, on a PC clone that is up to date with `main`

```bash
# 1. Make sure you are on main and up to date
git checkout main
git pull

# 2. Move with git (this records renames + deletes correctly)
git mv index.html package.json package-lock.json vite.config.js frontend/
git mv src frontend/
git mv supabase backend/
git mv .env.example frontend/.env.example

# 3. Add the new workflow files (already created in this restructure)
git add frontend/README.md backend/README.md backend/functions backend/supabase/migrations
git add CODEOWNERS MIGRATION-NOTE.md README.md ARCHITECTURE.md vercel.json .gitignore

# 4. Check before committing: git status must show renames, NOT copies
git status

# 5. Commit + push
git commit -m "Restructure: split repo into frontend/ (Member B) and backend/ (Member A)"
git push
```

If your clone does not already have the new `frontend/` / `backend/` folders
from this restructure, first copy them in from the prepared structure, then run
the `git mv` steps above for the old files (git will detect the renames).

## After pushing — verify Vercel before anyone edits

1. Vercel auto-deploys from `main`. Open the Vercel deploy for this push.
2. It must succeed with: Install `cd frontend && npm install`, Build
   `cd frontend && npm run build`, Output `frontend/dist` (from root `vercel.json`).
3. Open the live URL on phone + laptop. No blank page = restructure is live.
4. Only after step 3, Member A works in `backend/` and Member B in `frontend/`.
   If the Vercel deploy fails, revert the push (`git revert`) and keep working
   from the previous deploy — do not debug a deploy at 03:00.

## After the migration is live, delete this file

Once GitHub `main` matches this structure and Vercel is verified, this note
has done its job. Delete it in a follow-up commit so it does not confuse
anyone later.
