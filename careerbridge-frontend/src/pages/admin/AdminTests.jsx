import { useState, useEffect } from 'react'
import { Badge, Btn, Chip } from '../../components/UI'
import { IconBrain, IconCalendar, IconUser } from '../../components/Icons'
import { api } from '../../api/api'
import { useToast } from '../../hooks/useToast'

export default function AdminTests({ onNav }) {
  const toast = useToast()
  const [tests, setTests] = useState([])
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState('list') // 'list' | 'questions'
  const [activeTest, setActiveTest] = useState(null)
  const [questions, setQuestions] = useState([])
  const [editingId, setEditingId] = useState(null)
  
  const [form, setForm] = useState({ 
    title: '', 
    type: 'Technical', 
    total_questions: 10, 
    duration_secs: 1200, 
    points_per_question: 10,
    cadence: 'Weekly', 
    status: 'Draft' 
  })

  const [qForm, setQForm] = useState({
    question: '',
    options: ['', '', '', ''],
    answer_idx: 0,
    explanation: '',
    domain: '',
    order: 0
  })

  const [sortKey, setSortKey] = useState('id')
  const [sortOrder, setSortOrder] = useState('desc')

  const fetchTests = async () => {
    try {
      const data = await api.admin.tests.list()
      setTests(data)
    } catch (err) {
      toast('❌ Error fetching tests: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTests()
  }, [])

  const sortedTests = [...tests].sort((a, b) => {
    const valA = a[sortKey] ? a[sortKey].toString().toLowerCase() : ''
    const valB = b[sortKey] ? b[sortKey].toString().toLowerCase() : ''
    if (valA < valB) return sortOrder === 'asc' ? -1 : 1
    if (valA > valB) return sortOrder === 'asc' ? 1 : -1
    return 0
  })

  const groups = {
    Active: sortedTests.filter(t => t.status === 'Active'),
    Draft: sortedTests.filter(t => t.status === 'Draft' || t.status === 'Paused'),
    Archived: sortedTests.filter(t => t.status === 'Archived')
  }

  const addTest = async () => {
    if (!form.title.trim()) return
    try {
      await api.admin.tests.create(form)
      toast('✅ Test created successfully')
      fetchTests()
      setForm({ title: '', type: 'Technical', total_questions: 10, duration_secs: 1200, points_per_question: 10, cadence: 'Weekly', status: 'Draft' })
    } catch (err) {
      toast('❌ Create failed: ' + err.message)
    }
  }

  const deleteTest = async (id) => {
    if (!window.confirm('Are you sure you want to delete this test?')) return
    try {
      await api.admin.tests.delete(id)
      toast('🗑️ Test deleted')
      fetchTests()
    } catch (err) {
      toast('❌ Delete failed: ' + err.message)
    }
  }

  const cycleStatus = async (testId, currentStatus) => {
    const order = ['Draft', 'Active', 'Paused', 'Archived']
    const nextIndex = (order.indexOf(currentStatus) + 1) % order.length
    const nextStatus = order[nextIndex]
    try {
      await api.admin.tests.update(testId, { status: nextStatus })
      fetchTests()
    } catch (err) {
      toast('❌ Update failed: ' + err.message)
    }
  }

  // Question Management
  const manageBank = async (test) => {
    setActiveTest(test)
    setLoading(true)
    try {
      const qs = await api.admin.questions.list(test.id)
      setQuestions(qs)
      setView('questions')
    } catch (err) {
      toast('❌ Error fetching questions: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const startEditQuestion = (q) => {
    setEditingId(q.id)
    setQForm({
      question: q.question,
      options: [...q.options],
      answer_idx: q.answer_idx,
      explanation: q.explanation || '',
      domain: q.domain || activeTest.type.toLowerCase(),
      order: q.order || 0
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const saveQuestion = async () => {
    if (!qForm.question.trim()) return
    try {
      if (editingId) {
        await api.admin.questions.update(activeTest.id, editingId, qForm)
        toast('✅ Question updated')
      } else {
        await api.admin.questions.add(activeTest.id, qForm)
        toast('✅ Question added')
      }
      const qs = await api.admin.questions.list(activeTest.id)
      setQuestions(qs)
      setQForm({ question: '', options: ['', '', '', ''], answer_idx: 0, explanation: '', domain: activeTest.type.toLowerCase(), order: qs.length })
      setEditingId(null)
    } catch (err) {
      toast('❌ Failed: ' + err.message)
    }
  }

  const deleteQuestion = async (qId) => {
    try {
      await api.admin.questions.delete(activeTest.id, qId)
      toast('🗑️ Question removed')
      const qs = await api.admin.questions.list(activeTest.id)
      setQuestions(qs)
    } catch (err) {
      toast('❌ Delete failed: ' + err.message)
    }
  }

  if (view === 'questions' && activeTest) {
    return (
      <div className="admin-enter" style={{ maxWidth: 1000, margin: '0 auto', padding: '40px 28px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div>
            <Btn variant="g" size="xs" onClick={() => { setView('list'); setEditingId(null); }}>← Back to Tests</Btn>
            <h2 style={{ fontFamily: '"Bebas Neue"', fontSize: 32, marginTop: 10 }}>BANK: {activeTest.title}</h2>
          </div>
          <Badge variant="bb">{questions.length} Questions</Badge>
        </div>

        <div className="admin-panel" style={{ background: 'var(--s1)', border: '1px solid var(--bd)', borderRadius: 14, padding: 20, marginBottom: 24 }}>
          <div style={{ fontWeight: 800, marginBottom: 16 }}>{editingId ? 'Edit Question' : 'Add New Question'}</div>
          <textarea
            className="inp"
            placeholder="Question Text"
            value={qForm.question}
            onChange={e => setQForm({...qForm, question: e.target.value})}
            style={{ width: '100%', minHeight: 80, marginBottom: 12, padding: 12 }}
          />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
            {qForm.options.map((opt, i) => (
              <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <input 
                  type="radio" 
                  name="ans" 
                  checked={qForm.answer_idx === i} 
                  onChange={() => setQForm({...qForm, answer_idx: i})} 
                />
                <input
                  className="inp"
                  placeholder={`Option ${String.fromCharCode(65 + i)}`}
                  value={opt}
                  onChange={e => {
                    const newOpts = [...qForm.options]
                    newOpts[i] = e.target.value
                    setQForm({...qForm, options: newOpts})
                  }}
                />
              </div>
            ))}
          </div>
          <input
            className="inp"
            placeholder="Explanation (Optional)"
            value={qForm.explanation}
            onChange={e => setQForm({...qForm, explanation: e.target.value})}
            style={{ width: '100%', marginBottom: 12 }}
          />
          <div style={{ display: 'flex', gap: 10 }}>
            <Btn size="md" onClick={saveQuestion}>{editingId ? 'Update Question' : 'Add Question to Bank'}</Btn>
            {editingId && <Btn variant="g" size="md" onClick={() => { setEditingId(null); setQForm({ question: '', options: ['', '', '', ''], answer_idx: 0, explanation: '', domain: activeTest.type.toLowerCase(), order: questions.length }); }}>Cancel</Btn>}
          </div>
        </div>

        <div style={{ display: 'grid', gap: 12 }}>
          {questions.map((q, i) => (
            <div key={q.id} style={{ background: 'var(--s2)', padding: 16, borderRadius: 12, border: '1px solid var(--bd)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div style={{ fontWeight: 700, marginBottom: 8 }}>{i + 1}. {q.question}</div>
                <div style={{ display: 'flex', gap: 12 }}>
                    <button onClick={() => startEditQuestion(q)} style={{ color: 'var(--P)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 700 }}>Edit</button>
                    <button onClick={() => deleteQuestion(q.id)} style={{ color: 'var(--E)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 700 }}>Delete</button>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                {q.options.map((opt, idx) => (
                  <div key={idx} style={{ fontSize: 13, color: idx === q.answer_idx ? 'var(--bg)' : 'var(--t2)', background: idx === q.answer_idx ? 'var(--P)' : 'rgba(255,255,255,.03)', padding: '4px 8px', borderRadius: 4 }}>
                    {String.fromCharCode(65 + idx)}) {opt}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="admin-enter" style={{ maxWidth: 1180, margin: '0 auto', padding: '40px 28px 70px' }}>
      <Chip style={{ marginBottom: 12 }}>Admin - Tests & Interviews</Chip>
      <h1 style={{ fontFamily: '"Bebas Neue"', fontSize: 'clamp(2.4rem,4.8vw,4.8rem)', lineHeight: 1, marginBottom: 10 }}>
        TEST <span style={{ color: 'var(--A)' }}>OPERATIONS</span>
      </h1>
      <p style={{ color: 'var(--t2)', fontSize: 14, marginBottom: 18 }}>Create/update/delete test sets, manage question banks, and schedule mock interviews.</p>

      <div className="admin-panel" style={{ background: 'var(--s1)', border: '1px solid var(--bd)', borderRadius: 14, padding: 16, marginBottom: 14, animationDelay: '.05s' }}>
        <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--t1)', marginBottom: 10 }}>Create Test</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr .8fr .4fr .6fr .5fr .6fr .5fr auto', gap: 8 }}>
          <div>
            <label style={{ fontSize: 10, color: 'var(--t4)', display: 'block', marginBottom: 4 }}>TITLE</label>
            <input
              className="inp"
              placeholder="Test title"
              value={form.title}
              onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
            />
          </div>
          <div>
            <label style={{ fontSize: 10, color: 'var(--t4)', display: 'block', marginBottom: 4 }}>TYPE</label>
            <select className="inp" value={form.type} onChange={(e) => setForm((p) => ({ ...p, type: e.target.value }))}>
              <option>Technical</option>
              <option>Aptitude</option>
              <option>Communication</option>
            </select>
          </div>
          <div>
            <label style={{ fontSize: 10, color: 'var(--t4)', display: 'block', marginBottom: 4 }}>QS</label>
            <input
              className="inp"
              type="number"
              placeholder="Q"
              value={form.total_questions}
              onChange={(e) => setForm((p) => ({ ...p, total_questions: e.target.value }))}
            />
          </div>
          <div>
            <label style={{ fontSize: 10, color: 'var(--t4)', display: 'block', marginBottom: 4 }}>DUR (S)</label>
            <input
              className="inp"
              type="number"
              placeholder="Secs"
              value={form.duration_secs}
              onChange={(e) => setForm((p) => ({ ...p, duration_secs: e.target.value }))}
            />
          </div>
          <div>
            <label style={{ fontSize: 10, color: 'var(--t4)', display: 'block', marginBottom: 4 }}>POINTS</label>
            <input
              className="inp"
              type="number"
              placeholder="Pts"
              value={form.points_per_question}
              onChange={(e) => setForm((p) => ({ ...p, points_per_question: e.target.value }))}
            />
          </div>
          <div>
            <label style={{ fontSize: 10, color: 'var(--t4)', display: 'block', marginBottom: 4 }}>CADENCE</label>
            <select className="inp" value={form.cadence} onChange={(e) => setForm((p) => ({ ...p, cadence: e.target.value }))}>
              <option>Daily</option>
              <option>Weekly</option>
              <option>Mon/Wed/Fri</option>
              <option>Tue/Thu</option>
            </select>
          </div>
          <div>
            <label style={{ fontSize: 10, color: 'var(--t4)', display: 'block', marginBottom: 4 }}>STATUS</label>
            <select className="inp" value={form.status} onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))}>
              <option>Draft</option>
              <option>Active</option>
              <option>Paused</option>
            </select>
          </div>
          <div style={{ alignSelf: 'end' }}>
            <Btn size="sm" onClick={addTest}>Create</Btn>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 18, alignItems: 'center' }}>
        <div style={{ fontFamily: '"DM Mono"', fontSize: 11, color: 'var(--t4)' }}>SORTED BY:</div>
        <Btn variant={sortKey === 'title' ? 'p' : 'g'} size="xs" onClick={() => { setSortKey('title'); setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc') }}>Title</Btn>
        <Btn variant={sortKey === 'type' ? 'p' : 'g'} size="xs" onClick={() => { setSortKey('type'); setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc') }}>Type</Btn>
        <Btn variant={sortKey === 'id' ? 'p' : 'g'} size="xs" onClick={() => { setSortKey('id'); setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc') }}>ID</Btn>
      </div>

      <div style={{ display: 'grid', gap: 30 }}>
        {Object.entries(groups).map(([groupName, groupItems], gIdx) => (
          <div key={groupName} style={{ animationDelay: `${gIdx * 0.1}s`, animation: 'fadeUp .4s both' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                <div style={{ width: 4, height: 20, background: groupName === 'Active' ? '#4ade80' : groupName === 'Archived' ? 'var(--E)' : 'var(--P)', borderRadius: 10 }}></div>
                <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--t1)' }}>{groupName} Tests ({groupItems.length})</div>
            </div>
            
            {groupItems.length === 0 ? (
                <div style={{ padding: '20px', background: 'rgba(255,255,255,0.02)', border: '1px dashed var(--bd)', borderRadius: 12, color: 'var(--t4)', fontSize: 13, textAlign: 'center' }}>
                    No {groupName.toLowerCase()} tests found.
                </div>
            ) : (
                <div style={{ display: 'grid', gap: 12 }}>
                    {groupItems.map((t, idx) => (
                    <div key={t.id} className="admin-panel admin-row" style={{ background: 'var(--s1)', border: '1px solid var(--bd)', borderRadius: 14, padding: 16 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <IconBrain size={16} color="var(--P)" />
                            <span style={{ fontWeight: 700, color: 'var(--t1)' }}>{t.title}</span>
                        </div>
                        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                            <Badge variant="bb">{t.total_questions} Questions</Badge>
                            <Badge variant={t.status === 'Active' ? 'bg' : t.status === 'Draft' ? 'by' : t.status === 'Archived' ? 'br' : 'by'}>{t.status}</Badge>
                        </div>
                        </div>
                        <div style={{ color: 'var(--t3)', fontSize: 12, marginBottom: 10 }}>
                        ID: {t.id} · Type: {t.type} · Duration: {Math.floor(t.duration_secs / 60)}m · Points/Q: {t.points_per_question}
                        </div>
                        <div style={{ display: 'flex', gap: 8 }}>
                        <div className="admin-action"><Btn variant="g" size="xs" onClick={() => manageBank(t)}>Manage Question Bank</Btn></div>
                        <div className="admin-action"><Btn variant="g" size="xs" onClick={() => cycleStatus(t.id, t.status)}>Change Status</Btn></div>
                        <div className="admin-action"><Btn variant="e" size="xs" onClick={() => deleteTest(t.id)}>Delete Test</Btn></div>
                        </div>
                    </div>
                    ))}
                </div>
            )}
          </div>
        ))}
      </div>

      <div style={{ marginTop: 14 }}>
        <Btn variant="g" size="sm" onClick={() => onNav('admin')}>Back To Admin Home</Btn>
      </div>
    </div>
  )
}
