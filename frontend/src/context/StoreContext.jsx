import { createContext, useCallback, useEffect, useState } from 'react'
import axios from 'axios'
import { food_list as localFoodList, url } from '../assets/assets'
import { useToast } from './ToastContext'

// eslint-disable-next-line react/only-export-components -- DELIVERY_FEE and StoreContext are exported together intentionally
export const StoreContext = createContext(null)
export const DELIVERY_FEE = 50

const StoreContextProvider = (props) => {
    const showToast = useToast()
    const [cartItems, setCartItems] = useState({})
    const [food_list, setFoodList] = useState([])
    const [token, setToken] = useState('')
    // true while the initial token + food + cart load is in progress
    const [loading, setLoading] = useState(true)

    // ── Helpers ─────────────────────────────────────────────────────────────

    const authHeader = (t) => ({ Authorization: `Bearer ${t || token}` })

    // ── Food list ────────────────────────────────────────────────────────────

    const fetchFoodList = async () => {
        try {
            const { data } = await axios.get(`${url}/api/food/list`)
            if (data.success && data.data.length > 0) {
                // Prepend the server image base URL so every item.image is a full URL
                const foods = data.data.map((item) => ({
                    ...item,
                    image: `${url}/images/${item.image}`,
                }))
                setFoodList(foods)
                return
            }

            console.warn('Food list is empty; showing the bundled dish catalog.')
            setFoodList(localFoodList)
        } catch (err) {
            console.error('fetchFoodList:', err.message)
            console.warn('Showing the bundled dish catalog because the food API is unavailable.')
            setFoodList(localFoodList)
        }
    }

    // ── Cart sync ────────────────────────────────────────────────────────────

    const loadCartData = useCallback(async (userToken) => {
        try {
            const { data } = await axios.get(`${url}/api/cart/get`, {
                headers: { Authorization: `Bearer ${userToken || token}` },
            })
            if (data.success) {
                setCartItems(data.cartData || {})
            }
        } catch (err) {
            console.error('loadCartData:', err.message)
        }
    }, [token])

    // ── Initialise on mount ──────────────────────────────────────────────────

    useEffect(() => {
        const init = async () => {
            await fetchFoodList()
            const saved = localStorage.getItem('token')
            if (saved) {
                setToken(saved)
                await loadCartData(saved)
            }
            setLoading(false)
        }
        init()
    }, [loadCartData])

    // ── Cart operations ──────────────────────────────────────────────────────

    const addToCart = async (itemId) => {
        // Update local state immediately (optimistic UI)
        setCartItems((curr) => ({
            ...curr,
            [itemId]: (curr[itemId] || 0) + 1,
        }))
        // Sync to backend when authenticated
        if (token) {
            try {
                await axios.post(
                    `${url}/api/cart/add`,
                    { itemId },
                    { headers: authHeader() }
                )
                showToast('Added to cart.')
            } catch (err) {
                console.error('addToCart sync:', err.message)
                showToast('Could not sync your cart. Please try again.', 'error')
            }
        } else {
            showToast('Added to cart.')
        }
    }

    // Full removal (used by the ✕ button in Cart.jsx).
    // Syncs to backend cleanly with a single request using removeAll: true.
    const removeFromCart = async (itemId) => {
        const qty = cartItems[itemId] || 0
        setCartItems((curr) => {
            const next = { ...curr }
            delete next[itemId]
            return next
        })
        if (token && qty > 0) {
            try {
                await axios.delete(`${url}/api/cart/remove`, {
                    headers: authHeader(),
                    data: { itemId, removeAll: true },
                })
            } catch (err) {
                console.error('removeFromCart sync:', err.message)
            }
        }
        if (qty > 0) showToast('Item removed from cart.')
    }

    // Used by the food-card counter (+/-).
    // When quantity drops to 0 the item is removed entirely.
    const updateCartQuantity = async (itemId, quantity) => {
        if (quantity <= 0) {
            removeFromCart(itemId)
            return
        }
        const prev = cartItems[itemId] || 0
        setCartItems((curr) => ({ ...curr, [itemId]: quantity }))
        // Sync a single decrement to the backend
        if (token && quantity < prev) {
            try {
                await axios.delete(`${url}/api/cart/remove`, {
                    headers: authHeader(),
                    data: { itemId },
                })
            } catch (err) {
                console.error('updateCartQuantity sync:', err.message)
            }
        }
    }

    const clearCart = () => setCartItems({})

    // ── Context value ────────────────────────────────────────────────────────

    const contextValue = {
        url,
        food_list,
        cartItems,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        token,
        setToken,
        loading,
        loadCartData,
    }

    return (
        <StoreContext.Provider value={contextValue}>
            {props.children}
        </StoreContext.Provider>
    )
}

export default StoreContextProvider