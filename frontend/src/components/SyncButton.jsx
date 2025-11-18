import { useState, useEffect } from 'react'

const SyncButton = ({ shop, onSyncComplete }) => {
  const [isSyncing, setIsSyncing] = useState(false)
  const [lastSync, setLastSync] = useState(null)
  const [authStatus, setAuthStatus] = useState(null)
  
  useEffect(() => {
    checkAuthStatus()
  }, [shop])
  
  const checkAuthStatus = async () => {
    if (!shop) return
    
    try {
      const response = await fetch(`http://localhost:3001/api/auth-status?shop=${shop}`)
      const status = await response.json()
      setAuthStatus(status)
    } catch (error) {
      console.error('Error checking auth status:', error)
    }
  }

  const handleSync = async () => {
    if (!shop || isSyncing) return

    setIsSyncing(true)
    try {
      const response = await fetch('http://localhost:3001/api/sync-orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ shop }),
      })

      const result = await response.json()
      
      if (result.success) {
        setLastSync(new Date())
        if (onSyncComplete) {
          onSyncComplete(result.count)
        }
        alert(`✅ Synced ${result.count} orders from Shopify successfully!`)
      } else {
        // Handle specific error cases
        if (result.needsAuth) {
          alert(`🔐 ${result.error}\n\nPlease reconnect your store by visiting:\nhttp://localhost:3001/auth?shop=${shop}`)
        } else if (result.demo) {
          alert(`ℹ️ ${result.error}\n\nTo use real Shopify data, configure your API credentials.`)
        } else {
          alert(`❌ ${result.error}`)
        }
      }
    } catch (error) {
      console.error('Sync error:', error)
      alert(`❌ Network error: ${error.message}\n\nPlease check if the backend server is running.`)
    } finally {
      setIsSyncing(false)
    }
  }

  const getButtonStyle = () => {
    if (authStatus?.demo) {
      return "flex items-center space-x-2 bg-yellow-600 hover:bg-yellow-700 disabled:bg-yellow-400 text-white px-4 py-2 rounded-lg transition-colors font-medium"
    } else if (!authStatus?.authenticated) {
      return "flex items-center space-x-2 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white px-4 py-2 rounded-lg transition-colors font-medium"
    }
    return "flex items-center space-x-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white px-4 py-2 rounded-lg transition-colors font-medium"
  }
  
  const getButtonText = () => {
    if (isSyncing) return 'Syncing...'
    if (authStatus?.demo) return 'Demo Mode'
    if (!authStatus?.authenticated) return 'Not Connected'
    return 'Sync Orders'
  }
  
  const getTooltip = () => {
    if (authStatus?.demo) return 'Running in demo mode - configure Shopify credentials for real data'
    if (!authStatus?.authenticated) return 'Connect to Shopify first'
    return 'Sync orders from Shopify'
  }

  return (
    <button
      onClick={handleSync}
      disabled={isSyncing}
      className={getButtonStyle()}
      title={getTooltip()}
    >
      <svg 
        className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} 
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth={2} 
          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" 
        />
      </svg>
      <span>{getButtonText()}</span>
      {lastSync && (
        <span className="text-xs opacity-75">
          ({lastSync.toLocaleTimeString()})
        </span>
      )}
    </button>
  )
}

export default SyncButton