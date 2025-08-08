// server.js  (for @shopify/shopify-api v7.x)
require('@shopify/shopify-api/adapters/node'); // safe with v7

const express = require('express');
const dotenv  = require('dotenv');
const path    = require('path');
const cors    = require('cors');
const helmet  = require('helmet');

dotenv.config();

// Shopify API config instance you created in ./config/shopify
const shopify = require('./config/shopify');

// Your own routes
const wishlistRoutes = require('./routes/wishlist');
const webhookRoutes  = require('./routes/webhooks');
const shopifyRoutes  = require('./routes/shopify');

const app  = express();
const PORT = process.env.PORT || 3000;

// IMPORTANT for OAuth cookies on Render/Heroku behind proxy
app.set('trust proxy', 1);

/* ---------- Security / parsing / static ---------- */
// Allow embedding in Shopify admin and set our own CSP
app.use(helmet({
  contentSecurityPolicy: false,
  frameguard: false,
  crossOriginEmbedderPolicy: false,
}));

// Minimal CSP so Shopify admin can iframe your app
app.use((req, res, next) => {
  res.setHeader(
    'Content-Security-Policy',
    "frame-ancestors https://*.myshopify.com https://admin.shopify.com;"
  );
  next();
});

app.use(cors({ origin: true, credentials: true }));
app.use('/webhooks', express.raw({ type: 'application/json' })); // raw body for webhooks
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(express.static(path.join(__dirname, 'public')));

/* ---------- API routes (yours) ---------- */
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/shopify',  shopifyRoutes);
app.use('/webhooks',     webhookRoutes);

/* ---------- Health ---------- */
app.get('/health', (_req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
  });
});

/* ---------- OAuth flow ---------- */
// Partner Dashboard → Configuration:
//   App URL:                 https://<your-render>.onrender.com/auth
//   Allowed redirection URL: https://<your-render>.onrender.com/auth/callback

// Start OAuth
app.get('/auth', async (req, res) => {
  const { shop } = req.query;
  if (!shop) return res.status(400).send('Missing ?shop');
  await shopify.auth.begin({
    shop,
    callbackPath: '/auth/callback',
    isOnline: false,
    rawRequest: req,
    rawResponse: res,
  });
});

// OAuth callback with good logging
app.get('/auth/callback', async (req, res) => {
  try {
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
    if (!session) {
      const { shop, host } = req.query;
      return res.redirect(
        `/auth?shop=${encodeURIComponent(shop || '')}&host=${encodeURIComponent(host || '')}`
      );
    }

    // Simple UI for now; replace with your real admin app
    res
      .status(200)
      .send('<html><body style="font-family:system-ui;padding:24px">Wishlist app loaded ✔</body></html>');
  } catch (err) {
    console.error('Session load error:', err);
    res.status(500).send('Session error');
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
