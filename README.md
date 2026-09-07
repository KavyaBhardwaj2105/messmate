# MessMate 🍽️

> **"Know your mess before you move in."**

A full-stack Hostel & PG Food Review web application for college students across India. Discover authentic mess ratings, taste & hygiene scores, monthly costs, and real student feedback before paying upfront accommodation deposits.

This repository has been hardened for **production deployment**: authentication, input validation, database error handling, API consistency, and environment configuration were all audited and fixed. See [`HARDENING_NOTES.md`](./HARDENING_NOTES.md) for the full list of issues found and how each was resolved.

---

## 🌟 Key Features

* Interactive 1–5 star food reviews with granular category ratings (Taste, Hygiene, Portion Size, Variety).
* Visual rating breakdown and aggregated stats per hostel.
* Search, filter (city / min rating / max cost) and sort (highest rated, most reviewed, cheapest, newest).
* One review per user per hostel — posting again edits the existing review.
* Full CRUD with strict ownership: only the creator can edit/delete their hostel or review.
* Email verification + resend verification, secure password reset links, and 15-minute access tokens.
* Rotating, revocable refresh sessions in an HttpOnly cookie (30-day maximum lifetime).
* Meal/review photo uploads with client-side compression and Cloudinary-backed production storage (local fallback for development).
* JWT authentication with securely salted & hashed passwords (`bcryptjs`).
* Responsive UI built with React, Tailwind CSS, and Framer Motion.
* Works out of the box with a local JSON file store for instant demoing, or a real MongoDB database for production.

---

## 🛠️ Tech Stack

**Frontend:** React 18 + Vite, Tailwind CSS, React Router v6, Axios, Framer Motion, Lucide icons.

**Backend:** Node.js + Express, MongoDB + Mongoose (with a JSON-file fallback store for zero-config local demos), JWT + bcryptjs, Helmet, express-rate-limit, express-validator, express-mongo-sanitize, hpp, compression.

---

## 📁 Project Structure

```text
messmate/
├── backend/
│   ├── config/
│   │   ├── db.js                 # MongoDB connection (+ dev-only JSON fallback)
│   │   └── validateEnv.js        # Fails fast on missing/weak secrets in production
│   ├── controllers/               # Auth, Hostel, Review business logic
│   ├── data/
│   │   ├── store.js               # JSON file-store used only when MongoDB is unavailable
│   │   └── db_files/              # Auto-generated local data (gitignored)
│   ├── middleware/
│   │   ├── auth.js                # JWT verification & route protection
│   │   ├── errorHandler.js        # Centralized error handler (no stack leaks in prod)
│   │   ├── rateLimiters.js        # API / auth / write rate limits
│   │   └── validators.js          # express-validator rules for every route
│   ├── models/                    # Mongoose schemas (User, Hostel, Review)
│   ├── routes/                    # Express routers
│   ├── utils/
│   │   ├── AppError.js            # Operational error class with HTTP status codes
│   │   └── asyncHandler.js        # Wraps async route handlers, forwards errors
│   ├── seed.js                    # MongoDB seeder with realistic demo data
│   ├── server.js                  # App entrypoint (security middleware, graceful shutdown)
│   ├── package.json
│   └── .env.example
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/            # Navbar, Footer, cards, ErrorBoundary, etc.
│   │   │   └── forms/              # HostelForm, ReviewForm (client-side validation)
│   │   ├── context/                # AuthContext (session state), ToastContext
│   │   ├── pages/                  # Route-level pages
│   │   ├── services/api.js         # Axios client, interceptors, global 401 handling
│   │   └── App.jsx
│   ├── package.json
│   └── .env.example
│
├── package.json                    # Root convenience scripts (install/run both apps)
├── HARDENING_NOTES.md              # Full list of fixes made for production readiness
├── LICENSE
└── README.md
```

---

## ⚡ Quick Start

### Prerequisites
* [Node.js](https://nodejs.org/) v18 or higher
* (Optional but recommended) [MongoDB](https://www.mongodb.com/try/download/community) running locally, or a free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster

> **Note:** if no `MONGO_URI` is reachable in **development**, the backend automatically falls back to a local JSON file database (`backend/data/db_files/`) so you can run and demo the full app with zero setup. This fallback is intentionally **disabled in production** — see [`HARDENING_NOTES.md`](./HARDENING_NOTES.md) for why.

### 1. Clone & configure environment variables

```bash
git clone <your-fork-url> messmate
cd messmate

cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

Open `backend/.env` and set a strong, unique `JWT_SECRET`:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

Paste the output as `JWT_SECRET` in `backend/.env`.

### 2. Install dependencies

```bash
npm run install:all
```

(equivalent to running `npm install` inside both `backend/` and `frontend/`)

### 3. (Optional) Seed a real MongoDB database

If you've set `MONGO_URI` to a real MongoDB instance:

```bash
npm run seed
```

### 4. Run both apps together

```bash
npm run dev
```

* Backend: `http://localhost:5000`
* Frontend: `http://localhost:5173`

Or run them separately: `npm run dev:backend` / `npm run dev:frontend`.

---

## 🔑 Demo Account

* **Email:** `demo@messmate.com`
* **Password:** `password123`

(Seed data only — always use unique, strong passwords for real accounts.)

---

## 📡 REST API

### Authentication (`/api/auth`)

`signup` requires email verification before login. `refresh` rotates the refresh token and invalidates the previous session token. `forgot-password` and `reset-password` provide one-time, expiring password reset links.

| Method | Endpoint | Description | Access |
|---|---|---|---|
| `POST` | `/api/auth/signup` | Register a new account | Public (rate-limited) |
| `POST` | `/api/auth/login` | Authenticate & get a JWT | Public (rate-limited) |
| `GET` | `/api/auth/me` | Get the current logged-in user | Private (JWT) |

### Hostels (`/api/hostels`)

| Method | Endpoint | Description | Access |
|---|---|---|---|
| `GET` | `/api/hostels` | Search, filter, sort, paginate hostels | Public |
| `GET` | `/api/hostels/:id` | Hostel details + aggregated ratings | Public |
| `POST` | `/api/hostels` | Add a new hostel/PG | Private |
| `PUT` | `/api/hostels/:id` | Update hostel details | Private (creator only) |
| `DELETE` | `/api/hostels/:id` | Delete hostel + its reviews | Private (creator only) |
| `GET` | `/api/hostels/meta/cities` | List unique cities | Public |
| `GET` | `/api/hostels/user/me` | Hostels created by the logged-in user | Private |

### Reviews (`/api/reviews` & nested)

| Method | Endpoint | Description | Access |
|---|---|---|---|
| `GET` | `/api/hostels/:id/reviews` | All reviews for a hostel | Public |
| `POST` | `/api/hostels/:id/reviews` | Post or update your review for a hostel | Private |
| `PUT` | `/api/reviews/:id` | Update a review | Private (author only) |
| `DELETE` | `/api/reviews/:id` | Delete a review | Private (author only) |
| `GET` | `/api/reviews/user/me` | Reviews written by the logged-in user | Private |

Every write endpoint validates its input with `express-validator` and returns a `422` with per-field error messages on failure. Every error response follows the shape `{ success: false, message, errors? }`.

---

## 🚀 Deployment

### Backend (Render / Railway / Fly.io / any Node host)

1. Set environment variables from `backend/.env.example` in your host's dashboard:
   `NODE_ENV=production`, `MONGO_URI` (Atlas connection string), `JWT_SECRET` (long random value), `CLIENT_URL` (your deployed frontend origin(s), comma-separated), `PORT` (usually provided by the host).
2. Build command: `npm install`. Start command: `npm start`.
3. The app **will refuse to boot** in production if `JWT_SECRET`, `MONGO_URI`, or `CLIENT_URL` are missing/weak — this is intentional (see `config/validateEnv.js`).

### Frontend (Vercel / Netlify)

1. Set `VITE_API_URL` to your deployed backend's `/api` URL, e.g. `https://messmate-api.onrender.com/api`.
2. Build command: `npm run build`. Publish directory: `dist`.

### Database

Use a managed MongoDB instance (e.g. MongoDB Atlas free tier) in production. The bundled JSON file store is a local development/demo convenience only — it is not safe for concurrent writes, multiple server instances, or durability guarantees, and is disabled automatically when `NODE_ENV=production`.

---

## 🔒 Security Notes

* Passwords are hashed with `bcryptjs` (cost factor 12) — never stored or logged in plaintext.
* JWTs are signed with a secret that must be explicitly configured; there is no hardcoded fallback.
* All API input is validated server-side (in addition to client-side UX validation) — the client can never bypass server checks.
* Rate limiting protects `/api/auth/*` (20 attempts/15 min) and all write endpoints from abuse.
* `helmet`, `express-mongo-sanitize`, and `hpp` guard against common HTTP/NoSQL-injection attack classes.
* CORS is restricted to an explicit origin allow-list in production (`CLIENT_URL`), not `*`.
* Known, non-critical dependency advisories remain in `vite` (dev-server only) and `react-router` — see `npm audit` output. Fixing these requires major-version upgrades (Vite 8 / React Router 7) that would need a dedicated regression pass across all routes/forms and were intentionally left for a follow-up to avoid shipping an unverified breaking change.

---

## 🚀 Future Roadmap

* Weekly menu schedules per hostel.
* Side-by-side hostel comparison tool.
* Automated test suite (Jest/Supertest for the API, React Testing Library for the frontend).

---

## 📄 License

MIT — see [`LICENSE`](./LICENSE). Free to use, modify, and distribute for college projects, portfolios, or startup ideas.
