import jsPDF from 'jspdf'

export const downloadReceiptPDF = (order) => {
  const pdf = new jsPDF()
  
  // Header
  pdf.setFontSize(24)
  pdf.setFont('helvetica', 'bold')
  pdf.text('E-COMMERCE DASHBOARD', 105, 30, { align: 'center' })
  
  pdf.setFontSize(16)
  pdf.setFont('helvetica', 'normal')
  pdf.text('RECEIPT', 105, 45, { align: 'center' })
  
  // Line separator
  pdf.line(20, 55, 190, 55)
  
  // Order details
  pdf.setFontSize(12)
  pdf.setFont('helvetica', 'bold')
  pdf.text('Order Details:', 20, 70)
  
  pdf.setFont('helvetica', 'normal')
  pdf.text(`Order ID: #${order.order_id}`, 20, 85)
  pdf.text(`Date: ${new Date(order.created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })}`, 20, 100)
  pdf.text(`Customer: ${order.customer_email || 'guest@example.com'}`, 20, 115)
  pdf.text(`Status: ${order.status.toUpperCase()}`, 20, 130)
  
  // Order summary
  pdf.setFont('helvetica', 'bold')
  pdf.text('Order Summary:', 20, 155)
  
  pdf.setFont('helvetica', 'normal')
  const subtotal = (parseFloat(order.total_price || 0) * 0.9).toFixed(2)
  const tax = (parseFloat(order.total_price || 0) * 0.1).toFixed(2)
  const total = parseFloat(order.total_price || 0).toFixed(2)
  
  pdf.text('Subtotal:', 20, 170)
  pdf.text(`$${subtotal}`, 170, 170, { align: 'right' })
  
  pdf.text('Tax:', 20, 185)
  pdf.text(`$${tax}`, 170, 185, { align: 'right' })
  
  pdf.text('Shipping:', 20, 200)
  pdf.text('Free', 170, 200, { align: 'right' })
  
  // Total line
  pdf.line(20, 210, 190, 210)
  pdf.setFont('helvetica', 'bold')
  pdf.text('TOTAL:', 20, 225)
  pdf.text(`$${total}`, 170, 225, { align: 'right' })
  
  // Footer
  pdf.setFont('helvetica', 'normal')
  pdf.setFontSize(10)
  pdf.text('Thank you for your business!', 105, 250, { align: 'center' })
  pdf.text('For support: support@example.com', 105, 265, { align: 'center' })
  pdf.text(`Generated: ${new Date().toLocaleString()}`, 105, 280, { align: 'center' })
  
  // Save the PDF
  pdf.save(`receipt-${order.order_id}.pdf`)
}

export const downloadInvoicePDF = (orderData, items = []) => {
  const pdf = new jsPDF()
  
  // Header
  pdf.setFontSize(24)
  pdf.setFont('helvetica', 'bold')
  pdf.text('E-COMMERCE DASHBOARD', 105, 30, { align: 'center' })
  
  pdf.setFontSize(16)
  pdf.setFont('helvetica', 'normal')
  pdf.text('INVOICE', 105, 45, { align: 'center' })
  
  // Line separator
  pdf.line(20, 55, 190, 55)
  
  // Invoice details
  pdf.setFontSize(12)
  pdf.setFont('helvetica', 'bold')
  pdf.text('Invoice Details:', 20, 70)
  
  pdf.setFont('helvetica', 'normal')
  pdf.text(`Invoice #: INV-${orderData.order_id}`, 20, 85)
  pdf.text(`Order #: ${orderData.order_id}`, 20, 100)
  pdf.text(`Date: ${new Date(orderData.created_at).toLocaleDateString()}`, 20, 115)
  
  // Customer info
  pdf.setFont('helvetica', 'bold')
  pdf.text('Bill To:', 120, 70)
  pdf.setFont('helvetica', 'normal')
  pdf.text(orderData.customer_email || 'guest@example.com', 120, 85)
  
  // Items table header
  let yPos = 140
  pdf.setFont('helvetica', 'bold')
  pdf.text('Product', 20, yPos)
  pdf.text('Qty', 120, yPos)
  pdf.text('Price', 150, yPos)
  pdf.text('Total', 170, yPos, { align: 'right' })
  
  pdf.line(20, yPos + 5, 190, yPos + 5)
  
  // Items
  yPos += 15
  pdf.setFont('helvetica', 'normal')
  
  if (items.length > 0) {
    items.forEach(item => {
      pdf.text(item.product_title || 'Sample Product', 20, yPos)
      pdf.text((item.qty || 1).toString(), 120, yPos)
      pdf.text(`$${parseFloat(item.price || 99.99).toFixed(2)}`, 150, yPos)
      pdf.text(`$${(parseFloat(item.price || 99.99) * (item.qty || 1)).toFixed(2)}`, 170, yPos, { align: 'right' })
      yPos += 15
    })
  } else {
    pdf.text('Sample Product', 20, yPos)
    pdf.text('1', 120, yPos)
    pdf.text(`$${parseFloat(orderData.total_price || 0).toFixed(2)}`, 150, yPos)
    pdf.text(`$${parseFloat(orderData.total_price || 0).toFixed(2)}`, 170, yPos, { align: 'right' })
    yPos += 15
  }
  
  // Totals
  yPos += 10
  pdf.line(120, yPos, 190, yPos)
  yPos += 15
  
  const subtotal = (parseFloat(orderData.total_price || 0) * 0.9).toFixed(2)
  const tax = (parseFloat(orderData.total_price || 0) * 0.1).toFixed(2)
  const total = parseFloat(orderData.total_price || 0).toFixed(2)
  
  pdf.text('Subtotal:', 120, yPos)
  pdf.text(`$${subtotal}`, 170, yPos, { align: 'right' })
  yPos += 15
  
  pdf.text('Tax:', 120, yPos)
  pdf.text(`$${tax}`, 170, yPos, { align: 'right' })
  yPos += 15
  
  pdf.text('Shipping:', 120, yPos)
  pdf.text('Free', 170, yPos, { align: 'right' })
  yPos += 15
  
  pdf.line(120, yPos, 190, yPos)
  yPos += 15
  
  pdf.setFont('helvetica', 'bold')
  pdf.text('TOTAL:', 120, yPos)
  pdf.text(`$${total}`, 170, yPos, { align: 'right' })
  
  // Footer
  pdf.setFont('helvetica', 'normal')
  pdf.setFontSize(10)
  pdf.text('Thank you for your business!', 105, yPos + 30, { align: 'center' })
  pdf.text('For questions about this invoice, please contact support.', 105, yPos + 45, { align: 'center' })
  
  // Save the PDF
  pdf.save(`invoice-${orderData.order_id}.pdf`)
}