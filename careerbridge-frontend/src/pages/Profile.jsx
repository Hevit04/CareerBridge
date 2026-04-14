import { useState, useEffect, useRef } from 'react'
import { Chip, Badge, Btn } from '../components/UI'
import { api } from '../api/api'
import { useToast } from '../hooks/useToast'

const ALL_SKILLS = ['React', 'Python', 'Java', 'C++', 'SQL', 'Docker', 'ML/AI', 'Node.js', 'AWS', 'Git']

export default function Profile({ onNav, isLoggedIn }) {
  const toast = useToast()
  const fileInputRef = useRef(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [user, setUser] = useState(null)
  const [readiness, setReadiness] = useState(0)
  const [customSkill, setCustomSkill] = useState('')
  
  // Form State
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    enrollment_no: '',
    branch: '',
    semester: 1,
    preferred_role: '',
    location_pref: '',
    skills: '' // comma separated
  })

  if (!isLoggedIn) {
    return (
      <div className="admin-enter" style={{ maxWidth: 760, margin: '80px auto', textAlign: 'center', padding: '0 24px' }}>
        <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(255,77,109,.08)', border: '1px solid rgba(255,77,109,.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
          <span style={{ fontSize: 32 }}>👤</span>
        </div>
        <h1 style={{ fontFamily: '"Bebas Neue"', fontSize: 'clamp(2.5rem,5vw,4.5rem)', lineHeight: 1, marginBottom: 12 }}>
          PROFILE <span style={{ color: 'var(--E)' }}>LOCKED</span>
        </h1>
        <p style={{ fontSize: 16, color: 'var(--t2)', marginBottom: 32, lineHeight: 1.6 }}>
          Please log in to view and manage your professional profile, <br />
          track your readiness score, and update your resume.
        </p>
        <div style={{ display: 'flex', gap: 14, justifyContent: 'center' }}>
          <Btn size="md" onClick={() => onNav('login')}>Login Now →</Btn>
          <Btn variant="g" size="md" onClick={() => onNav('login')}>Join CareerBridge</Btn>
        </div>
      </div>
    )
  }

  const fetchProfile = async () => {
    try {
      const [u, r] = await Promise.all([api.users.me(), api.users.readiness()])
      setUser(u)
      setReadiness(r.readiness_score)
      setFormData({
        first_name: u.first_name || '',
        last_name: u.last_name || '',
        phone: u.phone || '',
        enrollment_no: u.enrollment_no || '',
        branch: u.branch || '',
        semester: u.semester || 1,
        preferred_role: u.preferred_role || '',
        location_pref: u.location_pref || '',
        skills: u.skills || ''
      })
    } catch (err) {
      toast('❌ Error fetching profile: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isLoggedIn) fetchProfile()
  }, [isLoggedIn])

  const toggleSkill = (s) => {
    const skillList = formData.skills ? formData.skills.split(',').map(x => x.trim()).filter(Boolean) : []
    const index = skillList.indexOf(s)
    let newSkills
    if (index > -1) {
      newSkills = skillList.filter(x => x !== s)
    } else {
      newSkills = [...skillList, s]
    }
    setFormData(prev => ({ ...prev, skills: newSkills.join(', ') }))
  }

  const addCustomSkill = () => {
    const s = customSkill.trim()
    if (!s) return
    const current = formData.skills ? formData.skills.split(',').map(x => x.trim()).filter(Boolean) : []
    if (current.includes(s)) {
      setCustomSkill('')
      return
    }
    setFormData(prev => ({ ...prev, skills: [...current, s].join(', ') }))
    setCustomSkill('')
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await api.users.update(formData)
      toast('✅ Changes Saved successfully')
      alert('Changes Saved successfully')
      fetchProfile()
    } catch (err) {
      toast('❌ Error saving profile: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleResumeUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    
    const fd = new FormData()
    fd.append('file', file)
    
    try {
      await api.users.uploadResume(fd)
      toast('📄 Resume uploaded successfully!')
      fetchProfile()
    } catch (err) {
      toast('❌ Upload failed: ' + err.message)
    }
  }

  if (loading || !user) return <div style={{ padding: 40, textAlign: 'center' }}>Loading profile...</div>

  const skillsOn = new Set(formData.skills.split(',').map(x => x.trim()).filter(Boolean))

  return (
    <div style={{ maxWidth: 1020, margin: '0 auto', padding: '40px 28px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <Chip style={{ marginBottom: 10 }}>Student Profile</Chip>
          <h1 style={{ fontFamily: '"Bebas Neue"', fontSize: 'clamp(2.5rem,5vw,5rem)', lineHeight: 1, marginBottom: 4 }}>
            MY <span style={{ color: 'var(--N)' }}>PROFILE</span>
          </h1>
          <p style={{ fontSize: 14, color: 'var(--t2)' }}>Manage your career profile, skills, and resume.</p>
        </div>
        <Btn size="md" disabled={saving} onClick={handleSave}>{saving ? 'Saving...' : 'Save Changes'}</Btn>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '270px 1fr', gap: 22 }}>
        {/* Left */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ background: 'var(--s1)', border: '1px solid var(--bd)', borderRadius: 16, padding: 24, textAlign: 'center' }}>
            <div style={{
              width: 80, height: 80, borderRadius: '50%', background: 'linear-gradient(135deg,var(--N),var(--P))',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, fontWeight: 800,
              color: 'var(--bg)', margin: '0 auto 16px',
            }}>{user.first_name[0]}{user.last_name[0]}</div>
            <div style={{ fontSize: 19, fontWeight: 800, color: 'var(--t1)', marginBottom: 4 }}>{user.first_name} {user.last_name}</div>
            <div style={{ fontFamily: '"DM Mono"', fontSize: 12, marginBottom: 14, color: 'var(--t3)' }}>{user.enrollment_no || 'No ID'} · {user.branch || 'No Branch'} · Sem {user.semester || '-'}</div>
            <div style={{ padding: 12, background: 'rgba(0,245,212,.06)', border: '1px solid rgba(0,245,212,.14)', borderRadius: 10 }}>
              <div style={{ fontFamily: '"DM Mono"', fontSize: 11, color: 'var(--P)', marginBottom: 4 }}>Readiness Score</div>
              <div style={{ fontFamily: '"Bebas Neue"', fontSize: 42, color: 'var(--P)', lineHeight: 1 }}>{readiness}%</div>
              <div style={{ height: 3, background: 'rgba(255,255,255,.07)', borderRadius: 4, overflow: 'hidden', marginTop: 8 }}>
                <div style={{ height: '100%', transform: `scaleX(${readiness/100})`, background: 'linear-gradient(90deg,var(--P),var(--N))', transformOrigin: 'left' }} />
              </div>
            </div>
          </div>

          <div style={{ background: 'var(--s1)', border: '1px solid var(--bd)', borderRadius: 16, padding: 18 }}>
            <div style={{ fontFamily: '"DM Mono"', fontSize: 11, color: 'var(--t4)', marginBottom: 12 }}>Skills — click to toggle</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 16 }}>
              {(() => {
                const current = formData.skills ? formData.skills.split(',').map(x => x.trim()).filter(Boolean) : []
                const others = current.filter(s => !ALL_SKILLS.includes(s))
                return [...ALL_SKILLS, ...others].map(s => (
                  <button
                    key={s}
                    onClick={() => toggleSkill(s)}
                    style={{
                      display: 'inline-flex', alignItems: 'center', padding: '6px 12px', borderRadius: 8,
                      fontSize: 12, fontWeight: 600, cursor: 'pointer', transition: 'all .2s',
                      border: `1px solid ${skillsOn.has(s) ? 'var(--P)' : 'var(--bd)'}`,
                      background: skillsOn.has(s) ? 'rgba(0,245,212,.09)' : 'var(--s2)',
                      color: skillsOn.has(s) ? 'var(--P)' : 'var(--t2)',
                      fontFamily: 'Syne, sans-serif',
                    }}>
                    {s}
                  </button>
                ))
              })()}
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <input 
                type="text" 
                placeholder="Add skill..." 
                value={customSkill}
                onChange={e => setCustomSkill(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addCustomSkill()}
                style={{
                  flex: 1, background: 'var(--s2)', border: '1px solid var(--bd)', borderRadius: 8,
                  padding: '8px 12px', fontSize: 12, color: 'var(--t1)', fontFamily: 'Syne, sans-serif', outline: 'none'
                }}
              />
              <Btn size="xs" onClick={addCustomSkill}>Add</Btn>
            </div>
          </div>

          <div style={{ background: 'var(--s1)', border: '1px solid var(--bd)', borderRadius: 16, padding: 18 }}>
            <div style={{ fontFamily: '"DM Mono"', fontSize: 11, color: 'var(--t4)', marginBottom: 12 }}>Upcoming</div>
            {[
              { icon: '▶', label: 'Technical Round', date: 'Today, 4:00 PM', color: 'var(--P)' },
              { icon: '◉', label: 'Google Interview', date: 'Mar 28, 10:00 AM', color: 'var(--A)' },
            ].map((item, i) => (
              <div key={i} style={{ padding: 10, background: 'var(--s2)', borderRadius: 8, marginBottom: 8, borderLeft: `3px solid ${item.color}` }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--t1)' }}>{item.label}</div>
                <div style={{ fontFamily: '"DM Mono"', fontSize: 11, color: 'var(--t4)', marginTop: 2 }}>{item.date}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div style={{ background: 'var(--s1)', border: '1px solid var(--bd)', borderRadius: 16, padding: 24 }}>
            <div style={{ fontSize: 17, fontWeight: 800, marginBottom: 20, color: 'var(--t1)' }}>Personal Information</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              {[
                { label: 'First Name', key: 'first_name' },
                { label: 'Last Name', key: 'last_name' },
                { label: 'Email', val: user.email, full: true, disabled: true },
                { label: 'Phone', key: 'phone', maxLength: 10 },
                { label: 'Enrollment No.', key: 'enrollment_no', disabled: true, val: formData.enrollment_no || user.enrollment_no || '' },
                { label: 'Branch', key: 'branch', full: true },
              ].map((f, i) => (
                <div key={i} style={{ ...(f.full && { gridColumn: '1 / -1' }) }}>
                  <label style={{ fontFamily: '"DM Mono"', fontSize: 11, fontWeight: 700, color: 'var(--t3)', marginBottom: 6, display: 'block', textTransform: 'uppercase', letterSpacing: '.07em' }}>
                    {f.label}
                  </label>
                  <input
                    type="text"
                    value={f.val !== undefined ? f.val : formData[f.key]}
                    disabled={f.disabled}
                    maxLength={f.maxLength || undefined}
                    onChange={f.key ? (e) => setFormData(p => ({ ...p, [f.key]: e.target.value })) : undefined}
                    style={{
                      width: '100%', background: f.disabled ? 'transparent' : 'var(--s2)', border: '1px solid var(--bd)', borderRadius: 10,
                      padding: '12px 16px', color: 'var(--t1)', fontFamily: 'Syne, sans-serif', fontSize: 14,
                      outline: 'none', opacity: f.disabled ? 0.6 : 1, transition: 'border-color .2s',
                    }}
                    onFocus={e => !f.disabled && (e.target.style.borderColor = 'var(--P)')}
                    onBlur={e => e.target.style.borderColor = 'var(--bd)'}
                  />
                  {f.maxLength && (
                    <div style={{ fontFamily: '"DM Mono"', fontSize: 10, color: (formData[f.key] || '').length >= f.maxLength ? 'var(--E)' : 'var(--t4)', marginTop: 4, textAlign: 'right' }}>
                      {(formData[f.key] || '').length}/{f.maxLength}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div style={{ background: 'var(--s1)', border: '1px solid var(--bd)', borderRadius: 16, padding: 24 }}>
            <div style={{ fontSize: 17, fontWeight: 800, marginBottom: 20, color: 'var(--t1)' }}>Career Preferences</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              
              {/* Preferred Role Column */}
              <div>
                  <label style={{ fontFamily: '"DM Mono"', fontSize: 11, fontWeight: 700, color: 'var(--t3)', marginBottom: 6, display: 'block', textTransform: 'uppercase', letterSpacing: '.07em' }}>
                    Preferred Role
                  </label>
                  
                  <select 
                    value={
                      ['Software Engineer', 'Data Scientist', 'ML Engineer', 'Backend Dev', 'Frontend Dev', ''].includes(formData.preferred_role) 
                      ? formData.preferred_role 
                      : 'Other'
                    }
                    onChange={(e) => {
                      if (e.target.value === 'Other') {
                        setFormData(p => ({ ...p, preferred_role: ' ' })) // non-empty space to trigger input
                      } else {
                        setFormData(p => ({ ...p, preferred_role: e.target.value }))
                      }
                    }}
                    style={{
                      width: '100%', background: 'var(--s2)', border: '1px solid var(--bd)', borderRadius: 10,
                      padding: '12px 16px', color: 'var(--t1)', fontFamily: 'Syne, sans-serif', fontSize: 14,
                      cursor: 'pointer', outline: 'none', marginBottom: 
                        !['Software Engineer', 'Data Scientist', 'ML Engineer', 'Backend Dev', 'Frontend Dev', ''].includes(formData.preferred_role) ? 10 : 0
                    }}>
                    <option value="">Select Role</option>
                    <option value="Software Engineer">Software Engineer</option>
                    <option value="Data Scientist">Data Scientist</option>
                    <option value="ML Engineer">ML Engineer</option>
                    <option value="Backend Dev">Backend Dev</option>
                    <option value="Frontend Dev">Frontend Dev</option>
                    <option value="Other">Other</option>
                  </select>

                  {!['Software Engineer', 'Data Scientist', 'ML Engineer', 'Backend Dev', 'Frontend Dev', ''].includes(formData.preferred_role) && (
                    <input 
                      type="text" 
                      placeholder="Enter your custom role"
                      value={formData.preferred_role.trim()}
                      onChange={(e) => setFormData(p => ({ ...p, preferred_role: e.target.value }))}
                      style={{
                        width: '100%', background: 'var(--s2)', border: '1px solid var(--bd)', borderRadius: 10,
                        padding: '12px 16px', color: 'var(--t1)', fontFamily: 'Syne, sans-serif', fontSize: 14,
                        outline: 'none',
                      }} 
                    />
                  )}
              </div>

              {/* Location Preference Column */}
              <div>
                  <label style={{ fontFamily: '"DM Mono"', fontSize: 11, fontWeight: 700, color: 'var(--t3)', marginBottom: 6, display: 'block', textTransform: 'uppercase', letterSpacing: '.07em' }}>
                    Location Preference
                  </label>
                  <input type="text" value={formData.location_pref} onChange={(e) => setFormData(p => ({ ...p, location_pref: e.target.value }))} style={{
                    width: '100%', background: 'var(--s2)', border: '1px solid var(--bd)', borderRadius: 10,
                    padding: '12px 16px', color: 'var(--t1)', fontFamily: 'Syne, sans-serif', fontSize: 14,
                    outline: 'none',
                  }} />
              </div>

            </div>
          </div>

          <div style={{ background: 'var(--s1)', border: '1px solid var(--bd)', borderRadius: 16, padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div style={{ fontSize: 17, fontWeight: 800, color: 'var(--t1)' }}>Resume</div>
              <input type="file" ref={fileInputRef} onChange={handleResumeUpload} style={{ display: 'none' }} accept=".pdf" />
              <Btn variant="g" size="xs" onClick={() => fileInputRef.current.click()}>Upload New</Btn>
            </div>
            <div
              onClick={() => user.resume_filename && window.open(`${import.meta.env.VITE_API_BASE_URL || 'https://careerbridge-backend-vw5s.onrender.com'}/uploads/resumes/${user.resume_filename}`, '_blank')}
              style={{
                padding: 16, background: 'rgba(0,245,212,.05)', border: '1px solid rgba(0,245,212,.14)',
                borderRadius: 10, display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer',
              }}>
              <span style={{ fontSize: 26 }}>📄</span>
              <div>
                <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--t1)' }}>{user.resume_filename || 'No resume uploaded'}</div>
                <div style={{ fontFamily: '"DM Mono"', fontSize: 11, color: 'var(--t4)', marginTop: 3 }}>
                  {user.resume_uploaded_at ? `Uploaded ${new Date(user.resume_uploaded_at).toLocaleDateString()} · Click to view` : 'Upload a PDF to get matching scores'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
