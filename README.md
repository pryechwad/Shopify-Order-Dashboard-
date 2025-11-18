# Shopify Order Dashboard

A Shopify app that displays the last 60 days of orders in a clean dashboard interface.

## Features

- **OAuth Authentication**: Secure Shopify app installation and authentication
- **Order Management**: View all orders from the last 60 days
- **Order Details**: Detailed view of individual orders with line items
- **Search & Filter**: Search orders by ID or customer email
- **Responsive Design**: Works on desktop and mobile devices

## Tech Stack

- **Backend**: Node.js, Express, PostgreSQL
- **Frontend**: React, Tailwind CSS, Vite
- **Integration**: Shopify Admin API, OAuth 2.0

## Setup Instructions

### Prerequisites

- Node.js (v16 or higher)
- PostgreSQL database
- Shopify Partner account
- Shopify development store

### 1. Create Shopify App

1. Go to [Shopify Partners](https://partners.shopify.com/)
2. Create a new app
3. Note down your API key and API secret

### 2. Database Setup

1. Create a PostgreSQL database named `shopify_orders`
2. The app will automatically create the required tables on first run

### 3. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
```

Update `.env` with your configuration:
```env
SHOPIFY_API_KEY=your_shopify_api_key
SHOPIFY_API_SECRET=your_shopify_api_secret
APP_URL=http://localhost:3001
FRONTEND_URL=http://localhost:5173

DB_USER=postgres
DB_HOST=localhost
DB_NAME=shopify_orders
DB_PASSWORD=your_password
DB_PORT=5432
```

Start the backend server:
```bash
npm run dev
```

### 4. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

### 5. Install the App

1. Visit `http://localhost:3001/auth?shop=your-store-name`
2. Complete the OAuth flow
3. The app will redirect to the dashboard

## API Endpoints

- `GET /auth` - Initiate OAuth flow
- `GET /auth/callback` - OAuth callback
- `GET /api/orders` - Get all orders for a shop
- `GET /api/orders/:orderId` - Get detailed order information

## Database Schema

### shops
- `id` - Primary key
- `shop_domain` - Shop domain name
- `access_token` - OAuth access token
- `created_at` - Timestamp

### orders
- `id` - Primary key
- `shop` - Shop domain
- `order_id` - Shopify order ID
- `status` - Order status
- `total_price` - Order total
- `customer_email` - Customer email
- `created_at` - Order creation date
- `order_data` - Full order JSON data

### fulfillment_items
- `id` - Primary key
- `order_id` - Reference to order
- `line_item_id` - Shopify line item ID
- `qty` - Quantity
- `product_title` - Product name
- `variant_title` - Variant name
- `price` - Item price
- `reason` - Return reason (if applicable)

### images
- `id` - Primary key
- `image_url` - Image URL
- `return_item_id` - Reference to fulfillment item

## Development

- Backend runs on `http://localhost:3001`
- Frontend runs on `http://localhost:5173`
- Database connection is configured via environment variables

## Deployment

1. Set up production database
2. Update environment variables for production
3. Deploy backend to your hosting service
4. Build and deploy frontend
5. Update Shopify app URLs in partner dashboard