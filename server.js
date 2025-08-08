// server.js
require('@shopify/shopify-api/adapters/node'); // Register Node adapter FIRST

const express = require('express');
const dotenv = require('dotenv');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');

dotenv.config();

/** Shopify SDK config */
const shopify = require('./config/shopify');

/** Your routes */
const wishlistRoutes = require('./routes/wishlist');   // /api/wishlist
const webhookRoutes  = require('./routes/webhooks');   // /webhooks
const shopifyRoutes  = require('./routes/shopify');    // /api/shopify

const app  = express();
const PORT = process.env.PORT || 3000;

/* ---------------- Security / parsing / static ---------------- */

/** Allow embedding in Shopify Admin iFrame */
app.use(
  helmet({
    frameguard: false,                // disable X-Frame-Options
    contentSecurityPolicy: false,     // we'll set our own CSP
    crossOriginEmbedderPolicy: false, // avoid COEP issues in iframe
  })
);

/** Trust Render’s proxy so secure cookies work */
app.set('trust proxy', 1);

/** Minimal CSP so the Admin can embed us */
app.use((req, res, next) => {
  const shopParam = req.query.shop;
  const shopUrl = shopParam ? `https://${shopParam}` : '';
  res.setHeader(
    'Content-Security-Policy',
    `frame-ancestors https://admin.shopify.com ${shopUrl};`
  );
  next();
});

/** CORS */
app.use(cors({ origin: true, credentials: true }));

/** Raw body for webhooks BEFORE json parser */
app.use('/webhooks', express.raw({ type: 'application/json' }));

/** Normal parsers */
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

/** Static assets */
app.use(express.static(path.join(__dirname, 'public')));

/* ---------------- Health check ---------------- */
app.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    env: process.env.NODE_ENV || 'development',
  });
});

/* ---------------- OAuth flow ---------------- */

// Start OAuth
app.get('/auth', async (req, res) => {
  try {
    const { shop } = req.query;
    if (!shop) return res.status(400).send('Missing ?shop');
    await shopify.auth.begin({
      shop,
      callbackPath: '/auth/callback',
      isOnline: false,
      rawRequest: req,
      rawResponse: res,
    });
  } catch (err) {
    console.error('OAuth start error:', err);
    res.status(500).send('Auth start error');
  }
});

// OAuth callback
app.get('/auth/callback', async (req, res) => {
  try {
    const { session } = await shopify.auth.callback({
      rawRequest: req,
      rawResponse: res,
    });

    // TODO: register webhooks here if needed

    const { host, shop } = req.query;
    return res.redirect(
      `/app?host=${encodeURIComponent(host || '')}&shop=${encodeURIComponent(
        shop || session.shop
      )}`
    );
  } catch (err) {
    console.error('OAuth callback error:', err);
    res.status(500).send('Auth error');
  }
});

/* ---------------- Embedded Admin UI ---------------- */
app.get('/app', (_req, res) => {
  res.type('html').send(`<!doctype html>
<html>
  <head><meta charset="utf-8"><title>Wishlist App</title></head>
  <body style="font-family:system-ui;padding:24px">
    <h1>Wishlist app loaded ✔</h1>
    <p>If you can see this inside Shopify Admin, the embed works.</p>
  </body>
</html>`);
});

/* ---------------- API routes ---------------- */
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/shopify',  shopifyRoutes);
app.use('/webhooks',     webhookRoutes);

/* ---------------- Root redirect ---------------- */
app.get('/', (req, res) => {
  const { shop, host } = req.query;

  if (host) {
    return res.redirect(
      `/app?host=${encodeURIComponent(host)}${shop ? `&shop=${encodeURIComponent(shop)}` : ''}`
    );
  }

  if (shop) return res.redirect(`/auth?shop=${encodeURIComponent(shop)}`);

  res.type('html').send(`
    <h2>Wishlist App</h2>
    <p>Open this app from your Shopify Admin.</p>
  `);
});

/* ---------------- Errors & 404 ---------------- */
app.use((err, _req, res, _next) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    error:
      process.env.NODE_ENV === 'production'
        ? 'Internal server error'
        : (err && err.message) || 'Unknown error',
  });
});

app.use((_req, res) => {
  res.status(404).json({ success: false, error: 'Route not found' });
});

/* ---------------- Start server ---------------- */
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server on ${PORT}`);
});
