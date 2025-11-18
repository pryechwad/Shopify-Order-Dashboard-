const resolvers = {
  Query: {
    orders: async (_, { shop }, { pool }) => {
      const result = await pool.query(
        'SELECT * FROM orders WHERE shop = $1 ORDER BY created_at DESC',
        [shop]
      );
      return result.rows;
    },
    
    order: async (_, { orderId, shop }, { pool }) => {
      const result = await pool.query(
        'SELECT * FROM orders WHERE order_id = $1 AND shop = $2',
        [orderId, shop]
      );
      return result.rows[0];
    }
  },

  Order: {
    items: async (parent, _, { pool }) => {
      const result = await pool.query(
        'SELECT * FROM fulfillment_items WHERE order_id = $1',
        [parent.order_id]
      );
      return result.rows;
    }
  },

  FulfillmentItem: {
    images: async (parent, _, { pool }) => {
      const result = await pool.query(
        'SELECT * FROM images WHERE return_item_id = $1',
        [parent.id]
      );
      return result.rows;
    }
  }
};

module.exports = resolvers;