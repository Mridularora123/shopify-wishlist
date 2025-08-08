// config/shopify.js — for @shopify/shopify-api v7.x
require('@shopify/shopify-api/adapters/node');

const { shopifyApi, LATEST_API_VERSION } = require('@shopify/shopify-api');

function reqEnv(name) {
  const v = process.env[name];
  if (!v || !String(v).trim()) throw new Error(`Missing required env: ${name}`);
  return String(v).trim();
}

const API_KEY    = reqEnv('SHOPIFY_API_KEY');
const API_SECRET = reqEnv('SHOPIFY_API_SECRET');

const SCOPES_STR = reqEnv('SHOPIFY_SCOPES'); // e.g. read_products,read_customers
if (/shopify_scopes\s*=/i.test(SCOPES_STR)) {
  throw new Error('Invalid SHOPIFY_SCOPES value. Use only a comma list like "read_products,write_customers".');
}
const SCOPES = SCOPES_STR.split(',').map(s => s.trim()).filter(Boolean);

const RAW_HOST = (process.env.APP_URL || process.env.HOST || process.env.SHOPIFY_APP_URL || '').trim();
if (!RAW_HOST) throw new Error('Missing env: APP_URL or HOST (e.g. https://your-app.onrender.com)');
const HOST_NAME = RAW_HOST.replace(/^https?:\/\//i, '').replace(/\/+$/, '');

const shopify = shopifyApi({
  apiKey: API_KEY,
  apiSecretKey: API_SECRET,
  scopes: SCOPES,
  hostName: HOST_NAME,        // e.g. "shopify-wishlist-kji7.onrender.com"
  apiVersion: LATEST_API_VERSION,
  isEmbeddedApp: true,
  // v7 uses an in-memory session store by default; no explicit sessionStorage needed
  logger: { level: process.env.NODE_ENV === 'production' ? 'info' : 'debug' },
});

module.exports = shopify;
