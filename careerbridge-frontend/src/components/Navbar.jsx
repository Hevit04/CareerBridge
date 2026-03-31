import { Btn } from './UI'

const STUDENT_LINKS = [
  { key: 'home', label: 'Home' },
  { key: 'dashboard', label: 'Dashboard' },
  { key: 'assessment', label: 'Assessments' },
  { key: 'interview', label: 'Mock Interview' },
  { key: 'internships', label: 'Internships' },
  { key: 'notifications', label: 'Notifications' },
  { key: 'profile', label: 'Profile' },
]

const ADMIN_LINKS = [
  { key: 'home', label: 'Home' },
  { key: 'admin', label: 'Admin Home' },
  { key: 'admin-users', label: 'Users' },
  { key: 'admin-tests', label: 'Tests' },
  { key: 'admin-internships', label: 'Internships' },
  { key: 'admin-analytics', label: 'Analytics' },
  { key: 'admin-system', label: 'System' },
  { key: 'admin-moderation', label: 'Moderation' },
]

export default function Navbar({ page, go, isAdmin, isLoggedIn, user, onLogout }) {
  const navLinks = isAdmin ? ADMIN_LINKS : STUDENT_LINKS

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-[900]"
      style={{ background: 'rgba(7,7,15,.82)', backdropFilter: 'blur(24px)', borderBottom: '1px solid var(--bd)' }}
    >
      <div className="max-w-[1300px] mx-auto px-7 h-[62px] flex items-center justify-between">
        {/* Logo */}
        <button
          onClick={() => go('home')}
          className="flex items-center gap-2.5 cursor-pointer bg-none border-none"
        >
          <div
            className="w-8 h-8 rounded-[9px] flex items-center justify-center text-[13px] tracking-wide"
            style={{
              background: 'linear-gradient(135deg, var(--N), var(--P))',
              color: 'var(--bg)',
              fontFamily: '"Bebas Neue", cursive',
            }}
          >
            CB
          </div>
          <span className="font-bold text-[16px] tracking-tight" style={{ color: 'var(--t1)', fontFamily: 'Syne, sans-serif', fontWeight: 800 }}>
            CareerBridge
          </span>
        </button>

        {/* Nav Links */}
        <div className="hidden md:flex gap-0.5">
          {navLinks.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => go(key)}
              className="px-3 py-2 rounded-lg text-[13px] font-semibold border-none transition-all duration-150"
              style={{
                color: page === key ? 'var(--P)' : 'var(--t3)',
                background: page === key ? 'rgba(0,245,212,.08)' : 'transparent',
                fontFamily: 'Syne, sans-serif',
                cursor: 'pointer',
              }}
              onMouseEnter={e => { if (page !== key) { e.currentTarget.style.color = 'var(--t1)'; e.currentTarget.style.background = 'rgba(255,255,255,.06)' } }}
              onMouseLeave={e => { if (page !== key) { e.currentTarget.style.color = 'var(--t3)'; e.currentTarget.style.background = 'transparent' } }}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-4">
          {isLoggedIn ? (
            <div className="flex items-center gap-3">
              <button 
                onClick={() => go('profile')}
                style={{
                  width: 36, height: 36, borderRadius: '50%', background: '#718791',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 15, fontWeight: 700, color: '#fff', border: 'none',
                  cursor: 'pointer', transition: 'transform .2s'
                }}
                onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
              >
                {(user?.first_name?.[0] || user?.full_name?.[0] || 'U').toUpperCase()}
              </button>
              <Btn variant="g" size="xs" onClick={onLogout}>Log Out</Btn>
            </div>
          ) : (
            <Btn variant="g" size="sm" onClick={() => go('login')}>Log In</Btn>
          )}
          <Btn variant="p" size="sm" onClick={() => go(isAdmin ? 'admin' : 'dashboard')}>
            {isAdmin ? 'Admin Home →' : 'Dashboard →'}
          </Btn>
        </div>
      </div>
    </nav>
  )
}
