import { useEffect, useState } from 'react'
import { Chip, Badge, Btn, ProgressBar } from '../components/UI'
import { useToast } from '../hooks/useToast'
import { IconOverview, IconBrain, IconMic, IconTarget, IconUser, IconCalendar, IconReport, IconGear, IconMessageSquare } from '../components/Icons'
import { api } from '../api/api'

// Skills computed dynamically




const sidebarItems = [
  { icon: <IconOverview size={14} />, label: 'Overview', page: 'dashboard', active: true },
  { icon: <IconBrain size={14} />, label: 'Assessments', page: 'assessment' },
  { icon: <IconMic size={14} />, label: 'Mock Interviews', page: 'interview' },
  { icon: <IconTarget size={14} />, label: 'Internships', page: 'internships' },
  { icon: <IconMessageSquare size={14} />, label: 'Notifications', page: 'notifications' },
  { icon: <IconUser size={14} />, label: 'My Profile', page: 'profile' },
]


export default function Dashboard({ onNav, authUser }) {
  const toast = useToast()
  const [stats, setStats] = useState({ tests_done: 0, avg_score: 0, best_score: 0 })
  const [readiness, setReadiness] = useState(0)
  const [activity, setActivity] = useState([])
  const [matches, setMatches] = useState([])
  const [loading, setLoading] = useState(true)
  const [showInterview, setShowInterview] = useState(false)
  const [skills, setSkills] = useState([])
  const [userData, setUserData] = useState(null)

  // Animate skill bars whenever the skills data changes
  useEffect(() => {
    if (skills.length === 0) return
    const bars = document.querySelectorAll('[data-skill-bar]')
    bars.forEach((b, i) => {
      const fill = b.querySelector('.pf')
      if (!fill) return
      const pct = parseFloat(b.dataset.skillBar)
      setTimeout(() => { fill.style.transform = `scaleX(${pct})` }, i * 110 + 150)
    })
  }, [skills])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsData, readinessData, activityData, matchesData, testsData, uData] = await Promise.all([
          api.assessments.stats(),
          api.users.readiness(),
          api.assessments.attempts(),
          api.internships.list(),
          api.assessments.list(),
          api.users.me()
        ])
        setStats(statsData)
        setReadiness(readinessData.readiness_score)

        // Enrich activity with test names
        const enrichedActivity = activityData.map(attempt => {
          const test = testsData.find(t => t.id === attempt.test_id)
          return { ...attempt, test_name: test ? test.title : 'Mock Test', test_type: test ? test.type : 'Technical' }
        })
        setActivity(enrichedActivity)

        setMatches(matchesData.slice(0, 4))
        setUserData(uData)

        // Compute Dynamic Skills
        const skillMap = {}
        activityData.forEach(attempt => {
          const test = testsData.find(t => t.id === attempt.test_id)
          if (test) {
            if (!skillMap[test.title]) skillMap[test.title] = { sum: 0, count: 0, type: test.type }
            skillMap[test.title].sum += attempt.percentage
            skillMap[test.title].count += 1
          }
        })

        const dynamicSkills = testsData.slice(0, 6).map(test => {
          const sm = skillMap[test.title]
          const pct = sm ? Math.round(sm.sum / sm.count) : 0
          let color = 'var(--P)'
          let barStyle = {}
          if (test.type === 'Aptitude') { color = 'var(--E)'; barStyle = { background: 'linear-gradient(90deg,var(--E),var(--A))' } }
          else if (test.type === 'Communication') { color = 'var(--A)'; barStyle = { background: 'linear-gradient(90deg,var(--A),var(--P))' } }
          else if (test.type !== 'Technical') { color = '#a78bfa'; barStyle = { background: 'linear-gradient(90deg,var(--N),var(--E))' } }
          return { label: test.title, pct, color, barStyle }
        })

        if (dynamicSkills.length === 0) {
          setSkills([
            { label: 'Technical Skills', pct: 0, color: 'var(--P)', barStyle: {} },
            { label: 'Aptitude & Reasoning', pct: 0, color: 'var(--E)', barStyle: { background: 'linear-gradient(90deg,var(--E),var(--A))' } },
            { label: 'Communication Skills', pct: 0, color: 'var(--A)', barStyle: { background: 'linear-gradient(90deg,var(--A),var(--P))' } },
          ])
        } else {
          setSkills(dynamicSkills)
        }
      } catch (err) {
        console.error("Failed to fetch dashboard data", err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()

    const now = new Date()
    const isWeekend = now.getDay() === 0 || now.getDay() === 6
    const isBefore4PM = now.getHours() < 16
    setShowInterview(isWeekend && isBefore4PM)
  }, [])

  const handleDownload = async () => {
    try {
      const blob = await api.analytics.downloadReport()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      const safeName = userData?.first_name ? `${userData.first_name}_${userData.last_name || ''}` : 'User'
      a.download = `CareerBridge_Report_${safeName.trim().replace(/\s+/g, '_')}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      toast('📊 Report downloaded!')
    } catch (err) {
      console.error(err)
      toast('❌ Failed to download report')
    }
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '230px 1fr', minHeight: 'calc(100vh - 62px)' }}>
      {/* Sidebar */}
      <div style={{ background: 'var(--s1)', borderRight: '1px solid var(--bd)', padding: '20px 14px', position: 'sticky', top: 62, height: 'calc(100vh - 62px)', overflowY: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', marginBottom: 22 }}>
          <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'linear-gradient(135deg,var(--N),var(--P))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 13, color: 'var(--bg)' }}>
            {userData?.first_name?.[0] || 'U'}
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--t1)' }}>{userData?.first_name ? `${userData.first_name} ${userData.last_name}` : 'User'}</div>
            <div style={{ fontFamily: '"DM Mono"', fontSize: 11, color: 'var(--t4)' }}>{userData?.enrollment_no || 'Student'}</div>
          </div>
        </div>
        <div style={{ fontFamily: '"DM Mono"', fontSize: 10, color: 'var(--t4)', letterSpacing: '.12em', padding: '0 12px', margin: '14px 0 6px' }}>MAIN</div>
        {sidebarItems.map(({ icon, label, page, active }) => (
          <div key={label} onClick={() => onNav(page)} style={{
            display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 10,
            cursor: 'pointer', transition: 'all .2s', marginBottom: 2,
            color: active ? 'var(--P)' : 'var(--t2)', fontSize: 13, fontWeight: 600,
            background: active ? 'rgba(0,245,212,.07)' : 'transparent',
            border: `1px solid ${active ? 'rgba(0,245,212,.14)' : 'transparent'}`,
          }}
            onMouseEnter={!active ? e => { e.currentTarget.style.background = 'rgba(255,255,255,.04)'; e.currentTarget.style.color = 'var(--t1)'; } : undefined}
            onMouseLeave={!active ? e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--t2)'; } : undefined}
          >
            <span style={{ fontSize: 14, width: 18, textAlign: 'center' }}>{icon}</span>{label}
          </div>
        ))}

        {showInterview && (
          <div style={{ marginTop: 28, padding: 14, background: 'rgba(0,245,212,.06)', border: '1px solid rgba(0,245,212,.14)', borderRadius: 10 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--P)', marginBottom: 4 }}>⚡ Next Interview</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--t1)' }}>Technical Round</div>
            <div style={{ fontFamily: '"DM Mono"', fontSize: 11, color: 'var(--t4)', marginTop: 2 }}>Today, 4:00 PM</div>
          </div>
        )}
      </div>

      {/* Main content */}
      <div style={{ padding: 32, overflowY: 'auto', background: 'var(--bg)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-.02em', color: 'var(--t1)', marginBottom: 4 }}>Welcome, {userData?.first_name || 'Student'}</div>
            <p style={{ fontSize: 14, color: 'var(--t2)' }}>Here's your career readiness snapshot — <span style={{ color: 'var(--P)' }}>{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span></p>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <Btn variant="g" size="sm" onClick={handleDownload}>Download Report</Btn>
            <Btn size="sm" onClick={() => onNav('assessment')}>Take Test →</Btn>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 22 }}>
          {[
            { label: 'Average Score', val: stats.avg_score, sub: null },
            { label: 'Tests Completed', val: stats.tests_done, sub: 'Keep it up!' },
            { label: 'Best Score', val: stats.best_score + '%', valStyle: { background: 'linear-gradient(135deg,var(--A),var(--P))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }, children: <div style={{ marginTop: 6 }}><Badge variant="bg">Peak performance</Badge></div> },
            { label: 'Readiness Level', val: readiness + '%', valStyle: { background: 'linear-gradient(135deg,var(--E),var(--A))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }, sub: 'Target: 90% by May' },
          ].map(({ label, val, sub, valStyle, children }) => (
            <div key={label} style={{ background: 'var(--s1)', border: '1px solid var(--bd)', borderRadius: 14, padding: 20, transition: 'all .22s' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(0,245,212,.18)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--bd)'; e.currentTarget.style.transform = ''; }}>
              <div style={{ fontFamily: '"DM Mono"', fontSize: 11, color: 'var(--t4)', marginBottom: 8 }}>{label}</div>
              <div style={{ fontFamily: '"Bebas Neue"', fontSize: 44, lineHeight: 1, background: 'linear-gradient(135deg,var(--P),var(--N))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', ...valStyle }}>{val}</div>
              {sub && <div style={{ fontFamily: '"DM Mono"', fontSize: 11, color: 'var(--t4)', marginTop: 6 }}>{sub}</div>}
              {children}
            </div>
          ))}
        </div>

        {/* Charts row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 18, marginBottom: 18 }}>
          {/* Skills */}
          <div style={{ background: 'var(--s1)', border: '1px solid var(--bd)', borderRadius: 16, padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div style={{ fontSize: 17, fontWeight: 800, color: 'var(--t1)' }}>Skill Breakdown</div>
              <Btn variant="g" size="xs" onClick={() => onNav('assessment')}>Take Tests →</Btn>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 15 }}>
              {skills.map(({ label, pct, color, barStyle }) => (
                <div key={label} data-skill-bar={pct / 100}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--t1)' }}>{label}</span>
                    <span style={{ fontFamily: '"DM Mono"', fontSize: 12, color }}>{pct}%</span>
                  </div>
                  <div style={{ height: 5, background: 'rgba(255,255,255,.07)', borderRadius: 4, overflow: 'hidden' }}>
                    <div className="pf" style={{ transform: 'scaleX(0)', ...barStyle }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Matches */}
          <div style={{ background: 'var(--s1)', border: '1px solid var(--bd)', borderRadius: 16, padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
              <div style={{ fontSize: 17, fontWeight: 800, color: 'var(--t1)' }}>Top Matches</div>
              <Btn variant="g" size="xs" onClick={() => onNav('internships')}>All →</Btn>
            </div>
            {(!userData?.skills && !userData?.resume_filename) ? (
              <div style={{ padding: '30px 20px', textAlign: 'center', background: 'rgba(255,255,255,.02)', border: '1px dashed var(--bd)', borderRadius: 12 }}>
                <div style={{ marginBottom: 12, display: 'flex', justifyContent: 'center' }}><IconUser size={32} color="var(--t4)" /></div>
                <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--t1)', marginBottom: 6 }}>Profile Incomplete</div>
                <p style={{ fontSize: 13, color: 'var(--t2)', marginBottom: 16, lineHeight: 1.5 }}>Upload your resume or add manual skills to unlock AI-powered match scores.</p>
                <Btn size="sm" onClick={() => onNav('profile')}>Complete Profile →</Btn>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
                {matches.map(({ id, company, role, match, color, badge }) => (
                  <div key={id} onClick={() => onNav('internships')} style={{ padding: 13, background: 'rgba(255,255,255,.02)', border: '1px solid var(--bd)', borderRadius: 11, cursor: 'pointer', transition: 'border-color .2s' }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(0,245,212,.3)'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--bd)'; }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--t1)' }}>{company}</div>
                        <div style={{ fontFamily: '"DM Mono"', fontSize: 11, color: 'var(--t4)', marginTop: 2 }}>{role}</div>
                      </div>
                      <Badge variant={badge}>{match}%</Badge>
                    </div>
                  </div>
                ))}
                {matches.length === 0 && !loading && <p style={{ fontSize: 12, color: 'var(--t4)', textAlign: 'center' }}>No matches found yet.</p>}
              </div>
            )}
          </div>
        </div>

        {/* Activity table */}
        <div style={{ background: 'var(--s1)', border: '1px solid var(--bd)', borderRadius: 16, padding: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div style={{ fontSize: 17, fontWeight: 800, color: 'var(--t1)' }}>Recent Activity</div>
            <span style={{ fontFamily: '"DM Mono"', fontSize: 11, color: 'var(--t4)' }}>Last 7 days</span>
          </div>
          <table className="tbl">
            <thead><tr><th>Activity</th><th>Type</th><th>Score</th><th>Date</th><th>Status</th></tr></thead>
            <tbody>
              {activity.map(row => (
                <tr key={row.id}>
                  <td style={{ color: 'var(--t1)', fontWeight: 600 }}>{row.test_name || 'Mock Test'}</td>
                  <td><Chip style={{ fontSize: 10 }}>{row.test_type || 'Technical'}</Chip></td>
                  <td style={{ color: 'var(--P)', fontWeight: 700 }}>{row.score} / {row.total}</td>
                  <td>{new Date(row.completed_at).toLocaleDateString()}</td>
                  <td><Badge variant="bg">Completed</Badge></td>
                </tr>
              ))}
              {activity.length === 0 && !loading && <tr><td colSpan="5" style={{ textAlign: 'center', color: 'var(--t4)' }}>No recent activity.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
