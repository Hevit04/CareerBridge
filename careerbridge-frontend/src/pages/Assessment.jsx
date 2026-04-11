import { useState, useEffect, useRef } from 'react'
import { Chip, Badge, Btn } from '../components/UI'
import { IconBrain, IconCalculator, IconGear, IconBook } from '../components/Icons'
import { api } from '../api/api'

const getIconForType = (type) => {
  switch (type) {
    case 'Technical': return { icon: <IconBrain size={20} color="var(--P)" />, bg: 'rgba(0,245,212,.09)', border: 'rgba(0,245,212,.18)' }
    case 'Aptitude': return { icon: <IconCalculator size={20} color="var(--A)" />, bg: 'rgba(212,255,0,.07)', border: 'rgba(212,255,0,.16)' }
    case 'Communication': return { icon: <IconBook size={20} color="var(--E)" />, bg: 'rgba(255,77,109,.08)', border: 'rgba(255,77,109,.18)' }
    default: return { icon: <IconGear size={20} color="#a78bfa" />, bg: 'rgba(123,47,255,.1)', border: 'rgba(123,47,255,.22)' }
  }
}

export default function Assessment({ onNav, isLoggedIn }) {
  const [view, setView] = useState('home') // 'home' | 'quiz' | 'result'
  const [availableTests, setAvailableTests] = useState([])
  const [stats, setStats] = useState({ tests_done: 0, avg_score: 0, best_score: 0 })
  const [qs, setQs] = useState([])
  const [cur, setCur] = useState(0)
  const [answers, setAnswers] = useState([]) // objects: { question_id, answer_idx }
  const [selected, setSelected] = useState(null)
  const [secs, setSecs] = useState(1200)
  const [currentTest, setCurrentTest] = useState(null)
  const [finalResult, setFinalResult] = useState(null)
  const [generating, setGenerating] = useState(false)
  const timerRef = useRef(null)

  useEffect(() => {
    if (view === 'home') {
      api.assessments.list().then(setAvailableTests)
      api.assessments.stats().then(setStats)
    }
  }, [view])

  const startTest = async (test) => {
    setGenerating(true)
    try {
      const questionsData = await api.assessments.questions(test.id)
      setQs(questionsData)
      setCurrentTest(test)
      setCur(0)
      setAnswers([])
      setSelected(null)
      setSecs(test.duration_secs)
      setView('quiz')
    } catch (err) {
      alert("Failed to load test questions: " + err.message)
    } finally {
      setGenerating(false)
    }
  }

  useEffect(() => {
    if (view !== 'quiz') return
    timerRef.current = setInterval(() => {
      setSecs(s => {
        if (s <= 1) { clearInterval(timerRef.current); return 0 }
        return s - 1
      })
    }, 1000)
    return () => clearInterval(timerRef.current)
  }, [view])

  useEffect(() => {
    if (view === 'quiz' && secs === 0 && !generating) {
      setGenerating(true)
      api.assessments.submit({
        test_db_id: currentTest.id,
        answers,
        time_taken_secs: currentTest.duration_secs
      }).then(res => {
        setFinalResult(res)
        setView('result')
      }).catch(err => {
        alert("Failed to auto-submit test: " + err.message)
        setView('home')
      }).finally(() => {
        setGenerating(false)
      })
    }
  }, [secs, view, generating, currentTest, answers])

  const answerQ = (idx) => {
    setSelected(idx)
    setAnswers(prev => {
      const existingIdx = prev.findIndex(a => a.question_id === qs[cur].id)
      if (existingIdx > -1) {
        const updated = [...prev]
        updated[existingIdx] = { ...updated[existingIdx], answer_idx: idx }
        return updated
      }
      return [...prev, { question_id: qs[cur].id, answer_idx: idx }]
    })
  }

  const submitResults = async () => {
    clearInterval(timerRef.current)
    try {
      const res = await api.assessments.submit({
        test_db_id: currentTest.id,
        answers: answers,
        time_taken_secs: currentTest.duration_secs - secs
      })
      setFinalResult(res)
      setView('result')
    } catch (err) {
      alert("Failed to submit test: " + err.message)
      setView('home')
    }
  }

  const nextQ = () => {
    if (cur + 1 >= qs.length) {
      submitResults()
      return
    }
    setCur(c => c + 1)
    setSelected(null)
  }

  const exitQuiz = () => { clearInterval(timerRef.current); setView('home') }
  const mm = String(Math.floor(secs / 60)).padStart(2, '0')
  const ss = String(secs % 60).padStart(2, '0')

  return (
    <div className="admin-enter" style={{ maxWidth: view === 'home' ? 960 : 760, margin: '0 auto', padding: '40px 28px' }}>

      {/* Not logged in */}
      {!isLoggedIn && view === 'home' && (
        <div style={{ maxWidth: 600, margin: '0 auto 40px', textAlign: 'center' }}>
          <div style={{
            background: 'var(--s1)', border: '1px solid rgba(0,245,212,.2)', borderRadius: 16,
            padding: 36, animation: 'fadeUp .4s both'
          }}>
            <div style={{ fontSize: 40, marginBottom: 14 }}>🎯</div>
            <div style={{ fontFamily: '"Bebas Neue"', fontSize: 'clamp(1.8rem,3.5vw,3rem)', marginBottom: 8, color: 'var(--t1)' }}>
              Log In to Start Your Journey
            </div>
            <p style={{ fontSize: 14, color: 'var(--t2)', lineHeight: 1.7, marginBottom: 22 }}>
              Create a free account or log in to take skill assessments, get AI-graded results, and track your progress.
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Btn size="md" onClick={() => onNav('login')}>Log In →</Btn>
              <Btn variant="g" size="md" onClick={() => onNav('login')}>Create Account</Btn>
            </div>
          </div>
        </div>
      )}

      {/* Home */}
      {view === 'home' && <>
        <div className="admin-card" style={{ marginBottom: 32, animationDelay: '.03s' }}>
          <Chip style={{ marginBottom: 12 }}>Assessment Centre</Chip>
          <h1 style={{ fontFamily: '"Bebas Neue"', fontSize: 'clamp(2.5rem,5vw,5rem)', lineHeight: 1, marginBottom: 10 }}>
            SKILL <span style={{ color: 'var(--A)' }}>TESTS</span>
          </h1>
          <p style={{ fontSize: 14, color: 'var(--t2)' }}>Choose a domain to begin. All tests are auto-graded with instant AI feedback.</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 32 }}>
          {(() => {
            // Compute percentile: higher avg_score = better percentile (lower rank number)
            // e.g. avg 90% → top 10%, avg 80% → top 20%, etc.
            const percentileVal = stats.tests_done === 0
              ? null
              : Math.max(1, Math.round((100 - stats.avg_score) / 5) * 5)
            const percentileDisplay = percentileVal === null ? '—' : `Top ${percentileVal}%`
            return [
              { v: stats.tests_done, label: 'Tests Done', c: 'var(--P)' },
              { v: stats.avg_score ? stats.avg_score + '%' : '—', label: 'Avg. Score', c: 'var(--A)' },
              { v: stats.best_score ? stats.best_score + '%' : '—', label: 'Best Score', c: 'var(--E)' },
              { v: percentileDisplay, label: 'Percentile', c: '#a78bfa' },
            ].map(({ v, label, c }, idx) => (
              <div key={label} className="admin-panel admin-kpi" style={{ padding: 16, background: 'var(--s1)', border: '1px solid var(--bd)', borderRadius: 12, textAlign: 'center', animationDelay: `${0.08 + idx * 0.05}s` }}>
                <div style={{ fontFamily: '"Bebas Neue"', fontSize: 32, color: c }}>{v}</div>
                <div style={{ fontFamily: '"DM Mono"', fontSize: 11, color: 'var(--t4)' }}>{label}</div>
              </div>
            ))
          })()}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          {availableTests.map((t, idx) => {
            const { icon, bg, border } = getIconForType(t.type)
            return (
            <div key={t.id} className="admin-panel admin-row" onClick={() => startTest(t)} style={{ background: 'var(--s1)', border: '1px solid var(--bd)', borderRadius: 16, padding: 24, cursor: 'pointer', transition: 'all .25s', animationDelay: `${0.18 + idx * 0.05}s` }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(0,245,212,.2)'; e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 14px 42px rgba(0,0,0,.45)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--bd)'; e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                <div style={{ width: 48, height: 48, borderRadius: 12, background: bg, border: `1px solid ${border}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{icon}</div>
                <Badge variant={t.status === 'Active' ? 'bg' : 'by'}>{t.status}</Badge>
              </div>
              <div style={{ fontSize: 17, fontWeight: 800, color: 'var(--t1)', marginBottom: 6 }}>{t.title}</div>
              <p style={{ fontSize: 13, color: 'var(--t2)', marginBottom: 16 }}>{t.type} Assessment · <strong style={{ color: 'var(--t1)' }}>{t.total_questions} questions · {Math.round(t.duration_secs / 60)} mins</strong></p>
              <div style={{ height: 3, background: 'rgba(255,255,255,.07)', borderRadius: 4, overflow: 'hidden', marginBottom: 8 }}>
                <div className="pf" style={{ transform: `scaleX(${t.status === 'Active' ? 1 : 0.5})`, transition: 'none' }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontFamily: '"DM Mono"', fontSize: 12, color: 'var(--t4)' }}>
                  Cadence: {t.cadence}
                </span>
                <Btn size="xs">Start Test →</Btn>
              </div>
            </div>
            )
          })}
        </div>
      </>}

      {/* Quiz */}
      {view === 'quiz' && qs.length > 0 && <>
        <div className="admin-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
          <Btn variant="g" size="sm" onClick={exitQuiz}>← Exit Test</Btn>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div className="pulse-dot" style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--E)' }} />
              <span style={{ fontFamily: '"DM Mono"', fontSize: 12, color: 'var(--t4)' }}>{mm}:{ss}</span>
            </div>
            <Chip>Q {cur + 1} / {qs.length}</Chip>
          </div>
        </div>
        <div style={{ height: 5, background: 'rgba(255,255,255,.07)', borderRadius: 4, overflow: 'hidden', marginBottom: 28 }}>
          <div className="pf" style={{ transform: `scaleX(${(cur + 1) / qs.length})`, transition: 'transform .5s ease' }} />
        </div>
        <div className="admin-panel" style={{ background: 'var(--s1)', border: '1px solid var(--bd)', borderRadius: 16, padding: 28, marginBottom: 18, animationDelay: '.06s' }}>
          <div style={{ fontFamily: '"DM Mono"', fontSize: 12, color: 'var(--P)', marginBottom: 10 }}>Assessment</div>
          <p style={{ fontSize: 18, fontWeight: 700, lineHeight: 1.55, color: 'var(--t1)' }}>{qs[cur].question}</p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
          {qs[cur].options.map((o, i) => {
            let cls = 'qopt'
            if (i === selected) cls += ' sel'
            return (
              <div key={i} className={`${cls} admin-row`} style={{ animationDelay: `${i * 0.04}s` }} onClick={() => answerQ(i)}>
                <div style={{ width: 30, height: 30, minWidth: 30, borderRadius: '50%', border: '1px solid var(--bd)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: '"DM Mono"', fontSize: 11, background: i === selected ? 'var(--P)' : 'transparent', color: i === selected ? 'var(--bg)' : 'inherit', borderColor: i === selected ? 'transparent' : 'var(--bd)' }}>{'ABCD'[i]}</div>
                <span>{o}</span>
              </div>
            )
          })}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontFamily: '"DM Mono"', fontSize: 12, color: 'var(--t4)' }}>Question {cur + 1} of {qs.length}</span>
          <Btn disabled={selected === null} onClick={nextQ}>{cur + 1 === qs.length ? 'Submit Test →' : 'Next Question →'}</Btn>
        </div>
      </>}

      {/* Result */}
      {view === 'result' && finalResult && (() => {
        const { score, total, percentage, breakdown } = finalResult
        return (
          <div className="admin-enter" style={{ maxWidth: 540, margin: '0 auto', textAlign: 'center' }}>
            <div style={{ marginBottom: 14 }}>
              <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="var(--A)" strokeWidth="1.5"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/></svg>
            </div>
            <div style={{ fontFamily: '"Bebas Neue"', fontSize: 'clamp(1.8rem,3.5vw,3rem)', marginBottom: 8 }}>TEST COMPLETE!</div>
            <div style={{ fontFamily: '"Bebas Neue"', fontSize: 80, lineHeight: 1, margin: '16px 0', background: percentage >= 80 ? 'linear-gradient(135deg,var(--P),var(--A))' : percentage >= 60 ? 'linear-gradient(135deg,var(--A),var(--E))' : 'linear-gradient(135deg,var(--E),var(--N))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{score}/{total}</div>
            <p style={{ fontSize: 15, color: 'var(--t2)', marginBottom: 28 }}>{percentage >= 80 ? "Excellent! You're in the top 10% of test-takers." : percentage >= 60 ? "Good work! A little more practice and you'll ace it." : 'Keep going — review weak areas and try again.'}</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 28 }}>
              {[{ v: percentage + '%', l: 'Score', c: 'var(--P)' }, { v: total - score, l: 'Wrong', c: 'var(--A)' }, { v: percentage >= 80 ? 'A' : percentage >= 60 ? 'B' : 'C', l: 'Grade', c: 'var(--E)' }].map(({ v, l, c }) => (
                <div key={l} style={{ padding: 14, background: 'var(--s2)', border: '1px solid var(--bd)', borderRadius: 10, textAlign: 'center' }}>
                  <div style={{ fontFamily: '"Bebas Neue"', fontSize: 34, color: c }}>{v}</div>
                  <div style={{ fontFamily: '"DM Mono"', fontSize: 11, color: 'var(--t4)' }}>{l}</div>
                </div>
              ))}
            </div>
            
            <div style={{ textAlign: 'left', marginBottom: 28 }}>
                <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--t1)', marginBottom: 14 }}>Detailed Review</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {breakdown.map((item, i) => (
                        <div key={i} style={{ padding: 16, background: 'var(--s1)', border: '1px solid var(--bd)', borderRadius: 12 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                                <span style={{ fontFamily: '"DM Mono"', fontSize: 11, color: item.is_correct ? 'var(--P)' : 'var(--E)' }}>{item.is_correct ? 'CORRECT' : 'INCORRECT'}</span>
                                <span style={{ fontFamily: '"DM Mono"', fontSize: 11, color: 'var(--t4)' }}>Q {i+1}</span>
                            </div>
                            <p style={{ fontSize: 14, color: 'var(--t1)', fontWeight: 600, marginBottom: 8 }}>{item.question}</p>
                            <p style={{ fontSize: 13, color: 'var(--t2)', fontStyle: 'italic' }}>{item.explanation}</p>
                        </div>
                    ))}
                </div>
            </div>

            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Btn variant="g" size="md" onClick={exitQuiz}>Try Another Test</Btn>
              <Btn size="md" onClick={() => { exitQuiz() }}>Back to Home</Btn>
            </div>
          </div>
        )
      })()}
    </div>
  )
}
