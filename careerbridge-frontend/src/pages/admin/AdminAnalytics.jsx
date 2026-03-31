import { Badge, Btn, Chip } from '../../components/UI'
import { IconReport } from '../../components/Icons'

const studentWise = [
  { name: 'Bhumika Jain', id: 'AU2340065', tests: 88, interview: 84, gap: 'System Design' },
  { name: 'Aarav Mehta', id: 'AU2340102', tests: 62, interview: 58, gap: 'Communication' },
  { name: 'Diya Shah', id: 'AU2340118', tests: 79, interview: 82, gap: 'Aptitude' },
  { name: 'Riya Patel', id: 'AU2340140', tests: 91, interview: 87, gap: 'Backend APIs' },
]

export default function AdminAnalytics({ onNav }) {
  return (
    <div className="admin-enter" style={{ maxWidth: 1180, margin: '0 auto', padding: '40px 28px 70px' }}>
      <Chip style={{ marginBottom: 12 }}>Admin - Analytics</Chip>
      <h1 style={{ fontFamily: '"Bebas Neue"', fontSize: 'clamp(2.4rem,4.8vw,4.8rem)', lineHeight: 1, marginBottom: 10 }}>
        MONITORING <span style={{ color: '#a78bfa' }}>& ANALYTICS</span>
      </h1>
      <p style={{ color: 'var(--t2)', fontSize: 14, marginBottom: 18 }}>Track test scores, interview performance, skill gaps, and generate system-wide reports.</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 14 }}>
        {[
          { k: 'Avg Test Score', v: '78.6' },
          { k: 'Interview Avg', v: '74.2' },
          { k: 'Skill Gap Index', v: '31%' },
          { k: 'Report Requests', v: '126' },
        ].map((m, idx) => (
          <div key={m.k} className="admin-panel admin-kpi" style={{ background: 'var(--s1)', border: '1px solid var(--bd)', borderRadius: 12, padding: 14, animationDelay: `${idx * 0.05}s` }}>
            <div style={{ fontFamily: '"DM Mono"', fontSize: 10, color: 'var(--t4)' }}>{m.k}</div>
            <div style={{ fontFamily: '"Bebas Neue"', fontSize: 34, color: 'var(--P)', lineHeight: 1 }}>{m.v}</div>
          </div>
        ))}
      </div>

      <div className="admin-panel" style={{ background: 'var(--s1)', border: '1px solid var(--bd)', borderRadius: 16, padding: 20, animationDelay: '.16s' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <IconReport size={18} color="#a78bfa" />
            <span style={{ fontWeight: 800, color: 'var(--t1)' }}>Performance Snapshot</span>
          </div>
          <Badge variant="bb">Live Data</Badge>
        </div>
        <p style={{ color: 'var(--t2)', fontSize: 13, lineHeight: 1.7 }}>
          Cohort A has the highest communication uplift (+9.4%), while system design remains the top skill-gap area across Year 3 profiles.
          Interview confidence scores improved 6.1% week-over-week.
        </p>
      </div>

      <div className="admin-panel" style={{ background: 'var(--s1)', border: '1px solid var(--bd)', borderRadius: 16, padding: 20, marginTop: 14, animationDelay: '.24s' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <span style={{ fontWeight: 800, color: 'var(--t1)' }}>Student-wise Performance</span>
          <Badge variant="bb">Detailed</Badge>
        </div>
        <table className="tbl">
          <thead><tr><th>Student</th><th>Enrollment</th><th>Avg Test</th><th>Interview</th><th>Primary Skill Gap</th></tr></thead>
          <tbody>
            {studentWise.map((s, idx) => (
              <tr key={s.id} className="admin-row" style={{ animationDelay: `${idx * 0.04}s` }}>
                <td style={{ color: 'var(--t1)', fontWeight: 700 }}>{s.name}</td>
                <td>{s.id}</td>
                <td>{s.tests}</td>
                <td>{s.interview}</td>
                <td><Badge variant="by">{s.gap}</Badge></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ marginTop: 14, display: 'flex', gap: 8 }}>
        <Btn size="sm" onClick={() => alert('System report generated')}>Generate Report</Btn>
        <Btn variant="g" size="sm" onClick={() => onNav('admin')}>Back</Btn>
      </div>
    </div>
  )
}
