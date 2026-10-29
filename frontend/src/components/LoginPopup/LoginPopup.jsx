import React, { useContext, useState } from 'react'
import axios from 'axios'
import './LoginPopup.css'
import { StoreContext } from '../../context/StoreContext'
import { useToast } from '../../context/ToastContext'

const LoginPopup = ({ setShowLogin }) => {
    const { url, setToken, loadCartData } = useContext(StoreContext)
    const showToast = useToast()

    const [currentState, setCurrentState] = useState('Login')
    const [data, setData] = useState({ name: '', email: '', password: '' })
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const handleChange = (e) => {
        setData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
        // Clear error whenever the user edits a field
        if (error) setError('')
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        try {
            const endpoint =
                currentState === 'Login'
                    ? `${url}/api/user/login`
                    : `${url}/api/user/register`

            const payload =
                currentState === 'Login'
                    ? { email: data.email, password: data.password }
                    : { name: data.name, email: data.email, password: data.password }

            const { data: res } = await axios.post(endpoint, payload)

            if (res.success) {
                // Persist token and update context
                localStorage.setItem('token', res.token)
                setToken(res.token)
                // Load the user's cart from the backend
                await loadCartData(res.token)
                setShowLogin(false)
                showToast(
                    currentState === 'Login' ? 'Login successful.' : 'Account created successfully.'
                )
            } else {
                setError(res.message || 'Something went wrong. Please try again.')
            }
        } catch (err) {
            const msg =
                err.response?.data?.message ||
                'Unable to connect to the server. Please try again.'
            setError(msg)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div
            className='login-popup'
            onClick={() => setShowLogin(false)}
            role='presentation'
        >
            <section
                className='login-popup-container'
                role='dialog'
                aria-modal='true'
                aria-labelledby='login-popup-title'
                onClick={(e) => e.stopPropagation()}
            >
                <div className='login-popup-title'>
                    <h2 id='login-popup-title'>{currentState}</h2>
                    <button
                        className='login-popup-close'
                        type='button'
                        aria-label='Close sign in'
                        onClick={() => setShowLogin(false)}
                    >
                        &times;
                    </button>
                </div>

                <form className='login-popup-inputs' onSubmit={handleSubmit} noValidate>
                    {currentState === 'Sign Up' && (
                        <label>
                            <span>Name</span>
                            <input
                                type='text'
                                name='name'
                                placeholder='Your name'
                                value={data.name}
                                onChange={handleChange}
                                autoComplete='name'
                                required
                            />
                        </label>
                    )}
                    <label>
                        <span>Email</span>
                        <input
                            type='email'
                            name='email'
                            placeholder='you@example.com'
                            value={data.email}
                            onChange={handleChange}
                            autoComplete='email'
                            required
                        />
                    </label>
                    <label>
                        <span>Password</span>
                        <input
                            type='password'
                            name='password'
                            placeholder={
                                currentState === 'Sign Up'
                                    ? 'Min 8 characters'
                                    : 'Password'
                            }
                            value={data.password}
                            onChange={handleChange}
                            autoComplete={
                                currentState === 'Login'
                                    ? 'current-password'
                                    : 'new-password'
                            }
                            required
                        />
                    </label>

                    {/* Error message — visible only when there is an error */}
                    {error && (
                        <p className='login-popup-error' role='alert'>
                            {error}
                        </p>
                    )}

                    <button
                        className='login-popup-submit'
                        type='submit'
                        disabled={loading}
                    >
                        {loading
                            ? 'Please wait…'
                            : currentState === 'Login'
                            ? 'Sign in'
                            : 'Create account'}
                    </button>

                    <p className='login-popup-toggle'>
                        {currentState === 'Login'
                            ? "Don't have an account?"
                            : 'Already have an account?'}{' '}
                        <button
                            type='button'
                            onClick={() => {
                                setCurrentState((s) =>
                                    s === 'Login' ? 'Sign Up' : 'Login'
                                )
                                setError('')
                            }}
                        >
                            {currentState === 'Login' ? 'Create one' : 'Sign in'}
                        </button>
                    </p>
                </form>
            </section>
        </div>
    )
}

export default LoginPopup
