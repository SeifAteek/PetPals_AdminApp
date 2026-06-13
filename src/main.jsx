import React from 'react'
import ReactDOM from 'react-dom/client'
import { ThemeProvider } from '@petpals/theme/ThemeProvider.jsx'
import AdminDashboard from './components/AdminDashboard'
import { supabase } from './supabaseClient'
import './index.css'

supabase.auth.signOut().finally(() => {
  ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
      <ThemeProvider>
        <AdminDashboard />
      </ThemeProvider>
    </React.StrictMode>,
  )
})
