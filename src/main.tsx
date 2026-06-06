import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'sonner'
import App from './App.tsx'
import { AppProvider } from './context/AppContext.tsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <AppProvider>
        <App />
        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              background: 'hsl(230 18% 14%)',
              border: '1px solid hsl(230 15% 20%)',
              color: 'hsl(40 20% 90%)',
            },
          }}
        />
      </AppProvider>
    </BrowserRouter>
  </React.StrictMode>
)
