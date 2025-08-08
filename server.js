require('@shopify/shopify-api/adapters/node');

const express = require('express');
const dotenv = require('dotenv');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');

dotenv.config();

// --- Environment Variable Validation ---
const requiredEnvVars = [
  'SHOPIFY_API_KEY',
  'SHOPIFY_API_SECRET',
  'SHOPIFY_SCOPES',
  'SHOP_CUSTOM_URL', // Assuming this is needed for your app's URL
  'SESSION_SECRET' // For express-session if you decide to use it
];

requiredEnvVars.forEach(envVar => {
  if (!process.env[envVar]) {
    console.error(`Missing required environment variable: ${envVar}`);
    process.exit(1);
  }
});

// Your Shopify config (created with shopifyApi({...}) in ./config/shopify)
const shopify = require('./config/shopify');

// Your own routes (keep as-is)
const wishlistRoutes = require('./routes/wishlist');
const webhookRoutes = require('./routes/webhooks');
const shopifyRoutes = require('./routes/shopify');

const app = express();
const PORT = process.env.PORT || 3000;

// IMPORTANT: needed for OAuth cookies on Render/Heroku (behind proxy)
app.set('trust proxy', 1);

/* ---------- Security / parsing / static ---------- */
app.use(helmet({
  contentSecurityPolicy: false, // we'll set minimal CSP manually
  frameguard: false,            // allow embedding in iframe
  crossOriginEmbedderPolicy: false,
}));

// Minimal CSP so Shopify admin can embed the app
app.use((req, res, next) => {
  res.setHeader(
    'Content-Security-Policy',
    "frame-ancestors https://*.myshopify.com https://admin.shopify.com;"
  );
  next();
});

// --- Corrected CORS Configuration ---
// Explicitly allow only Shopify domains for CORS
const allowedOrigins = [
  'https://admin.shopify.com',
  `https://${process.env.SHOP_CUSTOM_URL}` // Your custom shop URL if applicable
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true
}));

app.use(cookieParser());
app.use('/webhooks', express.raw({ type: 'application/json' })); // raw body for webhooks
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(express.static(path.join(__dirname, 'public')));

// --- Rate Limiting ---
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again after 15 minutes'
});
app.use('/api/', apiLimiter); // Apply to all API routes

/* ---------- API routes (yours) ---------- */
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/shopify', shopifyRoutes);
app.use('/webhooks', webhookRoutes);

/* ---------- Health ---------- */
app.get('/health', (_req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
  });
});

/* ---------- OAuth flow (Top-level bounce) ---------- */
// Partner Dashboard → Configuration:
//   App URL:                 https://<your-render>.onrender.com/auth
//   Allowed redirection URL: https://<your-render>.onrender.com/auth/callback

// Step 1: ensure top-level context so cookies can be set
app.get('/auth/toplevel', (req, res) => {
  const { shop, host } = req.query;

  // Set a cookie readable by client JS to mark top-level step
  res.cookie('shopify.top_level_oauth', '1', {
    httpOnly: false,   // must be readable by the browser
    sameSite: 'none',  // required for embedded apps
    secure: true,      // required on HTTPS
  });

  // Break out of the iframe and return to /auth at top-level
  res
    .status(200)
    .type('html')
    .send(`
      <!DOCTYPE html>
      <html>
        <body>
          <script>
            window.top.location.href = "/auth?shop=${encodeURIComponent(shop || '')}&host=${encodeURIComponent(host || '')}";
          </script>
        </body>
      </html>
    `);
});

// Step 2: start OAuth (bounce to Shopify)
app.get('/auth', async (req, res) => {
  console.log('AUTH cookies:', req.headers.cookie || '(none)');

  const { shop, host } = req.query;
  if (!shop) return res.status(400).send('Missing ?shop');

  // If top-level cookie not set yet, go run the toplevel step
  if (!req.cookies['shopify.top_level_oauth']) {
    return res.redirect(
      `/auth/toplevel?shop=${encodeURIComponent(shop)}&host=${encodeURIComponent(host || '')}`
    );
  }

  await shopify.auth.begin({
    shop,
    callbackPath: '/auth/callback',
    isOnline: false,         // offline access
    rawRequest: req,
    rawResponse: res,
  });
});

// Step 3: callback — exchange code for session, then into the app
app.get('/auth/callback', async (req, res) => {
  try {
    console.log('CALLBACK cookies:', req.headers.cookie || '(none)');

    const { session } = await shopify.auth.callback({
      rawRequest: req,
      rawResponse: res,
    });

    const { host, shop } = req.query;
    return res.redirect(
      `/app?host=${encodeURIComponent(host || '')}&shop=${encodeURIComponent(shop || session.shop)}`
    );
  } catch (e) {
    console.error('OAuth callback error:', {
      message: e?.message,
      name: e?.name,
      stack: e?.stack,
      query: req.query,
    });
    return res.status(500).send('Auth error');
  }
});

/* ---------- Embedded Admin UI ---------- */
// v7-compatible session guard
app.get('/app', async (req, res) => {
  try {
    const session = await shopify.utils.loadCurrentSession(req, res, false); // offline

    // If no session or missing token → redirect to auth
    if (!session || !session.accessToken) {
      const { shop, host } = req.query;
      console.warn('No valid session — redirecting to /auth');
      return res.redirect(
        `/auth?shop=${encodeURIComponent(shop || '')}&host=${encodeURIComponent(host || '')}`
      );
    }

    // ✅ Session is valid — load your app's embedded UI
    res
      .status(200)
      .send('<html><body style="font-family:system-ui;padding:24px">Wishlist app loaded ✔</body></html>');

  } catch (err) {
    console.error('Error loading /app route:', err);

    // Redirect to auth instead of throwing 500
    const { shop, host } = req.query;
    return res.redirect(
      `/auth?shop=${encodeURIComponent(shop || '')}&host=${encodeURIComponent(host || '')}`
    );
  }
});

/* ---------- Optional landing ---------- */
app.get('/', (_req, res) => {
  return res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

/* ---------- Errors & 404 ---------- */
app.use((err, _req, res, _next) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    error: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
  });
});

app.use((_req, res) => res.status(404).json({ success: false, error: 'Route not found' }));

/* ---------- Start ---------- */
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server on ${PORT}`);
});