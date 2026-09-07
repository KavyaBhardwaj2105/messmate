# MessMate deployment

## Frontend — Vercel

In Vercel, import the GitHub repository and use:

- **Root Directory:** `frontend`
- **Framework Preset:** Vite
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **Environment Variable:** `VITE_API_URL=https://YOUR-BACKEND-URL/api`

`frontend/vercel.json` is included so React Router routes such as `/explore`, `/login`, and `/hostels/:id` continue to work after a refresh.

## Backend — Render (recommended)

The Express API is a normal Node server, so deploy `backend/` as a Render Web Service rather than trying to run `server.js` as a Vercel static frontend function.

- **Root Directory:** `backend`
- **Build Command:** `npm ci`
- **Start Command:** `npm start`
- **Health Check:** `/api/health`

Required production variables:

- `NODE_ENV=production`
- `MONGO_URI=<MongoDB Atlas connection string>`
- `JWT_SECRET=<32+ random characters>`
- `CLIENT_URL=https://YOUR-VERCEL-DOMAIN`
- `PUBLIC_API_URL=https://YOUR-BACKEND-DOMAIN`
- `RESEND_API_KEY=<Resend API key>`
- `MAIL_FROM=MessMate <verified-sender@example.com>`
- `CLOUDINARY_CLOUD_NAME=<Cloudinary cloud>`
- `CLOUDINARY_API_KEY=<Cloudinary key>`
- `CLOUDINARY_API_SECRET=<Cloudinary secret>`

`render.yaml` is included as a deployment blueprint.

## Demo account

After seeding MongoDB, the app includes a verified demo account:

- Email: `demo@messmate.com`
- Password: `password123`

Do not use this password for a real account or production credentials.
