import { useState, useEffect } from 'react'
import axios from 'axios'
import OrderList from './components/OrderList'
import OrderDetails from './components/OrderDetails'
import ConnectModal from './components/ConnectModal'
import Dashboard from './components/Dashboard'
import ProfileModal from './components/ProfileModal'

function App() {
  const [orders, setOrders] = useState([])
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [shop, setShop] = useState('')
  const [showConnectModal, setShowConnectModal] = useState(false)
  const [currentView, setCurrentView] = useState('dashboard')
  const [showProfileDropdown, setShowProfileDropdown] = useState(false)
  const [showProfileModal, setShowProfileModal] = useState(false)

  const handleAddOrder = (newOrder) => {
    setOrders(prevOrders => [newOrder, ...prevOrders])
  }

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const shopParam = urlParams.get('shop')
    const errorParam = urlParams.get('error')
    
    // Handle OAuth errors
    if (errorParam) {
      console.error('OAuth error:', decodeURIComponent(errorParam))
      alert(`Authentication failed: ${decodeURIComponent(errorParam)}`)
      localStorage.removeItem('shopify_shop')
      setLoading(false)
      // Clean URL
      window.history.replaceState({}, document.title, window.location.pathname)
      return
    }
    
    // Only accept shop parameter from OAuth callback
    if (shopParam && shopParam.trim()) {
      const cleanShop = shopParam.replace('.myshopify.com', '')
      setShop(cleanShop)
      localStorage.setItem('shopify_shop', cleanShop)
      fetchOrders(cleanShop)
      // Clean URL after getting shop parameter
      window.history.replaceState({}, document.title, window.location.pathname)
    } else {
      // Clear any existing shop data and show connect modal
      localStorage.removeItem('shopify_shop')
      setLoading(false)
    }
  }, [])

  const fetchOrders = async (shopDomain) => {
    try {
      const response = await axios.get(`http://localhost:3001/api/orders?shop=${shopDomain}`)
      setOrders(response.data)
    } catch (error) {
      console.error('Error fetching orders:', error)
      setOrders([])
    } finally {
      setLoading(false)
    }
  }

  const refreshOrders = async () => {
    if (shop) {
      setLoading(true)
      await fetchOrders(shop)
    }
  }

  const fetchOrderDetails = async (orderId) => {
    try {
      console.log(`Fetching order details for order ${orderId}`)
      const response = await axios.get(`http://localhost:3001/api/orders/${orderId}?shop=${shop}`)
      console.log('Order details response:', response.data)
      setSelectedOrder(response.data)
    } catch (error) {
      console.error('Error fetching order details:', error)
      alert('Failed to load order details. Please try again.')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <div className="text-xl font-semibold text-gray-700">Loading your orders...</div>
        </div>
      </div>
    )
  }

  if (!shop) {
    return (
      <>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute inset-0">
            <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
            <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse delay-1000"></div>
            <div className="absolute bottom-1/4 left-1/3 w-64 h-64 bg-indigo-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse delay-500"></div>
          </div>
          
          <div className="max-w-lg w-full mx-4 relative z-10">
            <div className="card p-10 text-center backdrop-blur-sm bg-white/80">
              <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent mb-3">
                E-Commerce Dashboard
              </h1>
              <p className="text-gray-600 mb-8 text-lg">Connect your Shopify store to access advanced analytics, order management, and real-time insights</p>
              
              <div className="space-y-4 mb-8">
                <div className="flex items-center justify-center space-x-3 text-sm text-gray-600">
                  <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Secure OAuth Authentication</span>
                </div>
                <div className="flex items-center justify-center space-x-3 text-sm text-gray-600">
                  <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Real-time Order Sync</span>
                </div>
                <div className="flex items-center justify-center space-x-3 text-sm text-gray-600">
                  <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Advanced Search & Filtering</span>
                </div>
              </div>
              
              <button 
                onClick={() => setShowConnectModal(true)}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                <span className="flex items-center justify-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Launch Dashboard
                </span>
              </button>
            </div>
          </div>
        </div>
        
        <ConnectModal 
          isOpen={showConnectModal} 
          onConnect={() => setShowConnectModal(false)} 
        />
        
        <ProfileModal 
          isOpen={showProfileModal} 
          onClose={() => setShowProfileModal(false)}
          shop={shop}
        />
      </>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-lg border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            {/* Logo and Brand */}
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 rounded-2xl flex items-center justify-center shadow-xl">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">Order Dashboard System</h1>
                <div className="flex items-center space-x-2">
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                    <span className="text-xs text-emerald-600 font-semibold">Connected</span>
                  </div>
                  <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
                  <span className="text-sm text-gray-500">Last 60 days</span>
                </div>
              </div>
            </div>
            
            {/* Navigation */}
            <div className="flex items-center space-x-6">
              {/* Desktop Navigation */}
              <nav className="hidden md:flex items-center space-x-1 bg-gray-50 rounded-xl p-1 border border-gray-200">
                <button
                  onClick={() => setCurrentView('dashboard')}
                  className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                    currentView === 'dashboard' 
                      ? 'bg-white text-blue-600 shadow-md border border-blue-100' 
                      : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                  }`}
                >
                  <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  Dashboard
                </button>
                <button
                  onClick={() => setCurrentView('orders')}
                  className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                    currentView === 'orders' 
                      ? 'bg-white text-blue-600 shadow-md border border-blue-100' 
                      : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                  }`}
                >
                  <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                  Orders
                </button>
              </nav>
              
              {/* Profile Dropdown */}
              <div className="relative">
                <button 
                  onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                  className="flex items-center space-x-3 bg-gradient-to-r from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200 border border-gray-200 rounded-xl px-4 py-2.5 transition-all duration-200 shadow-sm hover:shadow-md"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm">
                      {shop.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="hidden md:block text-left">
                    <p className="text-sm font-semibold text-gray-900 capitalize">{shop.replace('-', ' ')}</p>
                    <p className="text-xs text-gray-500">Store Owner</p>
                  </div>
                  <svg className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${showProfileDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {/* Dropdown Menu */}
                {showProfileDropdown && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-sm font-semibold text-gray-900 capitalize">{shop.replace('-', ' ')}</p>
                      <p className="text-xs text-gray-500">{shop}.myshopify.com</p>
                    </div>
                    
                    <div className="py-2">
                      <button 
                        onClick={() => {
                          setShowProfileDropdown(false)
                          window.open(`https://${shop}.myshopify.com/admin`, '_blank')
                        }}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <svg className="w-4 h-4 mr-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                        Shopify Admin
                      </button>
                      
                      <button 
                        onClick={() => window.location.reload()}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <svg className="w-4 h-4 mr-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        Refresh Data
                      </button>
                    </div>
                    
                    <div className="border-t border-gray-100 pt-2">
                      <button 
                        onClick={() => {
                          localStorage.removeItem('shopify_shop')
                          window.location.href = '/'
                        }}
                        className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <svg className="w-4 h-4 mr-3 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {selectedOrder ? (
          <OrderDetails 
            order={selectedOrder} 
            onBack={() => setSelectedOrder(null)} 
          />
        ) : currentView === 'dashboard' ? (
          <Dashboard 
            orders={orders}
            shop={shop}
            onAddOrder={handleAddOrder}
            onRefreshOrders={refreshOrders}
            setCurrentView={setCurrentView}
          />
        ) : (
          <OrderList 
            orders={orders} 
            onSelectOrder={fetchOrderDetails} 
          />
        )}
      </main>
    </div>
  )
}

export default App
