import { useEffect, useState } from 'react'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import './App.css'
import Navbar from './Navbar/Navbar.jsx'
import Sidebar from './Sidebar/Sidebar.jsx'
import Dashboard from './Dashboard/Dashboard.jsx'
import Add from './Add/Add.jsx'
import List from './List/List.jsx'
import Order from './Orders/Order.jsx'
import Users from './Users/Users.jsx'
import Login from './Login/Login.jsx'

function App() {
  const [token, setToken] = useState(() => localStorage.getItem('token') || '')
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('adminUser')
      return saved ? JSON.parse(saved) : null
    } catch {
      return null
    }
  })

  const [activePage, setActivePage] = useState('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Listen for storage changes or logout across tabs
  useEffect(() => {
    if (!token) {
      localStorage.removeItem('token')
      localStorage.removeItem('adminUser')
    }
  }, [token])

  const handleLoginSuccess = ({ token: newToken, user }) => {
    localStorage.setItem('token', newToken)
    localStorage.setItem('adminUser', JSON.stringify(user))
    setToken(newToken)
    setCurrentUser(user)
    setActivePage('dashboard')
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('adminUser')
    setToken('')
    setCurrentUser(null)
  }

  // If unauthenticated, show the Admin Login Portal
  if (!token) {
    return (
      <div className="admin-app-root">
        <ToastContainer position="top-right" autoClose={3000} />
        <Login onLoginSuccess={handleLoginSuccess} />
      </div>
    )
  }

  return (
    <div className="admin-app-root">
      <ToastContainer position="top-right" autoClose={3000} />
      <Navbar
        currentUser={currentUser}
        onLogout={handleLogout}
        onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
        isSidebarOpen={sidebarOpen}
      />
      <div className="admin-layout">
        <Sidebar
          activePage={activePage}
          onNavigate={(page) => {
            setActivePage(page)
            setSidebarOpen(false)
          }}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
        <main className="admin-content-area">
          {activePage === 'dashboard' && <Dashboard onNavigate={setActivePage} />}
          {activePage === 'add' && <Add onSuccess={() => setActivePage('foods')} />}
          {(activePage === 'foods' || activePage === 'list') && <List />}
          {activePage === 'orders' && <Order />}
          {activePage === 'users' && <Users />}
        </main>
      </div>
    </div>
  )
}

export default App
