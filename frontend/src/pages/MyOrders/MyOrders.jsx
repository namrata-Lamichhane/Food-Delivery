import { useContext, useEffect, useState } from 'react'
import axios from 'axios'
import { Link } from 'react-router-dom'
import { StoreContext } from '../../context/StoreContext'
import './MyOrders.css'

const formatPrice = (amount) =>
    `Rs. ${Number(amount || 0).toLocaleString('en-NP')}`

const formatItems = (items) =>
    items.map((item) => `${item.name} x ${item.quantity}`).join(', ')

const MyOrders = () => {
    const { token, url } = useContext(StoreContext)
    const requestKey = token ? `${url}|${token}` : ''
    const [result, setResult] = useState({ key: '', orders: [], error: '' })
    const [trackingOrderId, setTrackingOrderId] = useState(null)
    const loading = Boolean(requestKey) && result.key !== requestKey
    const orders = result.key === requestKey ? result.orders : []
    const error = result.key === requestKey ? result.error : ''

    useEffect(() => {
        if (!token) return undefined

        const controller = new AbortController()
        const fetchOrders = async () => {
            try {
                const { data } = await axios.get(`${url}/api/order/userorders`, {
                    headers: { Authorization: `Bearer ${token}` },
                    signal: controller.signal,
                })
                if (!data.success || !Array.isArray(data.data)) {
                    throw new Error(data.message || 'Could not load your orders.')
                }
                setResult({ key: requestKey, orders: data.data, error: '' })
            } catch (requestError) {
                if (!controller.signal.aborted) {
                    setResult({
                        key: requestKey,
                        orders: [],
                        error: requestError.response?.data?.message ||
                            requestError.message ||
                            'Could not load your orders.',
                    })
                }
            }
        }

        fetchOrders()
        return () => controller.abort()
    }, [token, url, requestKey])

    return (
        <main className='my-orders'>
            <h1>My Orders</h1>

            {!token ? (
                <section className='my-orders-message' role='status'>
                    <h2>Sign in to see your orders</h2>
                    <p>Your order history is available after you log in.</p>
                    <Link to='/' className='my-orders-home-link'>Go to home</Link>
                </section>
            ) : loading ? (
                <p className='my-orders-message' role='status'>Loading your orders…</p>
            ) : error ? (
                <section className='my-orders-message my-orders-error' role='alert'>
                    <p>{error}</p>
                </section>
            ) : orders.length === 0 ? (
                <section className='my-orders-message'>
                    <h2>No orders yet</h2>
                    <p>Your placed orders will show up here.</p>
                    <Link to='/' className='my-orders-home-link'>Browse food</Link>
                </section>
            ) : (
                <div className='my-orders-list'>
                    {orders.map((order) => {
                        const itemCount = order.items.length
                        const isTracking = trackingOrderId === order._id

                        return (
                            <article className='my-order-card' key={order._id}>
                                <span className='my-order-package' aria-hidden='true'>📦</span>
                                <div className='my-order-items'>
                                    <p>{formatItems(order.items)}</p>
                                    <span>{order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'Order'}</span>
                                </div>
                                <strong className='my-order-amount'>{formatPrice(order.amount)}</strong>
                                <span className='my-order-count'>Items: {itemCount}</span>
                                <span className={`my-order-status my-order-status-${order.status === 'Delivered' ? 'delivered' : 'active'}`}>
                                    <span aria-hidden='true'>●</span>
                                    {order.status}
                                </span>
                                <button
                                    className='my-order-track'
                                    type='button'
                                    aria-expanded={isTracking}
                                    onClick={() =>
                                        setTrackingOrderId(isTracking ? null : order._id)
                                    }
                                >
                                    {isTracking ? 'Hide status' : 'Track Order'}
                                </button>
                                {isTracking && (
                                    <p className='my-order-tracking-detail' role='status'>
                                        Current status: <strong>{order.status}</strong>
                                    </p>
                                )}
                            </article>
                        )
                    })}
                </div>
            )}
        </main>
    )
}

export default MyOrders
