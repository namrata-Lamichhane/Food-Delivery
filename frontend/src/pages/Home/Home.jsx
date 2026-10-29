import React, { useState } from 'react'
import './Home.css'
import Header from '../../components/Navbar/Header/Header'
import ExploreMenu from '../../components/ExploreMenu/ExploreMenu'
import FoodDisplay from '../../components/FoodDisplay/FoodDisplay'
import app_store from '../../assets/app_store.png'
import play_store from '../../assets/play_store.png'

const Home = () => {

  const[category,setCategory] = useState("All");

  return (
    <div>
      <Header/>
      <ExploreMenu category={category} setCategory={setCategory}/>
      <FoodDisplay category={category}/>
      <section className='app-download' id='mobile-app'>
        <h2>For Better Experience Download<br />Food Del App</h2>
        <div className='app-download-platforms'>
          <a href='https://play.google.com/store' target='_blank' rel='noreferrer' aria-label='Get it on Google Play'>
            <img src={play_store} alt='Get it on Google Play' />
          </a>
          <a href='https://www.apple.com/app-store/' target='_blank' rel='noreferrer' aria-label='Download on the App Store'>
            <img src={app_store} alt='Download on the App Store' />
          </a>
        </div>
      </section>
    </div>
  )
}

export default Home
