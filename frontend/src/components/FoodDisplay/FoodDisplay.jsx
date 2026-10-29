import React, { useContext } from 'react'
import './FoodDisplay.css'
import { StoreContext } from '../../context/StoreContext'
import rating_starts from '../../assets/rating_starts.png'

const FoodDisplay = ({ category }) => {
  const { food_list, cartItems, addToCart, updateCartQuantity } =
    useContext(StoreContext)
  const displayedFood = food_list.filter(
    (item) => category === 'All' || category === item.category
  )

  return (
    <div className='food-display' id='food-display'>
      <h2>Top dishes near you</h2>
      <div className='food-display-list'>
        {displayedFood.map((item) => (
          <article className='food-item' key={`${category}-${item._id}`}>
           <div className='food-item-image-container'>
             <img className='food-item-image' src={item.image} alt={item.name} />
             {cartItems[item._id] ? (
               <div className='food-item-counter' aria-label={`${item.name} quantity`}>
                 <button
                   className='food-item-counter-remove'
                   type='button'
                   aria-label={`Remove one ${item.name}`}
                   onClick={() =>
                     updateCartQuantity(item._id, cartItems[item._id] - 1)
                   }
                 >
                   −
                 </button>
                 <span aria-live='polite'>{cartItems[item._id]}</span>
                 <button
                   className='food-item-counter-add'
                   type='button'
                   aria-label={`Add one ${item.name}`}
                   onClick={() => addToCart(item._id)}
                 >
                   +
                 </button>
               </div>
             ) : (
               <button
                 className='food-item-add'
                 type='button'
                 aria-label={`Add ${item.name}`}
                 onClick={() => addToCart(item._id)}
               >
                 +
               </button>
             )}
           </div>
           <div className='food-item-info'>
             <div className='food-item-name-rating'>
               <h3>{item.name}</h3>
               <img src={rating_starts} alt='4 out of 5 stars' />
             </div>
             <p className='food-item-description'>{item.description}</p>
             <strong className='food-item-price'>Rs. {item.price}</strong>
           </div>
          </article>
        ))}
      </div>
    </div>
  )
}

export default FoodDisplay
