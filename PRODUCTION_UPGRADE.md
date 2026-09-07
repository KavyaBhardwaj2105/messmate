# MessMate production upgrade

Implemented in this build:

- Email verification before login, with expiring hashed verification tokens.
- Resend-verification endpoint.
- Forgot-password + one-time, expiring password reset flow.
- Short-lived access JWTs (15 minutes by default).
- Rotating/revocable refresh sessions stored server-side and delivered in an HttpOnly cookie.
- Same-origin protection for refresh/logout cookie endpoints.
- Review photo uploads (up to 6) with client-side resizing/compression.
- Hostel listing photo uploads (up to 8) with client-side resizing/compression.
- Cloudinary signed image storage for production; local disk fallback for development.
- Image gallery UI on hostel details, image thumbnails on hostel cards, and photo galleries on reviews.
- Demo seed listings include relevant hostel mess photos sourced from public web pages; review/hostel users can replace/add their own photos.
- Production startup now requires persistent MongoDB, email provider, public API URL, and Cloudinary storage configuration.
- Access token is kept in runtime memory on the frontend instead of localStorage; refresh cookie restores the session on reload.

## Required production environment

Set these on the backend:

- `NODE_ENV=production`
- `MONGO_URI`
- `JWT_SECRET` (32+ random characters)
- `CLIENT_URL`
- `PUBLIC_API_URL`
- `RESEND_API_KEY`
- `MAIL_FROM`
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`
- `ACCESS_TOKEN_EXPIRES_IN=15m`
- `REFRESH_TOKEN_DAYS=30`
- `COOKIE_SAMESITE=none` when frontend and API are on different sites; use `lax` when they share a site
- `COOKIE_DOMAIN` only when a shared parent domain is intentionally required

Set `VITE_API_URL` on the frontend to the deployed backend `/api` URL.
