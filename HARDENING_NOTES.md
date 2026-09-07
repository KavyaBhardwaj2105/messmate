# Production Hardening Notes

This document records every issue found in the original project and exactly how it was fixed. It's kept in the repo intentionally — being able to explain *why* a change was made is as valuable as the change itself, especially for a portfolio project.

---

## 1. Weak Backend Security

**Found:**
- `middleware/auth.js` and `controllers/authController.js` fell back to a hardcoded default JWT secret (`'messmate_super_secret_jwt_key_2026'`) whenever `JWT_SECRET` wasn't set. Anyone who read the source (public on GitHub) could forge valid tokens for any account.
- `server.js` configured CORS with `origin: '*'` while also setting `credentials: true` — an invalid and insecure combination that browsers reject or that effectively disables the origin check.
- No rate limiting existed anywhere, including on `/api/auth/login` and `/api/auth/signup`, leaving them open to brute-force and credential-stuffing.
- No `helmet`, no NoSQL-injection sanitization, no HTTP parameter pollution protection.

**Fixed:**
- Added `backend/config/validateEnv.js`, run at startup. It refuses to boot in production if `JWT_SECRET` is missing, shorter than 32 characters, or matches a list of known/example values. `auth.js` and `authController.js` no longer have any fallback secret — if it's not configured, tokens simply can't be verified.
- CORS now uses an explicit allow-list built from `CLIENT_URL` (comma-separated for multiple frontend origins), checked per-request in the `cors()` origin callback.
- Added `express-rate-limit`: a general API limiter (300 req/15 min/IP), a stricter auth limiter (20 req/15 min/IP) on login & signup, and a write-operation limiter on all POST/PUT/DELETE routes.
- Added `helmet()`, `express-mongo-sanitize()`, and `hpp()` to `server.js`.

## 2. Insecure Password Handling

**Found:** Password hashing itself was already implemented correctly with `bcryptjs` (in both the Mongoose `User` model's `pre('save')` hook and the JSON-store signup path) — this part of the original code was solid. The gap was in the *secret used to sign the tokens that prove a password was verified* (see above), and in the login response leaking which behavior occurs for existing vs. non-existing accounts.

**Fixed:**
- Bumped bcrypt salt rounds from 10 to 12 in the JSON-store signup path for consistency with modern recommendations.
- Login now throws the exact same generic "Invalid email or password" error for both "no such user" and "wrong password" cases, from a single code path (`invalidCredentials()` helper), so response timing/content can't be used to enumerate registered emails.

## 3. Incomplete Input Validation

**Found:** Validation was ad-hoc and inconsistent — some routes checked `!name || !email`, others checked nothing beyond what Mongoose would eventually reject. The JSON-file fallback store had **no validation at all** (Mongoose's schema validators don't apply when MongoDB isn't in use), so in fallback mode you could create a hostel with a 10,000-character name or a negative cost. Search query params (`q`, `city`) were passed directly into `new RegExp()`, which is a regex-injection / ReDoS vector.

**Fixed:**
- Added `backend/middleware/validators.js` — a single source of truth of `express-validator` chains for signup, login, hostel create/update, hostel search query params, and review create/update. These run identically regardless of whether MongoDB or the JSON store is active, closing the fallback-mode validation gap.
- Pagination (`page`, `limit`) is validated and clamped server-side (`limit` capped at 50) instead of trusting raw query input.
- Added `escapeRegex()` in `hostelController.js` so user-supplied search text can never be interpreted as regex syntax.
- Frontend forms (`HostelForm.jsx`, `SignupPage.jsx`) got matching `maxLength` attributes and client-side checks so users get instant feedback instead of only discovering limits via a server error.

## 4. Fragile Database Layer

**Found:** `data/store.js`'s `writeJSON()` caught write errors, logged them, and returned — silently. Every `create`/`update`/`delete` function assumed the write succeeded and returned a "success" object to the controller even if the disk write actually failed, so the API would report `200 OK` / `201 Created` while no data was actually persisted.

**Fixed:**
- `writeJSON()` now writes to a temp file and renames it into place (atomic-ish write, avoids leaving a half-written/corrupt JSON file if the process dies mid-write), and re-throws via `AppError` on failure so it surfaces as a proper `500` through the centralized error handler instead of a silent no-op.
- `config/db.js`: connection timeout increased from 1.5s (too aggressive for slower networks/Atlas) to 5s, and the app now listens for `error`/`disconnected` events on the live connection instead of only checking connectivity once at boot.
- In **production**, if MongoDB is unreachable the server now exits with a clear error instead of silently falling back to the JSON file store — that fallback is a dev/demo convenience only and isn't safe for concurrent writes or multi-instance deployments.

## 5. Poor Error Handling

**Found:** `middleware/errorHandler.js` did `let error = { ...err }` (which drops the actual `Error` prototype/message in some cases), and on any unexpected 500-level error it returned `error.message` straight to the client — meaning a raw database or Node internals error message could leak to an end user.

**Fixed:**
- Added `utils/AppError.js` (a small `Error` subclass carrying an HTTP status code and an `isOperational` flag) and `utils/asyncHandler.js` (wraps every controller so thrown/rejected errors reach `next()` automatically — no more repeated try/catch boilerplate, and no risk of an unhandled rejection crashing the process).
- Rewrote `errorHandler.js`: known/operational errors (validation, 404, 403, duplicate key, cast errors, malformed JSON, JWT errors) get a specific, safe message. Any *unexpected* 500-level error gets replaced with a generic "Something went wrong on our end" message in production, while full details are always still logged server-side via `console.error`. Stack traces are only ever included in the JSON response outside of production.

## 6. Inconsistent API Design

**Found:** Status codes were inconsistent (e.g. duplicate-email returned `400` instead of `409`), and route/controller organization mixed concerns.

**Fixed:**
- Standardized status codes: `409 Conflict` for duplicate email / duplicate review, `422 Unprocessable Entity` for validation failures (with a structured `errors[]` array of `{field, message}`), `403 Forbidden` for ownership violations, `404 Not Found` for missing resources (including invalid MongoDB ObjectIds, which previously fell through to a generic `CastError` → `500`-adjacent path).
- Every response still follows the existing `{ success, message, ... }` envelope the frontend already expects — no breaking change to the response shape, only to when specific codes are used.

## 7. Frontend State Management Issues

**Found:**
- `AddHostelPage.jsx`, `EditHostelPage.jsx`, and `ProfilePage.jsx` all read `isAuthenticated` from `AuthContext` without checking `loading`. Since `AuthContext` starts with `user = null` and only resolves after an async `GET /auth/me` call, an already-logged-in user refreshing any of these pages would see a flash of "Sign In Required" (or get forcibly redirected to `/login` by `ProfilePage`/`EditHostelPage`) before the session check finished.
- `EditHostelPage.jsx` called `navigate('/login')` directly inside the render body (`if (!isAuthenticated) { navigate(...); return null; }`) — calling a router navigation function during render is a React anti-pattern that can trigger "Cannot update state during render" warnings and unpredictable double-renders.
- `services/api.js` had no request timeout, so a hung backend would leave the UI in a loading spinner indefinitely, and no global handling for an expired/invalid token — each page had to discover a 401 on its own.

**Fixed:**
- All three pages now destructure `loading: authLoading` from `useAuth()` and show a "Checking your session..." spinner until that resolves, before deciding whether to redirect or show the sign-in prompt.
- `EditHostelPage`'s redirect moved into the existing `useEffect`, removing the render-time navigation call.
- `api.js` now sets a 15s request timeout and distinguishes timeout vs. network vs. server error messages. A global `messmate:session-expired` event fires on any `401` response; `AuthContext` listens for it and clears the session with a toast, so an expired token is handled consistently everywhere instead of per-page.

## 8. CRUD Edge Cases Were Missing

**Found:**
- `createOrUpdateReview` and `getReviewsForHostel` never checked that the target hostel actually existed — you could POST a review against a made-up hostel ID and get a `201 Created` for an orphaned review that would never appear anywhere in the UI.
- Passing a malformed MongoDB ObjectId (e.g. `/api/hostels/not-an-id`) fell through to a Mongoose `CastError`, which the old error handler mapped to a somewhat confusing 404 message but which still hit the database driver first.
- No caps existed on `page`/`limit` query params — a request like `?limit=999999` would attempt to return the entire dataset in one response.

**Fixed:**
- Added `Hostel.exists()` / `store.findHostelById()` existence checks before creating or listing reviews for a hostel, returning a clean `404 Hostel not found` instead.
- Added `isValidObjectId()` checks (via `mongoose.Types.ObjectId.isValid`) at the top of every controller action that takes an `:id` param, short-circuiting to a `404` before any query touches the database.
- `page`/`limit` are now parsed and clamped (`limit` capped at 50, `page` at a sane upper bound) via a shared `clampInt()` helper in both the hostel and review controllers.

## 9. Production Configuration Was Incomplete

**Found:** `.env.example` files had placeholder-but-plausible values; there was no startup validation of configuration; `backend/package.json` depended on `mongodb-memory-server` (an 80+MB dev/testing dependency) despite it never being imported anywhere in the codebase; there was an orphaned root `package-lock.json` with no matching `package.json`.

**Fixed:**
- Rewrote both `.env.example` files with clear comments explaining every variable, what's required in production vs. optional in development, and how to generate a secure `JWT_SECRET`.
- Added `config/validateEnv.js` (see section 1) so misconfiguration is caught at boot, not discovered later as an incident.
- Removed the unused `mongodb-memory-server` dependency.
- Added a proper root `package.json` with `install:all` / `dev` (via `concurrently`) / `seed` / `build:frontend` convenience scripts, replacing the orphaned lockfile.

## 10. Deployment & GitHub Readiness

**Found:** No `LICENSE` file (README claimed MIT but nothing backed it), no documentation of what a reviewer/interviewer should know about the production changes, `.gitignore` didn't exclude the auto-generated JSON demo-database files.

**Fixed:**
- Added `LICENSE` (MIT, matching the README's existing claim).
- Added this `HARDENING_NOTES.md`.
- Updated `.gitignore` to exclude `backend/data/db_files/*.json` (auto-generated at runtime) and log files.
- Rewrote `README.md` with accurate setup steps, a deployment section (Render/Vercel + MongoDB Atlas), and a security-notes section that's honest about the two remaining non-critical dependency advisories (`vite` dev-server, `react-router`) rather than silently hiding them.

---

## 11. Build Verification Pass (found after this document was first written)

The note below (under "Known, intentionally-deferred items") admitted that a full
`npm install` + `npm run build` was never actually run before this repo was first
packaged. That gap mattered: a follow-up pass that syntax-checked every file with
`node --check` (backend) and `esbuild` (frontend JSX) — the closest thing to a real
build available without npm registry access — turned up two bugs that a full build
would have caught immediately.

**Found:**
- `frontend/src/components/forms/ReviewForm.jsx`: `handleSubmit` used `await` inside
  a non-`async` arrow function (`const handleSubmit = (e) => { ... await ... }`).
  This is a hard JavaScript syntax error — `npm run dev` / `npm run build` would
  have failed to even start.
- Same file, same function: the file-upload `onChange` handler had one extra stray
  closing `}`, breaking the JSX (`Expected ">" but found "}"`) — masked behind the
  first error until that was fixed.
- `backend/server.js` called `connectDB()` twice — once unawaited at module scope,
  once correctly awaited inside `startServer()` — causing a redundant, racy second
  connection attempt (duplicate `mongoose.connection` event listeners, doubled
  startup log lines).
- `backend/middleware/validators.js`: the signup password rule enforces
  `min: 8` characters but its error message said "between 6 and 72 characters."

**Fixed:**
- Added the missing `async` keyword and removed the stray `}` in `ReviewForm.jsx`.
- Removed the redundant top-level `connectDB()` call in `server.js`; the app now
  connects exactly once, awaited, before `app.listen()`.
- Corrected the password validation message to match the actual `min: 8` rule.

**Lesson for next time:** "audited" and "built" are not the same claim. Before
tagging any release as production-ready, actually run `npm install && npm run
build` (and ideally `npm run dev` and click through the app) in an
internet-connected environment — a source-level review, however careful, will not
catch every syntax error a real bundler catches instantly.

## Known, intentionally-deferred items

- `npm audit` on the frontend reports moderate/high advisories in `vite`'s dev-server-only `esbuild` dependency and in `react-router`. Fixing both requires major version upgrades (Vite 8, React Router 7) that change bundler/router behavior; that deserves its own dedicated PR with full manual regression testing across every route and form, rather than being bundled silently into a security-fix pass.
- There is no automated test suite yet. This audit included source-level review and JavaScript syntax validation. A complete dependency install and production frontend build could not be executed in this isolated environment because the npm registry/cache was unavailable; run `npm install` and `npm run build` in an Internet-connected environment before deployment. Adding Jest/Supertest + React Testing Library coverage is the natural next step.
