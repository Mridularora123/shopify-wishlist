// server.js
require('@shopify/shopify-api/adapters/node'); // IMPORTANT: register Node adapter first

const express = require('express');
const dotenv = require('dotenv');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');

// Shopify config (the safe one we wrote earlier in config/shopify.js)
const shopify = require('./config/shopify');

dotenv.config();

const wishlistRoutes = require('./routes/wishlist');
const webhookRoutes  = require('./routes/webhooks');
const shopifyRoutes  = require('./routes/shopify');

const app  = express();
const PORT = process.env.PORT || 3000;

/* ---------- Security / parsing / static ---------- */
// app.use(helmet());
app.use(helmet({
  contentSecurityPolicy: false,
  frameguard: false,
  crossOriginEmbedderPolicy: false,
}));

// add Shopify CSP headers so admin can iframe the app
app.use(shopify.cspHeaders());

app.use(cors({ origin: true, credentials: true }));
app.use('/webhooks', express.raw({ type: 'application/json' })); // raw for webhooks
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(express.static(path.join(__dirname, 'public')));

/* ---------- API routes (yours) ---------- */
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/shopify',  shopifyRoutes);
app.use('/webhooks',     webhookRoutes);

/* ---------- Health ---------- */
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
  });
});

/* ---------- OAuth flow ---------- */

// Option A: Make App URL point to /auth (simplest partner setup)
// Partner Dashboard → App setup:
//   App URL: https://<your-render>.onrender.com/auth
//   Allowed redirection URL(s): https://<your-render>.onrender.com/auth/callback

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

// Handle callback
app.get('/auth/callback', async (req, res) => {
  try {
    const { session } = await shopify.auth.callback({
      rawRequest: req,
      rawResponse: res,
    });

    // TODO: register webhooks here with `session` if needed

    const { host, shop } = req.query;
    return res.redirect(`/app?host=${encodeURIComponent(host || '')}&shop=${encodeURIComponent(shop || session.shop)}`);
  } catch (e) {
    console.error('OAuth callback error:', e);
    return res.status(500).send('Auth error');
  }
});

/* ---------- Embedded app UI ---------- */
// app.get('/app', (_req, res) => {
  // Serve your admin UI; for now a simple OK page:
//   res.send('Wishlist app loaded ✔');
// });

app.get('/app', shopify.validateAuthenticatedSession(), (_req, res) => {
  res
    .status(200)
    .send('<html><body style="font-family:system-ui;padding:24px">Wishlist app loaded ✔</body></html>');
});


/* ---------- Optional: if you keep App URL = "/" ----------
app.get('/', (req, res) => {
  const { shop, host } = req.query;
  if (!shop) return res.status(400).send('Missing ?shop');
  return res.redirect(`/auth?shop=${encodeURIComponent(shop)}&host=${encodeURIComponent(host || '')}`);
});
--------------------------------------------------------- */

/* ---------- Fallbacks ---------- */
app.get('/', (_req, res) => {
  // If someone visits root directly, show your landing page.
  return res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.use((err, _req, res, _next) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    error: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
  });
});

app.use((_req, res) => {
  res.status(404).json({ success: false, error: 'Route not found' });
});

/* ---------- Start ---------- */
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server on ${PORT}`);
});
