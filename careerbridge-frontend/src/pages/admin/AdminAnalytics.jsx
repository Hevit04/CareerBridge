import { useState, useEffect } from 'react'
import { Badge, Btn, Chip } from '../../components/UI'
import { IconReport } from '../../components/Icons'
import { api } from '../../api/api'
import { useToast } from '../../hooks/useToast'

export default function AdminAnalytics({ onNav }) {
  const toast = useToast()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedStudentId, setSelectedStudentId] = useState('')
  const [generating, setGenerating] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const studentsPerPage = 5

  useEffect(() => {
    api.admin.analytics()
      .then(setData)
      .catch(err => toast('❌ Failed to load analytics: ' + err.message))
      .finally(() => setLoading(false))
  }, [])

  const handleGenerateReport = async () => {
    if (!selectedStudentId) {
      toast('⚠️ Please select a student first')
      return
    }
    setGenerating(true)
    try {
      const blob = await api.admin.downloadStudentReport(selectedStudentId)
      const student = data?.student_performances?.find(s => s.id === parseInt(selectedStudentId))
      const name = student?.name?.replace(/\s+/g, '_') || 'Student'
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `CareerBridge_Report_${name}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      toast('📊 Report generated and downloaded!')
    } catch (err) {
      toast('❌ Failed to generate report: ' + err.message)
    } finally {
      setGenerating(false)
    }
  }

  const metrics = data ? [
    { k: 'Avg Test Score', v: data.avg_test_score + '%' },
    { k: 'Interview Avg', v: data.avg_interview_score + '%' },
    { k: 'Skill Gap Index', v: data.skill_gap_index + '%' },
    { k: 'Total Students', v: data.total_students },
  ] : [
    { k: 'Avg Test Score', v: '—' },
    { k: 'Interview Avg', v: '—' },
    { k: 'Skill Gap Index', v: '—' },
    { k: 'Total Students', v: '—' },
  ]

  return (
    <div className="admin-enter" style={{ maxWidth: 1180, margin: '0 auto', padding: '40px 28px 70px' }}>
      <Chip style={{ marginBottom: 12 }}>Admin - Analytics</Chip>
      <h1 style={{ fontFamily: '"Bebas Neue"', fontSize: 'clamp(2.4rem,4.8vw,4.8rem)', lineHeight: 1, marginBottom: 10 }}>
        MONITORING <span style={{ color: '#a78bfa' }}>&amp; ANALYTICS</span>
      </h1>
      <p style={{ color: 'var(--t2)', fontSize: 14, marginBottom: 18 }}>Track test scores, interview performance, skill gaps, and generate student reports.</p>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 14 }}>
        {metrics.map((m, idx) => (
          <div key={m.k} className="admin-panel admin-kpi" style={{ background: 'var(--s1)', border: '1px solid var(--bd)', borderRadius: 12, padding: 14, animationDelay: `${idx * 0.05}s` }}>
            <div style={{ fontFamily: '"DM Mono"', fontSize: 10, color: 'var(--t4)' }}>{m.k}</div>
            <div style={{ fontFamily: '"Bebas Neue"', fontSize: 34, color: 'var(--P)', lineHeight: 1 }}>{loading ? '…' : m.v}</div>
          </div>
        ))}
      </div>

      {/* Student-wise Performance Table */}
      <div className="admin-panel" style={{ background: 'var(--s1)', border: '1px solid var(--bd)', borderRadius: 16, padding: 20, marginTop: 14, animationDelay: '.24s' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <span style={{ fontWeight: 800, color: 'var(--t1)' }}>Student-wise Performance</span>
          <Badge variant="bb">Live Data</Badge>
        </div>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '30px 0', color: 'var(--t4)' }}>Loading data…</div>
        ) : (
          <table className="tbl">
            <thead><tr><th>Student</th><th>Enrollment</th><th>Avg Test</th><th>Interview</th><th>Primary Skill Gap</th></tr></thead>
            <tbody>
              {(data?.student_performances || [])
                .slice((currentPage - 1) * studentsPerPage, currentPage * studentsPerPage)
                .map((s, idx) => (
                <tr key={s.enrollment_no} className="admin-row" style={{ animationDelay: `${idx * 0.04}s` }}>
                  <td style={{ color: 'var(--t1)', fontWeight: 700 }}>{s.name}</td>
                  <td>{s.enrollment_no}</td>
                  <td>{s.avg_test_score}%</td>
                  <td>{s.avg_interview ? s.avg_interview + '%' : '—'}</td>
                  <td><Badge variant="by">{s.primary_gap}</Badge></td>
                </tr>
              ))}
              {!loading && data?.student_performances?.length === 0 && (
                <tr><td colSpan="5" style={{ textAlign: 'center', color: 'var(--t4)' }}>No student data yet.</td></tr>
              )}
            </tbody>
          </table>
        )}
        
        {!loading && data?.student_performances?.length > studentsPerPage && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginTop: 20 }}>
            <Btn variant="g" size="xs" disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}>Prev</Btn>
            {Array.from({ length: Math.ceil(data.student_performances.length / studentsPerPage) }, (_, i) => i + 1).map(page => (
              <Btn 
                key={page} 
                variant={currentPage === page ? 'p' : 'g'} 
                size="xs" 
                onClick={() => setCurrentPage(page)}
                style={{ minWidth: 32 }}
              >
                {page}
              </Btn>
            ))}
            <Btn variant="g" size="xs" disabled={currentPage === Math.ceil(data.student_performances.length / studentsPerPage)} onClick={() => setCurrentPage(p => p + 1)}>Next</Btn>
          </div>
        )}
      </div>

      {/* Generate Report Section */}
      <div className="admin-panel" style={{ background: 'var(--s1)', border: '1px solid var(--bd)', borderRadius: 16, padding: 20, marginTop: 14, animationDelay: '.32s' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
          <IconReport size={18} color="#a78bfa" />
          <span style={{ fontWeight: 800, color: 'var(--t1)' }}>Generate Student Report</span>
        </div>
        <p style={{ color: 'var(--t2)', fontSize: 13, marginBottom: 14, lineHeight: 1.6 }}>
          Select a student and generate their personalized CareerBridge readiness report — identical to what the student downloads from their own dashboard.
        </p>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <select
            value={selectedStudentId}
            onChange={e => setSelectedStudentId(e.target.value)}
            style={{
              flex: 1, minWidth: 240, padding: '10px 14px', fontSize: 13, fontFamily: 'Syne, sans-serif',
              background: 'var(--s2)', border: '1px solid var(--bd)', borderRadius: 10,
              color: selectedStudentId ? 'var(--t1)' : 'var(--t4)', cursor: 'pointer', outline: 'none',
            }}
          >
            <option value="">— Select a student —</option>
            {(data?.student_performances || []).map(s => (
              <option key={s.id} value={s.id}>{s.name} ({s.enrollment_no})</option>
            ))}
          </select>
          <Btn size="sm" disabled={generating || !selectedStudentId} onClick={handleGenerateReport}>
            {generating ? 'Generating…' : 'Generate Report ↓'}
          </Btn>
        </div>
      </div>

      <div style={{ marginTop: 14, display: 'flex', gap: 8 }}>
        <Btn variant="g" size="sm" onClick={() => onNav('admin')}>Back</Btn>
      </div>
    </div>
  )
}
