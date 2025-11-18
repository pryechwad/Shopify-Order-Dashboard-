const { shopify } = require('./config');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

// Generate OAuth URL
const generateAuthUrl = async (shop) => {
  try {
    // Clean and format shop domain
    let cleanShop = shop.trim().toLowerCase();
    
    // Remove protocol if present
    cleanShop = cleanShop.replace(/^https?:\/\//, '');
    
    // Add .myshopify.com if not present
    if (!cleanShop.includes('.myshopify.com')) {
      cleanShop = `${cleanShop}.myshopify.com`;
    }
    
    // Remove .myshopify.com for validation, then add it back
    const shopName = cleanShop.replace('.myshopify.com', '');
    
    console.log(`Processing shop: ${shop} -> ${shopName}`);
    
    // Basic validation - just check it's not empty
    if (!shopName || shopName.length === 0) {
      throw new Error(`Invalid shop name: ${shopName}`);
    }
    
    const fullShopDomain = `${shopName}.myshopify.com`;
    console.log(`Using shop domain: ${fullShopDomain}`);
    
    // Create the OAuth URL manually
    const scopes = ['read_orders', 'read_products', 'read_customers'].join(',');
    const redirectUri = `${process.env.APP_URL}/auth/callback`;
    const state = Math.random().toString(36).substring(7);
    
    const authUrl = `https://${fullShopDomain}/admin/oauth/authorize?` +
      `client_id=${process.env.SHOPIFY_API_KEY}&` +
      `scope=${encodeURIComponent(scopes)}&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `state=${state}`;
    
    console.log(`Generated OAuth URL: ${authUrl}`);
    return authUrl;
  } catch (error) {
    console.error('Error generating auth URL:', error);
    throw error;
  }
};

// Handle OAuth callback
const handleCallback = async (req, res) => {
  try {
    const { code, shop, state, error, error_description } = req.query;
    
    // Check for OAuth errors first
    if (error) {
      console.error(`OAuth error: ${error} - ${error_description}`);
      throw new Error(`OAuth failed: ${error_description || error}`);
    }
    
    if (!code || !shop) {
      throw new Error('Missing required parameters: code or shop');
    }
    
    console.log(`Processing OAuth callback for shop: ${shop}`);
    
    // Validate shop domain format
    if (!shop.includes('.myshopify.com')) {
      throw new Error(`Invalid shop domain format: ${shop}`);
    }
    
    // Exchange code for access token
    const tokenUrl = `https://${shop}/admin/oauth/access_token`;
    const tokenData = {
      client_id: process.env.SHOPIFY_API_KEY,
      client_secret: process.env.SHOPIFY_API_SECRET,
      code: code
    };
    
    console.log(`Exchanging code for access token at: ${tokenUrl}`);
    
    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(tokenData)
    });
    
    const responseText = await response.text();
    console.log(`Token response status: ${response.status}`);
    console.log(`Token response: ${responseText}`);
    
    if (!response.ok) {
      throw new Error(`Token exchange failed: ${response.status} ${response.statusText} - ${responseText}`);
    }
    
    const tokenResponse = JSON.parse(responseText);
    
    if (!tokenResponse.access_token) {
      throw new Error('No access token received from Shopify');
    }
    
    console.log(`Successfully obtained access token for shop: ${shop}`);
    
    return {
      shop: shop,
      accessToken: tokenResponse.access_token,
      scope: tokenResponse.scope,
    };
  } catch (error) {
    console.error('OAuth callback error:', error);
    throw error;
  }
};

// Validate webhook
const validateWebhook = (rawBody, signature) => {
  return shopify.webhooks.validate({
    rawBody,
    rawHeader: signature,
  });
};

module.exports = {
  generateAuthUrl,
  handleCallback,
  validateWebhook,
};