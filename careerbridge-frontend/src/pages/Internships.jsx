import { useEffect, useState } from 'react'
import { Chip, Badge, Btn } from '../components/UI'
import { useToast } from '../hooks/useToast'
import { api } from '../api/api'

const DOMAIN_MAP = {
  'swe': 'Software Engineering',
  'ml': 'Machine Learning',
  'data': 'Data Science',
  'backend': 'Backend Dev',
  'frontend': 'Frontend Dev'
}

export default function Internships({ onNav, isLoggedIn }) {
  const toast = useToast()
  const [filter, setFilter] = useState('all')
  const [internships, setInternships] = useState([])
  const [applications, setApplications] = useState([])
  const [selected, setSelected] = useState(null)
  const [loading, setLoading] = useState(true)

  if (!isLoggedIn) {
    return (
      <div className="admin-enter" style={{ maxWidth: 760, margin: '80px auto', textAlign: 'center', padding: '0 24px' }}>
        <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(0,245,212,.08)', border: '1px solid rgba(0,245,212,.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
          <span style={{ fontSize: 32 }}>🔒</span>
        </div>
        <h1 style={{ fontFamily: '"Bebas Neue"', fontSize: 'clamp(2.5rem,5vw,4.5rem)', lineHeight: 1, marginBottom: 12 }}>
          ACCESS <span style={{ color: 'var(--E)' }}>RESTRICTED</span>
        </h1>
        <p style={{ fontSize: 16, color: 'var(--t2)', marginBottom: 32, lineHeight: 1.6 }}>
          The Internship Pool is exclusive to CareerBridge members. <br />
          Login or create an account to view and apply for curated opportunities.
        </p>
        <div style={{ display: 'flex', gap: 14, justifyContent: 'center' }}>
          <Btn size="md" onClick={() => onNav('login')}>Login to Account →</Btn>
          <Btn variant="g" size="md" onClick={() => onNav('login')}>Create Profile</Btn>
        </div>
      </div>
    )
  }

  const fetchData = async () => {
    setLoading(true)
    try {
      const domainParam = filter === 'all' ? null : filter
      const [list, apps] = await Promise.all([
        api.internships.list(domainParam),
        api.internships.applications()
      ])
      setInternships(list)
      setApplications(apps)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [filter])

  const isApplied = (id) => applications.some(a => a.internship_id === id)

  const handleApply = async (id) => {
    try {
      await api.internships.apply(id)
      toast('🚀 Application submitted successfully!')
      fetchData()
    } catch (err) {
      toast('❌ Error: ' + err.message)
    }
  }

  const list = internships

  return (
    <div style={{ maxWidth: 1260, margin: '0 auto', padding: '40px 28px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 28, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <Chip style={{ marginBottom: 12 }}>Live Opportunities</Chip>
          <h1 style={{ fontFamily: '"Bebas Neue"', fontSize: 'clamp(2.5rem,5vw,5rem)', lineHeight: 1, marginBottom: 8 }}>
            INTERNSHIP <span style={{ color: 'var(--E)' }}>POOL</span>
          </h1>
          <p style={{ fontSize: 14, color: 'var(--t2)' }}>AI-matched to your skill profile · Updated daily</p>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          <select 
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            style={{
              width: 175, padding: '9px 14px', fontSize: 13, fontFamily: 'Syne, sans-serif',
              background: 'var(--s2)', border: '1px solid var(--bd)', borderRadius: 10, color: 'var(--t1)',
              cursor: 'pointer',
            }}>
            <option value="all">All Domains</option>
            <option value="swe">Software Engineering</option>
            <option value="ml">Machine Learning</option>
            <option value="data">Data Science</option>
            <option value="backend">Backend Dev</option>
            <option value="frontend">Frontend Dev</option>
          </select>
        </div>
      </div>

      <div style={{ background: 'rgba(0,245,212,.06)', border: '1px solid rgba(0,245,212,.16)', borderRadius: 12, padding: '13px 20px', display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
        <span style={{ fontSize: 18 }}>⚡</span>
        <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--t1)' }}>
          {list.length} internships matched your profile today. <span style={{ color: 'var(--P)' }}>Matching logic updated based on your skill tests.</span>
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 18 }}>
        {list.map((intern, idx) => (
          <div key={intern.id}
            onClick={() => setSelected(intern)}
            style={{
              background: 'var(--s1)', border: '1px solid var(--bd)', borderRadius: 16, padding: 24,
              transition: 'all .25s cubic-bezier(.34,1.2,.64,1)', cursor: 'pointer',
              animation: `fadeUp .45s ${idx * 0.07}s both`,
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = 'rgba(0,245,212,.22)'
              e.currentTarget.style.transform = 'translateY(-3px)'
              e.currentTarget.style.boxShadow = '0 14px 42px rgba(0,0,0,.45)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = 'var(--bd)'
              e.currentTarget.style.transform = ''
              e.currentTarget.style.boxShadow = ''
            }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 18 }}>
              <div style={{
                width: 48, height: 48, borderRadius: 12, background: 'rgba(0,245,212,.09)',
                border: `1px solid rgba(0,245,212,.18)`, display: 'flex', alignItems: 'center',
                justifyContent: 'center', fontWeight: 800, fontSize: 20, color: 'var(--P)',
              }}>
                {intern.company[0]}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 5 }}>
                <Badge variant="bg">{intern.match}% Match</Badge>
              </div>
            </div>
            <div style={{ fontSize: 17, fontWeight: 800, marginBottom: 4, color: 'var(--t1)' }}>{intern.role}</div>
            <div style={{ fontFamily: '"DM Mono"', fontSize: 12, color: 'var(--t2)', marginBottom: 3 }}>
              {intern.company} · {intern.location}
            </div>
            <div style={{ fontFamily: '"DM Mono"', fontSize: 11, color: 'var(--t4)', marginBottom: 14 }}>{intern.duration}</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 16 }}>
              <Chip style={{ fontSize: 10, padding: '2px 8px' }}>{DOMAIN_MAP[intern.domain] || intern.domain}</Chip>
            </div>
            <div style={{ borderTop: '1px solid var(--bd)', paddingTop: 14, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontFamily: '"DM Mono"', fontSize: 11, color: 'var(--t4)' }}>Deadline: {new Date(intern.deadline).toLocaleDateString()}</span>
              <Btn size="xs" disabled={isApplied(intern.id)} onClick={(e) => { e.stopPropagation(); handleApply(intern.id) }}>
                {isApplied(intern.id) ? 'Applied ✓' : 'Apply →'}
              </Btn>
            </div>
          </div>
        ))}
      </div>

      {selected && (
        <div
          onClick={() => setSelected(null)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,.75)',
            backdropFilter: 'blur(6px)',
            zIndex: 2000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 20,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: 620,
              background: 'var(--s1)',
              border: '1px solid var(--bd)',
              borderRadius: 16,
              padding: 24,
              animation: 'modalIn .3s cubic-bezier(.34,1.3,.64,1)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--t1)' }}>{selected.role}</div>
              <Btn variant="g" size="xs" onClick={() => setSelected(null)}>Close</Btn>
            </div>
            <div style={{ fontFamily: '"DM Mono"', fontSize: 12, color: 'var(--t3)', marginBottom: 10 }}>
              {selected.company} · {selected.location} · {selected.duration}
            </div>
            <p style={{ fontSize: 14, lineHeight: 1.7, color: 'var(--t2)', marginBottom: 14 }}>
              {selected.description || `Join ${selected.company} for a ${selected.duration} internship in the ${selected.domain} domain.`}
              <br /><br />
              <strong>Required skills:</strong> {selected.tags?.join(', ') || 'Not specified'}
            </p>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontFamily: '"DM Mono"', fontSize: 12, color: 'var(--t4)' }}>Deadline: {new Date(selected.deadline).toLocaleDateString()}</span>
              <Btn size="sm" disabled={isApplied(selected.id)} onClick={() => handleApply(selected.id)}>
                {isApplied(selected.id) ? 'Application Sent' : 'Apply Now →'}
              </Btn>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
