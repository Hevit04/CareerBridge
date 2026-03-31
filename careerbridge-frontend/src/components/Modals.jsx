import { Btn } from './UI'
import { useToast } from '../hooks/useToast'

export function ReportModal({ onClose }) {
  const toast = useToast()
  return (
    <div className="modal-bg" onClick={onClose}>
      <div className="modal-box p-8" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-[22px] font-extrabold tracking-tight" style={{ color: 'var(--t1)' }}>
            Interview Report — Technical #3
          </h2>
          <Btn variant="g" size="xs" onClick={onClose}>✕</Btn>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { v: '88', label: 'Overall', c: 'var(--P)' },
            { v: '85%', label: 'Clarity', c: 'var(--A)' },
            { v: '38m', label: 'Duration', c: 'var(--E)' },
          ].map(s => (
            <div key={s.label} className="text-center py-4 px-3 rounded-xl" style={{ background: 'var(--s2)' }}>
              <div className="font-bebas text-[42px] leading-none" style={{ fontFamily: '"Bebas Neue", cursive', color: s.c }}>{s.v}</div>
              <div className="text-[11px] mt-1" style={{ color: 'var(--t4)', fontFamily: '"DM Mono", monospace' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* AI Feedback */}
        <h3 className="text-[17px] font-extrabold mb-3" style={{ color: 'var(--t1)' }}>AI Feedback</h3>
        <div className="flex flex-col gap-2.5 mb-6">
          <div className="px-4 py-3 rounded-xl text-[14px]" style={{ background: 'rgba(74,222,128,.06)', border: '1px solid rgba(74,222,128,.14)', color: 'var(--t2)' }}>
            ✅ <strong style={{ color: '#4ade80' }}>Strength:</strong> Clear problem decomposition with excellent use of time complexity analysis. Communicates trade-offs naturally.
          </div>
          <div className="px-4 py-3 rounded-xl text-[14px]" style={{ background: 'rgba(255,77,109,.06)', border: '1px solid rgba(255,77,109,.14)', color: 'var(--t2)' }}>
            ⚠ <strong style={{ color: 'var(--E)' }}>Improve:</strong> Pacing was fast in the first 10 minutes. Practice speaking 15% slower — interviewers need time to follow.
          </div>
          <div className="px-4 py-3 rounded-xl text-[14px]" style={{ background: 'rgba(212,255,0,.05)', border: '1px solid rgba(212,255,0,.1)', color: 'var(--t2)' }}>
            💡 <strong style={{ color: 'var(--A)' }}>Tip:</strong> Always ask clarifying questions before coding. This shows structured thinking and is rewarded highly.
          </div>
        </div>

        <div className="flex gap-2.5">
          <Btn variant="g" size="md" className="flex-1" onClick={onClose}>Close</Btn>
          <Btn variant="p" size="md" className="flex-1" onClick={() => { toast('📥 Full report downloaded!'); onClose() }}>Download PDF</Btn>
        </div>
      </div>
    </div>
  )
}

export function ApplyModal({ job, onClose }) {
  const toast = useToast()
  const submit = () => { onClose(); toast("🚀 Application submitted! You'll hear back within 5–7 days.") }
  if (!job) return null
  return (
    <div className="modal-bg" onClick={onClose}>
      <div className="modal-box p-8" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-1">
          <h2 className="text-[22px] font-extrabold tracking-tight" style={{ color: 'var(--t1)' }}>Apply — {job.role}</h2>
          <Btn variant="g" size="xs" onClick={onClose}>✕</Btn>
        </div>
        <p className="text-[14px] mb-6" style={{ color: 'var(--t2)' }}>{job.role} · {job.co} · {job.loc}</p>

        <div className="mb-3.5">
          <label className="block mb-1.5 text-[11px] font-bold uppercase tracking-wide" style={{ color: 'var(--t3)', fontFamily: '"DM Mono", monospace' }}>Cover Letter</label>
          <textarea
            className="inp"
            style={{ minHeight: 100 }}
            defaultValue="I am a passionate third-year CSE student with strong DSA foundations and hands-on experience in React and Python. My CareerBridge overall score of 87.4 reflects consistent performance across technical and communication domains."
          />
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4.5">
          <div>
            <label className="block mb-1.5 text-[11px] font-bold uppercase tracking-wide" style={{ color: 'var(--t3)', fontFamily: '"DM Mono", monospace' }}>Available From</label>
            <input className="inp" type="date" defaultValue="2026-05-01" />
          </div>
          <div>
            <label className="block mb-1.5 text-[11px] font-bold uppercase tracking-wide" style={{ color: 'var(--t3)', fontFamily: '"DM Mono", monospace' }}>Expected Stipend</label>
            <input className="inp" defaultValue="₹40,000 / month" />
          </div>
        </div>

        <div className="flex items-center gap-2.5 px-4 py-3 rounded-lg mb-5" style={{ background: 'rgba(0,245,212,.05)', border: '1px solid rgba(0,245,212,.12)' }}>
          <span className="text-[20px]">📄</span>
          <span className="text-[13px]" style={{ color: 'var(--t2)' }}>Bhumika_Jain_Resume_2026.pdf will be auto-attached</span>
        </div>

        <Btn variant="p" size="lg" className="w-full" onClick={submit}>Submit Application →</Btn>
      </div>
    </div>
  )
}
