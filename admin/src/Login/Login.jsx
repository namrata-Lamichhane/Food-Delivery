import { useState } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'
import { assets, url } from '../assets/assets.js'
import './Login.css'

const Login = ({ onLoginSuccess }) => {
  const [currentState, setCurrentState] = useState('Login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrorMsg('')

    if (currentState === 'Sign Up' && !name.trim()) {
      setErrorMsg('Please enter your name.')
      return
    }

    if (!email.trim() || !password) {
      setErrorMsg('Please enter both email and password.')
      return
    }

    if (currentState === 'Sign Up' && password.length < 8) {
      setErrorMsg('Password must be at least 8 characters.')
      return
    }

    setLoading(true)
    try {
      const isSignUp = currentState === 'Sign Up'
      const { data } = await axios.post(
        `${url}/api/user/${isSignUp ? 'register' : 'login'}`,
        isSignUp
          ? { name: name.trim(), email: email.trim(), password }
          : { email: email.trim(), password }
      )

      if (!data.success) {
        throw new Error(data.message || (isSignUp ? 'Sign up failed.' : 'Login failed.'))
      }

      if (isSignUp) {
        setCurrentState('Login')
        setPassword('')
        setErrorMsg('')
        toast.success('Customer account created. Sign in with an administrator account to access this panel.')
        return
      }

      const role = data.user?.role || 'user'
      if (role !== 'admin') {
        throw new Error(
          'This account is registered as a customer. Only administrator accounts can sign in here.'
        )
      }

      toast.success(`Welcome back, ${data.user?.name || 'Admin'}!`)
      onLoginSuccess({ token: data.token, user: data.user })
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to sign in.'
      setErrorMsg(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="admin-login-wrapper">
      <div className="admin-login-card">
        <div className="admin-login-header">
          <img src={assets.logo} alt="Food Del Logo" className="admin-login-logo" />
          <h2>{currentState === 'Login' ? 'Sign in' : 'Create an account'}</h2>
          <p>
            {currentState === 'Login'
              ? 'Enter your account details to continue.'
              : 'Create a customer account to use the food store.'}
          </p>
        </div>

        {errorMsg && (
          <div className="admin-login-error" role="alert">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="admin-login-form" noValidate>
          {currentState === 'Sign Up' && (
            <div className="login-field">
              <label htmlFor="admin-name">Name</label>
              <input
                id="admin-name"
                type="text"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoComplete="name"
              />
            </div>
          )}
          <div className="login-field">
            <label htmlFor="admin-email">Email address</label>
            <input
              id="admin-email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>

          <div className="login-field">
            <label htmlFor="admin-password">Password</label>
            <input
              id="admin-password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete={currentState === 'Login' ? 'current-password' : 'new-password'}
            />
          </div>

          <button type="submit" className="admin-login-btn" disabled={loading}>
            {loading ? (
              <span className="btn-spinner-wrap">
                <span className="btn-spinner" />
                {currentState === 'Login' ? 'Signing in...' : 'Creating account...'}
              </span>
            ) : (
              currentState === 'Login' ? 'Sign in' : 'Create account'
            )}
          </button>
        </form>
        <p className="login-mode-toggle">
          {currentState === 'Login'
            ? "Don't have an account?"
            : 'Already have an account?'}{' '}
          <button
            type="button"
            onClick={() => {
              setCurrentState((state) => (state === 'Login' ? 'Sign Up' : 'Login'))
              setErrorMsg('')
            }}
          >
            {currentState === 'Login' ? 'Sign up' : 'Sign in'}
          </button>
        </p>
      </div>
    </div>
  )
}

export default Login
