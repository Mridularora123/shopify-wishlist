// config/shopify.js
const { shopifyApi, LATEST_API_VERSION } = require("@shopify/shopify-api");
require("dotenv").config();

/**
 * Helpers
 */
function required(name, value) {
  if (!value || String(value).trim() === "") {
    throw new Error(`Missing required env var: ${name}`);
  }
  return value;
}

function getScopes() {
  const raw =
    process.env.SHOPIFY_SCOPES ||
    process.env.SCOPES ||
    process.env.SHOPIFY_API_SCOPES; // last-chance alias
  required("SHOPIFY_SCOPES (or SCOPES)", raw);
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function getHostName() {
  const url =
    process.env.SHOPIFY_APP_URL ||
    process.env.APP_URL ||
    process.env.HOST ||
    process.env.HOSTNAME;
  required("SHOPIFY_APP_URL (or APP_URL/HOST)", url);
  return String(url).replace(/^https?:\/\//, "").replace(/\/+$/, "");
}

/**
 * Shopify API client
 */
const shopify = shopifyApi({
  apiKey: required("SHOPIFY_API_KEY", process.env.SHOPIFY_API_KEY),
  apiSecretKey: required("SHOPIFY_API_SECRET", process.env.SHOPIFY_API_SECRET),
  scopes: getScopes(),
  hostName: getHostName(),
  apiVersion: LATEST_API_VERSION,
  isEmbeddedApp: true,
  logger: { level: process.env.SHOPIFY_LOG_LEVEL || "info" },
});

module.exports = shopify;
