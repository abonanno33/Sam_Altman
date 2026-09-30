import { useEffect, useState } from 'react'
import Icon from './Icon'

const TOKEN = 'kbc-room-92f8-xyz7'
const CONSENT = [
  'Roommates only shares the payments I choose.',
  'I decide which categories my roommates can see.',
  'I can stop sharing and delete my shared data at any time.',
]

export function Consent({ onDone }: { onDone: () => void }) {
  const [chk, setChk] = useState([false, false, false])
  return (
    <div className="body">
      <div style={{ marginTop: 6 }}>
        <div className="ico" style={{ marginBottom: 14 }}><Icon name="shield" /></div>
        <h3 style={{ fontSize: 24, marginBottom: 6 }}>Share bills with your roommates</h3>
        <div className="mut">You stay in control of what is shared.</div>
      </div>
      {CONSENT.map((t, i) => (
        <div key={i} className="card row" style={{ padding: 14, cursor: 'pointer' }} onClick={() => setChk(chk.map((c, j) => (j === i ? !c : c)))}>
          <div className={'check box' + (chk[i] ? ' on' : '')}>{chk[i] && <Icon name="check" size={16} />}</div>
          <div className="grow t">{t}</div>
        </div>
      ))}
      <button className="btn block" disabled={!chk.every(Boolean)} onClick={onDone}>Continue</button>
    </div>
  )
}

export function Invite({ onDone }: { onDone: () => void }) {
  const [mode, setMode] = useState<'invite' | 'join'>('invite')
  const [secs, setSecs] = useState(600)
  const [code, setCode] = useState('')
  const [copied, setCopied] = useState(false)
  useEffect(() => {
    if (mode !== 'invite' || secs <= 0) return
    const i = setInterval(() => setSecs((s) => s - 1), 1000)
    return () => clearInterval(i)
  }, [mode, secs > 0])
  const mm = String(Math.floor(secs / 60)).padStart(2, '0')
  const ss = String(secs % 60).padStart(2, '0')
  const copy = () => { try { navigator.clipboard.writeText(TOKEN) } catch { /* ignore */ } setCopied(true); setTimeout(() => setCopied(false), 1500) }
  return (
    <div className="body">
      <div><h3 style={{ fontSize: 22, marginBottom: 6 }}>Connect your flat</h3>
        <div className="mut">Every roommate confirms with their KBC PIN.</div></div>
      <div className="seg" style={{ margin: 0 }}>
        <button className={mode === 'invite' ? 'on' : ''} onClick={() => setMode('invite')}>Invite</button>
        <button className={mode === 'join' ? 'on' : ''} onClick={() => setMode('join')}>Join with code</button>
      </div>
      {mode === 'invite' ? (
        <div className="card" style={{ textAlign: 'center' }}>
          <div className="mut">One-time invite code</div>
          <div className="code" style={{ margin: '8px 0', color: secs > 0 ? undefined : '#b7c7d6', textDecoration: secs > 0 ? undefined : 'line-through' }}>{TOKEN}</div>
          <div className="timer" style={{ color: secs > 60 ? 'var(--ok)' : 'var(--warn)', margin: '10px 0 16px' }}>{secs > 0 ? `${mm}:${ss}` : 'Expired'}</div>
          {secs > 0 ? <>
            <button className="btn ghost block" onClick={copy}><Icon name="copy" size={18} />{copied ? 'Copied' : 'Copy invite'}</button>
            <button className="btn block" style={{ marginTop: 10 }} onClick={onDone}>Demo: roommates join</button>
          </> : <button className="btn block" onClick={() => setSecs(600)}>New invite code</button>}
        </div>
      ) : (
        <div className="card">
          <input type="text" placeholder="kbc-room-xxxx-xxxx" value={code} onChange={(e) => setCode(e.target.value)} />
          <button className="btn block" disabled={!/^kbc-room-/.test(code.trim())} onClick={onDone}>Confirm with PIN and join</button>
        </div>
      )}
    </div>
  )
}
