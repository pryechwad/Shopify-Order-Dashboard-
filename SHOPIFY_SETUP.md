# Shopify Integration Setup Guide

## 🚀 Real Shopify Integration

This project now includes **real Shopify integration** using the official Shopify GraphQL Admin API and OAuth 2.0 flow.

## 📋 Prerequisites

1. **Shopify Partner Account**: [Sign up here](https://partners.shopify.com/)
2. **Development Store**: Create a test store in your partner dashboard
3. **PostgreSQL Database**: Running locally or remotely

## 🔧 Setup Steps

### 1. Create Shopify App

1. Go to [Shopify Partners Dashboard](https://partners.shopify.com/)
2. Click "Apps" → "Create app" → "Create app manually"
3. Fill in app details:
   - **App name**: `Order Dashboard`
   - **App URL**: `http://localhost:3001`
   - **Allowed redirection URL(s)**: `http://localhost:3001/auth/callback`

### 2. Configure App Permissions

In your app settings, set these **scopes**:
- `read_orders` - Read order data
- `read_products` - Read product information  
- `read_customers` - Read customer details

### 3. Get API Credentials

From your app dashboard, copy:
- **API key** (Client ID)
- **API secret key** (Client Secret)

### 4. Environment Setup

1. Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

2. Update `.env` with your credentials:
```env
SHOPIFY_API_KEY=your_actual_api_key_here
SHOPIFY_API_SECRET=your_actual_secret_here
APP_URL=http://localhost:3001
FRONTEND_URL=http://localhost:5173

DB_USER=postgres
DB_HOST=localhost
DB_NAME=shopify_orders
DB_PASSWORD=your_db_password
DB_PORT=5432
```

### 5. Install Your App

1. Start the backend server:
```bash
cd backend
npm run dev
```

2. Start the frontend:
```bash
cd frontend
npm run dev
```

3. Install the app on your development store:
   - Visit: `http://localhost:3001/auth?shop=your-dev-store-name`
   - Complete OAuth flow
   - App will fetch real orders from your store

## 🔄 How It Works

### OAuth Flow
1. User enters store domain
2. Redirects to Shopify OAuth
3. User grants permissions
4. App receives access token
5. Token stored in database
6. Real orders fetched via GraphQL

### GraphQL Queries
- **Orders List**: Fetches last 60 days of orders
- **Order Details**: Gets complete order information
- **Real-time Sync**: Updates orders automatically

### Fallback System
- **With Credentials**: Uses real Shopify API
- **Without Credentials**: Falls back to demo data
- **Error Handling**: Graceful degradation

## 📊 Features

### Real Data Integration
- ✅ OAuth 2.0 authentication
- ✅ GraphQL Admin API
- ✅ Real order data
- ✅ Customer information
- ✅ Product details
- ✅ Order line items
- ✅ Automatic sync

### Demo Mode
- ✅ Works without Shopify credentials
- ✅ Generated sample data
- ✅ Full UI functionality
- ✅ Testing capabilities

## 🛠️ API Endpoints

### Authentication
- `GET /auth?shop=store-name` - Start OAuth flow
- `GET /auth/callback` - OAuth callback handler

### Orders
- `GET /api/orders?shop=store-name` - Get all orders
- `GET /api/orders/:id?shop=store-name` - Get order details
- `POST /api/sync-orders` - Manual sync orders

## 🔍 Testing

### With Real Store
1. Set up Shopify app credentials
2. Connect your development store
3. View real order data

### Demo Mode
1. Leave credentials empty
2. Connect any store name
3. See generated demo data

## 📝 Database Schema

The app automatically creates these tables:

```sql
-- Store OAuth tokens
CREATE TABLE shops (
  id SERIAL PRIMARY KEY,
  shop_domain VARCHAR(255) UNIQUE NOT NULL,
  access_token VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Store order data
CREATE TABLE orders (
  id SERIAL PRIMARY KEY,
  shop VARCHAR(255) NOT NULL,
  order_id BIGINT NOT NULL,
  status VARCHAR(50),
  total_price DECIMAL(10,2),
  customer_email VARCHAR(255),
  created_at TIMESTAMP,
  order_data JSONB,
  UNIQUE(shop, order_id)
);
```

## 🚨 Important Notes

1. **Development Only**: Current setup is for development
2. **HTTPS Required**: Production needs HTTPS URLs
3. **Webhook Setup**: Add webhooks for real-time updates
4. **Rate Limits**: Shopify API has rate limits
5. **Scopes**: Only request needed permissions

## 🔐 Security

- OAuth tokens encrypted in database
- Environment variables for secrets
- Proper error handling
- Input validation
- CORS protection

## 📚 Shopify Documentation

- [Admin API](https://shopify.dev/docs/api/admin)
- [GraphQL Reference](https://shopify.dev/docs/api/admin-graphql)
- [OAuth Guide](https://shopify.dev/docs/apps/auth/oauth)
- [App Development](https://shopify.dev/docs/apps)

## 🎯 Next Steps

1. Set up Shopify app credentials
2. Test with development store
3. Add webhook endpoints
4. Implement real-time updates
5. Deploy to production with HTTPS