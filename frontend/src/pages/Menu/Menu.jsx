import React, { useState } from 'react'
import ExploreMenu from '../../components/ExploreMenu/ExploreMenu'
import FoodDisplay from '../../components/FoodDisplay/FoodDisplay'
import './Menu.css'

const Menu = () => {
  const [category, setCategory] = useState('All')

  return (
    <main className='menu-page'>
      <header className='menu-page-header' aria-labelledby='menu-page-title'>
        <h1 id='menu-page-title'>Our Menu</h1>
      </header>
      <ExploreMenu category={category} setCategory={setCategory} />
      <FoodDisplay category={category} title='All the good stuff' />
    </main>
  )
}

export default Menu
