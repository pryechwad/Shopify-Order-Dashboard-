const { gql } = require('apollo-server-express');

const typeDefs = gql`
  type Order {
    id: ID!
    shop: String!
    order_id: String!
    status: String
    total_price: Float
    customer_email: String
    created_at: String
    order_data: String
    items: [FulfillmentItem]
  }

  type FulfillmentItem {
    id: ID!
    order_id: String!
    line_item_id: String!
    qty: Int
    product_title: String
    variant_title: String
    price: Float
    reason: String
    images: [Image]
  }

  type Image {
    id: ID!
    image_url: String!
    return_item_id: Int
  }

  type Query {
    orders(shop: String!): [Order]
    order(orderId: String!, shop: String!): Order
  }
`;

module.exports = typeDefs;