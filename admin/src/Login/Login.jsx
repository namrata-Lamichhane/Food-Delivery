import { useEffect, useState } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'
import { assets, url } from '../assets/assets.js'
import './Login.css'

const Login = ({ onLoginSuccess }) => {
  const [setupAvailable, setSetupAvailable] = useState(null)
  const [currentView, setCurrentView] = useState('checking')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    let ignore = false
    axios
      .get(`${url}/api/user/admin-setup`)
      .then(({ data }) => {
        if (
          !data.success ||
          typeof data.setupAvailable !== 'boolean'
        ) {
          throw new Error(data.message || 'Invalid administrator setup response.')
        }
        if (!ignore) {
          setSetupAvailable(data.setupAvailable)
          setCurrentView(data.setupAvailable ? 'register' : 'login')
        }
      })
      .catch((error) => {
        if (!ignore) {
          setSetupAvailable(false)
          setCurrentView('login')
          setErrorMsg(
            error.response?.data?.message ||
              error.message ||
              'Could not check administrator setup. Please try again.'
          )
        }
      })

    return () => {
      ignore = true
    }
  }, [])

  const handleSubmit = async (event) => {
    event.preventDefault()
    setErrorMsg('')
    const isRegistration = currentView === 'register'
    const isFirstAdminSetup = isRegistration && setupAvailable

    if (isRegistration && !name.trim()) {
      setErrorMsg('Please enter your full name.')
      return
    }
    if (!email.trim() || !password) {
      setErrorMsg('Please enter both email and password.')
      return
    }
    if (isRegistration && password.length < 8) {
      setErrorMsg('Password must be at least 8 characters.')
      return
    }
    if (isRegistration && password !== confirmPassword) {
      setErrorMsg('Passwords do not match.')
      return
    }
    setLoading(true)
    try {
      const { data } = await axios.post(
        `${url}/api/user/${
          isRegistration ? (isFirstAdminSetup ? 'admin-setup' : 'admin-signup') : 'login'
        }`,
        isRegistration
          ? {
              name: name.trim(),
              email: email.trim(),
              password,
            }
          : { email: email.trim(), password }
      )

      if (!data.success) {
        throw new Error(data.message || (isRegistration ? 'Setup failed.' : 'Login failed.'))
      }

      if (isRegistration) {
        setSetupAvailable(false)
        setCurrentView('login')
        setName('')
        setPassword('')
        setConfirmPassword('')
        toast.success('Administrator created. Sign in with your new account.')
        return
      }

      if (data.user?.role !== 'admin') {
        throw new Error(
          'This account is registered as a customer. Only administrator accounts can sign in here.'
        )
      }

      toast.success(`Welcome back, ${data.user?.name || 'Admin'}!`)
      onLoginSuccess({ token: data.token, user: data.user })
    } catch (error) {
      const message =
        error.response?.data?.message || error.message || 'Failed to sign in.'
      setErrorMsg(message)
      if (isFirstAdminSetup && error.response?.status === 403) {
        setSetupAvailable(false)
        setCurrentView('login')
      }
    } finally {
      setLoading(false)
    }
  }

  const openView = (view) => {
    setCurrentView(view)
    setErrorMsg('')
  }

  const canToggleToRegistration = currentView === 'register' || currentView === 'login'

  return (
    <div className="admin-login-wrapper">
      <div className="admin-login-card">
        <div className="admin-login-header">
          <img src={assets.logo} alt="Tomato Admin Panel" className="admin-login-logo" />
          {currentView === 'register' && (
            <>
              <h2>Create Administrator</h2>
              <p>
                {setupAvailable
                  ? 'Create the first administrator account.'
                  : 'Create an administrator account to access the admin panel.'}
              </p>
            </>
          )}
          {currentView === 'login' && (
            <>
              <h2>Sign in</h2>
              <p>Enter your administrator account details to continue.</p>
            </>
          )}
          {currentView === 'welcome' && (
            <>
              <h2>Tomato Admin Portal</h2>
              <p>Welcome! Please select an option to continue.</p>
            </>
          )}
          {currentView === 'checking' && (
            <>
              <h2>Tomato Admin Portal</h2>
              <p>Checking administrator setup...</p>
            </>
          )}
        </div>

        {errorMsg && (
          <div className="admin-login-error" role="alert">
            {errorMsg}
          </div>
        )}

        {currentView === 'welcome' && (
          <div className="admin-welcome-options">
            <button type="button" className="admin-login-btn" onClick={() => openView('login')}>
              Sign in
            </button>
            <button
              type="button"
              className="admin-welcome-register"
              onClick={() => openView('register')}
            >
              Create Administrator
            </button>
          </div>
        )}

        {(currentView === 'register' || currentView === 'login') && (
          <>
            <button
              type="button"
              className="admin-view-back-btn"
              onClick={() => openView('welcome')}
            >
              &larr; Back to Welcome Options
            </button>

            <form onSubmit={handleSubmit} className="admin-login-form" noValidate>
              {currentView === 'register' && (
                <div className="login-field">
                  <label htmlFor="admin-name">Full name</label>
                  <input
                    id="admin-name"
                    type="text"
                    placeholder="Your name"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
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
                  onChange={(event) => setEmail(event.target.value)}
                  required
                  autoComplete="email"
                />
              </div>

              <div className="login-field">
                <label htmlFor="admin-password">Password</label>
                <div className="login-password-input">
                  <input
                    id="admin-password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    required
                    autoComplete={currentView === 'login' ? 'current-password' : 'new-password'}
                    minLength={currentView === 'register' ? 8 : undefined}
                  />
                  <button
                    type="button"
                    className="login-password-toggle"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    aria-pressed={showPassword}
                    onClick={() => setShowPassword((visible) => !visible)}
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
              </div>

              {currentView === 'register' && (
                <div className="login-field">
                  <label htmlFor="admin-confirm-password">Confirm password</label>
                  <div className="login-password-input">
                    <input
                      id="admin-confirm-password"
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="Re-enter your password"
                      value={confirmPassword}
                      onChange={(event) => setConfirmPassword(event.target.value)}
                      required
                      autoComplete="new-password"
                      minLength={8}
                    />
                    <button
                      type="button"
                      className="login-password-toggle"
                      aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                      aria-pressed={showConfirmPassword}
                      onClick={() => setShowConfirmPassword((visible) => !visible)}
                    >
                      {showConfirmPassword ? 'Hide' : 'Show'}
                    </button>
                  </div>
                </div>
              )}

              <button type="submit" className="admin-login-btn" disabled={loading}>
                {loading
                  ? currentView === 'register'
                    ? 'Creating administrator...'
                    : 'Signing in...'
                  : currentView === 'register'
                    ? 'Create Administrator'
                    : 'Sign in'}
              </button>
            </form>

            <p className="login-mode-toggle">
              {currentView === 'register' ? 'Already created an account?' : 'First time here?'}{' '}
              {canToggleToRegistration ? (
                <button
                  type="button"
                  onClick={() =>
                    openView(currentView === 'register' ? 'login' : 'register')
                  }
                >
                  {currentView === 'register' ? 'Sign in' : 'Create Administrator'}
                </button>
              ) : null}
            </p>
          </>
        )}
      </div>
    </div>
  )
}

export default Login
