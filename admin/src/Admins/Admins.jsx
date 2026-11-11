import { useCallback, useEffect, useState } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'
import { url } from '../assets/assets.js'
import './Admins.css'

const emptyForm = { name: '', email: '', password: '', confirmPassword: '' }

const Admins = () => {
  const [admins, setAdmins] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const fetchAdmins = useCallback(async () => {
    const token = localStorage.getItem('token') || ''
    try {
      const { data } = await axios.get(`${url}/api/user/admins`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!data.success || !Array.isArray(data.data)) {
        throw new Error(data.message || 'Invalid administrator list response.')
      }
      setAdmins(data.data)
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        'Failed to load administrator accounts.'
      setErrorMsg(message)
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    let ignore = false
    const token = localStorage.getItem('token') || ''
    axios
      .get(`${url}/api/user/admins`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(({ data }) => {
        if (!data.success || !Array.isArray(data.data)) {
          throw new Error(data.message || 'Invalid administrator list response.')
        }
        if (!ignore) setAdmins(data.data)
      })
      .catch((error) => {
        if (!ignore) {
          const message =
            error.response?.data?.message ||
            error.message ||
            'Failed to load administrator accounts.'
          setErrorMsg(message)
          toast.error(message)
        }
      })
      .finally(() => {
        if (!ignore) setLoading(false)
      })

    return () => {
      ignore = true
    }
  }, [])

  const handleSubmit = async (event) => {
    event.preventDefault()
    setErrorMsg('')
    if (form.password.length < 8) {
      setErrorMsg('Password must be at least 8 characters.')
      return
    }
    if (form.password !== form.confirmPassword) {
      setErrorMsg('Passwords do not match.')
      return
    }

    const token = localStorage.getItem('token')
    if (!token) {
      setErrorMsg('Administrator authentication required.')
      return
    }

    setSaving(true)
    try {
      const { data } = await axios.post(
        `${url}/api/user/admins`,
        { name: form.name.trim(), email: form.email.trim(), password: form.password },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      if (!data.success || !data.data?._id) {
        throw new Error(data.message || 'Failed to create administrator account.')
      }
      setAdmins((currentAdmins) => [data.data, ...currentAdmins])
      setForm(emptyForm)
      toast.success('Administrator account created.')
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        'Failed to create administrator account.'
      setErrorMsg(message)
      toast.error(message)
    } finally {
      setSaving(false)
    }
  }

  const updateField = (field) => (event) => {
    setForm((currentForm) => ({ ...currentForm, [field]: event.target.value }))
  }

  return (
    <div className="admins-container">
      <div className="admins-header">
        <div>
          <h1>Administrator Accounts</h1>
          <p>Create and manage accounts that can access the admin panel.</p>
        </div>
        <button
          type="button"
          className="admins-refresh-btn"
          onClick={() => {
            setLoading(true)
            setErrorMsg('')
            fetchAdmins()
          }}
          disabled={loading}
        >
          {loading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      <form className="admins-form" onSubmit={handleSubmit}>
        <h2>Create administrator</h2>
        <div className="admins-form-grid">
          <label>
            Full name
            <input
              type="text"
              value={form.name}
              onChange={updateField('name')}
              autoComplete="name"
              required
            />
          </label>
          <label>
            Email address
            <input
              type="email"
              value={form.email}
              onChange={updateField('email')}
              autoComplete="email"
              required
            />
          </label>
          <label>
            Password
            <input
              type="password"
              value={form.password}
              onChange={updateField('password')}
              autoComplete="new-password"
              minLength={8}
              required
            />
          </label>
          <label>
            Confirm password
            <input
              type="password"
              value={form.confirmPassword}
              onChange={updateField('confirmPassword')}
              autoComplete="new-password"
              minLength={8}
              required
            />
          </label>
        </div>
        {errorMsg && <p className="admins-error" role="alert">{errorMsg}</p>}
        <button type="submit" className="admins-submit-btn" disabled={saving}>
          {saving ? 'Creating account...' : 'Create administrator'}
        </button>
      </form>

      <section className="admins-list-section" aria-labelledby="admins-list-heading">
        <h2 id="admins-list-heading">Current administrators ({admins.length})</h2>
        {loading ? (
          <div className="admins-state">Loading administrator accounts...</div>
        ) : admins.length === 0 ? (
          <div className="admins-state">No administrator accounts found.</div>
        ) : (
          <div className="admins-table-wrap">
            <table className="admins-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email address</th>
                  <th>Created</th>
                </tr>
              </thead>
              <tbody>
                {admins.map((admin) => (
                  <tr key={admin._id}>
                    <td>{admin.name}</td>
                    <td>{admin.email}</td>
                    <td>
                      {admin.createdAt
                        ? new Date(admin.createdAt).toLocaleDateString()
                        : 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}

export default Admins
