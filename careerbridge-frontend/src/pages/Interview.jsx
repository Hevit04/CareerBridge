import { useState, useRef, useEffect } from 'react'
import { Chip, Badge, Btn } from '../components/UI'
import { IconBrain, IconGear, IconUser } from '../components/Icons'
import { api } from '../api/api'

export default function Interview({ onNav, isLoggedIn }) {
  const [view, setView] = useState('home')
  const [sessionType, setSessionType] = useState(null)
  const [qi, setQi] = useState(0)
  const [secs, setSecs] = useState(0)
  const [answer, setAnswer] = useState('')
  const [stats, setStats] = useState({ sessions_completed: 0, avg_score: 0, avg_comm_score: 0 })
  const [sessions, setSessions] = useState([])
  const [questions, setQuestions] = useState([])
  const [sessionId, setSessionId] = useState(null)
  const [isRecording, setIsRecording] = useState(false)
  const timerRef = useRef(null)
  const recognitionRef = useRef(null)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US'; // Help it understand English better

        recognition.onresult = (event) => {
          let finalTranscript = '';
          for (let i = 0; i < event.results.length; i++) {
            // Add a space after final results so words don't get mashed together
            finalTranscript += event.results[i][0].transcript + (event.results[i].isFinal ? ' ' : '');
          }
          setAnswer(finalTranscript);
        };

        recognition.onerror = (event) => {
          console.error("Speech recognition error", event.error);
          setIsRecording(false);
        };
        
        recognition.onend = () => {
          setIsRecording(false);
        };

        recognitionRef.current = recognition;
      }
    }
    
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const toggleRecording = () => {
    if (!recognitionRef.current) {
      alert("Speech recognition is not supported in this browser.")
      return
    }
    
    if (isRecording) {
      recognitionRef.current.stop()
      setIsRecording(false)
    } else {
      setAnswer('')
      try {
        recognitionRef.current.start()
        setIsRecording(true)
      } catch (e) {
        console.error(e)
      }
    }
  }

  useEffect(() => {
    if (view === 'home' && isLoggedIn) {
      api.interviews.stats().then(setStats).catch(console.error)
      api.interviews.sessions().then(setSessions).catch(console.error)
    }
  }, [view, isLoggedIn])

  const startSession = async (type) => {
    if (!isLoggedIn) {
      onNav('login')
      return
    }
    try {
      const res = await api.interviews.start({ session_type: type })
      setSessionId(res.id)
      setQuestions(res.questions)
      setSessionType(type)
      setQi(0)
      setSecs(0)
      setAnswer('')
      setView('session')
    } catch (e) {
      alert(e.message)
    }
  }

  useEffect(() => {
    if (view !== 'session') return

    timerRef.current = setInterval(() => setSecs(s => s + 1), 1000)

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }
  }, [view])

  // Speak the question when it changes
  useEffect(() => {
    if (view === 'session' && questions[qi]) {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(questions[qi]);
        utterance.lang = 'en-US';
        utterance.rate = 1.0;
        window.speechSynthesis.speak(utterance);
      }
    }
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    }
  }, [view, qi, questions])

  const mm = String(Math.floor(secs / 60)).padStart(2, '0')
  const ss = String(secs % 60).padStart(2, '0')
  const q = questions[qi]

  const submit = async () => {
    if (!q) return;
    try {
      await api.interviews.submitResponse({
        session_id: sessionId,
        question: q,
        answer: answer,
        order: qi
      })
      if (qi + 1 >= questions.length) {
        if (timerRef.current) {
          clearInterval(timerRef.current)
          timerRef.current = null
        }
        await api.interviews.complete({ session_id: sessionId, duration_secs: secs })
        setView('home')
        alert('Session complete! Your report is ready.')
        return
      }
      setQi(qi + 1)
      setAnswer('')
    } catch (e) {
      alert("Error: " + e.message)
    }
  }

  return (
    <div className="admin-enter" style={{ maxWidth: 1000, margin: '0 auto', padding: '40px 28px' }}>
      {view === 'home' && (
        <>
          <div className="admin-card" style={{ marginBottom: 32, animationDelay: '.03s' }}>
            <Chip style={{ marginBottom: 12 }}>Interview Lab</Chip>
            <h1 style={{ fontFamily: '"Bebas Neue"', fontSize: 'clamp(2.5rem,5vw,5rem)', lineHeight: 1, marginBottom: 10 }}>
              MOCK <span style={{ color: 'var(--E)' }}>INTERVIEWS</span>
            </h1>
            <p style={{ fontSize: 14, color: 'var(--t2)' }}>Practice with AI-powered sessions. Scored feedback on every answer.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, marginBottom: 32 }}>
            {[
              { label: 'Sessions Completed', val: stats.sessions_completed || '0', sub: 'Keep practicing' },
              { label: 'Avg. Interview Score', val: stats.avg_score || '0', sub: 'Out of 100', subColor: '#4ade80' },
              { label: 'Communication Score', val: stats.avg_comm_score || '0', sub: 'Out of 100', subColor: 'var(--A)' },
            ].map((s, idx) => (
              <div key={s.label} className="admin-panel admin-kpi" style={{ padding: 20, background: 'var(--s1)', border: '1px solid var(--bd)', borderRadius: 14, animationDelay: `${0.08 + idx * 0.05}s` }}>
                <div style={{ fontFamily: '"DM Mono"', fontSize: 11, color: 'var(--t4)', marginBottom: 6 }}>{s.label}</div>
                <div style={{ fontFamily: '"Bebas Neue"', fontSize: 40, color: 'var(--P)', lineHeight: 1 }}>{s.val}</div>
                <div style={{ fontSize: 13, fontWeight: 700, marginTop: 6, color: s.subColor || 'var(--t2)' }}>{s.sub}</div>
              </div>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, marginBottom: 28 }}>
            {[
              { icon: <IconBrain size={22} color="var(--P)" />, iconBg: 'rgba(0,245,212,.08)', iconBorder: 'rgba(0,245,212,.2)', type: 'technical', title: 'Technical Round', desc: 'DSA, coding, systems. 5 questions · 45 min session.', avg: '74%', done: '3' },
              { icon: <IconUser size={22} color="var(--A)" />, iconBg: 'rgba(212,255,0,.07)', iconBorder: 'rgba(212,255,0,.2)', type: 'hr', title: 'HR Round', desc: 'Behavioral & situational questions. Tone, confidence scored.', avg: '82%', done: '4' },
              { icon: <IconGear size={22} color="#a78bfa" />, iconBg: 'rgba(123,47,255,.1)', iconBorder: 'rgba(123,47,255,.25)', type: 'system', title: 'System Design', desc: 'Whiteboard-style architecture. Scalability evaluated.', avg: '61%', done: '1' },
            ].map((s, idx) => (
              <div key={s.type}
                className="admin-panel admin-row"
                onClick={() => startSession(s.type)}
                style={{
                  padding: 22, cursor: 'pointer', border: '1px solid var(--bd)', borderRadius: 16,
                  background: 'var(--s1)', transition: 'all .25s cubic-bezier(.34,1.2,.64,1)', animationDelay: `${0.18 + idx * 0.05}s`,
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = 'rgba(0,245,212,.22)'
                  e.currentTarget.style.transform = 'translateY(-3px)'
                  e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,.4)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = 'var(--bd)'
                  e.currentTarget.style.transform = ''
                  e.currentTarget.style.boxShadow = ''
                }}>
                <div style={{ width: 52, height: 52, borderRadius: 14, background: s.iconBg, border: `1px solid ${s.iconBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
                  {s.icon}
                </div>
                <div style={{ fontSize: 17, fontWeight: 800, marginBottom: 6, color: 'var(--t1)' }}>{s.title}</div>
                <p style={{ fontSize: 13, color: 'var(--t2)', marginBottom: 16, lineHeight: 1.6 }}>{s.desc}</p>
                <div style={{ fontFamily: '"DM Mono"', fontSize: 12, marginBottom: 14 }}>
                  Avg: <span style={{ color: 'var(--P)' }}>{s.avg}</span> · <span style={{ color: 'var(--t2)' }}>{s.done} sessions done</span>
                </div>
                <Btn style={{ width: '100%' }}>Start Session →</Btn>
              </div>
            ))}
          </div>

          <div className="admin-panel" style={{ background: 'var(--s1)', border: '1px solid var(--bd)', borderRadius: 16, padding: 24, animationDelay: '.3s' }}>
            <div style={{ fontSize: 17, fontWeight: 800, marginBottom: 16, color: 'var(--t1)' }}>Past Sessions</div>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ fontFamily: '"DM Mono"', fontSize: 10, color: 'var(--t4)', textAlign: 'left', padding: '10px 16px', borderBottom: '1px solid var(--bd)', textTransform: 'uppercase', letterSpacing: '.08em' }}>Session</th>
                  <th style={{ fontFamily: '"DM Mono"', fontSize: 10, color: 'var(--t4)', textAlign: 'left', padding: '10px 16px', borderBottom: '1px solid var(--bd)', textTransform: 'uppercase', letterSpacing: '.08em' }}>Type</th>
                  <th style={{ fontFamily: '"DM Mono"', fontSize: 10, color: 'var(--t4)', textAlign: 'left', padding: '10px 16px', borderBottom: '1px solid var(--bd)', textTransform: 'uppercase', letterSpacing: '.08em' }}>Score</th>
                  <th style={{ fontFamily: '"DM Mono"', fontSize: 10, color: 'var(--t4)', textAlign: 'left', padding: '10px 16px', borderBottom: '1px solid var(--bd)', textTransform: 'uppercase', letterSpacing: '.08em' }}>Comm.</th>
                </tr>
              </thead>
              <tbody>
                {sessions.map((row, idx) => (
                  <tr key={row.id} className="admin-row" style={{ borderBottom: '1px solid rgba(255,255,255,.03)', animationDelay: `${idx * 0.05}s` }}>
                    <td style={{ padding: '13px 16px', fontSize: 14, color: 'var(--t1)', fontWeight: 600 }}>{row.session_type.toUpperCase()} Interview</td>
                    <td style={{ padding: '13px 16px', fontSize: 14, color: 'var(--t2)' }}><Chip style={{ fontSize: 10 }}>{row.session_type}</Chip></td>
                    <td style={{ padding: '13px 16px', fontSize: 14, color: 'var(--P)', fontWeight: 700 }}>{row.overall_score || '--'}/100</td>
                    <td style={{ padding: '13px 16px', fontSize: 14, color: '#4ade80', fontWeight: 600 }}>{row.communication_score || '--'}</td>
                  </tr>
                ))}
                {sessions.length === 0 && (
                   <tr><td colSpan="4" style={{ textAlign: 'center', padding: 20, color: 'var(--t4)' }}>No past sessions.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {view === 'session' && (!q || questions.length === 0) && (
        <div className="admin-card" style={{ padding: 30, textAlign: 'center', marginBottom: 24 }}>
          <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>Session failed to start</div>
          <p style={{ color: 'var(--t4)', marginBottom: 16 }}>No questions available right now. Please return to the interview home and try again.</p>
          <Btn size="sm" onClick={() => { setView('home'); setSessionType(null); setQuestions([]); setQi(0); setAnswer('') }}>← Back to Mock Interview</Btn>
        </div>
      )}

      {view === 'session' && q && (
        <>
          <div className="admin-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <Btn variant="g" size="sm" onClick={() => setView('home')}>← End Session</Btn>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--E)', animation: 'pulse 1s infinite' }} />
                <span style={{ fontFamily: '"DM Mono"', fontSize: 11, color: 'var(--E)', fontWeight: 600 }}>LIVE SESSION</span>
              </div>
              <Chip>{mm}:{ss}</Chip>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 18 }}>
            <div>
              <div className="admin-panel" style={{ background: 'var(--s1)', border: '1px solid var(--bd)', borderRadius: 16, padding: 28, marginBottom: 16, animationDelay: '.06s' }}>
                <div style={{ fontFamily: '"DM Mono"', fontSize: 12, color: 'var(--P)', marginBottom: 10 }}>
                  {sessionType.toUpperCase()} · Q{qi + 1} of {questions.length}
                </div>
                <p style={{ fontSize: 18, fontWeight: 700, lineHeight: 1.55, color: 'var(--t1)' }}>{q}</p>
              </div>
              <div className="admin-panel" style={{ background: 'var(--s1)', border: '1px solid var(--bd)', borderRadius: 16, padding: 22, animationDelay: '.1s' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                  <span style={{ fontWeight: 700, fontSize: 14, color: 'var(--t1)' }}>Your Response</span>
                  <Btn 
                    size="xs" 
                    variant={isRecording ? "e" : "p"} 
                    onClick={toggleRecording}
                  >
                    {isRecording ? '⏹ Stop Recording' : '🎤 Speak Answer'}
                  </Btn>
                </div>
                <textarea
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  placeholder="Type your answer here…"
                  style={{
                    width: '100%', minHeight: 130, padding: '12px 16px', background: 'var(--s2)',
                    border: '1px solid var(--bd)', borderRadius: 10, color: 'var(--t1)', fontFamily: 'Syne, sans-serif',
                    fontSize: 14, outline: 'none', resize: 'vertical',
                  }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
                  <span style={{ fontFamily: '"DM Mono"', fontSize: 12, color: 'var(--t4)' }}>
                    {answer.trim().split(/\s+/).filter(x => x).length} words
                  </span>
                  <Btn size="md" onClick={submit}>Submit Answer →</Btn>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div className="admin-panel" style={{ background: 'var(--s1)', border: '1px solid var(--bd)', borderRadius: 16, padding: 18, animationDelay: '.14s' }}>
                <div style={{ fontFamily: '"DM Mono"', fontSize: 11, color: 'var(--t4)', marginBottom: 12 }}>Live Metrics</div>
                {[
                  { label: 'Pace', val: 'Good', color: 'var(--A)', pct: 0.72 },
                  { label: 'Clarity', val: '85%', color: 'var(--P)', pct: 0.85 },
                  { label: 'Confidence', val: '60%', color: 'var(--E)', pct: 0.6 },
                ].map(m => (
                  <div key={m.label} style={{ marginBottom: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ fontSize: 13, color: 'var(--t2)' }}>{m.label}</span>
                      <span style={{ fontFamily: '"DM Mono"', fontSize: 11, color: m.color }}>{m.val}</span>
                    </div>
                    <div style={{ height: 3, background: 'rgba(255,255,255,.07)', borderRadius: 4, overflow: 'hidden' }}>
                      <div style={{ height: '100%', transform: `scaleX(${m.pct})`, background: 'linear-gradient(90deg,var(--P),var(--N))', transformOrigin: 'left' }} />
                    </div>
                  </div>
                ))}
              </div>
              <div className="admin-panel admin-kpi" style={{ background: 'var(--s1)', border: '1px solid var(--bd)', borderRadius: 16, padding: 18, textAlign: 'center', animationDelay: '.18s' }}>
                <div style={{ fontFamily: '"DM Mono"', fontSize: 11, color: 'var(--t4)', marginBottom: 8 }}>Progress</div>
                <div style={{ fontFamily: '"Bebas Neue"', fontSize: 46, color: 'var(--P)' }}>{qi + 1} / {questions.length}</div>
                <div style={{ fontFamily: '"DM Mono"', fontSize: 11, color: 'var(--t4)' }}>Questions</div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
