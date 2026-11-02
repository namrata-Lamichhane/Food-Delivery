import React, { useContext, useEffect } from 'react'
import Navbar from './components/Navbar/Navbar/Navbar'
import { Route, Routes, useLocation } from 'react-router-dom'
import Home from './pages/Home/Home'
import Welcome from './pages/Welcome/Welcome'
import Cart from './pages/Cart/Cart'
import PlaceOrder from './pages/PlaceOrder/PlaceOrder'
import MyOrders from './pages/MyOrders/MyOrders'
import Menu from './pages/Menu/Menu'
import Contact from './pages/Contact/Contact'
import Footer from './components/Footer/Footer'
import { StoreContext } from './context/StoreContext'

const App = () => {
  const { pathname, hash } = useLocation()
  const { token, loading } = useContext(StoreContext)
  const isPublicLanding = pathname === '/' && !token
  const isSignedInHome = pathname === '/' && Boolean(token)
  const isSignedInMenu = pathname === '/menu' && Boolean(token)
  const appClassName = [
    'app',
    isPublicLanding && 'app--public-landing',
    isSignedInHome && 'app--signed-in-home',
    isSignedInMenu && 'app--signed-in-menu',
  ].filter(Boolean).join(' ')

  useEffect(() => {
    if (hash) {
      document.getElementById(decodeURIComponent(hash.slice(1)))?.scrollIntoView()
    } else {
      window.scrollTo(0, 0)
    }
  }, [pathname, hash])

  return (
    <>
      <div className={appClassName}>
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
          <Route path='/menu' element={<Menu />} />
          <Route path='/contact' element={<Contact />} />
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
