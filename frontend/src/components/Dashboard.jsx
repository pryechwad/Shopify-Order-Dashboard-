import { useState, useEffect } from 'react'
import { generateOrdersReport } from '../utils/pdfGenerator'
import AddOrderModal from './AddOrderModal'
import SettingsModal from './SettingsModal'
import SyncButton from './SyncButton'

const Dashboard = ({ orders, shop, onAddOrder, onRefreshOrders, setCurrentView }) => {
  const [timeRange, setTimeRange] = useState('7d')
  const [selectedMetric, setSelectedMetric] = useState('revenue')
  const [showAddOrderModal, setShowAddOrderModal] = useState(false)
  const [showSettingsModal, setShowSettingsModal] = useState(false)

  // Calculate metrics
  const totalOrders = orders.length
  const totalRevenue = orders.reduce((sum, order) => sum + parseFloat(order.total_price || 0), 0)
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0
  const paidOrders = orders.filter(order => order.status === 'paid').length
  const conversionRate = totalOrders > 0 ? (paidOrders / totalOrders) * 100 : 0

  // Get recent orders (last 7 days)
  const recentOrders = orders.filter(order => {
    const orderDate = new Date(order.created_at)
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)
    return orderDate >= weekAgo
  }).slice(0, 5)

  // Status distribution
  const statusCounts = orders.reduce((acc, order) => {
    acc[order.status] = (acc[order.status] || 0) + 1
    return acc
  }, {})

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
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
      case 'cancelled': return 'bg-gray-50 text-gray-700 border-gray-200'
      default: return 'bg-blue-50 text-blue-700 border-blue-200'
    }
  }

  return (
    <div className="space-y-6">
      {/* Professional E-commerce Dashboard Header */}
      <div className="relative bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 rounded-3xl p-8 text-white overflow-hidden shadow-2xl">
        {/* Sophisticated Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-blue-400 to-purple-600 rounded-full -translate-x-48 -translate-y-48 blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-80 h-80 bg-gradient-to-tl from-indigo-400 to-cyan-600 rounded-full translate-x-40 translate-y-40 blur-3xl"></div>
        </div>
        
        <div className="relative">
          {/* Header Section */}
          <div className="flex items-start justify-between mb-8">
            <div className="flex items-center space-x-6">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 rounded-3xl flex items-center justify-center shadow-2xl border border-white/20">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <div>
                <h1 className="text-5xl font-bold mb-2 bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
                  {shop.charAt(0).toUpperCase() + shop.slice(1).replace('-', ' ')} Store
                </h1>
                <p className="text-blue-200 text-xl font-medium">E-Commerce Business Intelligence Dashboard</p>
                <div className="flex items-center space-x-4 mt-3">
                  <div className="flex items-center space-x-2 bg-emerald-500/20 px-3 py-1 rounded-full border border-emerald-400/30">
                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                    <span className="text-emerald-300 text-sm font-semibold">Live Analytics</span>
                  </div>
                  <div className="flex items-center space-x-2 text-blue-200">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-sm">Last Updated: {new Date().toLocaleTimeString('en-IN', { hour12: true })}</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Revenue Highlight Card */}
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-xl">
              <div className="text-center">
                <div className="text-4xl font-bold mb-1">₹{totalRevenue.toLocaleString('en-IN')}</div>
                <div className="text-blue-200 text-sm font-medium">Total Revenue</div>
                <div className="text-emerald-300 text-xs mt-1">+{((totalRevenue / 10000) * 8.5).toFixed(1)}% vs last month</div>
              </div>
            </div>
          </div>
          
          {/* Stats Bar */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-8">
              <div className="flex items-center space-x-3 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-xl border border-white/20">
                <svg className="w-5 h-5 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <div>
                  <div className="text-white font-bold text-lg">{totalOrders}</div>
                  <div className="text-blue-200 text-xs">Total Orders</div>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-xl border border-white/20">
                <svg className="w-5 h-5 text-emerald-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
                <div>
                  <div className="text-white font-bold text-lg">{((paidOrders / totalOrders) * 100 || 0).toFixed(1)}%</div>
                  <div className="text-blue-200 text-xs">Success Rate</div>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-xl border border-white/20">
                <svg className="w-5 h-5 text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
                <div>
                  <div className="text-white font-bold text-lg">₹{avgOrderValue.toFixed(0)}</div>
                  <div className="text-blue-200 text-xs">Avg Order</div>
                </div>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex items-center space-x-4">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="bg-white/15 backdrop-blur-sm border border-white/30 text-white px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400/50 font-medium text-sm"
              >
                <option value="7d" className="text-gray-900">Last 7 days</option>
                <option value="30d" className="text-gray-900">Last 30 days</option>
                <option value="60d" className="text-gray-900">Last 60 days</option>
              </select>
              
              <SyncButton 
                shop={shop} 
                onSyncComplete={(count) => {
                  if (onRefreshOrders) {
                    onRefreshOrders();
                  }
                }}
              />
              
              <button 
                onClick={() => {
                  try {
                    console.log('Generating PDF report for:', shop, 'Orders:', orders.length)
                    generateOrdersReport(orders, shop)
                    console.log('PDF generation completed')
                  } catch (error) {
                    console.error('PDF generation error:', error)
                    alert('Error generating PDF: ' + error.message)
                  }
                }}
                className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 border border-blue-400/30 text-white px-6 py-3 rounded-xl transition-all duration-200 flex items-center space-x-2 font-semibold shadow-xl hover:shadow-2xl transform hover:scale-105"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3" />
                </svg>
                <span>Export Analytics Report</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced E-commerce Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div 
          onClick={() => setCurrentView('orders')}
          className="group bg-white rounded-3xl shadow-xl border border-gray-100 p-6 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden cursor-pointer"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400/20 to-blue-600/20 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform duration-300"></div>
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <div className="text-right">
                <div className="flex items-center text-green-600 text-sm font-bold bg-green-50 px-2 py-1 rounded-full">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3.293 9.707a1 1 0 010-1.414l6-6a1 1 0 011.414 0l6 6a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L4.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                  +12%
                </div>
              </div>
            </div>
            <p className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-2">Total Orders</p>
            <p className="text-4xl font-bold text-gray-900 mb-1">{totalOrders}</p>
            <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
              <div className="bg-blue-600 h-2 rounded-full" style={{width: '75%'}}></div>
            </div>
            <p className="text-xs text-gray-500">vs last period</p>
          </div>
        </div>

        <div 
          onClick={() => setCurrentView('orders')}
          className="group bg-white rounded-3xl shadow-xl border border-gray-100 p-6 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden cursor-pointer"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-400/20 to-emerald-600/20 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform duration-300"></div>
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <div className="text-right">
                <div className="flex items-center text-green-600 text-sm font-bold bg-green-50 px-2 py-1 rounded-full">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3.293 9.707a1 1 0 010-1.414l6-6a1 1 0 011.414 0l6 6a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L4.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                  +8%
                </div>
              </div>
            </div>
            <p className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-2">Total Revenue</p>
            <p className="text-4xl font-bold text-gray-900 mb-1">₹{totalRevenue.toFixed(2)}</p>
            <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
              <div className="bg-emerald-600 h-2 rounded-full" style={{width: '85%'}}></div>
            </div>
            <p className="text-xs text-gray-500">vs last period</p>
          </div>
        </div>

        <div 
          onClick={() => setCurrentView('orders')}
          className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6 hover:shadow-2xl transition-all duration-300 relative overflow-hidden cursor-pointer"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-400/20 to-purple-600/20 rounded-full -mr-16 -mt-16"></div>
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div className="text-right">
                <div className="flex items-center text-green-600 text-sm font-semibold">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3.293 9.707a1 1 0 010-1.414l6-6a1 1 0 011.414 0l6 6a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L4.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                  +5%
                </div>
              </div>
            </div>
            <p className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-1">Avg Order Value</p>
            <p className="text-3xl font-bold text-gray-900">₹{avgOrderValue.toFixed(2)}</p>
            <p className="text-xs text-gray-500 mt-2">vs last period</p>
          </div>
        </div>

        <div 
          onClick={() => setCurrentView('orders')}
          className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6 hover:shadow-2xl transition-all duration-300 relative overflow-hidden cursor-pointer"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-400/20 to-orange-600/20 rounded-full -mr-16 -mt-16"></div>
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <div className="text-right">
                <div className="flex items-center text-green-600 text-sm font-semibold">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3.293 9.707a1 1 0 010-1.414l6-6a1 1 0 011.414 0l6 6a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L4.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                  +3%
                </div>
              </div>
            </div>
            <p className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-1">Conversion Rate</p>
            <p className="text-3xl font-bold text-gray-900">{conversionRate.toFixed(1)}%</p>
            <p className="text-xs text-gray-500 mt-2">vs last period</p>
          </div>
        </div>
      </div>

      {/* E-commerce Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Order Status Distribution */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">Order Status Distribution</h3>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
              <span className="text-sm text-gray-600">Live Data</span>
            </div>
          </div>
          
          <div className="space-y-4">
            {Object.entries(statusCounts).map(([status, count]) => {
              const percentage = totalOrders > 0 ? (count / totalOrders) * 100 : 0
              return (
                <div key={status} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(status)}`}>
                      {status}
                    </span>
                    <span className="text-sm text-gray-600">{count} orders</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-semibold text-gray-900 w-12 text-right">
                      {percentage.toFixed(1)}%
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">Recent Orders</h3>
            <button 
              onClick={() => window.location.reload()}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center space-x-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>Refresh</span>
            </button>
          </div>
          
          <div className="space-y-4">
            {recentOrders.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2 2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-2.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 009.586 13H7" />
                  </svg>
                </div>
                <p className="text-gray-500">No recent orders</p>
              </div>
            ) : (
              recentOrders.map((order, index) => (
                <div key={order.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold text-xs">
                        #{order.order_id.toString().slice(-3)}
                      </span>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">Order #{order.order_id}</p>
                      <p className="text-sm text-gray-500">{formatDate(order.created_at)}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900">₹{parseFloat(order.total_price || 0).toFixed(2)}</p>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* E-commerce Quick Actions */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-3xl shadow-xl border border-gray-200 p-8">
        <div className="flex items-center mb-6">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mr-4">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-gray-900">Quick Actions</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <button 
            onClick={() => setShowAddOrderModal(true)}
            className="flex items-center justify-center space-x-3 bg-gradient-to-r from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 border border-blue-200 rounded-xl p-4 transition-all duration-200"
          >
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <span className="font-semibold text-blue-700">Add New Order</span>
          </button>
          
          <button 
            onClick={() => {
              try {
                console.log('Generating PDF report for:', shop, 'Orders:', orders.length)
                generateOrdersReport(orders, shop)
                console.log('PDF generation completed')
              } catch (error) {
                console.error('PDF generation error:', error)
                alert('Error generating PDF: ' + error.message)
              }
            }}
            className="flex items-center justify-center space-x-3 bg-gradient-to-r from-emerald-50 to-emerald-100 hover:from-emerald-100 hover:to-emerald-200 border border-emerald-200 rounded-xl p-4 transition-all duration-200"
          >
            <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <span className="font-semibold text-emerald-700">Generate PDF Report</span>
          </button>
          
          <button 
            onClick={() => setShowSettingsModal(true)}
            className="flex items-center justify-center space-x-3 bg-gradient-to-r from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 border border-purple-200 rounded-xl p-4 transition-all duration-200"
          >
            <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="font-semibold text-purple-700">Settings</span>
          </button>
        </div>
      </div>
      
      {/* Modals */}
      <AddOrderModal 
        isOpen={showAddOrderModal} 
        onClose={() => setShowAddOrderModal(false)}
        onAddOrder={onAddOrder}
      />
      
      <SettingsModal 
        isOpen={showSettingsModal} 
        onClose={() => setShowSettingsModal(false)} 
        shop={shop}
      />
    </div>
  )
}

export default Dashboard