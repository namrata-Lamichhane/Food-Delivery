import React, { useContext, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import './Navbar.css'
import { assets } from '../../../assets/assets'
import { StoreContext } from '../../../context/StoreContext'
import LoginPopup from '../../LoginPopup/LoginPopup'
import { useToast } from '../../../context/ToastContext'

const Navbar = () => {
    const [menu, setMenu] = useState('home')
    const [showLogin, setShowLogin] = useState(false)
    const [dropdownOpen, setDropdownOpen] = useState(false)
    const dropdownRef = useRef(null)

    const { token, setToken, cartItems, clearCart } = useContext(StoreContext)
    const showToast = useToast()

    // Cart dot only when at least one item is in the cart
    const hasCartItems = Object.values(cartItems).some((qty) => qty > 0)

    const logout = () => {
        localStorage.removeItem('token')
        setToken('')
        clearCart()
        setDropdownOpen(false)
        showToast('You have been logged out.')
    }

    // Close dropdown when the user clicks anywhere outside it
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setDropdownOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    return (
        <>
            {showLogin && <LoginPopup setShowLogin={setShowLogin} />}
            <header className='navbar'>
                <Link to='/' aria-label='Food Del home' onClick={() => setMenu('home')}>
                    <img src={assets.logo} alt='Food Del' className='logo' />
                </Link>

                <nav aria-label='Main navigation'>
                    <ul className='navbar-menu'>
                        <li>
                            <Link
                                to='/'
                                className={menu === 'home' ? 'active' : ''}
                                onClick={() => setMenu('home')}
                            >
                                Home
                            </Link>
                        </li>
                        <li>
                            <Link
                                to='/#explore-menu'
                                className={menu === 'menu' ? 'active' : ''}
                                onClick={() => setMenu('menu')}
                            >
                                Menu
                            </Link>
                        </li>
                        <li>
                            <Link
                                to='/#mobile-app'
                                className={menu === 'mobile-app' ? 'active' : ''}
                                onClick={() => setMenu('mobile-app')}
                            >
                                Mobile app
                            </Link>
                        </li>
                        <li>
                            <Link
                                to='/#footer'
                                className={menu === 'contact-us' ? 'active' : ''}
                                onClick={() => setMenu('contact-us')}
                            >
                                Contact us
                            </Link>
                        </li>
                    </ul>
                </nav>

                <div className='navbar-right'>
                    <img src={assets.search_icon} alt='' aria-hidden='true' />

                    <Link to='/cart' className='navbar-search-icon' aria-label='Open cart'>
                        <img src={assets.basket_icon} alt='' />
                        {hasCartItems && <span className='dot' aria-hidden='true' />}
                    </Link>

                    {token ? (
                        /* ── Logged-in: profile icon + click-toggled dropdown ── */
                        <div className='navbar-profile' ref={dropdownRef}>
                            <button
                                type='button'
                                className='navbar-profile-btn'
                                aria-haspopup='true'
                                aria-expanded={dropdownOpen}
                                onClick={() => setDropdownOpen((o) => !o)}
                                aria-label='Account menu'
                            >
                                <img
                                    src={assets.profile_image}
                                    alt=''
                                    className='navbar-profile-icon'
                                />
                                <span className='navbar-profile-arrow'>
                                    {dropdownOpen ? '▲' : '▼'}
                                </span>
                            </button>

                            {dropdownOpen && (
                                <ul
                                    className='navbar-profile-dropdown'
                                    role='menu'
                                >
                                    <li role='none'>
                                        <Link
                                            to='/orders'
                                            role='menuitem'
                                            className='navbar-profile-link'
                                            onClick={() => setDropdownOpen(false)}
                                        >
                                            <span aria-hidden='true'>▤</span>
                                            Orders
                                        </Link>
                                    </li>
                                    <li role='none'>
                                        <button
                                            type='button'
                                            role='menuitem'
                                            className='navbar-logout-btn'
                                            onClick={logout}
                                        >
                                            <img
                                                src={assets.logout_icon}
                                                alt=''
                                                aria-hidden='true'
                                            />
                                            Logout
                                        </button>
                                    </li>
                                </ul>
                            )}
                        </div>
                    ) : (
                        /* ── Logged-out: Sign in button ── */
                        <button type='button' onClick={() => setShowLogin(true)}>
                            Sign in
                        </button>
                    )}
                </div>
            </header>
        </>
    )
}

export default Navbar