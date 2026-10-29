import React from 'react'
import './Navbar.css'
import { assets } from '../assets/assets.js'

const Navbar = ({ currentUser, onLogout, onToggleSidebar, isSidebarOpen }) => {
  return (
    <header className="navbar">
      <div className="navbar-left">
        <button
          className="mobile-menu-btn"
          type="button"
          aria-label={isSidebarOpen ? 'Close sidebar' : 'Open sidebar'}
          onClick={onToggleSidebar}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            {isSidebarOpen ? (
              <>
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </>
            ) : (
              <>
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </>
            )}
          </svg>
        </button>
        <div className="navbar-brand-wrap">
          <img src={assets.logo} alt="Food Del Logo" className="navbar-logo" />
        </div>
      </div>

      <div className="navbar-right">
        {currentUser && (
          <div className="navbar-user-info">
            <span className="navbar-user-name">{currentUser.name || 'Admin'}</span>
            <span className="navbar-user-role">Administrator</span>
          </div>
        )}
        <img className="navbar-profile" src={assets.profile_image} alt="Admin avatar" />
        <button
          className="navbar-logout-btn"
          type="button"
          onClick={onLogout}
          title="Sign out of Admin Panel"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          <span className="logout-text">Logout</span>
        </button>
      </div>
    </header>
  )
}

export default Navbar
