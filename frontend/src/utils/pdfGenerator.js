import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

export const generateOrderReceipt = (order, items = []) => {
  try {
    const doc = new jsPDF()
    
    // Professional Header with Brand Colors
    doc.setFillColor(30, 41, 59) // Slate-800
    doc.rect(0, 0, 210, 50, 'F')
    
    // Company Logo Area (placeholder)
    doc.setFillColor(59, 130, 246)
    doc.roundedRect(15, 10, 30, 30, 5, 5, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(16)
    doc.setFont('helvetica', 'bold')
    doc.text('SHOP', 22, 28)
    
    // Company Info
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(24)
    doc.setFont('helvetica', 'bold')
    doc.text('ORDER RECEIPT', 55, 20)
    
    doc.setFontSize(12)
    doc.setFont('helvetica', 'normal')
    doc.text(`${(order.shop || 'Store').charAt(0).toUpperCase() + (order.shop || 'Store').slice(1).replace('-', ' ')} E-Commerce`, 55, 30)
    doc.text('Professional Online Shopping Experience', 55, 38)
    
    // Receipt Number & Date Box
    doc.setFillColor(248, 250, 252)
    doc.rect(15, 60, 180, 25, 'F')
    doc.setDrawColor(229, 231, 235)
    doc.rect(15, 60, 180, 25, 'S')
    
    doc.setTextColor(0, 0, 0)
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text('RECEIPT DETAILS', 20, 72)
    
    doc.setFontSize(11)
    doc.setFont('helvetica', 'normal')
    doc.text(`Receipt #: ${order.order_id || order.id}`, 20, 80)
    doc.text(`Order Date: ${new Date(order.created_at).toLocaleDateString('en-IN', {
      day: '2-digit', month: 'long', year: 'numeric'
    })}`, 110, 80)
    
    // Order Status Badge
    const statusColor = order.status === 'paid' ? [34, 197, 94] : 
                       order.status === 'pending' ? [251, 191, 36] : [239, 68, 68]
    doc.setFillColor(...statusColor)
    doc.roundedRect(160, 65, 30, 8, 2, 2, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(9)
    doc.setFont('helvetica', 'bold')
    doc.text((order.status || 'PENDING').toUpperCase(), 165, 70)
    
    // Customer Information Section
    doc.setFillColor(239, 246, 255)
    doc.rect(15, 95, 85, 35, 'F')
    doc.setDrawColor(59, 130, 246)
    doc.rect(15, 95, 85, 35, 'S')
    
    doc.setTextColor(59, 130, 246)
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.text('BILL TO', 20, 105)
    
    doc.setTextColor(0, 0, 0)
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text(`Customer: ${order.customer_name || 'Valued Customer'}`, 20, 115)
    doc.text(`Email: ${order.customer_email || 'N/A'}`, 20, 122)
    
    // Order Summary Box
    doc.setFillColor(236, 253, 245)
    doc.rect(110, 95, 85, 35, 'F')
    doc.setDrawColor(16, 185, 129)
    doc.rect(110, 95, 85, 35, 'S')
    
    doc.setTextColor(16, 185, 129)
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.text('ORDER SUMMARY', 115, 105)
    
    doc.setTextColor(0, 0, 0)
    doc.setFontSize(10)
    doc.text(`Items: ${items.length || 1}`, 115, 115)
    doc.text(`Total: Rs. ${parseFloat(order.total_price || 0).toFixed(2)}`, 115, 122)
    
    // Items Table Header
    doc.setTextColor(0, 0, 0)
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text('ORDER ITEMS', 20, 150)
    
    // Prepare items data
    const tableData = items.length > 0 ? items.map(item => [
      item.product_title || 'Product',
      item.variant_title || 'Standard',
      item.qty || 1,
      `Rs. ${parseFloat(item.price || 0).toFixed(2)}`,
      `Rs. ${(parseFloat(item.price || 0) * (item.qty || 1)).toFixed(2)}`
    ]) : [[
      'Sample Product',
      'Default Variant', 
      1, 
      `Rs. ${parseFloat(order.total_price || 99).toFixed(2)}`,
      `Rs. ${parseFloat(order.total_price || 99).toFixed(2)}`
    ]]
    
    // Professional Items Table
    autoTable(doc, {
      startY: 160,
      head: [['Product Name', 'Variant', 'Qty', 'Unit Price', 'Total']],
      body: tableData,
      theme: 'striped',
      headStyles: {
        fillColor: [59, 130, 246],
        textColor: [255, 255, 255],
        fontSize: 10,
        fontStyle: 'bold',
        halign: 'center'
      },
      bodyStyles: {
        fontSize: 9,
        cellPadding: 3
      },
      columnStyles: {
        0: { halign: 'left', cellWidth: 60 },
        1: { halign: 'left', cellWidth: 40 },
        2: { halign: 'center', cellWidth: 20 },
        3: { halign: 'right', cellWidth: 35 },
        4: { halign: 'right', cellWidth: 35, fontStyle: 'bold' }
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252]
      },
      margin: { left: 15, right: 15 }
    })
    
    // Payment Summary Section
    const finalY = (doc.lastAutoTable && doc.lastAutoTable.finalY) ? doc.lastAutoTable.finalY + 15 : 220
    
    // Total Amount Box
    doc.setFillColor(30, 41, 59)
    doc.rect(120, finalY, 75, 25, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.text('TOTAL AMOUNT', 125, finalY + 8)
    doc.setFontSize(18)
    doc.text(`Rs. ${parseFloat(order.total_price || 0).toFixed(2)}`, 125, finalY + 18)
    
    // Payment Method (if available)
    doc.setTextColor(0, 0, 0)
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text('Payment Method: Online Payment', 20, finalY + 10)
    doc.text(`Transaction ID: TXN${order.order_id || '12345'}${Date.now().toString().slice(-4)}`, 20, finalY + 18)
    
    // Footer Section
    const footerY = finalY + 35
    doc.setFillColor(248, 250, 252)
    doc.rect(15, footerY, 180, 30, 'F')
    doc.setDrawColor(229, 231, 235)
    doc.rect(15, footerY, 180, 30, 'S')
    
    doc.setTextColor(59, 130, 246)
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.text('THANK YOU FOR YOUR PURCHASE!', 20, footerY + 10)
    
    doc.setTextColor(0, 0, 0)
    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')
    doc.text('For support, contact us at support@yourstore.com | +91-XXXXX-XXXXX', 20, footerY + 18)
    doc.text(`Receipt generated on ${new Date().toLocaleDateString('en-IN')} at ${new Date().toLocaleTimeString('en-IN')}`, 20, footerY + 25)
    
    // Save with professional filename
    const filename = `receipt-${order.shop || 'store'}-${order.order_id || order.id}-${new Date().toISOString().split('T')[0]}.pdf`
    doc.save(filename)
    
  } catch (error) {
    console.error('Error generating receipt:', error)
    throw error
  }
}

export const generateOrdersReport = (orders, shop) => {
  try {
    console.log('Starting PDF generation...')
    console.log('Orders data:', orders)
    console.log('Shop:', shop)
    
    const doc = new jsPDF()
    console.log('jsPDF instance created')
    
    // Calculate metrics
    const totalRevenue = orders.reduce((sum, order) => sum + parseFloat(order.total_price || 0), 0)
    const avgOrderValue = orders.length > 0 ? totalRevenue / orders.length : 0
    const paidOrders = orders.filter(order => order.status === 'paid').length
    
    // Header with company branding
    doc.setFillColor(59, 130, 246)
    doc.rect(0, 0, 210, 40, 'F')
    
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(24)
    doc.setFont('helvetica', 'bold')
    doc.text('ORDER DASHBOARD SYSTEM', 20, 20)
    
    doc.setFontSize(12)
    doc.setFont('helvetica', 'normal')
    doc.text('E-Commerce Analytics Report', 20, 30)
    
    // Store Information Box
    doc.setFillColor(248, 250, 252)
    doc.rect(15, 50, 180, 35, 'F')
    doc.setDrawColor(229, 231, 235)
    doc.rect(15, 50, 180, 35, 'S')
    
    doc.setTextColor(0, 0, 0)
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text('STORE INFORMATION', 20, 62)
    
    doc.setFontSize(11)
    doc.setFont('helvetica', 'normal')
    doc.text(`Store Name: ${shop.charAt(0).toUpperCase() + shop.slice(1).replace('-', ' ')}`, 20, 72)
    doc.text(`Report Generated: ${new Date().toLocaleDateString('en-IN', { 
      year: 'numeric', month: 'long', day: 'numeric', 
      hour: '2-digit', minute: '2-digit' 
    })}`, 20, 80)
    
    // Summary Cards
    const cardY = 95
    const cardWidth = 42
    const cardHeight = 25
    const cardSpacing = 46
    
    // Total Orders Card
    doc.setFillColor(239, 246, 255)
    doc.rect(15, cardY, cardWidth, cardHeight, 'F')
    doc.setDrawColor(59, 130, 246)
    doc.rect(15, cardY, cardWidth, cardHeight, 'S')
    doc.setTextColor(59, 130, 246)
    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')
    doc.text('TOTAL ORDERS', 17, cardY + 8)
    doc.setFontSize(16)
    doc.text(orders.length.toString(), 17, cardY + 18)
    
    // Total Revenue Card
    doc.setFillColor(236, 253, 245)
    doc.rect(15 + cardSpacing, cardY, cardWidth, cardHeight, 'F')
    doc.setDrawColor(16, 185, 129)
    doc.rect(15 + cardSpacing, cardY, cardWidth, cardHeight, 'S')
    doc.setTextColor(16, 185, 129)
    doc.setFontSize(10)
    doc.text('TOTAL REVENUE', 17 + cardSpacing, cardY + 8)
    doc.setFontSize(16)
    doc.text(`Rs. ${totalRevenue.toLocaleString('en-IN')}`, 17 + cardSpacing, cardY + 18)
    
    // Average Order Value Card
    doc.setFillColor(252, 231, 243)
    doc.rect(15 + cardSpacing * 2, cardY, cardWidth, cardHeight, 'F')
    doc.setDrawColor(219, 39, 119)
    doc.rect(15 + cardSpacing * 2, cardY, cardWidth, cardHeight, 'S')
    doc.setTextColor(219, 39, 119)
    doc.setFontSize(10)
    doc.text('AVG ORDER', 17 + cardSpacing * 2, cardY + 6)
    doc.text('VALUE', 17 + cardSpacing * 2, cardY + 12)
    doc.setFontSize(14)
    doc.text(`Rs. ${avgOrderValue.toLocaleString('en-IN', {maximumFractionDigits: 0})}`, 17 + cardSpacing * 2, cardY + 20)
    
    // Paid Orders Card
    doc.setFillColor(255, 237, 213)
    doc.rect(15 + cardSpacing * 3, cardY, cardWidth, cardHeight, 'F')
    doc.setDrawColor(245, 101, 101)
    doc.rect(15 + cardSpacing * 3, cardY, cardWidth, cardHeight, 'S')
    doc.setTextColor(245, 101, 101)
    doc.setFontSize(10)
    doc.text('PAID ORDERS', 17 + cardSpacing * 3, cardY + 8)
    doc.setFontSize(16)
    doc.text(paidOrders.toString(), 17 + cardSpacing * 3, cardY + 18)
    
    // Orders Table Header
    doc.setTextColor(0, 0, 0)
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text('ORDER DETAILS', 20, 140)
    
    // Prepare table data with proper formatting
    const tableData = orders.slice(0, 30).map(order => [
      `#${order.order_id || order.id}`,
      new Date(order.created_at).toLocaleDateString('en-IN', {
        day: '2-digit', month: 'short', year: 'numeric'
      }),
      (order.customer_email || 'N/A').length > 25 ? 
        (order.customer_email || 'N/A').substring(0, 25) + '...' : 
        (order.customer_email || 'N/A'),
      (order.status || 'pending').toUpperCase(),
      `Rs. ${parseFloat(order.total_price || 0).toFixed(2)}`
    ])
    
    // Enhanced table styling
    autoTable(doc, {
      startY: 150,
      head: [['Order ID', 'Date', 'Customer Email', 'Status', 'Amount']],
      body: tableData,
      theme: 'striped',
      headStyles: { 
        fillColor: [59, 130, 246],
        textColor: [255, 255, 255],
        fontSize: 10,
        fontStyle: 'bold',
        halign: 'center'
      },
      bodyStyles: {
        fontSize: 9,
        cellPadding: 4
      },
      columnStyles: {
        0: { halign: 'center', cellWidth: 25 },
        1: { halign: 'center', cellWidth: 30 },
        2: { halign: 'left', cellWidth: 60 },
        3: { halign: 'center', cellWidth: 25 },
        4: { halign: 'right', cellWidth: 30, fontStyle: 'bold' }
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252]
      },
      margin: { left: 15, right: 15 }
    })
    
    // Footer section
    const finalY = (doc.lastAutoTable && doc.lastAutoTable.finalY) ? doc.lastAutoTable.finalY + 20 : 250
    
    // Summary footer
    doc.setFillColor(248, 250, 252)
    doc.rect(15, finalY, 180, 25, 'F')
    doc.setDrawColor(229, 231, 235)
    doc.rect(15, finalY, 180, 25, 'S')
    
    doc.setTextColor(0, 0, 0)
    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')
    doc.text('REPORT SUMMARY', 20, finalY + 8)
    
    doc.setFont('helvetica', 'normal')
    doc.text(`Total Orders Processed: ${orders.length}`, 20, finalY + 16)
    doc.text(`Orders Displayed: ${Math.min(orders.length, 30)}`, 100, finalY + 16)
    
    if (orders.length > 30) {
      doc.setTextColor(220, 38, 127)
      doc.text(`Note: Showing first 30 of ${orders.length} orders`, 20, finalY + 22)
    }
    
    // Footer with generation info
    doc.setTextColor(128, 128, 128)
    doc.setFontSize(8)
    doc.text(`Generated by Order Dashboard System on ${new Date().toLocaleString('en-IN')}`, 20, finalY + 35)
    doc.text(`Store: ${shop} | Page 1 of 1`, 20, finalY + 42)
    
    const filename = `${shop}-orders-report-${new Date().toISOString().split('T')[0]}.pdf`
    console.log('Saving PDF as:', filename)
    doc.save(filename)
    console.log('PDF saved successfully')
  } catch (error) {
    console.error('Error in generateOrdersReport:', error)
    throw error
  }
}