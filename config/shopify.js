// config/shopify.js
require('@shopify/shopify-api/adapters/node');   // <-- register Node adapter

const { shopifyApi, LATEST_API_VERSION } = require('@shopify/shopify-api');
require('dotenv').config();

// helpers
function required(name, val) {
  if (!val || String(val).trim() === '') throw new Error(`Missing env: ${name}`);
  return val;
}
const scopesStr = process.env.SHOPIFY_SCOPES || process.env.SCOPES || '';
const scopes = scopesStr.split(',').map(s => s.trim()).filter(Boolean);
const host =
  (process.env.SHOPIFY_APP_URL || process.env.APP_URL || process.env.HOST || '')
    .replace(/^https?:\/\//, '')
    .replace(/\/+$/, '');

const shopify = shopifyApi({
  apiKey: required('SHOPIFY_API_KEY', process.env.SHOPIFY_API_KEY),
  apiSecretKey: required('SHOPIFY_API_SECRET', process.env.SHOPIFY_API_SECRET),
  scopes: scopes,
  hostName: required('APP_URL/HOST', host),
  apiVersion: LATEST_API_VERSION,
  isEmbeddedApp: true,
  logger: { level: process.env.SHOPIFY_LOG_LEVEL || 'info' },
});

module.exports = shopify;
