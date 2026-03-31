import { useState } from 'react'
import { Btn } from '../components/UI'
import { api } from '../api/api'

export default function Login({ onNav, onLogin }) {
  const [tab, setTab] = useState('login')
  const [role, setRole] = useState('student')

  const [email, setEmail] = useState('demo@career.ai')
  const [password, setPassword] = useState('demo123')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [enrollmentNo, setEnrollmentNo] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const handleLogin = async (e) => {
    if (e && e.preventDefault) e.preventDefault()
    setLoading(true)
    setError('')
    try {
      if (tab === 'login') {
        const res = await api.auth.login({ email, password, role })
        onLogin(res)
      } else {
        const res = await api.auth.register({ 
          email, 
          password, 
          first_name: firstName, 
          last_name: lastName, 
          enrollment_no: enrollmentNo,
          role 
        })
        onLogin(res)
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="gridbg" style={{ minHeight: 'calc(100vh - 62px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 28px', position: 'relative' }}>
      <div className="glow" style={{ width: 400, height: 400, background: 'rgba(123,47,255,.1)', top: '50%', left: '50%', transform: 'translate(-50%,-50%)' }} />

      <div style={{
        background: 'var(--s1)', border: '1px solid var(--bd)', borderRadius: 16,
        padding: 40, width: '100%', maxWidth: 400, position: 'relative', zIndex: 1,
      }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{
            width: 44, height: 44, borderRadius: 12, margin: '0 auto 14px',
            background: 'linear-gradient(135deg, var(--N), var(--P))', display: 'flex',
            alignItems: 'center', justifyContent: 'center', fontSize: 15, letterSpacing: '.05em',
            fontFamily: '"Bebas Neue"', color: 'var(--bg)',
          }}>CB</div>
          <div style={{ fontFamily: '"Bebas Neue"', fontSize: 'clamp(1.8rem,3.5vw,3rem)', marginBottom: 6, color: 'var(--t1)' }}>SIGN IN</div>
          <p style={{ fontSize: 13, color: 'var(--t2)' }}>Access your CareerBridge dashboard</p>
          {error && <p style={{ fontSize: 12, color: 'var(--E)', marginTop: 10, fontWeight: 600 }}>{error}</p>}
        </div>

        <div style={{ display: 'flex', gap: 8, marginBottom: 22 }}>
          <button
            onClick={() => setTab('login')}
            style={{
              flex: 1, padding: '9px 20px', borderRadius: 8, fontSize: 13, fontWeight: 600,
              fontFamily: 'Syne, sans-serif', border: '1px solid rgba(255,255,255,.14)',
              background: tab === 'login' ? 'rgba(255,255,255,.07)' : 'transparent',
              color: tab === 'login' ? 'var(--t1)' : 'var(--t3)', cursor: 'pointer',
            }}>
            Login
          </button>
          <button
            onClick={() => setTab('register')}
            style={{
              flex: 1, padding: '9px 20px', borderRadius: 8, fontSize: 13, fontWeight: 600,
              fontFamily: 'Syne, sans-serif', border: '1px solid rgba(255,255,255,.14)',
              background: tab === 'register' ? 'rgba(255,255,255,.07)' : 'transparent',
              color: tab === 'register' ? 'var(--t1)' : 'var(--t3)', cursor: 'pointer',
            }}>
            Register
          </button>
        </div>

        {tab === 'login' && (
          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: 14 }}>
              <label style={{ fontFamily: '"DM Mono"', fontSize: 11, fontWeight: 700, color: 'var(--t3)', marginBottom: 6, display: 'block', textTransform: 'uppercase', letterSpacing: '.07em' }}>Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                style={{
                  width: '100%', background: 'var(--s2)', border: '1px solid var(--bd)', borderRadius: 10,
                  padding: '12px 16px', color: 'var(--t1)', fontFamily: 'Syne, sans-serif', fontSize: 14,
                  outline: 'none', cursor: 'pointer',
                }}
              >
                <option value="student">Student</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={{ fontFamily: '"DM Mono"', fontSize: 11, fontWeight: 700, color: 'var(--t3)', marginBottom: 6, display: 'block', textTransform: 'uppercase', letterSpacing: '.07em' }}>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="demo@career.ai"
                style={{
                  width: '100%', background: 'var(--s2)', border: '1px solid var(--bd)', borderRadius: 10,
                  padding: '12px 16px', color: 'var(--t1)', fontFamily: 'Syne, sans-serif', fontSize: 14,
                  outline: 'none',
                }}
              />
            </div>
            <div style={{ marginBottom: 22 }}>
              <label style={{ fontFamily: '"DM Mono"', fontSize: 11, fontWeight: 700, color: 'var(--t3)', marginBottom: 6, display: 'block', textTransform: 'uppercase', letterSpacing: '.07em' }}>Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  style={{
                    width: '100%', background: 'var(--s2)', border: '1px solid var(--bd)', borderRadius: 10,
                    padding: '12px 16px', paddingRight: '46px', color: 'var(--t1)', fontFamily: 'Syne, sans-serif', fontSize: 14,
                    outline: 'none',
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', color: 'var(--t4)', cursor: 'pointer', fontSize: 18
                  }}
                >
                  {showPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
            </div>
            <Btn size="lg" style={{ width: '100%' }} type="submit">Sign In →</Btn>
          </form>
        )}

        {tab === 'register' && (
          <form onSubmit={handleLogin}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
              <div>
                <label style={{ fontFamily: '"DM Mono"', fontSize: 11, fontWeight: 700, color: 'var(--t3)', marginBottom: 6, display: 'block', textTransform: 'uppercase', letterSpacing: '.07em' }}>First Name</label>
                <input 
                  placeholder="Bhumika" 
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  style={{
                    width: '100%', background: 'var(--s2)', border: '1px solid var(--bd)', borderRadius: 10,
                    padding: '12px 16px', color: 'var(--t1)', fontFamily: 'Syne, sans-serif', fontSize: 14,
                  }} 
                />
              </div>
              <div>
                <label style={{ fontFamily: '"DM Mono"', fontSize: 11, fontWeight: 700, color: 'var(--t3)', marginBottom: 6, display: 'block', textTransform: 'uppercase', letterSpacing: '.07em' }}>Last Name</label>
                <input 
                  placeholder="Jain" 
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  style={{
                    width: '100%', background: 'var(--s2)', border: '1px solid var(--bd)', borderRadius: 10,
                    padding: '12px 16px', color: 'var(--t1)', fontFamily: 'Syne, sans-serif', fontSize: 14,
                  }} 
                />
              </div>
            </div>
            <div style={{ marginBottom: 10 }}>
              <label style={{ fontFamily: '"DM Mono"', fontSize: 11, fontWeight: 700, color: 'var(--t3)', marginBottom: 6, display: 'block', textTransform: 'uppercase', letterSpacing: '.07em' }}>Enrollment No.</label>
              <input 
                placeholder="AU2340XXX" 
                value={enrollmentNo}
                onChange={(e) => setEnrollmentNo(e.target.value)}
                style={{
                  width: '100%', background: 'var(--s2)', border: '1px solid var(--bd)', borderRadius: 10,
                  padding: '12px 16px', color: 'var(--t1)', fontFamily: 'Syne, sans-serif', fontSize: 14,
                }} 
              />
            </div>
            <div style={{ marginBottom: 10 }}>
              <label style={{ fontFamily: '"DM Mono"', fontSize: 11, fontWeight: 700, color: 'var(--t3)', marginBottom: 6, display: 'block', textTransform: 'uppercase', letterSpacing: '.07em' }}>Email</label>
              <input 
                placeholder="your@email.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  width: '100%', background: 'var(--s2)', border: '1px solid var(--bd)', borderRadius: 10,
                  padding: '12px 16px', color: 'var(--t1)', fontFamily: 'Syne, sans-serif', fontSize: 14,
                }} 
              />
            </div>
            <div style={{ marginBottom: 22 }}>
              <label style={{ fontFamily: '"DM Mono"', fontSize: 11, fontWeight: 700, color: 'var(--t3)', marginBottom: 6, display: 'block', textTransform: 'uppercase', letterSpacing: '.07em' }}>Password</label>
              <div style={{ position: 'relative' }}>
                <input 
                  type={showPassword ? "text" : "password"} 
                  placeholder="••••••••" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{
                    width: '100%', background: 'var(--s2)', border: '1px solid var(--bd)', borderRadius: 10,
                    padding: '12px 16px', paddingRight: '46px', color: 'var(--t1)', fontFamily: 'Syne, sans-serif', fontSize: 14,
                  }} 
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', color: 'var(--t4)', cursor: 'pointer', fontSize: 18
                  }}
                >
                  {showPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
            </div>
            <Btn size="lg" style={{ width: '100%' }} type="submit" disabled={loading}>
              {loading ? 'Processing...' : tab === 'login' ? 'Sign In →' : 'Create Account →'}
            </Btn>
          </form>
        )}

        <p style={{ fontFamily: '"DM Mono"', fontSize: 11, textAlign: 'center', marginTop: 14, color: 'var(--t4)' }}>
          Demo: demo@career.ai / demo123 (choose role before sign in)
        </p>
      </div>
    </div>
  )
}
