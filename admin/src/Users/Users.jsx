import { useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'
import { url } from '../assets/assets.js'
import './Users.css'

const Users = () => {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(() => Boolean(localStorage.getItem('token')))
  const [errorMsg, setErrorMsg] = useState('')
  const [searchQuery, setSearchQuery] = useState('')

  const fetchUsers = async () => {
    const token = localStorage.getItem('token')
    if (!token) return

    setLoading(true)
    setErrorMsg('')
    try {
      const { data } = await axios.get(`${url}/api/user/list`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!data.success || !Array.isArray(data.data)) {
        throw new Error(data.message || 'Invalid user list response.')
      }
      setUsers(data.data.filter((user) => !user.role || user.role === 'user'))
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to fetch registered users.'
      setErrorMsg(msg)
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let ignore = false
    const token = localStorage.getItem('token')
    if (!token) return

    axios
      .get(`${url}/api/user/list`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(({ data }) => {
        if (!ignore) {
          if (!data.success || !Array.isArray(data.data)) {
            throw new Error(data.message || 'Invalid user list response.')
          }
          setUsers(data.data.filter((user) => !user.role || user.role === 'user'))
        }
      })
      .catch((err) => {
        if (!ignore) {
          const msg = err.response?.data?.message || err.message || 'Failed to fetch registered users.'
          setErrorMsg(msg)
          toast.error(msg)
        }
      })
      .finally(() => {
        if (!ignore) setLoading(false)
      })

    return () => {
      ignore = true
    }
  }, [])

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const query = searchQuery.toLowerCase()
      const matchesSearch =
        (u.name || '').toLowerCase().includes(query) ||
        (u.email || '').toLowerCase().includes(query)
      return matchesSearch
    })
  }, [users, searchQuery])

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A'
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  return (
    <div className="users-container">
      {/* Top Header */}
      <div className="users-top-bar">
        <div>
          <h1>Registered Users</h1>
          <p className="users-subtitle">
            View customer accounts registered with your store.
          </p>
        </div>
        <button
          type="button"
          className="refresh-users-btn"
          onClick={fetchUsers}
          disabled={loading}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={loading ? 'spin-icon' : ''}>
            <polyline points="23 4 23 10 17 10" />
            <polyline points="1 20 1 14 7 14" />
            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
          </svg>
          <span>{loading ? 'Refreshing...' : 'Refresh Users'}</span>
        </button>
      </div>

      {/* Customer Summary */}
      <div className="user-stats-cards">
        <div className="user-stat-card">
          <span className="stat-label">Registered Customers</span>
          <span className="stat-num">{users.length}</span>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="users-filter-bar">
        <div className="users-search-box">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            placeholder="Search users by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              type="button"
              className="clear-search-btn"
              onClick={() => setSearchQuery('')}
            >
              &times;
            </button>
          )}
        </div>

      </div>

      {/* Content */}
      {loading ? (
        <div className="users-loading-state">
          <div className="spinner" />
          <p>Loading registered accounts from MongoDB...</p>
        </div>
      ) : errorMsg ? (
        <div className="users-error-state" role="alert">
          <p>{errorMsg}</p>
          <button type="button" onClick={fetchUsers}>Retry</button>
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="users-empty-state">
          <p>No user accounts match your search query.</p>
        </div>
      ) : (
        <div className="users-table-container">
          <table className="users-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Email Address</th>
                <th>Role</th>
                <th>Registration Date</th>
                <th>Account ID</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => {
                return (
                  <tr key={user._id}>
                    <td>
                      <div className="user-cell">
                        <div className="user-avatar-initial">
                          {(user.name || 'U').charAt(0).toUpperCase()}
                        </div>
                        <span className="user-name-text">{user.name}</span>
                      </div>
                    </td>
                    <td className="user-email-text">{user.email}</td>
                    <td>
                      <span className="role-badge badge-role-user">Customer</span>
                    </td>
                    <td className="user-date-text">{formatDate(user.createdAt)}</td>
                    <td className="user-id-text">{String(user._id).slice(-8)}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default Users
