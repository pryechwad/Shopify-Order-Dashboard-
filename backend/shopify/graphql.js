// Shopify GraphQL queries for orders
const ORDERS_QUERY = `
  query getOrders($first: Int!, $after: String) {
    orders(first: $first, after: $after, sortKey: CREATED_AT, reverse: true) {
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
          lineItems(first: 10) {
            edges {
              node {
                id
                title
                quantity
                variant {
                  id
                  title
                  price
                  product {
                    id
                    title
                    featuredImage {
                      url
                    }
                  }
                }
              }
            }
          }
          shippingAddress {
            firstName
            lastName
            address1
            city
            province
            country
            zip
          }
        }
        cursor
      }
      pageInfo {
        hasNextPage
        hasPreviousPage
      }
    }
  }
`;

const ORDER_DETAILS_QUERY = `
  query getOrderDetails($id: ID!) {
    order(id: $id) {
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
      subtotalPriceSet {
        shopMoney {
          amount
          currencyCode
        }
      }
      totalTaxSet {
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
        phone
      }
      lineItems(first: 50) {
        edges {
          node {
            id
            title
            quantity
            variant {
              id
              title
              price
              product {
                id
                title
                featuredImage {
                  url
                }
              }
            }
          }
        }
      }
      shippingAddress {
        firstName
        lastName
        address1
        address2
        city
        province
        country
        zip
      }
      billingAddress {
        firstName
        lastName
        address1
        address2
        city
        province
        country
        zip
      }
    }
  }
`;

module.exports = {
  ORDERS_QUERY,
  ORDER_DETAILS_QUERY
};