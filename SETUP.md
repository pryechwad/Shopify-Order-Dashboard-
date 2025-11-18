# Quick Setup Guide

## Prerequisites
- Node.js (v16+)
- PostgreSQL database
- Shopify Partner account

## Setup Steps

### 1. Backend Setup
```bash
cd backend
npm install
cp .env.example .env
```

Update `.env` with your Shopify app credentials:
- Get API key and secret from Shopify Partners dashboard
- Update database credentials

### 2. Database Setup
Create PostgreSQL database named `shopify_orders`
Tables will be created automatically on first run.

### 3. Frontend Setup
```bash
cd frontend
npm install
```

### 4. Start Development
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend  
cd frontend
npm run dev
```

### 5. Install App
Visit: `http://localhost:3001/auth?shop=your-store-name`

## API Endpoints

### REST API
- `GET /api/orders?shop=SHOP` - List orders
- `GET /api/orders/:orderId?shop=SHOP` - Order details

### GraphQL API
- `POST /graphql` - GraphQL endpoint
- `GET /graphql` - GraphQL Playground

### Example GraphQL Query
```graphql
query GetOrders($shop: String!) {
  orders(shop: $shop) {
    id
    order_id
    status
    total_price
    customer_email
    created_at
    items {
      product_title
      qty
      price
      images {
        image_url
      }
    }
  }
}
```