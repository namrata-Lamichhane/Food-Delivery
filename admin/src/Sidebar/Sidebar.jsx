import React from 'react'
import './Sidebar.css'
import { assets } from '../assets/assets.js'

const navigation = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    iconType: 'svg',
    svg: (
      <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
  },
  {
    id: 'add',
    label: 'Add Food',
    iconType: 'asset',
    icon: assets.add_icon,
  },
  {
    id: 'foods',
    label: 'Manage Food',
    iconType: 'asset',
    icon: assets.order_icon,
  },
  {
    id: 'orders',
    label: 'Manage Orders',
    iconType: 'asset',
    icon: assets.parcel_icon,
  },
  {
    id: 'users',
    label: 'Manage Users',
    iconType: 'svg',
    svg: (
      <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
]

const Sidebar = ({ activePage, onNavigate, isOpen, onClose }) => {
  const handleItemClick = (id) => {
    onNavigate(id)
    if (onClose) onClose()
  }

  return (
    <>
      {isOpen && <div className="sidebar-backdrop" onClick={onClose} />}
      <aside className={`sidebar ${isOpen ? 'sidebar-open' : ''}`}>
        <div className="sidebar-section-title">Menu</div>
        <nav className="sidebar-nav" aria-label="Admin navigation">
          {navigation.map((item) => {
            const isActive = activePage === item.id
            return (
              <button
                className={`sidebar-link${isActive ? ' active' : ''}`}
                key={item.id}
                type="button"
                aria-current={isActive ? 'page' : undefined}
                onClick={() => handleItemClick(item.id)}
              >
                <div className="sidebar-icon-wrap">
                  {item.iconType === 'svg' ? (
                    item.svg
                  ) : (
                    <img src={item.icon} alt="" className="sidebar-asset-icon" />
                  )}
                </div>
                <span className="sidebar-label">{item.label}</span>
              </button>
            )
          })}
        </nav>
      </aside>
    </>
  )
}

export default Sidebar
