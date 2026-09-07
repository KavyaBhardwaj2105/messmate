const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const helmet = require('helmet');
const compression = require('compression');
const hpp = require('hpp');
const mongoSanitize = require('express-mongo-sanitize');

// Load environment variables before anything else reads process.env
dotenv.config();

const validateEnv = require('./config/validateEnv');
const { connectDB } = require('./config/db');
const errorHandler = require('./middleware/errorHandler');
const { apiLimiter } = require('./middleware/rateLimiters');

// Fail fast if secrets/config are missing or insecure (exits in production).
validateEnv();

const app = express();

// Trust the first proxy hop (Render/Railway/Heroku/Nginx) so req.ip and
// rate limiting work correctly behind a load balancer.
app.set('trust proxy', 1);

// ---------- Security & core middleware ----------
app.use(helmet());
app.use(compression());

// CORS: restricted to an explicit allow-list in production. In development,
// falls back to permissive localhost defaults for convenience.
const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:5173,http://127.0.0.1:5173')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow non-browser tools (curl/Postman/server-to-server) with no Origin header.
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Body parsers with sane size limits to prevent oversized-payload abuse
app.use(express.json({ limit: '24mb' }));
app.use(express.urlencoded({ extended: true, limit: '24mb' }));
app.use('/uploads', express.static(require('path').join(__dirname, 'uploads'), { maxAge: '7d', immutable: true }));

// Strip any keys starting with "$" or containing "." from user input to
// prevent MongoDB operator injection via query/body/params.
app.use(mongoSanitize());

// Prevent HTTP Parameter Pollution (e.g. ?sort=a&sort=b)
app.use(hpp());

// Apply a general rate limit across the whole API
app.use('/api', apiLimiter);

// ---------- Health check ----------
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    app: 'MessMate API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// ---------- API Routes ----------
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/hostels', require('./routes/hostelRoutes'));
app.use('/api/reviews', require('./routes/reviewRoutes'));
app.use('/api/uploads', require('./routes/uploadRoutes'));

// ---------- 404 for undefined routes ----------
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.originalUrl}`,
  });
});

// ---------- Centralized error handler (must be last) ----------
app.use(errorHandler);

const PORT = Number(process.env.PORT || 5000);
let server;

const startServer = async () => {
  await connectDB();
  server = app.listen(PORT, () => {
    console.log(`🚀 MessMate Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
    console.log(`📡 API available at http://localhost:${PORT}/api`);
  });
};

startServer().catch((error) => {
  console.error('❌ Failed to start MessMate:', error);
  process.exit(1);
});

// ---------- Graceful shutdown & crash safety ----------
const shutdown = (signal) => {
  console.log(`\n${signal} received. Shutting down gracefully...`);
  if (!server) return process.exit(0);
  server.close(() => {
    console.log('HTTP server closed.');
    process.exit(0);
  });
  // Force-exit if it hangs
  setTimeout(() => process.exit(1), 10000).unref();
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled Promise Rejection:', reason);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

module.exports = app;
