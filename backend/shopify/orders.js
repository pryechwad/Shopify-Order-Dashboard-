const { shopify } = require('./config');
const { ORDERS_QUERY, ORDER_DETAILS_QUERY } = require('./graphql');

// Fetch orders from Shopify using GraphQL
const fetchOrders = async (shop, accessToken, limit = 50) => {
  try {
    const client = new shopify.clients.Graphql({ session: { shop, accessToken } });
    
    const response = await client.query({
      data: {
        query: ORDERS_QUERY,
        variables: {
          first: limit,
        },
      },
    });

    if (response.body.errors) {
      throw new Error(`GraphQL errors: ${JSON.stringify(response.body.errors)}`);
    }

    const orders = response.body.data.orders.edges.map(edge => {
      const order = edge.node;
      return {
        id: order.id,
        order_id: order.name.replace('#', ''),
        shop: shop,
        status: order.displayFinancialStatus?.toLowerCase() || 'pending',
        total_price: order.totalPriceSet.shopMoney.amount,
        currency: order.totalPriceSet.shopMoney.currencyCode,
        customer_email: order.customer?.email || null,
        customer_name: order.customer ? `${order.customer.firstName || ''} ${order.customer.lastName || ''}`.trim() : null,
        created_at: order.createdAt,
        updated_at: order.updatedAt,
        fulfillment_status: order.displayFulfillmentStatus?.toLowerCase() || 'unfulfilled',
        line_items_count: order.lineItems.edges.length,
        order_data: JSON.stringify(order)
      };
    });

    return orders;
  } catch (error) {
    console.error('Error fetching orders:', error);
    throw error;
  }
};

// Fetch single order details
const fetchOrderDetails = async (shop, accessToken, orderId) => {
  try {
    const client = new shopify.clients.Graphql({ session: { shop, accessToken } });
    
    // Convert order ID to GraphQL ID format
    const gqlOrderId = `gid://shopify/Order/${orderId}`;
    
    const response = await client.query({
      data: {
        query: ORDER_DETAILS_QUERY,
        variables: {
          id: gqlOrderId,
        },
      },
    });

    if (response.body.errors) {
      throw new Error(`GraphQL errors: ${JSON.stringify(response.body.errors)}`);
    }

    const order = response.body.data.order;
    if (!order) {
      throw new Error('Order not found');
    }

    const orderDetails = {
      id: order.id,
      order_id: order.name.replace('#', ''),
      shop: shop,
      status: order.displayFinancialStatus?.toLowerCase() || 'pending',
      total_price: order.totalPriceSet.shopMoney.amount,
      subtotal_price: order.subtotalPriceSet.shopMoney.amount,
      total_tax: order.totalTaxSet.shopMoney.amount,
      currency: order.totalPriceSet.shopMoney.currencyCode,
      customer_email: order.customer?.email || null,
      customer_name: order.customer ? `${order.customer.firstName || ''} ${order.customer.lastName || ''}`.trim() : null,
      customer_phone: order.customer?.phone || null,
      created_at: order.createdAt,
      updated_at: order.updatedAt,
      fulfillment_status: order.displayFulfillmentStatus?.toLowerCase() || 'unfulfilled',
      shipping_address: order.shippingAddress,
      billing_address: order.billingAddress,
      order_data: JSON.stringify(order)
    };

    const lineItems = order.lineItems.edges.map(edge => {
      const item = edge.node;
      return {
        id: item.id,
        order_id: orderId,
        line_item_id: item.id,
        product_title: item.variant?.product?.title || item.title,
        variant_title: item.variant?.title || null,
        qty: item.quantity,
        price: item.variant?.price || '0.00',
        product_id: item.variant?.product?.id || null,
        variant_id: item.variant?.id || null,
        image_url: item.variant?.product?.featuredImage?.url || null
      };
    });

    return {
      order: orderDetails,
      items: lineItems
    };
  } catch (error) {
    console.error('Error fetching order details:', error);
    throw error;
  }
};

// Fetch orders from last 60 days
const fetchRecentOrders = async (shop, accessToken) => {
  try {
    const sixtyDaysAgo = new Date();
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);
    
    const client = new shopify.clients.Graphql({ 
      session: { 
        shop, 
        accessToken,
        id: `offline_${shop}`,
        state: 'active',
        isOnline: false,
        scope: 'read_orders,read_products,read_customers'
      } 
    });
    
    const RECENT_ORDERS_QUERY = `
      query getRecentOrders($first: Int!) {
        orders(first: $first, sortKey: CREATED_AT, reverse: true) {
          edges {
            node {
              id
              name
              createdAt
              updatedAt
              totalPriceSet {
                shopMoney {
                  amount
                  currencyCode
                }
              }
              displayFinancialStatus
              displayFulfillmentStatus
              customer {
                id
                email
                firstName
                lastName
              }
            }
          }
        }
      }
    `;
    
    const response = await client.request(RECENT_ORDERS_QUERY, {
      variables: {
        first: 250,
      },
    });

    if (response.errors) {
      throw new Error(`GraphQL errors: ${JSON.stringify(response.errors)}`);
    }

    const orders = response.data.orders.edges.map(edge => {
      const order = edge.node;
      return {
        id: order.id,
        order_id: order.name.replace('#', ''),
        shop: shop,
        status: order.displayFinancialStatus?.toLowerCase() || 'pending',
        total_price: order.totalPriceSet.shopMoney.amount,
        currency: order.totalPriceSet.shopMoney.currencyCode,
        customer_email: order.customer?.email || null,
        created_at: order.createdAt,
        updated_at: order.updatedAt,
        order_data: JSON.stringify(order)
      };
    });

    return orders;
  } catch (error) {
    console.error('Error fetching recent orders:', error);
    throw error;
  }
};

module.exports = {
  fetchOrders,
  fetchOrderDetails,
  fetchRecentOrders,
};