// config/shopify.js — @shopify/shopify-api v7.x
require('@shopify/shopify-api/adapters/node');

const { shopifyApi, LATEST_API_VERSION } = require('@shopify/shopify-api');

/** Helper: read required env var (throw if missing) */
function reqEnv(name) {
  const v = process.env[name];
  if (!v || !String(v).trim()) throw new Error(`Missing required env: ${name}`);
  return String(v).trim();
}

/** Required env */
const API_KEY     = reqEnv('SHOPIFY_API_KEY');
const API_SECRET  = reqEnv('SHOPIFY_API_SECRET');
const SCOPES_RAW  = reqEnv('SHOPIFY_SCOPES'); // e.g. "read_products,write_customers"
const APP_URL_RAW = reqEnv('APP_URL') || reqEnv('HOST') || reqEnv('SHOPIFY_APP_URL'); // https://your-app.onrender.com

/** Validate scopes string */
if (/shopify_scopes\s*=/i.test(SCOPES_RAW)) {
  throw new Error(
    'Invalid SHOPIFY_SCOPES. Use a plain comma list like: read_products,write_customers'
  );
}
const SCOPES = SCOPES_RAW.split(',').map(s => s.trim()).filter(Boolean);

/** Normalize host name for the SDK (no protocol, no trailing /) */
const HOST_NAME = APP_URL_RAW.replace(/^https?:\/\//i, '').replace(/\/+$/, '');

const shopify = shopifyApi({
  apiKey: API_KEY,
  apiSecretKey: API_SECRET,
  scopes: SCOPES,
  hostName: HOST_NAME,                 // e.g. "shopify-wishlist-kji7.onrender.com"
  apiVersion: LATEST_API_VERSION,
  isEmbeddedApp: true,
  // Optional: helpful in logs
  userAgentPrefix: 'wishlist-app/1.0.0',
  logger: { level: process.env.NODE_ENV === 'production' ? 'info' : 'debug' },
});

module.exports = shopify;
