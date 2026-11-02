import React, { useContext, useEffect } from 'react'
import Navbar from './components/Navbar/Navbar/Navbar'
import { Route, Routes, useLocation } from 'react-router-dom'
import Home from './pages/Home/Home'
import Welcome from './pages/Welcome/Welcome'
import Cart from './pages/Cart/Cart'
import PlaceOrder from './pages/PlaceOrder/PlaceOrder'
import MyOrders from './pages/MyOrders/MyOrders'
import Footer from './components/Footer/Footer'
import { StoreContext } from './context/StoreContext'

const App = () => {
  const { pathname, hash } = useLocation()
  const { token, loading } = useContext(StoreContext)
  const isPublicLanding = pathname === '/' && !token

  useEffect(() => {
    if (hash) {
      document.getElementById(decodeURIComponent(hash.slice(1)))?.scrollIntoView()
    } else if (pathname === '/') {
      window.scrollTo(0, 0)
    }
  }, [pathname, hash])

  return (
    <>
      <div className={`app${isPublicLanding ? ' app--public-landing' : ''}`}>
        <Navbar publicLanding={isPublicLanding} />
        <Routes>
          <Route
            path='/'
            element={
              loading ? (
                <main className='app-loading' aria-live='polite'>Loading…</main>
              ) : token ? (
                <Home />
              ) : (
                <Welcome />
              )
            }
          />
          <Route path='/cart' element={<Cart />} />
          <Route path='/order' element={<PlaceOrder />} />
          <Route path='/orders' element={<MyOrders />} />
          <Route path='/myorders' element={<MyOrders />} />
        </Routes>
      </div>
      <Footer />
    </>
  )
}

export default App
