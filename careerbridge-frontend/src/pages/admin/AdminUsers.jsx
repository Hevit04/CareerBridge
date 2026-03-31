import { useMemo, useState, useEffect } from 'react'
import { Badge, Btn, Chip } from '../../components/UI'
import { IconUser } from '../../components/Icons'
import { api } from '../../api/api'
import { useToast } from '../../hooks/useToast'

export default function AdminUsers({ onNav }) {
  const toast = useToast()
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [sortKey, setSortKey] = useState('enrollment_id')
  const [sortOrder, setSortOrder] = useState('desc')

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const data = await api.admin.users.list()
      setRows(data)
    } catch (err) {
      toast('❌ Error fetching users: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const stats = useMemo(() => {
    const total = rows.length
    const blocked = rows.filter((r) => !r.is_active).length
    const active = total - blocked
    return { total, active, blocked }
  }, [rows])

  const sortedUsers = useMemo(() => {
    return [...rows].sort((a, b) => {
      let valA = a[sortKey] ?? ''
      let valB = b[sortKey] ?? ''
      
      if (sortKey === 'status') {
          valA = a.is_active ? 1 : 0
          valB = b.is_active ? 1 : 0
      } else {
        if (typeof valA === 'string') valA = valA.toLowerCase()
        if (typeof valB === 'string') valB = valB.toLowerCase()
      }

      if (valA < valB) return sortOrder === 'asc' ? -1 : 1
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1
      return 0
    })
  }, [rows, sortKey, sortOrder])

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortKey(key)
      setSortOrder(key === 'enrollment_no' ? 'desc' : 'asc')
    }
  }

  const toggleBlock = async (id, isActive) => {
    try {
      const action = isActive ? 'block' : 'unblock'
      await api.admin.users.action(id, action)
      toast(`✅ User ${action}ed successfully`)
      fetchUsers()
    } catch (err) {
      toast('❌ Operation failed: ' + err.message)
    }
  }

  return (
    <div className="admin-enter" style={{ maxWidth: 1180, margin: '0 auto', padding: '40px 28px 70px' }}>
      <Chip style={{ marginBottom: 12 }}>Admin - Users</Chip>
      <h1 style={{ fontFamily: '"Bebas Neue"', fontSize: 'clamp(2.4rem,4.8vw,4.8rem)', lineHeight: 1, marginBottom: 10 }}>
        USER <span style={{ color: 'var(--P)' }}>MANAGEMENT</span>
      </h1>
      <p style={{ color: 'var(--t2)', fontSize: 14, marginBottom: 18 }}>
        Track registered students, inspect account activity, block/unblock access, and resolve login issues.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 14 }}>
        <div className="admin-panel admin-kpi" style={{ background: 'var(--s1)', border: '1px solid var(--bd)', borderRadius: 12, padding: 14, animationDelay: '.03s' }}>
          <div style={{ fontFamily: '"DM Mono"', fontSize: 10, color: 'var(--t4)' }}>Total Registered</div>
          <div style={{ fontFamily: '"Bebas Neue"', fontSize: 34, color: 'var(--P)', lineHeight: 1 }}>{stats.total}</div>
        </div>
        <div className="admin-panel admin-kpi" style={{ background: 'var(--s1)', border: '1px solid var(--bd)', borderRadius: 12, padding: 14, animationDelay: '.08s' }}>
          <div style={{ fontFamily: '"DM Mono"', fontSize: 10, color: 'var(--t4)' }}>Active Accounts</div>
          <div style={{ fontFamily: '"Bebas Neue"', fontSize: 34, color: '#4ade80', lineHeight: 1 }}>{stats.active}</div>
        </div>
        <div onClick={() => { setSortKey('status'); setSortOrder('asc'); }} className="admin-panel admin-kpi" style={{ cursor: 'pointer', background: 'var(--s1)', border: '1px solid var(--bd)', borderRadius: 12, padding: 14, animationDelay: '.13s' }}>
          <div style={{ fontFamily: '"DM Mono"', fontSize: 10, color: 'var(--t4)' }}>Blocked Accounts</div>
          <div style={{ fontFamily: '"Bebas Neue"', fontSize: 34, color: 'var(--E)', lineHeight: 1 }}>{stats.blocked}</div>
        </div>
      </div>

      <div className="admin-panel" style={{ background: 'var(--s1)', border: '1px solid var(--bd)', borderRadius: 16, padding: 20, animationDelay: '.18s' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 18, alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <IconUser size={18} color="var(--P)" />
            <span style={{ fontSize: 16, fontWeight: 800, color: 'var(--t1)' }}>Student Accounts</span>
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <div style={{ fontFamily: '"DM Mono"', fontSize: 11, color: 'var(--t4)' }}>SORT BY:</div>
            <Btn variant={sortKey === 'enrollment_no' ? 'p' : 'g'} size="xs" onClick={() => handleSort('enrollment_no')}>Enrollment</Btn>
            <Btn variant={sortKey === 'name' ? 'p' : 'g'} size="xs" onClick={() => handleSort('name')}>Name</Btn>
            <Btn variant={sortKey === 'status' ? 'p' : 'g'} size="xs" onClick={() => handleSort('status')}>Status</Btn>
            <div style={{ width: 1, height: 16, background: 'var(--bd)', margin: '0 4px' }}></div>
            <Btn variant="g" size="xs" onClick={() => onNav('admin')}>Back</Btn>
          </div>
        </div>

        <table className="tbl">
          <thead><tr><th>Name</th><th>Enrollment</th><th>Status</th><th>Email</th><th>Role</th><th>Actions</th></tr></thead>
          <tbody>
            {loading ? <tr><td colSpan="6" style={{ textAlign: 'center', padding: '40px' }}>Loading students...</td></tr> : 
              sortedUsers.map((r, idx) => (
                <tr key={r.id} className="admin-row" style={{ animationDelay: `${idx * 0.04}s` }}>
                  <td style={{ color: 'var(--t1)', fontWeight: 700 }}>{r.name}</td>
                  <td style={{ fontFamily: '"DM Mono"', fontSize: 13 }}>{r.enrollment_no}</td>
                  <td><Badge variant={r.is_active ? 'bg' : 'br'}>{r.is_active ? 'Active' : 'Blocked'}</Badge></td>
                  <td style={{ fontSize: 13, color: 'var(--t3)' }}>{r.email}</td>
                  <td><Chip size="xs">{r.role}</Chip></td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <Btn variant="g" size="xs" onClick={() => alert(`Password reset for ${r.name}`)}>Reset</Btn>
                      <Btn
                        variant={!r.is_active ? 'g' : 'e'}
                        size="xs"
                        onClick={() => toggleBlock(r.id, r.is_active)}
                      >
                        {!r.is_active ? 'Unblock' : 'Block'}
                      </Btn>
                    </div>
                  </td>
                </tr>
              ))
            }
          </tbody>
        </table>
      </div>
    </div>
  )
}
