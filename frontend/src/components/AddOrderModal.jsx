import { useState } from 'react'

const AddOrderModal = ({ isOpen, onClose, onAddOrder }) => {
  const [orderData, setOrderData] = useState({
    customerEmail: '',
    totalPrice: '',
    status: 'pending',
    items: [{ product: '', quantity: 1, price: '' }]
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    const newOrder = {
      id: Date.now(),
      order_id: Math.floor(Math.random() * 100000),
      customer_email: orderData.customerEmail,
      total_price: orderData.totalPrice,
      status: orderData.status,
      created_at: new Date().toISOString()
    }
    
    if (onAddOrder) {
      onAddOrder(newOrder)
    }
    
    alert(`Order #${newOrder.order_id} created successfully!`)
    onClose()
    setOrderData({
      customerEmail: '',
      totalPrice: '',
      status: 'pending',
      items: [{ product: '', quantity: 1, price: '' }]
    })
  }

  const addItem = () => {
    setOrderData(prev => ({
      ...prev,
      items: [...prev.items, { product: '', quantity: 1, price: '' }]
    }))
  }

  const removeItem = (index) => {
    setOrderData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }))
  }

  const updateItem = (index, field, value) => {
    setOrderData(prev => ({
      ...prev,
      items: prev.items.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }))
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-bold text-gray-900">Add New Order</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Customer Email
              </label>
              <input
                type="email"
                required
                value={orderData.customerEmail}
                onChange={(e) => setOrderData(prev => ({ ...prev, customerEmail: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="customer@example.com"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Order Status
              </label>
              <select
                value={orderData.status}
                onChange={(e) => setOrderData(prev => ({ ...prev, status: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
                <option value="refunded">Refunded</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <label className="block text-sm font-medium text-gray-700">
                Order Items
              </label>
              <button
                type="button"
                onClick={addItem}
                className="bg-blue-100 text-blue-700 px-3 py-1 rounded-lg hover:bg-blue-200 transition-colors text-sm"
              >
                + Add Item
              </button>
            </div>
            
            <div className="space-y-3">
              {orderData.items.map((item, index) => (
                <div key={index} className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                  <input
                    type="text"
                    placeholder="Product name"
                    value={item.product}
                    onChange={(e) => updateItem(index, 'product', e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                  <input
                    type="number"
                    placeholder="Qty"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value))}
                    className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                  <input
                    type="number"
                    placeholder="Price"
                    step="0.01"
                    min="0"
                    value={item.price}
                    onChange={(e) => updateItem(index, 'price', e.target.value)}
                    className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                  {orderData.items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeItem(index)}
                      className="text-red-500 hover:text-red-700 p-1"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Total Price
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              required
              value={orderData.totalPrice}
              onChange={(e) => setOrderData(prev => ({ ...prev, totalPrice: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="0.00"
            />
          </div>

          <div className="flex space-x-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-gray-300 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Create Order
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AddOrderModal