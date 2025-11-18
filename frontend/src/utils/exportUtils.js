// Export utilities for generating reports and downloads

export const exportToCSV = (orders, filename = 'orders-export') => {
  const headers = ['Order ID', 'Customer Email', 'Status', 'Total Price', 'Created At']
  
  const csvContent = [
    headers.join(','),
    ...orders.map(order => [
      order.order_id,
      order.customer_email || 'guest@example.com',
      order.status,
      parseFloat(order.total_price || 0).toFixed(2),
      new Date(order.created_at).toLocaleDateString()
    ].join(','))
  ].join('\n')
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  
  link.setAttribute('href', url)
  link.setAttribute('download', `${filename}.csv`)
  link.style.visibility = 'hidden'
  
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

export const exportToJSON = (orders, filename = 'orders-export') => {
  const jsonContent = JSON.stringify(orders, null, 2)
  const blob = new Blob([jsonContent], { type: 'application/json' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  
  link.setAttribute('href', url)
  link.setAttribute('download', `${filename}.json`)
  link.style.visibility = 'hidden'
  
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

export const generateSalesReport = (orders) => {
  const totalOrders = orders.length
  const totalRevenue = orders.reduce((sum, order) => sum + parseFloat(order.total_price || 0), 0)
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0
  const paidOrders = orders.filter(order => order.status === 'paid').length
  const conversionRate = totalOrders > 0 ? (paidOrders / totalOrders) * 100 : 0
  
  const statusBreakdown = orders.reduce((acc, order) => {
    acc[order.status] = (acc[order.status] || 0) + 1
    return acc
  }, {})
  
  const reportContent = `
SALES REPORT
============
Generated: ${new Date().toLocaleString()}

SUMMARY METRICS:
- Total Orders: ${totalOrders}
- Total Revenue: $${totalRevenue.toFixed(2)}
- Average Order Value: $${avgOrderValue.toFixed(2)}
- Conversion Rate: ${conversionRate.toFixed(1)}%

ORDER STATUS BREAKDOWN:
${Object.entries(statusBreakdown)
  .map(([status, count]) => `- ${status.charAt(0).toUpperCase() + status.slice(1)}: ${count} orders`)
  .join('\n')}

TOP RECENT ORDERS:
${orders.slice(0, 10).map(order => 
  `- Order #${order.order_id}: $${parseFloat(order.total_price || 0).toFixed(2)} (${order.status})`
).join('\n')}
  `
  
  const blob = new Blob([reportContent], { type: 'text/plain' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  
  link.setAttribute('href', url)
  link.setAttribute('download', `sales-report-${new Date().toISOString().split('T')[0]}.txt`)
  link.style.visibility = 'hidden'
  
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}