import { useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'
import { url } from '../assets/assets.js'
import './Order.css'

const validStatuses = [
  'Food Processing',
  'Out for Delivery',
  'Delivered',
  'Cancelled',
]

const OrderIcon = ({ className }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.7"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M7 3.75h8l4 4v12.5a.75.75 0 0 1-.75.75h-11.5a.75.75 0 0 1-.75-.75V4.5a.75.75 0 0 1 .75-.75Z" />
    <path d="M15 4v4h4M9 12h6M9 16h6" />
  </svg>
)

const Order = () => {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(() => Boolean(localStorage.getItem('token')))
  const [errorMsg, setErrorMsg] = useState('')
  const [updatingId, setUpdatingId] = useState(null)

  // Filtering & search
  const [filterStatus, setFilterStatus] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')

  // Order Details Modal
  const [selectedOrder, setSelectedOrder] = useState(null)

  const fetchOrders = async () => {
    const token = localStorage.getItem('token')
    if (!token) return

    setLoading(true)
    setErrorMsg('')
    try {
      const { data } = await axios.get(`${url}/api/order/list`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!data.success || !Array.isArray(data.data)) {
        throw new Error(data.message || 'Invalid order list response.')
      }
      setOrders(data.data)
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to fetch orders.'
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
      .get(`${url}/api/order/list`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(({ data }) => {
        if (!ignore) {
          if (!data.success || !Array.isArray(data.data)) {
            throw new Error(data.message || 'Invalid order list response.')
          }
          setOrders(data.data)
        }
      })
      .catch((err) => {
        if (!ignore) {
          const msg = err.response?.data?.message || err.message || 'Failed to fetch orders.'
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

  // Handle status update via PATCH
  const handleStatusChange = async (orderId, newStatus) => {
    const token = localStorage.getItem('token')
    if (!token) {
      toast.error('Administrator authentication required.')
      return
    }

    setUpdatingId(orderId)
    try {
      const res = await axios.patch(
        `${url}/api/order/status`,
        { orderId, status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      )

      if (!res.data.success) {
        throw new Error(res.data.message || 'Failed to update order status.')
      }

      setOrders((prev) =>
        prev.map((ord) => (ord._id === orderId ? { ...ord, status: newStatus } : ord))
      )

      if (selectedOrder && selectedOrder._id === orderId) {
        setSelectedOrder((prev) => ({ ...prev, status: newStatus }))
      }

      toast.success(`Order #${getOrderNumber(orderId)} updated to "${newStatus}"`)
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Status update failed.'
      toast.error(msg)
    } finally {
      setUpdatingId(null)
    }
  }

  // Filtered orders list
  const filteredOrders = useMemo(() => {
    return orders.filter((ord) => {
      const matchesStatus = filterStatus === 'All' || ord.status === filterStatus
      const customerFullName = `${ord.address?.firstName || ''} ${ord.address?.lastName || ''}`.toLowerCase()
      const customerEmail = (ord.address?.email || '').toLowerCase()
      const orderIdStr = String(ord._id).toLowerCase()
      const query = searchQuery.toLowerCase()

      const matchesSearch =
        customerFullName.includes(query) ||
        customerEmail.includes(query) ||
        orderIdStr.includes(query)

      return matchesStatus && matchesSearch
    })
  }, [orders, filterStatus, searchQuery])

  const getOrderNumber = (orderId) =>
    orders.findIndex((order) => order._id === orderId) + 1

  const formatCurrency = (val) => `Rs. ${Number(val || 0).toLocaleString()}`

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A'
    return new Date(dateStr).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'Delivered':
        return 'status-delivered'
      case 'Out for Delivery':
        return 'status-out'
      case 'Cancelled':
        return 'status-cancelled'
      default:
        return 'status-processing'
    }
  }

  return (
    <div className="orders-container">
      {/* Header */}
      <div className="orders-top-bar">
        <div>
          <h1>Customer Orders</h1>
          <p className="orders-subtitle">
            Manage incoming orders, delivery statuses, and customer addresses.
          </p>
        </div>
        <button
          type="button"
          className="refresh-orders-btn"
          onClick={fetchOrders}
          disabled={loading}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={loading ? 'spin-icon' : ''}>
            <polyline points="23 4 23 10 17 10" />
            <polyline points="1 20 1 14 7 14" />
            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
          </svg>
          <span>{loading ? 'Refreshing...' : 'Refresh Orders'}</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="orders-filter-bar">
        <div className="orders-search-box">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            placeholder="Search by customer, email, or order ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              type="button"
              className="clear-search-btn"
              onClick={() => setSearchQuery('')}
            >
              &times;
            </button>
          )}
        </div>

        <div className="orders-status-filters">
          <button
            type="button"
            className={`status-pill ${filterStatus === 'All' ? 'active' : ''}`}
            onClick={() => setFilterStatus('All')}
          >
            All ({orders.length})
          </button>
          {validStatuses.map((st) => {
            const count = orders.filter((o) => o.status === st).length
            return (
              <button
                key={st}
                type="button"
                className={`status-pill ${filterStatus === st ? 'active' : ''}`}
                onClick={() => setFilterStatus(st)}
              >
                {st} ({count})
              </button>
            )
          })}
        </div>
      </div>

      {/* Orders List View */}
      {loading ? (
        <div className="orders-loading-state">
          <div className="spinner" />
          <p>Fetching real-time orders from database...</p>
        </div>
      ) : errorMsg ? (
        <div className="orders-error-state" role="alert">
          <p>{errorMsg}</p>
          <button type="button" onClick={fetchOrders}>Retry</button>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="orders-empty-state">
          <OrderIcon className="empty-order-icon" />
          <h3>No Orders Found</h3>
          <p>
            {orders.length === 0
              ? 'No orders have been placed by customers yet.'
              : 'No orders match your search and filter criteria.'}
          </p>
          {(filterStatus !== 'All' || searchQuery) && (
            <button
              type="button"
              className="reset-filter-btn"
              onClick={() => {
                setFilterStatus('All')
                setSearchQuery('')
              }}
            >
              Clear Filters
            </button>
          )}
        </div>
      ) : (
        <div className="orders-list">
          {filteredOrders.map((order) => {
            const customerName = `${order.address?.firstName || ''} ${order.address?.lastName || ''}`.trim() || 'Customer'
            const fullAddress = `${order.address?.street || ''}, ${order.address?.city || ''}, ${order.address?.province || ''} ${order.address?.postalCode || ''}, ${order.address?.country || ''}`
            const isUpdating = updatingId === order._id
            const orderNumber = getOrderNumber(order._id)

            return (
              <div className="order-card" key={order._id}>
                {/* Order Top Ribbon */}
                <div className="order-card-header">
                  <div className="order-header-left">
                    <OrderIcon className="order-parcel-img" />
                    <div>
                      <span className="order-code">Order #{orderNumber}</span>
                      <span className="order-time">{formatDate(order.createdAt)}</span>
                    </div>
                  </div>

                  <div className="order-header-right">
                    <span className="order-amount-display">{formatCurrency(order.amount)}</span>
                    <span className="order-payment-method">Cash on Delivery</span>
                  </div>
                </div>

                {/* Items & Customer Body */}
                <div className="order-card-body">
                  {/* Items column */}
                  <div className="order-items-col">
                    <span className="col-subheading">Items Ordered ({order.items?.length || 0})</span>
                    <div className="order-items-pills">
                      {order.items?.map((item, idx) => (
                        <div className="order-item-chip" key={idx}>
                          <span className="chip-name">{item.name}</span>
                          <span className="chip-qty">x{item.quantity}</span>
                          <span className="chip-price">Rs. {item.price * item.quantity}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Customer details column */}
                  <div className="order-customer-col">
                    <span className="col-subheading">Delivery Address</span>
                    <div className="customer-info-box">
                      <div className="cust-name">
                        <strong>{customerName}</strong>
                      </div>
                      <div className="cust-address">{fullAddress}</div>
                      <div className="cust-contact">
                        <span>📞 {order.address?.phone || 'No phone'}</span>
                        <span>✉️ {order.address?.email || 'No email'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer with Status Changer and Details Button */}
                <div className="order-card-footer">
                  <button
                    type="button"
                    className="view-order-details-btn"
                    onClick={() => setSelectedOrder(order)}
                  >
                    View Full Details
                  </button>

                  <div className="status-changer-wrap">
                    <span className="status-change-label">Order Status:</span>
                    <select
                      className={`status-select ${getStatusColor(order.status)}`}
                      value={order.status}
                      disabled={isUpdating}
                      onChange={(e) => handleStatusChange(order._id, e.target.value)}
                    >
                      {validStatuses.map((st) => (
                        <option key={st} value={st}>
                          {st}
                        </option>
                      ))}
                    </select>
                    {isUpdating && <span className="updating-spinner" />}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Order Full Details Modal */}
      {selectedOrder && (
        <div className="modal-backdrop">
          <div className="modal-card order-details-modal">
            <div className="details-modal-header">
              <div>
                <h3>Order #{getOrderNumber(selectedOrder._id)}</h3>
                <span className="details-timestamp">{formatDate(selectedOrder.createdAt)}</span>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setSelectedOrder(null)}
              >
                &times;
              </button>
            </div>

            <div className="details-modal-body">
              {/* Customer & Address Details */}
              <div className="details-section">
                <h4>Customer & Delivery Details</h4>
                <div className="details-grid">
                  <div>
                    <span className="dt-label">Customer Name</span>
                    <span className="dt-val">
                      {selectedOrder.address?.firstName} {selectedOrder.address?.lastName}
                    </span>
                  </div>
                  <div>
                    <span className="dt-label">Phone</span>
                    <span className="dt-val">{selectedOrder.address?.phone || '—'}</span>
                  </div>
                  <div>
                    <span className="dt-label">Email</span>
                    <span className="dt-val">{selectedOrder.address?.email || '—'}</span>
                  </div>
                  <div>
                    <span className="dt-label">Payment Method</span>
                    <span className="dt-val">
                      Cash on Delivery ({selectedOrder.payment ? 'Paid' : 'Unpaid'})
                    </span>
                  </div>
                  <div className="details-grid-full">
                    <span className="dt-label">Street Address</span>
                    <span className="dt-val">
                      {selectedOrder.address?.street}, {selectedOrder.address?.city},{' '}
                      {selectedOrder.address?.province} ({selectedOrder.address?.postalCode}),{' '}
                      {selectedOrder.address?.country}
                    </span>
                  </div>
                </div>
              </div>

              {/* Items Table */}
              <div className="details-section">
                <h4>Order Items ({selectedOrder.items?.length || 0})</h4>
                <div className="details-items-table-wrap">
                  <table className="details-items-table">
                    <thead>
                      <tr>
                        <th>Item</th>
                        <th>Category</th>
                        <th>Price</th>
                        <th>Qty</th>
                        <th>Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedOrder.items?.map((item, idx) => (
                        <tr key={idx}>
                          <td>
                            <strong>{item.name}</strong>
                          </td>
                          <td>{item.category}</td>
                          <td>Rs. {item.price}</td>
                          <td>x{item.quantity}</td>
                          <td><strong>Rs. {item.price * item.quantity}</strong></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Total Summary */}
              <div className="details-summary-box">
                <div className="summary-line">
                  <span>Grand Total (including delivery fee)</span>
                  <span className="summary-grand-total">{formatCurrency(selectedOrder.amount)}</span>
                </div>
              </div>
            </div>

            <div className="details-modal-footer">
              <button
                type="button"
                className="btn-cancel"
                onClick={() => setSelectedOrder(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Order
