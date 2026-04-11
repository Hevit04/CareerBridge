import { useState, useMemo } from 'react'
import { Badge, Btn, Chip } from '../../components/UI'
import { IconCalendar, IconChart } from '../../components/Icons'

const initialQueue = [
  { id: 1, item: 'Resume - AU2340102', reason: 'Unverified claim', status: 'Pending', file: 'Aarav_Mehta_Resume.pdf' },
  { id: 2, item: 'Profile - AU2340118', reason: 'Incorrect phone details', status: 'Pending', file: 'Diya_Shah_Profile_Record.pdf' },
  { id: 3, item: 'Resume - AU2340154', reason: 'File mismatch', status: 'Pending', file: 'Rohan_Kapoor_Resume.pdf' },
]

export default function AdminModeration({ onNav }) {
  const [moderationQueue, setModerationQueue] = useState(initialQueue)
  const [sortKey, setSortKey] = useState('item')

  const verifyItem = (id) => {
    setModerationQueue((prev) =>
      prev.map((m) => (m.id === id ? { ...m, status: 'Verified' } : m)),
    )
  }

  const unverifyItem = (id) => {
    setModerationQueue((prev) =>
      prev.map((m) => (m.id === id ? { ...m, status: 'Pending' } : m)),
    )
  }

  const removeItem = (id) => {
    setModerationQueue((prev) => prev.filter((m) => m.id !== id))
  }

  const sortedQueue = useMemo(() => {
    return [...moderationQueue].sort((a, b) => a[sortKey].localeCompare(b[sortKey]))
  }, [moderationQueue, sortKey])

  const pending = sortedQueue.filter(m => m.status === 'Pending')
  const verified = sortedQueue.filter(m => m.status === 'Verified')

  return (
    <div className="admin-enter" style={{ maxWidth: 1180, margin: '0 auto', padding: '40px 28px 70px' }}>
      <Chip style={{ marginBottom: 12 }}>Admin - Moderation</Chip>
      <h1 style={{ fontFamily: '"Bebas Neue"', fontSize: 'clamp(2.4rem,4.8vw,4.8rem)', lineHeight: 1, marginBottom: 10 }}>
        CONTENT <span style={{ color: 'var(--A)' }}>MODERATION</span>
      </h1>
      <p style={{ color: 'var(--t2)', fontSize: 14, marginBottom: 18 }}>Verify resume uploads and remove inappropriate or incorrect records.</p>

      {/* Sort Section */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 18, alignItems: 'center' }}>
        <div style={{ fontFamily: '"DM Mono"', fontSize: 11, color: 'var(--t4)' }}>SORT QUEUE BY:</div>
        <Btn variant={sortKey === 'item' ? 'p' : 'g'} size="xs" onClick={() => setSortKey('item')}>Item Name</Btn>
        <Btn variant={sortKey === 'reason' ? 'p' : 'g'} size="xs" onClick={() => setSortKey('reason')}>Reason</Btn>
      </div>

      {/* Pending Items Section */}
      <div className="admin-panel" style={{ background: 'var(--s1)', border: '1px solid var(--bd)', borderRadius: 16, padding: 20, marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
          <IconCalendar size={18} color="var(--A)" />
          <span style={{ fontWeight: 800, color: 'var(--t1)' }}>Pending Verification ({pending.length})</span>
        </div>

        {pending.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--t4)', fontSize: 14 }}>All items have been moderated. Good job!</div>
        ) : (
          <table className="tbl">
            <thead><tr><th>Item</th><th>Reason</th><th>Resume</th><th>Actions</th></tr></thead>
            <tbody>
              {pending.map((m, idx) => (
                <tr key={m.id} className="admin-row" style={{ animationDelay: `${idx * 0.04}s` }}>
                  <td style={{ color: 'var(--t1)', fontWeight: 700 }}>{m.item}</td>
                  <td>{m.reason}</td>
                  <td>
                    <Btn variant="g" size="xs" onClick={() => window.open(`import.meta.env.VITE_API_URL/uploads/resumes/${m.file}`, '_blank', 'noopener,noreferrer')}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
                        Open
                      </span>
                    </Btn>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <Btn size="xs" onClick={() => verifyItem(m.id)}>Verify</Btn>
                      <Btn variant="e" size="xs" onClick={() => removeItem(m.id)}>Remove</Btn>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Verified Items Section */}
      {verified.length > 0 && (
        <div className="admin-panel" style={{ background: 'var(--s1)', border: '1px solid var(--bd)', borderRadius: 16, padding: 20, animation: 'fadeUp .4s both' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <IconChart size={18} color="#4ade80" />
            <span style={{ fontWeight: 800, color: 'var(--t1)' }}>Verified Records ({verified.length})</span>
          </div>

          <table className="tbl">
            <thead><tr><th>Item</th><th>Reason</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {verified.map((m, idx) => (
                <tr key={m.id} className="admin-row" style={{ animationDelay: `${idx * 0.04}s` }}>
                  <td style={{ color: 'var(--t4)', fontWeight: 600 }}>{m.item}</td>
                  <td style={{ color: 'var(--t4)' }}>{m.reason}</td>
                  <td><Badge variant="bg">Verified</Badge></td>
                  <td>
                    <Btn variant="g" size="xs" onClick={() => unverifyItem(m.id)}>Undo</Btn>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div style={{ marginTop: 24 }}>
        <Btn variant="g" size="sm" onClick={() => onNav('admin')}>Back to Dashboard</Btn>
      </div>
    </div>
  )
}
