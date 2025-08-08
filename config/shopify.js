// config/shopify.js — @shopify/shopify-api v7.x
require('@shopify/shopify-api/adapters/node');

const { shopifyApi, LATEST_API_VERSION } = require('@shopify/shopify-api');
require('dotenv').config();

function required(name, val) {
  if (!val || String(val).trim() === '') throw new Error(`Missing env: ${name}`);
  return String(val).trim();
}

// Scopes
const scopesStr = (process.env.SHOPIFY_SCOPES || process.env.SCOPES || '').trim();
if (!scopesStr) throw new Error('Missing env: SHOPIFY_SCOPES (comma-separated list)');
if (/shopify_scopes\s*=/i.test(scopesStr)) {
  throw new Error('Invalid SHOPIFY_SCOPES value — use just "read_products,write_customers,..." (no "SHOPIFY_SCOPES=" prefix)');
}
const scopes = scopesStr.split(',').map(s => s.trim()).filter(Boolean);

// Hostname (no protocol, no trailing slash)
const rawHost = (process.env.SHOPIFY_APP_URL || process.env.APP_URL || process.env.HOST || '').trim();
const hostName = rawHost.replace(/^https?:\/\//i, '').replace(/\/+$/, '');
if (!hostName) throw new Error('Missing env: APP_URL or HOST (e.g. https://your-app.onrender.com)');

const shopify = shopifyApi({
  apiKey: required('SHOPIFY_API_KEY', process.env.SHOPIFY_API_KEY),
  apiSecretKey: required('SHOPIFY_API_SECRET', process.env.SHOPIFY_API_SECRET),
  scopes,
  hostName,                           // e.g. "shopify-wishlist-kji7.onrender.com"
  apiVersion: LATEST_API_VERSION,
  isEmbeddedApp: true,
  logger: { level: process.env.SHOPIFY_LOG_LEVEL || 'info' },
});

module.exports = shopify;
