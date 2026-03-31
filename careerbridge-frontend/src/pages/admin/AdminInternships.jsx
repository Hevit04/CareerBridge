import { useState, useEffect } from 'react'
import { Badge, Btn, Chip } from '../../components/UI'
import { IconTarget, IconEdit, IconTrash } from '../../components/Icons'
import { api } from '../../api/api'
import { useToast } from '../../hooks/useToast'

const DOMAINS = [
  { key: 'swe', label: 'Software Engineering' },
  { key: 'ml', label: 'Machine Learning' },
  { key: 'data', label: 'Data Science' },
  { key: 'backend', label: 'Backend' },
  { key: 'frontend', label: 'Frontend' },
]

export default function AdminInternships({ onNav }) {
  const toast = useToast()
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedId, setSelectedId] = useState(null)
  const [form, setForm] = useState({
    company: '',
    role: '',
    domain: 'swe',
    skills: '',
    location: '',
    duration: '',
    deadline: '',
    description: '',
  })

  const fetchJobs = async () => {
    setLoading(true)
    try {
      const data = await api.admin.internships.list()
      setJobs(data)
    } catch (err) {
      toast('❌ Error: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchJobs()
  }, [])

  const handleSave = async () => {
    if (!form.company || !form.role || !form.deadline) {
      toast('⚠️ Company, Role and Deadline are required')
      return
    }

    const payload = {
      company: form.company.trim(),
      role: form.role.trim(),
      domain: form.domain,
      location: form.location.trim(),
      duration: form.duration.trim(),
      deadline: form.deadline,
      tags: form.skills.split(',').map(s => s.trim()).filter(Boolean),
      description: form.description.trim()
    }

    try {
      if (selectedId) {
        await api.admin.internships.update(selectedId, payload)
        toast('✅ Internship updated')
      } else {
        await api.admin.internships.create(payload)
        toast('🚀 New internship published')
      }
      setForm({ company: '', role: '', domain: 'swe', skills: '', location: '', duration: '', deadline: '', description: '' })
      setSelectedId(null)
      fetchJobs()
    } catch (err) {
      toast('❌ Failed: ' + err.message)
    }
  }

  const handleEdit = (j) => {
    setSelectedId(j.id)
    setForm({
      company: j.company,
      role: j.role,
      domain: j.domain,
      skills: (j.tags || []).join(', '),
      location: j.location,
      duration: j.duration,
      deadline: j.deadline,
      description: j.description || ''
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to remove this internship?')) return
    try {
      await api.admin.internships.delete(id)
      toast('🗑️ Internship removed')
      fetchJobs()
    } catch (err) {
      toast('❌ Delete failed: ' + err.message)
    }
  }

  return (
    <div style={{ maxWidth: 1180, margin: '0 auto', padding: '40px 28px 70px', animation: 'fadeUp .35s both' }}>
      <Chip style={{ marginBottom: 12 }}>Admin - Internships</Chip>
      <h1 style={{ fontFamily: '"Bebas Neue"', fontSize: 'clamp(2.4rem,4.8vw,4.8rem)', lineHeight: 1, marginBottom: 10 }}>
        INTERNSHIP <span style={{ color: 'var(--E)' }}>MANAGEMENT</span>
      </h1>
      <p style={{ color: 'var(--t2)', fontSize: 14, marginBottom: 18 }}>Publish new opportunities, edit requirements, and archive outdated roles.</p>

      <div className="admin-panel" style={{ background: 'var(--s1)', border: '1px solid var(--bd)', borderRadius: 16, padding: 20, marginBottom: 14, animationDelay: '.05s' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--t1)' }}>{selectedId ? 'Edit Internship' : 'Add New Opportunity'}</div>
          {selectedId && <Btn variant="g" size="xs" onClick={() => { setSelectedId(null); setForm({ company: '', role: '', domain: 'swe', skills: '', location: '', duration: '', deadline: '', description: '' }) }}>Cancel Edit</Btn>}
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 10 }}>
          <div className="f-grp">
            <label>Company Name</label>
            <input className="inp" value={form.company} onChange={e => setForm(p => ({ ...p, company: e.target.value }))} />
          </div>
          <div className="f-grp">
            <label>Role / Title</label>
            <input className="inp" value={form.role} onChange={e => setForm(p => ({ ...p, role: e.target.value }))} />
          </div>
          <div className="f-grp">
            <label>Domain</label>
            <select className="inp" value={form.domain} onChange={e => setForm(p => ({ ...p, domain: e.target.value }))}>
              {DOMAINS.map(d => <option key={d.key} value={d.key}>{d.label}</option>)}
            </select>
          </div>
          <div className="f-grp">
            <label>Location</label>
            <input className="inp" value={form.location} onChange={e => setForm(p => ({ ...p, location: e.target.value }))} />
          </div>
          <div className="f-grp">
            <label>Duration</label>
            <input className="inp" value={form.duration} onChange={e => setForm(p => ({ ...p, duration: e.target.value }))} />
          </div>
          <div className="f-grp">
            <label>Deadline</label>
            <input className="inp" type="date" value={form.deadline} onChange={e => setForm(p => ({ ...p, deadline: e.target.value }))} />
          </div>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 2fr auto', gap: 10, alignItems: 'end' }}>
          <div className="f-grp">
            <label>Skills (comma separated)</label>
            <input className="inp" value={form.skills} onChange={e => setForm(p => ({ ...p, skills: e.target.value }))} />
          </div>
          <div className="f-grp">
            <label>Brief Description</label>
            <input className="inp" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
          </div>
          <Btn size="md" onClick={handleSave} style={{ height: 42 }}>{selectedId ? 'Update Opportunity' : 'Publish Role'}</Btn>
        </div>
      </div>

      <div className="admin-panel" style={{ background: 'var(--s1)', border: '1px solid var(--bd)', borderRadius: 16, padding: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <IconTarget size={18} color="var(--E)" />
            <span style={{ fontSize: 16, fontWeight: 800, color: 'var(--t1)' }}>Active Pool ({jobs.length})</span>
          </div>
          <Btn variant="g" size="xs" onClick={() => onNav('admin')}>Back to Dashboard</Btn>
        </div>
        
        <table className="tbl">
          <thead>
            <tr>
              <th>Company</th>
              <th>Role</th>
              <th>Domain</th>
              <th>Location</th>
              <th>Deadline</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? <tr><td colSpan="6" style={{ textAlign: 'center', padding: 40 }}>Loading data...</td></tr> : 
              jobs.map((j, idx) => (
                <tr key={j.id} className="admin-row" style={{ animationDelay: `${idx * 0.04}s` }}>
                  <td style={{ color: 'var(--t1)', fontWeight: 700 }}>{j.company}</td>
                  <td>{j.role}</td>
                  <td><Chip size="xs">{DOMAINS.find(d => d.key === j.domain)?.label || j.domain}</Chip></td>
                  <td>{j.location}</td>
                  <td style={{ color: new Date(j.deadline) < new Date() ? 'var(--E)' : 'inherit' }}>{j.deadline}</td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                      <button onClick={() => handleEdit(j)} className="icon-btn" title="Edit"><IconEdit size={16} color="var(--t3)" /></button>
                      <button onClick={() => handleDelete(j.id)} className="icon-btn" title="Delete"><IconTrash size={16} color="var(--E)" /></button>
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
