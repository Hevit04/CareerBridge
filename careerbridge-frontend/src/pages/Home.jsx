import { useEffect, useRef } from 'react'
import { Chip, Card, Btn } from '../components/UI'
import { IconBrain, IconMic, IconTarget, IconChart, IconMessageSquare, IconShield, IconZap } from '../components/Icons'

function counter(el, target, sfx = '') {
  let v = 0
  const step = target / 65
  const iv = setInterval(() => {
    v = Math.min(v + step, target)
    if (el) el.textContent = Math.round(v).toLocaleString() + sfx
    if (v >= target) clearInterval(iv)
  }, 18)
}

function init3D(canvas) {
  if (!canvas || !window.THREE) return
  const THREE = window.THREE
  const W = Math.min(430, window.innerWidth * 0.42)
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true })
  renderer.setSize(W, W)
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2))
  canvas.style.cssText = `width:${W}px;height:${W}px;`
  const scene = new THREE.Scene()
  const cam = new THREE.PerspectiveCamera(45, 1, 0.1, 100)
  cam.position.z = 3.8
  const outer = new THREE.LineSegments(
    new THREE.WireframeGeometry(new THREE.IcosahedronGeometry(1.5, 4)),
    new THREE.LineBasicMaterial({ color: 0x7b2fff, transparent: true, opacity: 0.28 }))
  scene.add(outer)
  const inner = new THREE.LineSegments(
    new THREE.WireframeGeometry(new THREE.IcosahedronGeometry(1.0, 2)),
    new THREE.LineBasicMaterial({ color: 0x00f5d4, transparent: true, opacity: 0.5 }))
  scene.add(inner)
  scene.add(new THREE.Mesh(new THREE.SphereGeometry(0.95, 32, 32), new THREE.MeshBasicMaterial({ color: 0x07070f })))
  const ring = new THREE.Mesh(
    new THREE.RingGeometry(1.62, 1.66, 80),
    new THREE.MeshBasicMaterial({ color: 0xff4d6d, side: THREE.DoubleSide, transparent: true, opacity: 0.5 }))
  ring.rotation.x = Math.PI * 0.3
  scene.add(ring)
  const pa = []
  for (let i = 0; i < 260; i++) {
    const ph = Math.acos(2 * Math.random() - 1), th = 2 * Math.PI * Math.random(), r = 1.9 + Math.random() * 0.7
    pa.push(r * Math.sin(ph) * Math.cos(th), r * Math.sin(ph) * Math.sin(th), r * Math.cos(ph))
  }
  const pg = new THREE.BufferGeometry()
  pg.setAttribute('position', new THREE.Float32BufferAttribute(pa, 3))
  scene.add(new THREE.Points(pg, new THREE.PointsMaterial({ color: 0xd4ff00, size: 0.02, transparent: true, opacity: 0.72 })))
  let t = 0, raf
  const animate = () => {
    raf = requestAnimationFrame(animate)
    t += 0.005
    outer.rotation.y = t * 0.35; outer.rotation.x = t * 0.12
    inner.rotation.y = -t * 0.5; inner.rotation.x = t * 0.2
    ring.rotation.z = t * 0.25
    renderer.render(scene, cam)
  }
  animate()
  return () => cancelAnimationFrame(raf)
}

const features = [
  { icon: <IconBrain size={22} color="var(--P)" />, iconBg: 'rgba(0,245,212,.09)', iconBorder: 'rgba(0,245,212,.2)', title: 'AI Assessment Engine', desc: 'Adaptive testing across DSA, aptitude & communication — auto-scored with NLP benchmarking in real-time.', bottom: <><div style={{ height: 3, background: 'rgba(255,255,255,.07)', borderRadius: 4, overflow: 'hidden', marginBottom: 6 }}><div className="pf" style={{ transform: 'scaleX(.984)', transition: 'none' }} /></div><div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ fontFamily: '"DM Mono"', fontSize: 12, color: 'var(--t4)' }}>Accuracy</span><span style={{ fontFamily: '"DM Mono"', fontSize: 12, color: 'var(--P)' }}>98.4%</span></div></>, page: 'assessment' },
  { icon: <IconMic size={22} color="var(--A)" />, iconBg: 'rgba(212,255,0,.08)', iconBorder: 'rgba(212,255,0,.2)', title: 'Mock Interview Lab', desc: 'Live technical & HR rounds with tone analysis, filler-word detection, and full AI post-session reports.', bottom: <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>{['Technical', 'HR Round', 'GD'].map(t => <Chip key={t}>{t}</Chip>)}</div>, page: 'interview' },
  { icon: <IconTarget size={22} color="var(--E)" />, iconBg: 'rgba(255,77,109,.09)', iconBorder: 'rgba(255,77,109,.2)', title: 'Smart Internship Match', desc: 'ML-powered recommendations ranked by your skill fingerprint. Updated daily with new openings from top companies.', bottom: <><div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ fontFamily: '"DM Mono"', fontSize: 12, color: 'var(--t4)' }}>Match Rate</span><span style={{ fontFamily: '"DM Mono"', fontSize: 12, color: 'var(--E)' }}>94.1%</span></div><div style={{ height: 3, background: 'rgba(255,255,255,.07)', borderRadius: 4, overflow: 'hidden', marginTop: 6 }}><div className="pf" style={{ transform: 'scaleX(.941)', transition: 'none', background: 'linear-gradient(90deg,var(--E),var(--N))' }} /></div></>, page: 'internships' },
  { icon: <IconChart size={22} color="#a78bfa" />, iconBg: 'rgba(123,47,255,.12)', iconBorder: 'rgba(123,47,255,.25)', title: 'Skill Radar Dashboard', desc: 'Visual skill breakdown with trend lines, gap identification, and personalised study path recommendations.', bottom: <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>{['DSA', 'System Design', 'SQL'].map(t => <Chip key={t}>{t}</Chip>)}</div>, page: 'dashboard' },
  { icon: <IconMessageSquare size={22} color="var(--A)" />, iconBg: 'rgba(212,255,0,.08)', iconBorder: 'rgba(212,255,0,.18)', title: 'Communication Coach', desc: 'NLP speech analysis — confidence scoring, pacing feedback, filler-word detection and structured improvement plans.', bottom: <><div style={{ display: 'flex', gap: 3, marginTop: 8 }}>{[...Array(7)].map((_, i) => <div key={i} style={{ height: 18, background: 'var(--A)', borderRadius: 2, width: '9%', opacity: .5 + i * 0.06 }} />)}{[...Array(3)].map((_, i) => <div key={i} style={{ height: 18, background: 'rgba(255,255,255,.07)', borderRadius: 2, width: '9%' }} />)}</div><div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 5 }}><span style={{ fontFamily: '"DM Mono"', fontSize: 12, color: 'var(--t4)' }}>Confidence</span><span style={{ fontFamily: '"DM Mono"', fontSize: 12, color: 'var(--A)' }}>70%</span></div></>, page: null },
  { icon: <IconShield size={22} color="#a78bfa" />, iconBg: 'rgba(123,47,255,.14)', iconBorder: 'rgba(123,47,255,.28)', title: 'Secure & Scalable', desc: 'HTTPS encrypted, concurrent multi-user sessions, 99% uptime SLA with full role-based access control.', bottom: <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><div className="pulse-dot" style={{ width: 8, height: 8, borderRadius: '50%', background: '#4ade80', boxShadow: '0 0 8px #4ade80' }} /><span style={{ fontFamily: '"DM Mono"', fontSize: 12, color: 'var(--t2)' }}>All systems operational</span></div>, page: null },
]

export default function Home({ onNav }) {
  const canvasRef = useRef(null)
  const c1Ref = useRef(null), c2Ref = useRef(null), c3Ref = useRef(null)

  useEffect(() => {
    const script = document.createElement('script')
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js'
    script.onload = () => {
      const cleanup = init3D(canvasRef.current)
      return cleanup
    }
    document.head.appendChild(script)
    counter(c1Ref.current, 12400)
    counter(c2Ref.current, 3800)
    counter(c3Ref.current, 94, '%')
  }, [])

  return (
    <div>
      {/* Hero */}
      <section className="gridbg" style={{ position: 'relative', minHeight: '92vh', display: 'flex', alignItems: 'center', overflow: 'hidden' }}>
        <div className="glow" style={{ width: 700, height: 700, background: 'rgba(123,47,255,.11)', top: '50%', left: '58%', transform: 'translate(-50%,-50%)' }} />
        <div className="glow" style={{ width: 320, height: 320, background: 'rgba(0,245,212,.07)', top: '10%', left: '3%' }} />
        <div style={{ maxWidth: 1300, margin: '0 auto', padding: '60px 28px 40px', display: 'grid', gridTemplateColumns: '1fr 480px', gap: 60, alignItems: 'center', width: '100%' }}>
          {/* Left */}
          <div>
            <Chip style={{ marginBottom: 22, animation: 'fadeUp .6s both', display: 'inline-flex', gap: 6, alignItems: 'center' }}>
              <IconZap size={11} color="var(--P)" /> AI-Powered Career Intelligence
            </Chip>
            <h1 style={{ fontFamily: '"Bebas Neue"', fontSize: 'clamp(4rem,9vw,8rem)', lineHeight: .92, letterSpacing: '.02em', marginBottom: 18, animation: 'fadeUp .7s .08s both' }}>
              BRIDGE<br /><span style={{ color: 'var(--P)' }}>THE</span><br />GAP
            </h1>
            <p style={{ maxWidth: 460, marginBottom: 34, fontSize: 17, color: 'var(--t2)', lineHeight: 1.7, animation: 'fadeUp .7s .16s both' }}>
              Transform raw potential into career-ready excellence. AI-driven interview coaching, skill assessment, and intelligent internship matching.
            </p>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 48, animation: 'fadeUp .7s .24s both' }}>
              <Btn size="lg" onClick={() => onNav('dashboard')}>Enter Dashboard →</Btn>
              <Btn size="lg" variant="g" onClick={() => onNav('assessment')}>Take Free Assessment</Btn>
            </div>
            <div style={{ display: 'flex', gap: 40, paddingTop: 30, borderTop: '1px solid var(--bd)', animation: 'fadeUp .7s .32s both' }}>
              {[{ ref: c1Ref, label: 'Students Active' }, { ref: c2Ref, label: 'Matches Made' }, { ref: c3Ref, label: 'Success Rate' }].map(({ ref, label }) => (
                <div key={label}>
                  <div ref={ref} style={{ fontFamily: '"Bebas Neue"', fontSize: 52, lineHeight: 1, background: 'linear-gradient(135deg,var(--P),var(--N))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>0</div>
                  <div style={{ fontFamily: '"DM Mono"', fontSize: 11, color: 'var(--t4)', marginTop: 4 }}>{label}</div>
                </div>
              ))}
            </div>
          </div>
          {/* 3D Canvas */}
          <div style={{ position: 'relative', height: 520, display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'scaleIn .9s .2s both' }}>
            <canvas ref={canvasRef} className="float1" />
            <div className="float2" style={{ position: 'absolute', top: 20, right: -10, background: 'var(--s2)', border: '1px solid var(--bd)', borderRadius: 14, padding: 16, width: 178 }}>
              <div style={{ fontFamily: '"DM Mono"', fontSize: 11, color: 'var(--t4)', marginBottom: 6 }}>Interview Score</div>
              <div style={{ fontFamily: '"Bebas Neue"', fontSize: 48, color: 'var(--A)', lineHeight: 1 }}>87</div>
              <div style={{ color: '#4ade80', fontSize: 13, fontWeight: 700, marginTop: 4 }}>↑ +12 pts this week</div>
              <div style={{ height: 3, background: 'rgba(255,255,255,.07)', borderRadius: 4, overflow: 'hidden', marginTop: 9 }}><div className="pf" style={{ transform: 'scaleX(.87)', transition: 'none' }} /></div>
            </div>
            <div className="float3" style={{ position: 'absolute', bottom: 55, left: -10, background: 'var(--s2)', border: '1px solid var(--bd)', borderRadius: 14, padding: 16, width: 198 }}>
              <div style={{ fontFamily: '"DM Mono"', fontSize: 11, color: 'var(--t4)', marginBottom: 8 }}>Top Match Today</div>
              <div style={{ fontWeight: 800, fontSize: 15, color: 'var(--t1)' }}>Google SWE Intern</div>
              <div style={{ fontFamily: '"DM Mono"', fontSize: 12, color: 'var(--t3)', margin: '4px 0 10px' }}>94% skill alignment</div>
              <div style={{ display: 'flex', gap: 5 }}><Chip style={{ fontSize: 10, padding: '2px 8px' }}>React</Chip><Chip style={{ fontSize: 10, padding: '2px 8px' }}>Python</Chip></div>
            </div>
            <div className="float1" style={{ position: 'absolute', top: '48%', right: -18, transform: 'translateY(-50%)', background: 'rgba(212,255,0,.08)', border: '1px solid rgba(212,255,0,.2)', borderRadius: 10, padding: '12px 14px' }}>
              <div style={{ fontFamily: '"DM Mono"', fontSize: 10, color: 'var(--A)' }}>Readiness</div>
              <div style={{ fontFamily: '"Bebas Neue"', fontSize: 32, color: 'var(--A)', lineHeight: 1 }}>72%</div>
            </div>
          </div>
        </div>
      </section>

      {/* Marquee */}
      <div style={{ overflow: 'hidden', borderTop: '1px solid var(--bd)', borderBottom: '1px solid var(--bd)', background: 'rgba(123,47,255,.04)', padding: '11px 0' }}>
        <div className="marquee-track" style={{ display: 'flex', gap: 40, whiteSpace: 'nowrap' }}>
          {['Technical Assessment', 'Mock Interviews', 'AI Feedback', 'Internship Matching', 'Skill Gap Analysis', 'Career Readiness Score', 'Communication Coach',
            'Technical Assessment', 'Mock Interviews', 'AI Feedback', 'Internship Matching', 'Skill Gap Analysis', 'Career Readiness Score', 'Communication Coach'].map((t, i) => (
            <span key={i} style={{ fontFamily: '"DM Mono"', fontSize: 12, color: 'var(--t4)' }}>{t}{i % 7 !== 6 && ' ◈ '}</span>
          ))}
        </div>
      </div>

      {/* Features */}
      <section style={{ padding: '100px 28px', maxWidth: 1300, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 64 }}>
          <Chip style={{ marginBottom: 16 }}>Platform Features</Chip>
          <h2 style={{ fontFamily: '"Bebas Neue"', fontSize: 'clamp(2.5rem,5vw,5rem)', lineHeight: 1 }}>
            EVERYTHING YOU<br /><span style={{ color: 'var(--P)' }}>NEED TO WIN</span>
          </h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 20 }}>
          {features.map((f) => (
            <Card key={f.title} style={{ padding: 28 }} onClick={f.page ? () => onNav(f.page) : undefined}>
              <div style={{ width: 52, height: 52, borderRadius: 14, background: f.iconBg, border: `1px solid ${f.iconBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
                {f.icon}
              </div>
              <div style={{ fontSize: 17, fontWeight: 800, letterSpacing: '-.01em', color: 'var(--t1)', marginBottom: 10 }}>{f.title}</div>
              <p style={{ fontSize: 14, color: 'var(--t2)', lineHeight: 1.65, marginBottom: 20 }}>{f.desc}</p>
              {f.bottom}
            </Card>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '0 28px 100px', maxWidth: 1300, margin: '0 auto' }}>
        <div style={{ background: 'linear-gradient(135deg,rgba(123,47,255,.18),rgba(0,245,212,.06))', border: '1px solid rgba(123,47,255,.25)', borderRadius: 24, padding: 64, textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
          <div className="glow" style={{ width: 500, height: 280, background: 'rgba(123,47,255,.15)', top: '50%', left: '50%', transform: 'translate(-50%,-50%)' }} />
          <div style={{ position: 'relative', zIndex: 1 }}>
            <h2 style={{ fontFamily: '"Bebas Neue"', fontSize: 'clamp(2.5rem,5vw,5rem)', lineHeight: 1, marginBottom: 14 }}>
              START YOUR JOURNEY<br /><span style={{ color: 'var(--A)' }}>TODAY</span>
            </h2>
            <p style={{ fontSize: 15, color: 'var(--t2)', marginBottom: 30, maxWidth: 380, marginLeft: 'auto', marginRight: 'auto' }}>
              Join 12,000+ students who've used CareerBridge to land their dream internships.
            </p>
            <Btn size="lg" onClick={() => onNav('dashboard')}>Enter Dashboard — It's Free →</Btn>
          </div>
        </div>
      </section>
    </div>
  )
}
