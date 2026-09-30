import { useEffect, useState } from 'react'
import Icon from './Icon'
import { Avatar } from './Avatar'
import { MEMBERS, eur, equalShares, isEqual, type Shares } from './lib'

export default function SplitEditor({ amount, payer, initial, onChange }: {
  amount: number; payer: string; initial: Shares; onChange: (s: Shares | null) => void
}) {
  const [inc, setInc] = useState(Object.keys(initial))
  const [mode, setMode] = useState<'equal' | 'custom'>(isEqual(initial) ? 'equal' : 'custom')
  const [pct, setPct] = useState<Shares>(() => Object.fromEntries(Object.entries(initial).map(([k, v]) => [k, Math.round(v)])))

  const eq = equalShares(inc)
  const shares: Shares = mode === 'equal' ? eq : Object.fromEntries(inc.map((m) => [m, pct[m] ?? 0]))
  const total = Math.round(Object.values(shares).reduce((a, b) => a + b, 0))
  const valid = inc.some((m) => m !== payer) && total === 100
  useEffect(() => { onChange(valid ? shares : null) }, [inc, mode, pct]) // eslint-disable-line react-hooks/exhaustive-deps

  const toggle = (m: string) => setInc((s) => (s.includes(m) ? s.filter((x) => x !== m) : MEMBERS.filter((x) => s.includes(x) || x === m)))
  const toCustom = () => {
    const r = Object.fromEntries(inc.map((m) => [m, Math.floor(100 / inc.length)]))
    r[inc[0]] += 100 - Object.values(r).reduce((a, b) => a + b, 0)
    setPct(r); setMode('custom')
  }
  const bump = (m: string, d: number) => setPct((p) => ({ ...p, [m]: Math.max(0, Math.min(100, (p[m] ?? 0) + d)) }))
  const two = inc.length === 2
  const presets = [[50, 50], [70, 30], [80, 20], [20, 80]]

  return <>
    <div className="seg" style={{ marginBottom: 12 }}>
      <button className={mode === 'equal' ? 'on' : ''} onClick={() => setMode('equal')}>Equal</button>
      <button className={mode === 'custom' ? 'on' : ''} onClick={toCustom}>Custom %</button>
    </div>
    {mode === 'custom' && two && (
      <div className="pills" style={{ marginBottom: 10 }}>
        {presets.map(([a, b]) => <button key={a} className={'pill' + (pct[inc[0]] === a ? ' on' : '')} onClick={() => setPct({ [inc[0]]: a, [inc[1]]: b })}>{a}/{b}</button>)}
      </div>
    )}
    <div className="divide">
      {MEMBERS.map((m) => {
        const on = inc.includes(m)
        return (
          <div className="row" key={m} style={{ padding: '10px 0', opacity: on ? 1 : 0.5 }}>
            <div className={'check' + (on ? ' on' : '')} onClick={() => toggle(m)}>{on && <Icon name="check" size={15} />}</div>
            <Avatar m={m} />
            <div className="grow"><div className="t">{m}{m === payer ? ' (paid)' : ''}</div>
              {on && <div className="mut">{eur((amount * (shares[m] ?? 0)) / 100)}</div>}</div>
            {on && mode === 'custom' && <div className="row" style={{ gap: 8 }}>
              <button className="step" onClick={() => bump(m, -5)} aria-label="Less"><Icon name="minus" size={16} /></button>
              <b style={{ width: 40, textAlign: 'center' }}>{pct[m] ?? 0}%</b>
              <button className="step" onClick={() => bump(m, 5)} aria-label="More"><Icon name="plus" size={16} /></button>
            </div>}
            {on && mode === 'equal' && <b>{Math.round(shares[m])}%</b>}
          </div>
        )
      })}
    </div>
    {!valid && <div className="mut" style={{ color: 'var(--warn)', marginTop: 8 }}>{total !== 100 ? `Total is ${total}%, it needs to be 100%` : 'Pick at least one roommate'}</div>}
  </>
}
