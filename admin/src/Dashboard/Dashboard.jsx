import { useEffect, useState } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'
import { assets, url } from '../assets/assets.js'
import './Dashboard.css'

const Dashboard = ({ onNavigate }) => {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(() => Boolean(localStorage.getItem('token')))
  const [errorMsg, setErrorMsg] = useState('')

  const fetchStats = async () => {
    const token = localStorage.getItem('token')
    if (!token) return

    setLoading(true)
    setErrorMsg('')
    try {
      const { data } = await axios.get(`${url}/api/order/dashboard`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!data.success) {
        throw new Error(data.message || 'Failed to load dashboard data.')
      }
      setStats(data.data)
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Could not fetch dashboard metrics.'
      setErrorMsg(msg)
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let ignore = false
    const token = localStorage.getItem('token')
    if (!token) return

    axios
      .get(`${url}/api/order/dashboard`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(({ data }) => {
        if (!ignore) {
          if (!data.success) {
            throw new Error(data.message || 'Failed to load dashboard data.')
          }
          setStats(data.data)
        }
      })
      .catch((err) => {
        if (!ignore) {
          const msg = err.response?.data?.message || err.message || 'Could not fetch dashboard metrics.'
          setErrorMsg(msg)
          toast.error(msg)
        }
      })
      .finally(() => {
        if (!ignore) setLoading(false)
      })

    return () => {
      ignore = true
    }
  }, [])

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'Delivered':
        return 'badge-delivered'
      case 'Out for Delivery':
        return 'badge-out'
      case 'Cancelled':
        return 'badge-cancelled'
      default:
        return 'badge-processing'
    }
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A'
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div>
          <h1>Admin Dashboard</h1>
          <p className="dashboard-subtitle">Overview of your food delivery store.</p>
        </div>
        <button
          type="button"
          className="dashboard-refresh-btn"
          onClick={fetchStats}
          disabled={loading}
        >
          {loading ? 'Refreshing...' : '↻ Refresh'}
        </button>
      </div>

      {loading && !stats ? (
        <div className="dashboard-loading">
          <div className="spinner" />
          <p>Loading real dashboard data...</p>
        </div>
      ) : errorMsg && !stats ? (
        <div className="dashboard-error-box" role="alert">
          <p>{errorMsg}</p>
          <button type="button" onClick={fetchStats}>Retry</button>
        </div>
      ) : (
        <>
          {/* Exactly 3 Dashboard Cards */}
          <div className="dashboard-cards-grid">
            <div className="simple-card" onClick={() => onNavigate('foods')}>
              <div className="card-top">
                <span className="card-title">Total Food Items</span>
                <span className="card-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 10a8 8 0 0 1 16 0H4Z" />
                    <path d="M3 13h18M5 16h14M6 19h12" />
                    <path d="M7 13v1m5-1v1m5-1v1" />
                  </svg>
                </span>
              </div>
              <div className="card-count">{stats?.totalFoods ?? 0}</div>
              <span className="card-action">View all food items &rarr;</span>
            </div>

            <div className="simple-card" onClick={() => onNavigate('orders')}>
              <div className="card-top">
                <span className="card-title">Total Orders</span>
                <span className="card-icon" aria-hidden="true">
                  <img src={assets.parcel_icon} alt="" />
                </span>
              </div>
              <div className="card-count">{stats?.totalOrders ?? 0}</div>
              <span className="card-action">Manage orders &rarr;</span>
            </div>

            <div className="simple-card" onClick={() => onNavigate('users')}>
              <div className="card-top">
                <span className="card-title">Total Registered Users</span>
                <span className="card-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M16 20v-1.5a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4V20" />
                    <circle cx="9.5" cy="7.5" r="3.5" />
                    <path d="M17 11a3.5 3.5 0 1 0-1.1-6.8M17 14.5h1a3 3 0 0 1 3 3V20" />
                  </svg>
                </span>
              </div>
              <div className="card-count">{stats?.totalUsers ?? 0}</div>
              <span className="card-action">View registered users &rarr;</span>
            </div>
          </div>

          {/* Small Recent Orders Table */}
          <div className="recent-orders-card">
            <div className="recent-card-header">
              <h2>Recent Orders</h2>
              <button
                type="button"
                className="view-orders-btn"
                onClick={() => onNavigate('orders')}
              >
                View all orders &rarr;
              </button>
            </div>

            {(!stats?.recentOrders || stats.recentOrders.length === 0) ? (
              <p className="empty-table-note">No customer orders placed yet.</p>
            ) : (
              <div className="table-responsive">
                <table className="simple-table">
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Customer</th>
                      <th>Items</th>
                      <th>Amount</th>
                      <th>Status</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.recentOrders.map((order, index) => {
                      const customerName = `${order.address?.firstName || ''} ${order.address?.lastName || ''}`.trim() || 'Customer'
                      return (
                        <tr key={order._id}>
                          <td className="font-mono">#{index + 1}</td>
                          <td><strong>{customerName}</strong></td>
                          <td>{order.items?.length || 0} item(s)</td>
                          <td><strong>Rs. {Number(order.amount || 0).toLocaleString()}</strong></td>
                          <td>
                            <span className={`status-badge ${getStatusBadgeClass(order.status)}`}>
                              {order.status}
                            </span>
                          </td>
                          <td className="text-muted">{formatDate(order.createdAt)}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}

export default Dashboard
