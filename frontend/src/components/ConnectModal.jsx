import { useState } from 'react'

const ConnectModal = ({ isOpen, onConnect }) => {
  const [shopDomain, setShopDomain] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleConnect = async () => {
    if (!shopDomain.trim()) return
    
    // Extract domain from full URL or use as-is
    let cleanDomain = shopDomain.trim()
    
    // Handle full URLs
    if (cleanDomain.includes('://')) {
      try {
        const url = new URL(cleanDomain)
        cleanDomain = url.hostname.replace('.myshopify.com', '')
      } catch {
        cleanDomain = cleanDomain.replace(/https?:\/\//, '').replace('.myshopify.com', '')
      }
    } else {
      cleanDomain = cleanDomain.replace('.myshopify.com', '')
    }
    
    setIsLoading(true)
    // Clear any existing shop data before OAuth
    localStorage.removeItem('shopify_shop')
    if (onConnect) onConnect()
    window.location.href = `http://localhost:3001/auth?shop=${cleanDomain}`
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 transform transition-all">
        <div className="text-center mb-6">
          <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Connect Your Store</h2>
          <p className="text-gray-600">Enter your Shopify store domain to get started</p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Store Domain
            </label>
            <div className="relative">
              <input
                type="text"
                value={shopDomain}
                onChange={(e) => setShopDomain(e.target.value)}
                placeholder="your-store-name or https://your-store.myshopify.com"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-32"
                onKeyPress={(e) => e.key === 'Enter' && handleConnect()}
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <span className="text-gray-500 text-sm">.myshopify.com</span>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Example: "mystore" or "https://mystore.myshopify.com"
            </p>
          </div>

          <button
            onClick={handleConnect}
            disabled={!shopDomain.trim() || isLoading}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Connecting...
              </>
            ) : (
              <>
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Connect Store
              </>
            )}
          </button>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="flex items-center justify-center space-x-2 text-xs text-gray-500">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <span>Secure OAuth connection via Shopify</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ConnectModal