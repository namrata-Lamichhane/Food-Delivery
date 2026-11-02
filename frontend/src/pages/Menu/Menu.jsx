import React, { useState } from 'react'
import ExploreMenu from '../../components/ExploreMenu/ExploreMenu'
import FoodDisplay from '../../components/FoodDisplay/FoodDisplay'
import './Menu.css'

const Menu = () => {
  const [category, setCategory] = useState('All')

  return (
    <main className='menu-page'>
      <section className='menu-page-intro' aria-labelledby='menu-page-title'>
        <span className='menu-page-eyebrow'>FRESH FROM OUR KITCHEN</span>
        <h1 id='menu-page-title'>Our Menu</h1>
        <p>Find something delicious, made fresh and ready to enjoy.</p>
      </section>
      <ExploreMenu category={category} setCategory={setCategory} />
      <FoodDisplay category={category} title='All the good stuff' />
    </main>
  )
}

export default Menu
