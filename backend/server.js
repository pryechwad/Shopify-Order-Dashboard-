const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const fetch = require('node-fetch');
require('dotenv').config();

// Shopify integration
const { shopify } = require('./shopify/config');
const { generateAuthUrl, handleCallback } = require('./shopify/auth');
const { fetchOrders, fetchOrderDetails, fetchRecentOrders } = require('./shopify/orders');

const app = express();
const PORT = process.env.PORT || 3001;

// Database connection
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'shopify_orders',
  password: process.env.DB_PASSWORD || 'password',
  port: process.env.DB_PORT || 5432,
});

// Test database connection
pool.on('connect', () => {
  console.log('✅ Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('❌ Database connection error:', err);
});

// Middleware
app.use(cors());
app.use(express.json());

// Shopify OAuth endpoints
app.get('/auth', async (req, res) => {
  const { shop } = req.query;
  if (!shop) return res.status(400).send('Shop parameter required');
  
  console.log(`🔐 OAuth request for shop: ${shop}`);
  console.log(`🔑 API Key: ${process.env.SHOPIFY_API_KEY}`);
  console.log(`🔗 App URL: ${process.env.APP_URL}`);
  
  try {
    const authUrl = await generateAuthUrl(shop);
    console.log(`🔗 Generated OAuth URL: ${authUrl}`);
    res.redirect(authUrl);
  } catch (error) {
    console.error('❌ OAuth generation failed:', error);
    res.status(500).send(`OAuth setup failed: ${error.message}`);
  }
});

app.get('/auth/callback', async (req, res) => {
  try {
    console.log('OAuth callback received:', req.query);
    
    const { shop, accessToken } = await handleCallback(req, res);
    
    // Store shop and access token in database
    await pool.query(
      'INSERT INTO shops (shop_domain, access_token) VALUES ($1, $2) ON CONFLICT (shop_domain) DO UPDATE SET access_token = $2, created_at = CURRENT_TIMESTAMP',
      [shop, accessToken]
    );
    
    console.log(`✅ Successfully authenticated shop: ${shop}`);
    
    // Fetch and store initial orders
    try {
      const orders = await fetchRecentOrders(shop, accessToken);
      await storeOrdersInDatabase(orders);
      console.log(`📦 Fetched ${orders.length} orders for ${shop}`);
    } catch (orderError) {
      console.error('Error fetching initial orders:', orderError);
    }
    
    // Extract shop name without .myshopify.com for frontend
    const shopName = shop.replace('.myshopify.com', '');
    res.redirect(`${process.env.FRONTEND_URL}?shop=${shopName}`);
  } catch (error) {
    console.error('OAuth callback error:', error);
    
    // Provide more specific error page
    const errorMessage = encodeURIComponent(error.message || 'Authentication failed');
    res.redirect(`${process.env.FRONTEND_URL}?error=${errorMessage}`);
  }
});

// API endpoints
app.get('/api/orders', async (req, res) => {
  const { shop } = req.query;
  
  try {
    console.log(`📊 Fetching orders for shop: ${shop}`);
    
    // Ensure shop domain format consistency
    const shopDomain = shop.includes('.myshopify.com') ? shop : `${shop}.myshopify.com`;
    
    // First, try to get orders from database
    const result = await pool.query(
      'SELECT * FROM orders WHERE shop = $1 ORDER BY created_at DESC',
      [shop]
    );
    
    console.log(`📦 Found ${result.rows.length} orders in database for shop ${shop}`);
    
    // Check if we have access token for this shop to sync fresh data
    const shopResult = await pool.query(
      'SELECT access_token FROM shops WHERE shop_domain = $1',
      [shopDomain]
    );
    
    if (shopResult.rows.length > 0 && process.env.SHOPIFY_API_KEY) {
      console.log(`🔄 Syncing fresh orders from Shopify for ${shop}`);
      
      try {
        // Use real Shopify API to get fresh data
        const accessToken = shopResult.rows[0].access_token;
        const orders = await fetchRecentOrders(shopDomain, accessToken);
        
        console.log(`📥 Fetched ${orders.length} orders from Shopify`);
        
        // Store orders in database
        await storeOrdersInDatabase(orders);
        
        // Return fresh data from Shopify
        return res.json(orders);
      } catch (syncError) {
        console.error('❌ Error syncing from Shopify, using database data:', syncError);
        // Fall back to database data if sync fails
      }
    }
    
    if (result.rows.length > 0) {
      console.log(`📋 Returning ${result.rows.length} orders from database`);
      return res.json(result.rows);
    }
    
    // Generate demo data if no orders found
    console.log(`🎭 No orders found, generating demo data for ${shop}`);
    const demoOrders = generateDemoOrders(shop);
    res.json(demoOrders);
    
  } catch (error) {
    console.error('❌ Error fetching orders:', error);
    // Fallback to demo data
    const demoOrders = generateDemoOrders(shop);
    res.json(demoOrders);
  }
});

app.get('/api/orders/:orderId', async (req, res) => {
  const { orderId } = req.params;
  const { shop } = req.query;
  
  try {
    console.log(`🔍 Fetching order details for order ${orderId} in shop ${shop}`);
    
    // Ensure shop domain format consistency
    const shopDomain = shop.includes('.myshopify.com') ? shop : `${shop}.myshopify.com`;
    
    // First try to get from database
    const orderResult = await pool.query(
      'SELECT * FROM orders WHERE order_id = $1 AND shop = $2',
      [orderId, shop]
    );
    
    console.log(`📋 Found ${orderResult.rows.length} orders in database`);
    
    // Check if we have access token for this shop to get fresh data
    const shopResult = await pool.query(
      'SELECT access_token FROM shops WHERE shop_domain = $1',
      [shopDomain]
    );
    
    if (shopResult.rows.length > 0 && process.env.SHOPIFY_API_KEY) {
      console.log(`🔄 Fetching fresh order details from Shopify`);
      
      try {
        // Use real Shopify API for fresh data
        const accessToken = shopResult.rows[0].access_token;
        const orderDetails = await fetchOrderDetails(shopDomain, accessToken, orderId);
        
        console.log(`✅ Got order details from Shopify: $${orderDetails.order.total_price}`);
        return res.json(orderDetails);
      } catch (shopifyError) {
        console.error('❌ Error fetching from Shopify, using database:', shopifyError);
        // Fall back to database if Shopify fails
      }
    }
    
    if (orderResult.rows.length > 0) {
      // Get line items from database
      const itemsResult = await pool.query(
        'SELECT fi.*, i.image_url FROM fulfillment_items fi LEFT JOIN images i ON fi.id = i.return_item_id WHERE fi.order_id = $1',
        [orderId]
      );
      
      console.log(`📦 Returning order from database: $${orderResult.rows[0].total_price}`);
      
      return res.json({
        order: orderResult.rows[0],
        items: itemsResult.rows
      });
    }
    
    // Generate demo order only if nothing found
    console.log(`🎭 Generating demo order for ${orderId}`);
    const demoOrder = generateDemoOrder(shop, orderId);
    res.json(demoOrder);
    
  } catch (error) {
    console.error('❌ Error fetching order details:', error);
    const demoOrder = generateDemoOrder(shop, orderId);
    res.json(demoOrder);
  }
});

// Helper functions
const generateDemoOrders = (shopName) => {
  const statuses = ['paid', 'pending', 'refunded', 'cancelled']
  const customers = [
    `customer@${shopName}.com`,
    `john@${shopName}.com`, 
    `sarah@${shopName}.com`,
    `mike@${shopName}.com`,
    `admin@${shopName}.com`
  ]
  
  return Array.from({ length: 15 }, (_, i) => ({
    id: i + 1,
    shop: shopName,
    order_id: 1000 + i + 1,
    status: statuses[Math.floor(Math.random() * statuses.length)],
    total_price: (Math.random() * 500 + 50).toFixed(2),
    customer_email: customers[Math.floor(Math.random() * customers.length)],
    created_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
  }))
};

const generateDemoOrder = (shop, orderId) => {
  // Use consistent demo data based on orderId to avoid different amounts
  const seed = parseInt(orderId) || 1001;
  const basePrice = 50 + (seed % 450); // Consistent price based on order ID
  
  return {
    order: {
      id: orderId,
      shop: shop,
      order_id: orderId,
      status: ['paid', 'pending', 'refunded'][seed % 3],
      total_price: basePrice.toFixed(2),
      customer_email: `customer${seed % 5}@${shop}.com`,
      created_at: new Date(Date.now() - (seed % 30) * 24 * 60 * 60 * 1000).toISOString()
    },
    items: [
      {
        id: 1,
        product_title: `${shop.charAt(0).toUpperCase() + shop.slice(1)} Product ${seed % 10}`,
        variant_title: 'Default Variant',
        qty: (seed % 3) + 1,
        price: (basePrice * 0.8).toFixed(2),
        line_item_id: seed + 1000
      }
    ]
  };
};

// Store orders in database
const storeOrdersInDatabase = async (orders) => {
  console.log(`💾 Storing ${orders.length} orders in database...`);
  
  for (const order of orders) {
    try {
      // Extract shop name without .myshopify.com for consistency
      const shopName = order.shop.replace('.myshopify.com', '');
      
      console.log(`📦 Storing order ${order.order_id} for shop ${shopName}`);
      
      await pool.query(
        'INSERT INTO orders (shop, order_id, status, total_price, customer_email, created_at, order_data) VALUES ($1, $2, $3, $4, $5, $6, $7) ON CONFLICT (shop, order_id) DO UPDATE SET status = $3, total_price = $4, order_data = $7',
        [shopName, order.order_id, order.status, order.total_price, order.customer_email, order.created_at, order.order_data || JSON.stringify(order)]
      );
      
      console.log(`✅ Successfully stored order ${order.order_id}`);
    } catch (error) {
      console.error(`❌ Error storing order ${order.order_id}:`, error);
    }
  }
  
  console.log(`✅ Finished storing ${orders.length} orders`);
};

// Legacy function for compatibility
async function fetchAndStoreOrders(shop, accessToken) {
  try {
    const sixtyDaysAgo = new Date();
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);
    
    const response = await fetch(`https://${shop}.myshopify.com/admin/api/2023-10/orders.json?created_at_min=${sixtyDaysAgo.toISOString()}&limit=250`, {
      headers: {
        'X-Shopify-Access-Token': accessToken
      }
    });
    
    if (!response.ok) {
      throw new Error(`Shopify API error: ${response.status}`);
    }
    
    const data = await response.json();
    const orders = data.orders || [];
    
    console.log(`Fetched ${orders.length} orders for shop ${shop}`);
    
    for (const order of orders) {
      // Store order
      await pool.query(
        'INSERT INTO orders (shop, order_id, status, total_price, customer_email, created_at, order_data) VALUES ($1, $2, $3, $4, $5, $6, $7) ON CONFLICT (shop, order_id) DO UPDATE SET status = $3, order_data = $7',
        [shop, order.id, order.financial_status, order.total_price, order.email, order.created_at, JSON.stringify(order)]
      );
      
      // Store line items with images
      if (order.line_items && order.line_items.length > 0) {
        for (const item of order.line_items) {
          const itemResult = await pool.query(
            'INSERT INTO fulfillment_items (order_id, line_item_id, qty, product_title, variant_title, price) VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT (order_id, line_item_id) DO UPDATE SET qty = $3, product_title = $4, variant_title = $5, price = $6 RETURNING id',
            [order.id, item.id, item.quantity, item.title, item.variant_title, item.price]
          );
          
          // Store product images if available
          if (item.product_id && itemResult.rows.length > 0) {
            const fulfillmentItemId = itemResult.rows[0].id;
            
            // Fetch product images from Shopify
            try {
              const productResponse = await fetch(`https://${shop}.myshopify.com/admin/api/2023-10/products/${item.product_id}/images.json`, {
                headers: { 'X-Shopify-Access-Token': accessToken }
              });
              
              if (productResponse.ok) {
                const productData = await productResponse.json();
                if (productData.images && productData.images.length > 0) {
                  for (const image of productData.images.slice(0, 3)) { // Limit to 3 images
                    await pool.query(
                      'INSERT INTO images (image_url, return_item_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
                      [image.src, fulfillmentItemId]
                    );
                  }
                }
              }
            } catch (imageError) {
              console.log(`Could not fetch images for product ${item.product_id}:`, imageError.message);
            }
          }
        }
      }
    }
  } catch (error) {
    console.error('Error fetching orders from Shopify:', error);
  }
}

// Sync orders endpoint for manual refresh
app.post('/api/sync-orders', async (req, res) => {
  const { shop } = req.body;
  
  try {
    // Check if Shopify credentials are configured
    if (!process.env.SHOPIFY_API_KEY || !process.env.SHOPIFY_API_SECRET) {
      return res.status(400).json({ 
        error: 'Shopify credentials not configured. Using demo data.',
        demo: true 
      });
    }
    
    // Ensure shop domain format consistency
    const shopDomain = shop.includes('.myshopify.com') ? shop : `${shop}.myshopify.com`;
    
    const shopResult = await pool.query(
      'SELECT access_token FROM shops WHERE shop_domain = $1',
      [shopDomain]
    );
    
    if (shopResult.rows.length === 0) {
      return res.status(404).json({ 
        error: `Shop '${shop}' not authenticated. Please connect your store first.`,
        needsAuth: true 
      });
    }
    
    const accessToken = shopResult.rows[0].access_token;
    
    if (!accessToken) {
      return res.status(401).json({ 
        error: 'No valid access token found. Please reconnect your store.',
        needsAuth: true 
      });
    }
    
    console.log(`🔄 Starting sync for shop: ${shopDomain}`);
    console.log(`🔑 Using access token: ${accessToken.substring(0, 10)}...`);
    
    const orders = await fetchRecentOrders(shopDomain, accessToken);
    console.log(`📦 Fetched ${orders.length} orders from Shopify`);
    
    await storeOrdersInDatabase(orders);
    console.log(`💾 Stored ${orders.length} orders in database`);
    
    res.json({ 
      success: true, 
      message: `Successfully synced ${orders.length} orders from Shopify`,
      count: orders.length,
      shop: shop
    });
  } catch (error) {
    console.error('❌ Error syncing orders:', error);
    console.error('❌ Error stack:', error.stack);
    
    // Provide more specific error messages
    let errorMessage = 'Failed to sync orders';
    let statusCode = 500;
    
    if (error.message.includes('Unauthorized') || error.message.includes('401')) {
      errorMessage = 'Store authentication expired. Please reconnect your store.';
      statusCode = 401;
    } else if (error.message.includes('Not Found') || error.message.includes('404')) {
      errorMessage = 'Store not found or access denied.';
      statusCode = 404;
    } else if (error.message.includes('GraphQL')) {
      errorMessage = 'Error fetching data from Shopify API.';
    } else if (error.message.includes('fetch')) {
      errorMessage = 'Network error connecting to Shopify.';
    }
    
    res.status(statusCode).json({ 
      error: errorMessage,
      details: error.message,
      shop: shop
    });
  }
});

// Check authentication status
app.get('/api/auth-status', async (req, res) => {
  const { shop } = req.query;
  
  try {
    if (!process.env.SHOPIFY_API_KEY || !process.env.SHOPIFY_API_SECRET) {
      return res.json({ 
        authenticated: false, 
        demo: true,
        message: 'Running in demo mode - Shopify credentials not configured'
      });
    }
    
    // Ensure shop domain format consistency
    const shopDomain = shop.includes('.myshopify.com') ? shop : `${shop}.myshopify.com`;
    
    const shopResult = await pool.query(
      'SELECT access_token, created_at FROM shops WHERE shop_domain = $1',
      [shopDomain]
    );
    
    if (shopResult.rows.length === 0) {
      return res.json({ 
        authenticated: false, 
        demo: false,
        message: 'Store not connected. Please authenticate with Shopify.'
      });
    }
    
    res.json({ 
      authenticated: true, 
      demo: false,
      shop: shop,
      connectedAt: shopResult.rows[0].created_at,
      message: 'Store successfully connected to Shopify'
    });
  } catch (error) {
    console.error('Error checking auth status:', error);
    res.status(500).json({ error: 'Failed to check authentication status' });
  }
});

// Initialize database tables
async function initDatabase() {
  try {
    // Test database connection
    await pool.query('SELECT NOW()');
    
    await pool.query(`
      CREATE TABLE IF NOT EXISTS shops (
        id SERIAL PRIMARY KEY,
        shop_domain VARCHAR(255) UNIQUE NOT NULL,
        access_token VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    await pool.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        shop VARCHAR(255) NOT NULL,
        order_id BIGINT NOT NULL,
        status VARCHAR(50),
        total_price DECIMAL(10,2),
        customer_email VARCHAR(255),
        created_at TIMESTAMP,
        order_data JSONB,
        UNIQUE(shop, order_id)
      )
    `);
    
    await pool.query(`
      CREATE TABLE IF NOT EXISTS fulfillment_items (
        id SERIAL PRIMARY KEY,
        order_id BIGINT NOT NULL,
        line_item_id BIGINT NOT NULL,
        qty INTEGER,
        product_title VARCHAR(255),
        variant_title VARCHAR(255),
        price DECIMAL(10,2),
        reason VARCHAR(255),
        UNIQUE(order_id, line_item_id)
      )
    `);
    
    await pool.query(`
      CREATE TABLE IF NOT EXISTS images (
        id SERIAL PRIMARY KEY,
        image_url VARCHAR(500),
        return_item_id INTEGER REFERENCES fulfillment_items(id),
        UNIQUE(image_url, return_item_id)
      )
    `);
    
    console.log('✅ Database tables initialized');
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.log('⚠️  Server will run without database. Install PostgreSQL to enable full functionality.');
  }
}

// Debug endpoint to check database state
app.get('/api/debug/:shop', async (req, res) => {
  const { shop } = req.params;
  
  try {
    // Check shop authentication
    const shopDomain = shop.includes('.myshopify.com') ? shop : `${shop}.myshopify.com`;
    const shopResult = await pool.query(
      'SELECT * FROM shops WHERE shop_domain = $1',
      [shopDomain]
    );
    
    // Check orders in database
    const ordersResult = await pool.query(
      'SELECT COUNT(*) as count, MAX(created_at) as latest_order FROM orders WHERE shop = $1',
      [shop]
    );
    
    // Get sample orders
    const sampleOrders = await pool.query(
      'SELECT order_id, status, total_price, customer_email, created_at FROM orders WHERE shop = $1 ORDER BY created_at DESC LIMIT 5',
      [shop]
    );
    
    res.json({
      shop: shop,
      shopDomain: shopDomain,
      authenticated: shopResult.rows.length > 0,
      authDetails: shopResult.rows[0] || null,
      ordersCount: ordersResult.rows[0]?.count || 0,
      latestOrder: ordersResult.rows[0]?.latest_order || null,
      sampleOrders: sampleOrders.rows,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Debug endpoint error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Test order details endpoint
app.get('/api/test-order/:orderId', (req, res) => {
  const { orderId } = req.params;
  const { shop } = req.query;
  
  console.log(`🧪 Test endpoint called for order ${orderId} in shop ${shop}`);
  
  res.json({
    success: true,
    orderId: orderId,
    shop: shop,
    message: 'Test endpoint working',
    order: {
      order_id: orderId,
      shop: shop,
      status: 'paid',
      total_price: '99.99',
      customer_email: 'test@example.com',
      created_at: new Date().toISOString()
    },
    items: [
      {
        id: 1,
        product_title: 'Test Product',
        qty: 1,
        price: '99.99'
      }
    ]
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, async () => {
  try {
    await initDatabase();
    console.log(`✅ Server running on port ${PORT}`);
    console.log(`🔗 Health check: http://localhost:${PORT}/health`);
    console.log(`🔐 Auth URL: http://localhost:${PORT}/auth?shop=YOUR_SHOP_NAME`);
    console.log(`📊 REST API: http://localhost:${PORT}/api/orders`);
    console.log(`🐛 Debug API: http://localhost:${PORT}/api/debug/YOUR_SHOP_NAME`);
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
});