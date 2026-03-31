import { useMemo, useState, useEffect } from 'react'
import { api } from './api/api'
import Navbar from './components/Navbar'
import { ToastProvider } from './hooks/useToast'
import Assessment from './pages/Assessment'
import Admin from './pages/Admin'
import AdminAnalytics from './pages/admin/AdminAnalytics'
import AdminInternships from './pages/admin/AdminInternships'
import AdminModeration from './pages/admin/AdminModeration'
import AdminSystem from './pages/admin/AdminSystem'
import AdminTests from './pages/admin/AdminTests'
import AdminUsers from './pages/admin/AdminUsers'
import Dashboard from './pages/Dashboard'
import Home from './pages/Home'
import Internships from './pages/Internships'
import Interview from './pages/Interview'
import Login from './pages/Login'
import Profile from './pages/Profile'
import Notifications from './pages/Notifications'

const PAGES = {
  home: Home,
  dashboard: Dashboard,
  assessment: Assessment,
  admin: Admin,
  'admin-users': AdminUsers,
  'admin-tests': AdminTests,
  'admin-internships': AdminInternships,
  'admin-analytics': AdminAnalytics,
  'admin-system': AdminSystem,
  'admin-moderation': AdminModeration,
  interview: Interview,
  internships: Internships,
  profile: Profile,
  login: Login,
  notifications: Notifications,
}

const ADMIN_PAGES = new Set([
  'admin',
  'admin-users',
  'admin-tests',
  'admin-internships',
  'admin-analytics',
  'admin-system',
  'admin-moderation',
])

export default function App() {
  const [page, setPage] = useState('home')
  const [auth, setAuth] = useState({ isLoggedIn: false, role: 'student', user: null })

  useEffect(() => {
    const token = localStorage.getItem('token')
    const savedRole = localStorage.getItem('role')
    if (token) {
      api.auth.me()
        .then(user => {
          setAuth({ isLoggedIn: true, role: user.role, user })
        })
        .catch(() => {
          localStorage.removeItem('token')
          localStorage.removeItem('role')
          setAuth({ isLoggedIn: false, role: 'student', user: null })
        })
    }
  }, [])

  const go = (nextPage) => {
    if (ADMIN_PAGES.has(nextPage) && auth.role !== 'admin') {
      setPage('login')
      return
    }
    setPage(nextPage)
  }

  const handleLogin = (authData) => {
    localStorage.setItem('token', authData.access_token)
    localStorage.setItem('role', authData.role)
    setAuth({ 
      isLoggedIn: true, 
      role: authData.role, 
      user: { id: authData.user_id, full_name: authData.full_name } 
    })
    setPage(authData.role === 'admin' ? 'admin' : 'dashboard')
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('role')
    setAuth({ isLoggedIn: false, role: 'student', user: null })
    setPage('home')
  }

  const CurrentPage = useMemo(() => PAGES[page] || Home, [page])

  return (
    <ToastProvider>
      <Navbar
        page={page}
        go={go}
        isAdmin={auth.role === 'admin'}
        isLoggedIn={auth.isLoggedIn}
        user={auth.user}
        onLogout={handleLogout}
      />
      <div className="pt-[62px] min-h-screen">
        <CurrentPage onNav={go} onLogin={handleLogin} isAdmin={auth.role === 'admin'} isLoggedIn={auth.isLoggedIn} />
      </div>
    </ToastProvider>
  )
}
