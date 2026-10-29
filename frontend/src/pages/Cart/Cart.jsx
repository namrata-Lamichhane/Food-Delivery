import React, { useContext } from 'react'
import { Link } from 'react-router-dom'
import './Cart.css'
import { DELIVERY_FEE, StoreContext } from '../../context/StoreContext'

const Cart = () => {
  const { cartItems, food_list, removeFromCart } = useContext(StoreContext)
  const cartEntries = food_list.filter((item) => cartItems[item._id] > 0)
  const cartTotal = cartEntries.reduce(
    (total, item) => total + item.price * cartItems[item._id],
    0
  )
  const deliveryFee = DELIVERY_FEE

  return (
    <main className='cart'>
      {cartEntries.length === 0 ? (
        <div className='cart-empty'>
          <p>Your cart is empty.</p>
          <Link to='/'>Browse the menu</Link>
        </div>
      ) : (
        <>
          <section className='cart-items' aria-label='Cart items'>
            <div className='cart-items-title'>
              <span>Items</span>
              <span>Title</span>
              <span>Price</span>
              <span>Quantity</span>
              <span>Total</span>
              <span>Remove</span>
            </div>
            {cartEntries.map((item) => {
              const quantity = cartItems[item._id]

              return (
                <article className='cart-item-row' key={item._id}>
                  <img className='cart-item-image' src={item.image} alt={item.name} />
                  <span className='cart-item-name'>{item.name}</span>
                  <span className='cart-item-price'>Rs. {item.price}</span>
                  <span className='cart-item-quantity'>{quantity}</span>
                  <span className='cart-item-total'>Rs. {item.price * quantity}</span>
                  <button
                    className='cart-item-remove'
                    type='button'
                    aria-label={`Remove ${item.name} from cart`}
                    onClick={() => removeFromCart(item._id)}
                  >
                    ×
                  </button>
                </article>
              )
            })}
          </section>
          <section className='cart-bottom' aria-label='Cart totals and promo code'>
            <div className='cart-total'>
              <h2>Cart Totals</h2>
              <div className='cart-total-row'>
                <span>Subtotal</span>
                <span>Rs. {cartTotal}</span>
              </div>
              <div className='cart-total-row'>
                <span>Delivery Fee</span>
                <span>Rs. {deliveryFee}</span>
              </div>
              <div className='cart-total-row cart-total-final'>
                <strong>Total</strong>
                <strong>Rs. {cartTotal + deliveryFee}</strong>
              </div>
              <Link className='cart-checkout' to='/order'>
                PROCEED TO CHECKOUT
              </Link>
            </div>
            <form
              className='cart-promo'
              onSubmit={(event) => event.preventDefault()}
            >
              <label htmlFor='promo-code'>
                If you have a promo code, enter it here
              </label>
              <div className='cart-promo-input'>
                <input
                  id='promo-code'
                  type='text'
                  placeholder='Promo code'
                />
                <button type='submit'>Submit</button>
              </div>
            </form>
          </section>
        </>
      )}
    </main>
  )
}

export default Cart
