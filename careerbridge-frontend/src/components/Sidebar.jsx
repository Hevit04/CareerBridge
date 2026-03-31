import { useState, useEffect } from 'react'
import { useToast } from '../hooks/useToast'
import { api } from '../api/api'
const MAIN_LINKS = [
  { key: 'dashboard', label: 'Overview', icon: '⊞' },
  { key: 'assessment', label: 'Assessments', icon: '✦' },
  { key: 'interview', label: 'Mock Interviews', icon: '▶' },
  { key: 'internships', label: 'Internships', icon: '◈' },
  { key: 'notifications', label: 'Notifications', icon: '🔔' },
  { key: 'profile', label: 'My Profile', icon: '◉' },
]

export default function Sidebar({ page, go }) {
  const toast = useToast()
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    const fetchUnread = async () => {
      try {
        const notifs = await api.notifications.list()
        setUnreadCount(notifs.filter(n => !n.is_read).length)
      } catch (e) {
        // ignore
      }
    }
    fetchUnread()
    
    // Refresh periodically
    const interval = setInterval(fetchUnread, 30000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div
      className="hidden md:block sticky top-[62px] h-[calc(100vh-62px)] overflow-y-auto p-4 flex-shrink-0"
      style={{ width: 230, background: 'var(--s1)', borderRight: '1px solid var(--bd)' }}
    >
      {/* Profile */}
      <div className="flex items-center gap-2.5 px-3 py-2 mb-5">
        <div
          className="w-[38px] h-[38px] rounded-full flex items-center justify-center font-bold text-[13px] flex-shrink-0"
          style={{ background: 'linear-gradient(135deg, var(--N), var(--P))', color: 'var(--bg)' }}
        >
          BJ
        </div>
        <div>
          <div className="font-bold text-[14px]" style={{ color: 'var(--t1)' }}>Bhumika Jain</div>
          <div className="text-[11px]" style={{ color: 'var(--t4)', fontFamily: '"DM Mono", monospace' }}>AU2340065 · CSE</div>
        </div>
      </div>

      {/* Main */}
      <div className="text-[10px] px-3 mt-3.5 mb-1.5 tracking-[.12em]" style={{ color: 'var(--t4)', fontFamily: '"DM Mono", monospace' }}>MAIN</div>
      {MAIN_LINKS.map(({ key, label, icon }) => (
        <SideItem 
          key={key} 
          active={page === key} 
          icon={icon} 
          onClick={() => go(key)}
          badge={key === 'notifications' && unreadCount > 0 ? unreadCount : null}
        >
          {label}
        </SideItem>
      ))}

      <div className="text-[10px] px-3 mt-3.5 mb-1.5 tracking-[.12em]" style={{ color: 'var(--t4)', fontFamily: '"DM Mono", monospace' }}>TOOLS</div>
      <SideItem icon="📅" onClick={() => toast('📅 Schedule feature coming soon!')}>Schedule</SideItem>
      <SideItem icon="📝" onClick={() => toast('📝 Reports feature coming soon!')}>Reports</SideItem>
      <SideItem icon="⚙" onClick={() => toast('⚙ Settings coming soon!')}>Settings</SideItem>

      {/* Next Interview */}
      <div className="mt-7 p-3.5 rounded-xl" style={{ background: 'rgba(0,245,212,.06)', border: '1px solid rgba(0,245,212,.14)' }}>
        <div className="text-[11px] font-bold mb-1" style={{ color: 'var(--P)' }}>⚡ Next Interview</div>
        <div className="font-semibold text-[13px]" style={{ color: 'var(--t1)' }}>Technical Round</div>
        <div className="text-[11px] mt-0.5" style={{ color: 'var(--t4)', fontFamily: '"DM Mono", monospace' }}>Today, 4:00 PM</div>
      </div>
    </div>
  )
}

function SideItem({ children, active, icon, onClick, badge }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2.5 w-full px-3 py-2.5 rounded-xl mb-0.5 text-[13px] font-semibold border transition-all duration-200 cursor-pointer"
      style={{
        background: active ? 'rgba(0,245,212,.07)' : 'transparent',
        color: active ? 'var(--P)' : 'var(--t2)',
        borderColor: active ? 'rgba(0,245,212,.14)' : 'transparent',
        fontFamily: 'Syne, sans-serif',
      }}
      onMouseEnter={e => { if (!active) { e.currentTarget.style.background = 'rgba(255,255,255,.04)'; e.currentTarget.style.color = 'var(--t1)' } }}
      onMouseLeave={e => { if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--t2)' } }}
    >
      <span className="text-[14px] w-[18px] text-center flex-shrink-0">{icon}</span>
      <span className="flex-1 text-left">{children}</span>
      {badge && (
        <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
          {badge > 99 ? '99+' : badge}
        </span>
      )}
    </button>
  )
}
