import { Btn, Chip } from '../components/UI'
import { IconBrain, IconCalendar, IconGear, IconReport, IconTarget, IconUser } from '../components/Icons'

const adminModules = [
  {
    key: 'admin-users',
    title: 'User Management',
    desc: 'Add, remove, block users, view profiles, and resolve login/password issues.',
    icon: <IconUser size={22} color="var(--P)" />,
    iconBg: 'rgba(0,245,212,.08)',
    iconBorder: 'rgba(0,245,212,.2)',
  },
  {
    key: 'admin-tests',
    title: 'Test & Interview Management',
    desc: 'Manage technical, aptitude, communication assessments and interview schedules.',
    icon: <IconBrain size={22} color="var(--A)" />,
    iconBg: 'rgba(212,255,0,.08)',
    iconBorder: 'rgba(212,255,0,.2)',
  },
  {
    key: 'admin-internships',
    title: 'Internship Management',
    desc: 'Create, edit, and archive internship opportunities and requirements.',
    icon: <IconTarget size={22} color="var(--E)" />,
    iconBg: 'rgba(255,77,109,.08)',
    iconBorder: 'rgba(255,77,109,.2)',
  },
  {
    key: 'admin-analytics',
    title: 'Monitoring & Analytics',
    desc: 'Track scores, performance trends, and skill-gap reports system-wide.',
    icon: <IconReport size={22} color="#a78bfa" />,
    iconBg: 'rgba(123,47,255,.12)',
    iconBorder: 'rgba(123,47,255,.25)',
  },
  {
    key: 'admin-system',
    title: 'System Control',
    desc: 'Handle platform health, incidents, and database maintenance controls.',
    icon: <IconGear size={22} color="var(--P)" />,
    iconBg: 'rgba(0,245,212,.08)',
    iconBorder: 'rgba(0,245,212,.2)',
  },
  {
    key: 'admin-moderation',
    title: 'Content Moderation',
    desc: 'Verify resumes and remove incorrect or policy-violating data.',
    icon: <IconCalendar size={22} color="var(--A)" />,
    iconBg: 'rgba(212,255,0,.08)',
    iconBorder: 'rgba(212,255,0,.2)',
  },
]

export default function Admin({ onNav, isAdmin }) {
  if (!isAdmin) {
    return (
      <div style={{ maxWidth: 920, margin: '0 auto', padding: '70px 28px' }}>
        <div style={{ background: 'var(--s1)', border: '1px solid rgba(255,77,109,.3)', borderRadius: 16, padding: 28, textAlign: 'center' }}>
          <div style={{ fontFamily: '"Bebas Neue"', fontSize: 52, color: 'var(--E)', lineHeight: 1, marginBottom: 8 }}>ACCESS DENIED</div>
          <p style={{ fontSize: 14, color: 'var(--t2)', marginBottom: 16 }}>
            This area is restricted to administrators only. Please log in with an admin role.
          </p>
          <Btn onClick={() => onNav('login')}>Go To Login</Btn>
        </div>
      </div>
    )
  }

  return (
    <div className="admin-enter" style={{ maxWidth: 1260, margin: '0 auto', padding: '40px 28px 70px' }}>
      <div style={{ marginBottom: 30 }}>
        <Chip style={{ marginBottom: 12 }}>Admin Role</Chip>
        <h1 style={{ fontFamily: '"Bebas Neue"', fontSize: 'clamp(2.7rem,5.4vw,5.3rem)', lineHeight: 1, marginBottom: 8 }}>
          ADMIN <span style={{ color: 'var(--E)' }}>WORKSPACES</span>
        </h1>
        <p style={{ fontSize: 14, color: 'var(--t2)', maxWidth: 860 }}>
          Open separate pages for each admin responsibility so operations stay organized, auditable, and faster to manage.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
        {adminModules.map((m, idx) => (
          <div
            key={m.key}
            className="admin-card admin-panel"
            style={{
              background: 'var(--s1)',
              border: '1px solid var(--bd)',
              borderRadius: 16,
              padding: 22,
              transition: 'all .25s cubic-bezier(.34,1.2,.64,1)',
              animationDelay: `${idx * 0.06}s`,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'rgba(0,245,212,.22)'
              e.currentTarget.style.transform = 'translateY(-3px)'
              e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,.4)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--bd)'
              e.currentTarget.style.transform = ''
              e.currentTarget.style.boxShadow = ''
            }}
          >
            <div style={{ width: 52, height: 52, borderRadius: 14, background: m.iconBg, border: `1px solid ${m.iconBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
              {m.icon}
            </div>
            <div style={{ fontSize: 17, fontWeight: 800, color: 'var(--t1)', marginBottom: 8 }}>{m.title}</div>
            <p style={{ fontSize: 13, color: 'var(--t2)', lineHeight: 1.6, marginBottom: 14 }}>{m.desc}</p>
            <div className="admin-action" style={{ display: 'inline-block' }}>
              <Btn size="sm" onClick={() => onNav(m.key)}>Open Page →</Btn>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
