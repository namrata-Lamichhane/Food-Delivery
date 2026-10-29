import React, { useContext, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import './PlaceOrder.css'
import { DELIVERY_FEE, StoreContext } from '../../context/StoreContext'
import { useToast } from '../../context/ToastContext'

const EMPTY_ADDRESS = {
    firstName: '',
    lastName: '',
    email: '',
    street: '',
    city: '',
    province: '',
    postalCode: '',
    country: '',
    phone: '',
}

const PlaceOrder = () => {
    const { url, cartItems, food_list, token, loading, clearCart } =
        useContext(StoreContext)
    const navigate = useNavigate()
    const showToast = useToast()

    const [address, setAddress] = useState(EMPTY_ADDRESS)
    const [submitting, setSubmitting] = useState(false)
    const [formError, setFormError] = useState('')
    const [orderId, setOrderId] = useState(null)
    const [orderAmount, setOrderAmount] = useState(0)
    const [confirmingOrder, setConfirmingOrder] = useState(false)

    // Redirect to home if not authenticated (wait until the initial load finishes)
    useEffect(() => {
        if (!loading && !token) {
            navigate('/')
        }
    }, [loading, token, navigate])

    const cartEntries = food_list.filter((item) => cartItems[item._id] > 0)
    const subtotal = cartEntries.reduce(
        (total, item) => total + item.price * cartItems[item._id],
        0
    )

    const handleChange = (e) => {
        setAddress((prev) => ({ ...prev, [e.target.name]: e.target.value }))
        if (formError) setFormError('')
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        setFormError('')

        if (cartEntries.length === 0) {
            setFormError('Your cart is empty. Add items before placing an order.')
            return
        }

        setConfirmingOrder(true)
    }

    const confirmOrder = async () => {
        // Build the items array — only send _id + quantity; backend re-fetches prices
        const items = cartEntries.map((item) => ({
            _id: item._id,
            quantity: cartItems[item._id],
        }))

        setConfirmingOrder(false)
        setSubmitting(true)
        try {
            const { data } = await axios.post(
                `${url}/api/order/place`,
                { items, address },
                { headers: { Authorization: `Bearer ${token}` } }
            )

            if (data.success) {
                clearCart()           // clear local cart state
                setOrderId(data.orderId)
                setOrderAmount(data.amount)
                showToast('Order placed successfully. Payment is due on delivery.')
            } else {
                const message = data.message || 'Failed to place order. Please try again.'
                setFormError(message)
                showToast(message, 'error')
            }
        } catch (err) {
            const msg =
                err.response?.status === 401
                    ? 'Your session has expired. Please log in again.'
                    : err.response?.data?.message ||
                      'Unable to connect to the server. Please try again.'
            setFormError(msg)
            showToast(msg, 'error')
        } finally {
            setSubmitting(false)
        }
    }

    // ── Empty cart screen ────────────────────────────────────────────────────
    if (!loading && cartEntries.length === 0 && !orderId) {
        return (
            <main className='place-order'>
                <section className='place-order-empty'>
                    <h1>Your cart is empty</h1>
                    <p>Add dishes to your cart before placing an order.</p>
                    <Link to='/'>Browse the menu</Link>
                </section>
            </main>
        )
    }

    // ── Order confirmation screen ────────────────────────────────────────────
    if (orderId) {
        return (
            <main className='place-order'>
                <section
                    className='place-order-confirmation'
                    role='status'
                    aria-live='polite'
                >
                    <div className='confirmation-success-icon' aria-hidden='true'>✓</div>
                    <p className='confirmation-eyebrow'>ORDER CONFIRMED</p>
                    <h1>Thank you for your order</h1>
                    <p className='confirmation-description'>
                        We’ve received your order and our kitchen is getting it ready.
                    </p>

                    <div className='confirmation-details'>
                        <div className='confirmation-detail-row'>
                            <span>Order reference</span>
                            <strong className='confirmation-order-id'>{orderId}</strong>
                        </div>
                        <div className='confirmation-detail-row'>
                            <span>Total to pay</span>
                            <strong>Rs. {Number(orderAmount).toLocaleString('en-NP')}</strong>
                        </div>
                        <div className='confirmation-detail-row'>
                            <span>Payment method</span>
                            <strong className='confirmation-payment-method'>
                                <span aria-hidden='true'>●</span> Cash on Delivery
                            </strong>
                        </div>
                    </div>
                    <p className='confirmation-payment-note'>
                        Please pay in cash when your order is delivered.
                    </p>
                    <div className='confirmation-actions'>
                        <Link className='confirmation-primary-action' to='/'>
                            Continue shopping
                        </Link>
                        <Link className='confirmation-secondary-action' to='/orders'>
                            View my orders
                        </Link>
                    </div>
                </section>
            </main>
        )
    }

    // ── Main checkout form ───────────────────────────────────────────────────
    return (
        <main className='place-order'>
            <div className='place-order-layout'>
                {/* ── Delivery form ── */}
                <section className='delivery-details'>
                    <h1>Delivery Information</h1>
                    <form id='delivery-form' onSubmit={handleSubmit}>
                        <div className='delivery-name-fields'>
                            <label>
                                <span className='visually-hidden'>First name</span>
                                <input
                                    name='firstName'
                                    type='text'
                                    placeholder='First name'
                                    value={address.firstName}
                                    onChange={handleChange}
                                    autoComplete='given-name'
                                    required
                                />
                            </label>
                            <label>
                                <span className='visually-hidden'>Last name</span>
                                <input
                                    name='lastName'
                                    type='text'
                                    placeholder='Last name'
                                    value={address.lastName}
                                    onChange={handleChange}
                                    autoComplete='family-name'
                                    required
                                />
                            </label>
                        </div>
                        <label>
                            <span className='visually-hidden'>Email address</span>
                            <input
                                name='email'
                                type='email'
                                placeholder='Email address'
                                value={address.email}
                                onChange={handleChange}
                                autoComplete='email'
                                required
                            />
                        </label>
                        <label>
                            <span className='visually-hidden'>Street address</span>
                            <input
                                name='street'
                                type='text'
                                placeholder='Street'
                                value={address.street}
                                onChange={handleChange}
                                autoComplete='street-address'
                                required
                            />
                        </label>
                        <div className='delivery-name-fields'>
                            <label>
                                <span className='visually-hidden'>City</span>
                                <input
                                    name='city'
                                    type='text'
                                    placeholder='City'
                                    value={address.city}
                                    onChange={handleChange}
                                    autoComplete='address-level2'
                                    required
                                />
                            </label>
                            <label>
                                <span className='visually-hidden'>State / Province</span>
                                <input
                                    name='province'
                                    type='text'
                                    placeholder='State / Province'
                                    value={address.province}
                                    onChange={handleChange}
                                    autoComplete='address-level1'
                                    required
                                />
                            </label>
                        </div>
                        <div className='delivery-name-fields'>
                            <label>
                                <span className='visually-hidden'>Zip code</span>
                                <input
                                    name='postalCode'
                                    type='text'
                                    placeholder='Zip code'
                                    value={address.postalCode}
                                    onChange={handleChange}
                                    autoComplete='postal-code'
                                    required
                                />
                            </label>
                            <label>
                                <span className='visually-hidden'>Country</span>
                                <input
                                    name='country'
                                    type='text'
                                    placeholder='Country'
                                    value={address.country}
                                    onChange={handleChange}
                                    autoComplete='country-name'
                                    required
                                />
                            </label>
                        </div>
                        <label>
                            <span className='visually-hidden'>Phone number</span>
                            <input
                                name='phone'
                                type='tel'
                                placeholder='Phone'
                                value={address.phone}
                                onChange={handleChange}
                                autoComplete='tel'
                                required
                            />
                        </label>
                    </form>
                </section>

                {/* ── Order summary sidebar ── */}
                <aside className='order-summary'>
                    <h2>Cart Totals</h2>
                    <div className='order-summary-totals'>
                        <div>
                            <span>Subtotal</span>
                            <span>Rs. {subtotal}</span>
                        </div>
                        <div>
                            <span>Delivery Fee</span>
                            <span>Rs. {DELIVERY_FEE}</span>
                        </div>
                        <div className='order-summary-total'>
                            <strong>Total</strong>
                            <strong>Rs. {subtotal + DELIVERY_FEE}</strong>
                        </div>
                    </div>

                    <fieldset className='place-order-payment'>
                        <legend>Payment method</legend>
                        <label>
                            <input type='radio' name='paymentMethod' checked readOnly />
                            <span>Cash on Delivery</span>
                        </label>
                        <small>Pay in cash when your order is delivered.</small>
                    </fieldset>

                    {/* API error feedback */}
                    {formError && (
                        <p className='place-order-error' role='alert'>
                            {formError}
                        </p>
                    )}

                    <button
                        className='place-order-submit'
                        type='submit'
                        form='delivery-form'
                        disabled={submitting}
                    >
                        {submitting ? 'Placing order…' : 'REVIEW & CONFIRM ORDER'}
                    </button>
                </aside>
            </div>
            {confirmingOrder && (
                <div className='order-confirmation-backdrop'>
                    <section
                        className='order-confirmation-dialog'
                        role='dialog'
                        aria-modal='true'
                        aria-labelledby='confirm-order-title'
                    >
                        <h2 id='confirm-order-title'>Confirm your order</h2>
                        <p>
                            Place this order for <strong>Rs. {subtotal + DELIVERY_FEE}</strong>?
                        </p>
                        <div className='order-confirmation-payment'>
                            <span>Payment method</span>
                            <strong>Cash on Delivery</strong>
                        </div>
                        <p className='order-confirmation-note'>
                            You will pay in cash when your order arrives.
                        </p>
                        <div className='order-confirmation-actions'>
                            <button
                                type='button'
                                className='order-confirmation-cancel'
                                onClick={() => setConfirmingOrder(false)}
                            >
                                Edit order
                            </button>
                            <button
                                type='button'
                                className='order-confirmation-submit'
                                onClick={confirmOrder}
                                disabled={submitting}
                            >
                                Confirm order
                            </button>
                        </div>
                    </section>
                </div>
            )}
        </main>
    )
}

export default PlaceOrder
