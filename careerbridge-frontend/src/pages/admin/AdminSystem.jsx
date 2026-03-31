import { Btn, Chip } from '../../components/UI'
import { IconGear } from '../../components/Icons'

const checks = [
  'API Gateway: Healthy',
  'Database Cluster: Healthy',
  'Assessment Service: Healthy',
  'Interview Engine: Degraded latency warning',
]

export default function AdminSystem({ onNav }) {
  return (
    <div className="admin-enter" style={{ maxWidth: 1180, margin: '0 auto', padding: '40px 28px 70px' }}>
      <Chip style={{ marginBottom: 12 }}>Admin - System Control</Chip>
      <h1 style={{ fontFamily: '"Bebas Neue"', fontSize: 'clamp(2.4rem,4.8vw,4.8rem)', lineHeight: 1, marginBottom: 10 }}>
        SYSTEM <span style={{ color: 'var(--P)' }}>CONTROL</span>
      </h1>
      <p style={{ color: 'var(--t2)', fontSize: 14, marginBottom: 18 }}>Maintain platform health, resolve issues, and manage critical records.</p>

      <div className="admin-panel" style={{ background: 'var(--s1)', border: '1px solid var(--bd)', borderRadius: 16, padding: 20, animationDelay: '.08s' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <IconGear size={18} color="var(--P)" />
          <span style={{ fontWeight: 800, color: 'var(--t1)' }}>Service Status</span>
        </div>
        <div style={{ display: 'grid', gap: 8 }}>
          {checks.map((item, idx) => (
            <div key={item} className="admin-row" style={{ background: 'var(--s2)', border: '1px solid var(--bd)', borderRadius: 10, padding: 10, color: 'var(--t2)', fontSize: 13, animationDelay: `${idx * 0.05}s` }}>
              {item}
            </div>
          ))}
        </div>
      </div>

      <div style={{ marginTop: 14, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <div className="admin-action"><Btn variant="g" size="sm" onClick={() => alert('Error queue opened')}>Open Error Queue</Btn></div>
        <div className="admin-action"><Btn variant="g" size="sm" onClick={() => alert('Database backup started')}>Run Backup</Btn></div>
        <div className="admin-action"><Btn variant="e" size="sm" onClick={() => alert('Incident mode activated')}>Incident Mode</Btn></div>
        <div className="admin-action"><Btn variant="g" size="sm" onClick={() => onNav('admin')}>Back</Btn></div>
      </div>
    </div>
  )
}
