import React, { useContext, useEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import './Navbar.css'
import { assets } from '../../../assets/assets'
import { StoreContext } from '../../../context/StoreContext'
import LoginPopup from '../../LoginPopup/LoginPopup'
import { useToast } from '../../../context/ToastContext'

const Navbar = ({ publicLanding = false }) => {
    const [showLogin, setShowLogin] = useState(false)
    const [dropdownOpen, setDropdownOpen] = useState(false)
    const dropdownRef = useRef(null)

    const { token, setToken, cartItems, clearCart } = useContext(StoreContext)
    const { pathname } = useLocation()
    const showToast = useToast()
    const activeMenu = pathname === '/menu'
        ? 'menu'
        : pathname === '/contact'
            ? 'contact-us'
        : pathname === '/orders' || pathname === '/myorders'
            ? 'orders'
            : pathname === '/'
                ? 'home'
                : ''

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
                <Link to='/' aria-label='Food Del home'>
                    <img src={assets.logo} alt='Food Del' className='logo' />
                </Link>

                {publicLanding ? (
                    <nav className='welcome-nav' aria-label='Welcome page navigation'>
                        <Link to='/#welcome-categories'>Categories</Link>
                        <Link to='/#welcome-featured'>Popular dishes</Link>
                        <Link to='/#welcome-how'>How it works</Link>
                        <Link to='/contact'>Contact us</Link>
                    </nav>
                ) : <nav aria-label='Main navigation'>
                    <ul className='navbar-menu'>
                        <li>
                            <Link
                                to='/'
                                className={activeMenu === 'home' ? 'active' : ''}
                            >
                                Home
                            </Link>
                        </li>
                        <li>
                            <Link
                                to='/menu'
                                className={activeMenu === 'menu' ? 'active' : ''}
                            >
                                Menu
                            </Link>
                        </li>
                        <li>
                            <Link
                                to='/orders'
                                className={activeMenu === 'orders' ? 'active' : ''}
                            >
                                Orders
                            </Link>
                        </li>
                        <li>
                            <Link
                                to='/contact'
                                className={activeMenu === 'contact-us' ? 'active' : ''}
                            >
                                Contact us
                            </Link>
                        </li>
                    </ul>
                </nav>}

                <div className='navbar-right'>
                    {!publicLanding && (
                        <>
                            <img src={assets.search_icon} alt='' aria-hidden='true' />

                            <Link to='/cart' className='navbar-search-icon' aria-label='Open cart'>
                                <img src={assets.basket_icon} alt='' />
                                {hasCartItems && <span className='dot' aria-hidden='true' />}
                            </Link>
                        </>
                    )}

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
                                            Sign out
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