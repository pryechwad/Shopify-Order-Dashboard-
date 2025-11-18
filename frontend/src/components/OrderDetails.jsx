import { generateOrderReceipt } from '../utils/pdfGenerator'

const OrderDetails = ({ order, onBack }) => {
  const { order: orderData, items } = order

  const handleDownloadInvoice = (orderData) => {
    const invoiceData = {
      orderId: orderData.order_id,
      date: formatDate(orderData.created_at),
      customer: orderData.customer_email || 'guest@example.com',
      status: orderData.status,
      total: parseFloat(orderData.total_price || 0).toFixed(2),
      subtotal: (parseFloat(orderData.total_price || 0) * 0.9).toFixed(2),
      tax: (parseFloat(orderData.total_price || 0) * 0.1).toFixed(2)
    }
    
    const invoiceContent = `
INVOICE
=======

Order ID: #${invoiceData.orderId}
Date: ${invoiceData.date}
Customer: ${invoiceData.customer}
Status: ${invoiceData.status.toUpperCase()}

ORDER SUMMARY:
--------------
Subtotal: ₹${invoiceData.subtotal}
Tax: ₹${invoiceData.tax}
Shipping: Free
Total: ₹${invoiceData.total}

Thank you for your business!
    `
    
    const blob = new Blob([invoiceContent], { type: 'text/plain' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `invoice-${invoiceData.orderId}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }

  const handlePrintInvoice = (orderData, items) => {
    const invoiceData = {
      orderId: orderData.order_id,
      date: formatDate(orderData.created_at),
      customer: orderData.customer_email || 'guest@example.com',
      status: orderData.status,
      total: parseFloat(orderData.total_price || 0).toFixed(2),
      subtotal: (parseFloat(orderData.total_price || 0) * 0.9).toFixed(2),
      tax: (parseFloat(orderData.total_price || 0) * 0.1).toFixed(2)
    }
    
    const itemsHtml = items.map(item => `
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #eee;">${item.product_title || 'Sample Product'}</td>
        <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: center;">${item.qty || 1}</td>
        <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">₹${parseFloat(item.price || 99.99).toFixed(2)}</td>
        <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">₹${(parseFloat(item.price || 99.99) * (item.qty || 1)).toFixed(2)}</td>
      </tr>
    `).join('')
    
    const printWindow = window.open('', '_blank')
    printWindow.document.write(`
      <html>
        <head>
          <title>Invoice - Order #${invoiceData.orderId}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 40px; line-height: 1.6; }
            .header { text-align: center; margin-bottom: 40px; border-bottom: 2px solid #333; padding-bottom: 20px; }
            .company-name { font-size: 28px; font-weight: bold; color: #333; }
            .invoice-title { font-size: 24px; color: #666; margin-top: 10px; }
            .order-info { display: flex; justify-content: space-between; margin-bottom: 30px; }
            .info-section { flex: 1; }
            .info-title { font-weight: bold; color: #333; margin-bottom: 10px; }
            .items-table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
            .items-table th { background-color: #f8f9fa; padding: 12px; text-align: left; border-bottom: 2px solid #333; }
            .totals { text-align: right; }
            .total-row { font-weight: bold; font-size: 18px; color: #333; }
            .footer { margin-top: 40px; text-align: center; color: #666; border-top: 1px solid #eee; padding-top: 20px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="company-name">E-Commerce Dashboard</div>
            <div class="invoice-title">INVOICE</div>
          </div>
          
          <div class="order-info">
            <div class="info-section">
              <div class="info-title">Bill To:</div>
              <div>${invoiceData.customer}</div>
            </div>
            <div class="info-section" style="text-align: right;">
              <div class="info-title">Invoice Details:</div>
              <div>Order ID: #${invoiceData.orderId}</div>
              <div>Date: ${invoiceData.date}</div>
              <div>Status: ${invoiceData.status.toUpperCase()}</div>
            </div>
          </div>
          
          <table class="items-table">
            <thead>
              <tr>
                <th>Product</th>
                <th style="text-align: center;">Qty</th>
                <th style="text-align: right;">Price</th>
                <th style="text-align: right;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>
          
          <div class="totals">
            <div>Subtotal: ₹${invoiceData.subtotal}</div>
            <div>Tax: ₹${invoiceData.tax}</div>
            <div>Shipping: Free</div>
            <div class="total-row">Total: ₹${invoiceData.total}</div>
          </div>
          
          <div class="footer">
            <p>Thank you for your business!</p>
            <p>For questions about this invoice, please contact support.</p>
          </div>
        </body>
      </html>
    `)
    printWindow.document.close()
    printWindow.print()
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid': return 'bg-emerald-50 text-emerald-700 border-emerald-200'
      case 'pending': return 'bg-amber-50 text-amber-700 border-amber-200'
      case 'refunded': return 'bg-red-50 text-red-700 border-red-200'
      default: return 'bg-gray-50 text-gray-700 border-gray-200'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'paid': return (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
      )
      case 'pending': return (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
        </svg>
      )
      default: return (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
        </svg>
      )
    }
  }

  const orderDetails = orderData.order_data ? JSON.parse(orderData.order_data) : {}

  return (
    <div className="space-y-8">
      {/* Enhanced Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center space-x-2 bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-xl font-medium transition-all duration-200 text-gray-700 hover:text-gray-900"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span>Back to Dashboard</span>
        </button>
        
        <div className="flex items-center space-x-3">
          <button 
            onClick={() => {
              try {
                console.log('Generating receipt for order:', orderData.order_id)
                console.log('Order data:', orderData)
                console.log('Items:', items)
                generateOrderReceipt(orderData, items)
                console.log('Receipt generation completed')
              } catch (error) {
                console.error('Receipt generation error:', error)
                alert('Error generating receipt: ' + error.message)
              }
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl font-medium transition-colors flex items-center space-x-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span>Download PDF Receipt</span>
          </button>
          <button 
            onClick={() => handlePrintInvoice(orderData, items)}
            className="border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-xl font-medium transition-colors flex items-center space-x-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            <span>Print</span>
          </button>
        </div>
      </div>
        
      {/* Enhanced Order Header Card */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/30">
                <span className="text-white font-bold text-xl">
                  #{orderData.order_id.toString().slice(-3)}
                </span>
              </div>
              <div className="text-white">
                <h1 className="text-3xl font-bold mb-1">
                  Order #{orderData.order_id}
                </h1>
                <p className="text-blue-100 text-lg">{formatDate(orderData.created_at)}</p>
              </div>
            </div>
            <div className="text-right">
              <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold border ${getStatusColor(orderData.status)} bg-white`}>
                {getStatusIcon(orderData.status)}
                <span className="ml-2 capitalize">{orderData.status}</span>
              </div>
              <div className="text-white mt-3">
                <p className="text-blue-100 text-sm">Total Amount</p>
                <p className="text-2xl font-bold">₹{parseFloat(orderData.total_price || 0).toFixed(2)}</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="p-8">

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              {/* Customer Information Card */}
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 border border-gray-200">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center text-lg">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  Customer Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <p className="text-sm font-medium text-gray-500 mb-1">Email Address</p>
                    <p className="font-semibold text-gray-900">{orderData.customer_email || 'guest@example.com'}</p>
                  </div>
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <p className="text-sm font-medium text-gray-500 mb-1">Customer Type</p>
                    <p className="font-semibold text-gray-900">{orderData.customer_email ? 'Registered' : 'Guest'}</p>
                  </div>
                </div>
              </div>

              {/* Payment & Shipping Info */}
              <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl p-6 border border-emerald-200">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center text-lg">
                  <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center mr-3">
                    <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    </svg>
                  </div>
                  Shipping & Payment
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <p className="text-sm font-medium text-gray-500 mb-1">Payment Status</p>
                    <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(orderData.status)}`}>
                      {getStatusIcon(orderData.status)}
                      <span className="ml-1 capitalize">{orderData.status}</span>
                    </div>
                  </div>
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <p className="text-sm font-medium text-gray-500 mb-1">Shipping Method</p>
                    <p className="font-semibold text-gray-900">Standard Shipping</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Order Summary Sidebar */}
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center text-lg">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                    <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  </div>
                  Order Summary
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b border-purple-200">
                    <span className="text-gray-600">Subtotal:</span>
                    <span className="font-semibold">₹{(parseFloat(orderData.total_price || 0) * 0.9).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-purple-200">
                    <span className="text-gray-600">Tax:</span>
                    <span className="font-semibold">₹{(parseFloat(orderData.total_price || 0) * 0.1).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-purple-200">
                    <span className="text-gray-600">Shipping:</span>
                    <span className="font-semibold">Free</span>
                  </div>
                  <div className="flex justify-between items-center py-3 bg-white rounded-lg px-4">
                    <span className="font-bold text-lg text-gray-900">Total:</span>
                    <span className="font-bold text-2xl text-purple-600">₹{parseFloat(orderData.total_price || 0).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Order Items Section */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-gray-800 to-gray-900 px-8 py-6">
          <h2 className="text-2xl font-bold text-white flex items-center">
            <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center mr-4">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            Order Items ({items.length})
          </h2>
        </div>
        <div className="p-8">
          {items.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No items found</h3>
              <p className="text-gray-500">This order doesn't have any items associated with it.</p>
            </div>
          ) : (
            <div className="grid gap-6">
              {items.map((item, index) => (
                <div key={index} className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-6 border border-gray-200 hover:shadow-lg transition-all duration-300">
                  <div className="flex items-center space-x-6">
                    <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center border-2 border-gray-200 shadow-sm">
                      {item.image_url ? (
                        <img
                          src={item.image_url}
                          alt={item.product_title}
                          className="w-full h-full object-cover rounded-2xl"
                        />
                      ) : (
                        <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="text-xl font-bold text-gray-900 mb-1">{item.product_title || 'Sample Product'}</h4>
                      <p className="text-sm text-gray-500 mb-2">SKU: {item.line_item_id || 'N/A'}</p>
                      {item.variant_title && (
                        <p className="text-gray-600 mb-3">{item.variant_title}</p>
                      )}
                      <div className="flex items-center space-x-4">
                        <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">
                          Qty: {item.qty || 1}
                        </span>
                        <span className="bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-sm font-semibold">
                          ₹{parseFloat(item.price || 99.99).toFixed(2)}
                        </span>
                        {item.reason && (
                          <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-semibold">
                            Return: {item.reason}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-gray-900">
                        ₹{(parseFloat(item.price || 99.99) * (item.qty || 1)).toFixed(2)}
                      </p>
                      <p className="text-sm text-gray-500">Total</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default OrderDetails