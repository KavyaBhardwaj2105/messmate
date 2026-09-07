/**
 * Validates required environment variables at startup.
 * Fails fast (instead of silently running with an insecure default
 * JWT secret) so misconfiguration is caught before deployment rather
 * than discovered as a security incident later.
 */
const INSECURE_DEFAULTS = [
  '',
  'secret',
  'changeme',
  'your_jwt_secret',
  'messmate_super_secret_jwt_key_2026',
  'messmate_super_secret_jwt_key_2026_dev',
];

const validateEnv = () => {
  const errors = [];
  const isProduction = process.env.NODE_ENV === 'production';

  const jwtSecret = process.env.JWT_SECRET || '';

  if (!jwtSecret) {
    errors.push('JWT_SECRET is not set.');
  } else if (jwtSecret.length < 32) {
    errors.push('JWT_SECRET is too short. Use at least 32 random characters.');
  } else if (INSECURE_DEFAULTS.includes(jwtSecret)) {
    errors.push('JWT_SECRET is using a known/default value. Generate a unique secret.');
  }

  if (isProduction && !process.env.MONGO_URI) {
    errors.push('MONGO_URI is not set. A persistent database is required in production.');
  }

  if (isProduction && !process.env.CLIENT_URL) {
    errors.push('CLIENT_URL is not set. CORS cannot be safely restricted without it.');
  }

  if (isProduction && (!process.env.RESEND_API_KEY || !process.env.MAIL_FROM)) {
    errors.push('RESEND_API_KEY and MAIL_FROM are required in production for verification/reset emails.');
  }
  if (isProduction && !process.env.PUBLIC_API_URL) {
    errors.push('PUBLIC_API_URL is required in production for generated media URLs.');
  }
  if (isProduction && (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET)) {
    errors.push('Cloudinary credentials are required in production so uploads survive redeploys.');
  }

  if (errors.length > 0) {
    console.error('\n❌ Invalid environment configuration:');
    errors.forEach((e) => console.error(`   - ${e}`));

    if (isProduction) {
      console.error('\nRefusing to start in production with insecure/incomplete configuration.\n');
      process.exit(1);
    } else {
      console.warn('\n⚠️  Continuing in development mode, but fix these before deploying.\n');
    }
  }
};

module.exports = validateEnv;
