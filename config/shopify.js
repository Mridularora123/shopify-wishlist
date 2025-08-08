// config/shopify.js — add MemorySessionStorage
require('@shopify/shopify-api/adapters/node');
const { shopifyApi, LATEST_API_VERSION } = require('@shopify/shopify-api');
const { MemorySessionStorage } = require('@shopify/shopify-api/session-storage/memory');

function required(name, val) {
  if (!val || String(val).trim() === '') throw new Error(`Missing env: ${name}`);
  return String(val).trim();
}
const scopesStr = (process.env.SHOPIFY_SCOPES || process.env.SCOPES || '').trim();
if (!scopesStr) throw new Error('Missing env: SHOPIFY_SCOPES');
if (/shopify_scopes\s*=/i.test(scopesStr)) throw new Error('Invalid SHOPIFY_SCOPES value');
const scopes = scopesStr.split(',').map(s => s.trim()).filter(Boolean);

const rawHost = (process.env.SHOPIFY_APP_URL || process.env.APP_URL || process.env.HOST || '').trim();
const hostName = rawHost.replace(/^https?:\/\//i, '').replace(/\/+$/, '');
if (!hostName) throw new Error('Missing env: APP_URL or HOST');

const shopify = shopifyApi({
  apiKey: required('SHOPIFY_API_KEY', process.env.SHOPIFY_API_KEY),
  apiSecretKey: required('SHOPIFY_API_SECRET', process.env.SHOPIFY_API_SECRET),
  scopes,
  hostName,
  apiVersion: LATEST_API_VERSION,
  isEmbeddedApp: true,
  sessionStorage: new MemorySessionStorage(),   // <-- add this
  logger: { level: process.env.NODE_ENV === 'production' ? 'info' : 'debug' },
});

module.exports = shopify;
