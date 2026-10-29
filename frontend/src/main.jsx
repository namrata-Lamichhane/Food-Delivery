import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import StoreContextProvider from './context/StoreContext.jsx'
import ToastProvider from './context/ToastContext.jsx'

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <ToastProvider>
      <StoreContextProvider>
        <App />
      </StoreContextProvider>
    </ToastProvider>
  </BrowserRouter>
)
