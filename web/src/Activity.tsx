import { useState } from 'react'
import Icon from './Icon'
import { Avatars } from './Avatar'
import { ICON, eur, equalShares, MEMBERS, type Decision, type Tx } from './lib'

export default function Activity({ txs, decisionOf, onShare, onPrivate }: {
  txs: Tx[]; decisionOf: (t: Tx) => Decision; onShare: (t: Tx) => void; onPrivate: (t: Tx) => void
}) {
  const [seg, setSeg] = useState<'needs' | 'shared' | 'priv'>('needs')
  const needs = txs.filter((t) => decisionOf(t) === undefined)
  const shared = txs.filter((t) => decisionOf(t) === 'shared')
  const priv = txs.filter((t) => decisionOf(t) === 'private')

  const Row = ({ t, children }: { t: Tx; children: React.ReactNode }) => (
    <div className="card" style={{ padding: 12 }}>
      <div className="row">
        <div className="ico"><Icon name={ICON[t.cat]} size={20} /></div>
        <div className="grow"><div className="t">{t.merchant}</div><div className="mut">{t.date} · {t.cat}</div></div>
        <b>{eur(t.amount)}</b>
      </div>
      <div className="mut" style={{ margin: '6px 0 6px 52px' }}>{t.reason}</div>
      <div className="row" style={{ marginLeft: 52 }}>{children}</div>
    </div>
  )
  const SEGS = [['needs', 'Your call', needs.length], ['shared', 'Shared', shared.length], ['priv', 'Private', priv.length]] as const

  return <>
    <div className="seg">
      {SEGS.map(([k, l, n]) => <button key={k} className={seg === k ? 'on' : ''} onClick={() => setSeg(k)}>{l} ({n})</button>)}
    </div>

    {seg === 'needs' && <>
      {needs.map((t) => (
        <Row key={t.id} t={t}>
          <div style={{ width: '100%' }}>
            <span className="chip">Likely shared · {Math.round(t.score * 100)}%</span>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, margin: '8px 0 0 -52px', width: 'calc(100% + 52px)' }}>
              <button className="btn sm" onClick={() => onShare(t)}>Share</button>
              <button className="btn sm ghost" onClick={() => onPrivate(t)}>Keep private</button>
            </div>
          </div>
        </Row>
      ))}
    </>}

    {seg === 'shared' && <>
      {shared.map((t) => (
        <Row key={t.id} t={t}>
          <span className="chip ok">{t.decision ? 'Shared' : 'Auto-shared'}</span>
          <Avatars names={Object.keys(t.shares ?? equalShares(MEMBERS))} />
          <span className="grow" />
          <button className="link" onClick={() => (t.decision ? onShare(t) : onPrivate(t))}>{t.decision ? 'Change' : 'Undo'}</button>
        </Row>
      ))}
    </>}

    {seg === 'priv' && <>
      {priv.map((t) => (
        <Row key={t.id} t={t}>
          {t.decision ? <span className="chip grey">Kept private</span>
            : t.score <= 0.25 ? <span className="chip warn"><Icon name="flag" size={12} />Flagged · personal</span>
            : <span className="chip grey">By your settings</span>}
          <span className="grow" />
          <button className="link" onClick={() => onShare(t)}>Share instead</button>
        </Row>
      ))}
    </>}
  </>
}
