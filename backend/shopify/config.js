const { shopifyApi, ApiVersion } = require('@shopify/shopify-api');
require('@shopify/shopify-api/adapters/node');

// Shopify API Configuration
const shopify = shopifyApi({
  apiKey: process.env.SHOPIFY_API_KEY,
  apiSecretKey: process.env.SHOPIFY_API_SECRET,
  scopes: ['read_orders', 'read_products', 'read_customers'],
  hostName: process.env.APP_URL?.replace(/https?:\/\//, '') || 'localhost:3001',
  apiVersion: ApiVersion.October23,
  isEmbeddedApp: false,
  logger: {
    level: 'info',
  },
});

module.exports = { shopify };