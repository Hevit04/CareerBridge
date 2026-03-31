export function Chip({ children, style }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', padding: '4px 11px', borderRadius: 100,
      fontFamily: '"DM Mono"', fontSize: 11, letterSpacing: '.03em',
      border: '1px solid rgba(123,47,255,.3)', background: 'rgba(123,47,255,.1)', color: '#c4b5fd',
      ...style,
    }}>{children}</span>
  )
}

const badgeStyles = {
  bg: { background: 'rgba(74,222,128,.1)', border: '1px solid rgba(74,222,128,.25)', color: '#4ade80' },
  by: { background: 'rgba(251,191,36,.1)', border: '1px solid rgba(251,191,36,.25)', color: '#fbbf24' },
  br: { background: 'rgba(255,77,109,.1)', border: '1px solid rgba(255,77,109,.25)', color: 'var(--E)' },
  bb: { background: 'rgba(0,245,212,.08)', border: '1px solid rgba(0,245,212,.22)', color: 'var(--P)' },
  bp: { background: 'rgba(123,47,255,.1)', border: '1px solid rgba(123,47,255,.25)', color: '#a78bfa' },
}

export function Badge({ variant = 'bg', children, style }) {
  return (
    <span style={{
      fontFamily: '"DM Mono"', fontSize: 10, padding: '3px 9px', borderRadius: 100,
      display: 'inline-block', fontWeight: 500, ...badgeStyles[variant], ...style,
    }}>{children}</span>
  )
}

export function Card({ children, style, onClick, hover = true }) {
  const base = {
    background: 'var(--s1)', border: '1px solid var(--bd)', borderRadius: 16,
    transition: 'border-color .25s, transform .25s cubic-bezier(.34,1.2,.64,1), box-shadow .25s',
    cursor: onClick ? 'pointer' : 'default',
    ...style,
  }
  return (
    <div style={base} onClick={onClick}
      onMouseEnter={hover ? e => { e.currentTarget.style.borderColor = 'rgba(0,245,212,.2)'; e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 14px 42px rgba(0,0,0,.45)'; } : undefined}
      onMouseLeave={hover ? e => { e.currentTarget.style.borderColor = 'var(--bd)'; e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; } : undefined}
    >
      {children}
    </div>
  )
}

export function Btn({ children, variant = 'p', size = 'md', style, onClick, disabled, ...props }) {
  const sizes = { xs: '7px 16px', sm: '9px 20px', md: '12px 26px', lg: '15px 34px' }
  const fontSizes = { xs: 11, sm: 12, md: 13, lg: 15 }
  const variants = {
    p: { background: 'linear-gradient(135deg,var(--P),var(--N))', color: 'var(--bg)', border: 'none' },
    g: { background: 'transparent', border: '1px solid rgba(255,255,255,.14)', color: 'var(--t2)' },
    e: { background: 'rgba(255,77,109,.12)', border: '1px solid rgba(255,77,109,.25)', color: 'var(--E)' },
  }
  return (
    <button disabled={disabled} onClick={onClick} {...props} style={{
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
      borderRadius: 8, fontFamily: 'Syne', fontWeight: 700, cursor: disabled ? 'not-allowed' : 'pointer',
      transition: 'transform .22s cubic-bezier(.34,1.5,.64,1), box-shadow .22s',
      padding: sizes[size], fontSize: fontSizes[size], opacity: disabled ? .5 : 1,
      ...variants[variant], ...style,
    }}
      onMouseEnter={!disabled ? e => {
        if (variant === 'p') { e.currentTarget.style.transform = 'translateY(-2px) scale(1.04)'; e.currentTarget.style.boxShadow = '0 6px 28px rgba(0,245,212,.28)'; }
        if (variant === 'g') { e.currentTarget.style.borderColor = 'var(--P)'; e.currentTarget.style.color = 'var(--P)'; }
      } : undefined}
      onMouseLeave={!disabled ? e => {
        e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '';
        if (variant === 'g') { e.currentTarget.style.borderColor = 'rgba(255,255,255,.14)'; e.currentTarget.style.color = 'var(--t2)'; }
      } : undefined}
    >
      {children}
    </button>
  )
}

export function ProgressBar({ value, style, barStyle }) {
  return (
    <div style={{ height: 5, background: 'rgba(255,255,255,.07)', borderRadius: 4, overflow: 'hidden', ...style }}>
      <div className="pf" style={{ transform: `scaleX(${value})`, ...barStyle }} />
    </div>
  )
}

export function StatCard({ label, value, sub, valueStyle, children }) {
  return (
    <div style={{
      background: 'var(--s1)', border: '1px solid var(--bd)', borderRadius: 14, padding: 20,
      transition: 'all .22s',
    }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(0,245,212,.18)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--bd)'; e.currentTarget.style.transform = ''; }}
    >
      <div style={{ fontFamily: '"DM Mono"', fontSize: 11, color: 'var(--t4)', marginBottom: 8 }}>{label}</div>
      <div style={{ fontFamily: '"Bebas Neue"', fontSize: 44, lineHeight: 1, background: 'linear-gradient(135deg,var(--P),var(--N))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', ...valueStyle }}>{value}</div>
      {sub && <div style={{ fontFamily: '"DM Mono"', fontSize: 11, color: 'var(--t4)', marginTop: 6 }}>{sub}</div>}
      {children}
    </div>
  )
}
