import { useState } from 'react'
import Icon from './Icon'
import { Avatar, Avatars } from './Avatar'
import { CATS, CAT_COLOR, ICON, ME, MONTHS, eur, owesMe, pending, shareOf, splitText, type Expense } from './lib'

const who = (e: Expense) => Object.keys(e.shares).filter((m) => e.shares[m] > 0)

export function Donut({ parts, total }: { parts: [string, number][]; total: number }) {
  const r = 36, C = 2 * Math.PI * r
  let acc = 0
  return (
    <svg width="104" height="104" viewBox="0 0 100 100" style={{ flex: 'none' }}>
      <circle cx="50" cy="50" r={r} fill="none" stroke="#e3e9f1" strokeWidth="16" />
      {parts.map(([c, v]) => {
        const len = (v / total) * C
        const el = <circle key={c} cx="50" cy="50" r={r} fill="none" stroke={CAT_COLOR[c as keyof typeof CAT_COLOR]} strokeWidth="16" strokeDasharray={`${len} ${C - len}`} strokeDashoffset={-acc} transform="rotate(-90 50 50)" />
        acc += len
        return el
      })}
      <text x="50" y="46" textAnchor="middle" fontSize="8" fill="#4a5a70">shared</text>
      <text x="50" y="59" textAnchor="middle" fontSize="13" fontWeight="800" fill="#0b2545">€{Math.round(total).toLocaleString()}</text>
    </svg>
  )
}

export default function Bills({ expenses, onOpen, onPay, onRequest }: {
  expenses: Expense[]; onOpen: (id: number) => void; onPay: (e: Expense) => void; onRequest: (id: number) => void
}) {
  const live = expenses.filter((e) => !e.hidden)
  const toPay = live.filter(owesMe)
  const waiting = live.filter((e) => e.paidBy === ME && pending(e).length > 0)
  const [view, setView] = useState<'pay' | 'history'>(toPay.length ? 'pay' : 'history')
  const [month, setMonth] = useState('Sep')
  const [all, setAll] = useState(false)

  const inMonth = live.filter((e) => e.month === month)
  const total = inMonth.reduce((s, e) => s + e.amount, 0)
  const parts = CATS.map((c) => [c, inMonth.filter((e) => e.cat === c).reduce((s, e) => s + e.amount, 0)] as [string, number]).filter(([, v]) => v > 0).sort((a, b) => b[1] - a[1])
  const mine = inMonth.reduce((s, e) => s + shareOf(e, ME), 0)

  return <>
    <div className="seg">
      <button className={view === 'pay' ? 'on' : ''} onClick={() => setView('pay')}>To pay{toPay.length ? ` (${toPay.length})` : ''}</button>
      <button className={view === 'history' ? 'on' : ''} onClick={() => setView('history')}>Monthly</button>
    </div>

    {view === 'pay' && <>
      {toPay.length === 0 && <div className="card mut" style={{ textAlign: 'center', padding: 24 }}>Nothing to pay right now</div>}
      {toPay.map((e) => (
        <div className="card" key={e.id} onClick={() => onOpen(e.id)} style={{ cursor: 'pointer' }}>
          <div className="row">
            <Avatar m={e.paidBy} />
            <div className="grow"><div className="t">{e.title}</div><div className="mut">{e.paidBy} paid the bill</div></div>
            <div style={{ textAlign: 'right' }}><div className="b" style={{ fontSize: 18 }}>{eur(shareOf(e, ME))}</div><div className="mut">of {eur(e.amount)}</div></div>
          </div>
          <div className="row" style={{ margin: '12px 0 0' }}>
            <span className="mut">Shared with</span><Avatars names={who(e)} /><span className="grow" />
            <button className="btn sm" onClick={(ev) => { ev.stopPropagation(); onPay(e) }}>Pay {e.paidBy}</button>
          </div>
        </div>
      ))}

      {waiting.length > 0 && <>
        <div className="head" style={{ margin: '6px 4px 0' }}><b>Waiting for your roommates</b></div>
        {waiting.slice(0, 2).map((e) => (
          <div className="card row" key={e.id} onClick={() => onOpen(e.id)} style={{ cursor: 'pointer', padding: 14 }}>
            <div className="ico"><Icon name={ICON[e.cat]} size={20} /></div>
            <div className="grow"><div className="t">{e.title}</div><div className="mut">{pending(e).join(', ')} still to pay</div></div>
            {e.requested ? <span className="chip warn">Requested</span>
              : <button className="btn sm" onClick={(ev) => { ev.stopPropagation(); onRequest(e.id) }}>Request</button>}
          </div>
        ))}
        {waiting.length > 2 && <div className="mut" style={{ textAlign: 'center' }}>+{waiting.length - 2} more waiting</div>}
      </>}
    </>}

    {view === 'history' && <>
      <div className="pills">{MONTHS.map(([k, label]) => <button key={k} className={'pill' + (month === k ? ' on' : '')} onClick={() => setMonth(k)}>{label}</button>)}</div>
      <div className="card">
        <div className="row" style={{ alignItems: 'center', gap: 16 }}>
          {parts.length > 0 ? <Donut parts={parts} total={total} /> : <div style={{ width: 104 }} />}
          <div className="grow"><div className="mut">Your share</div><div className="b" style={{ fontSize: 26, letterSpacing: '-.02em' }}>{eur(mine)}</div>
            <div className="mut">{inMonth.length} shared bills</div></div>
        </div>
        <div className="divide" style={{ marginTop: 12 }}>
          {parts.map(([c, v]) => (
            <div className="row" key={c} style={{ padding: '6px 0' }}>
              <span className="dot" style={{ background: CAT_COLOR[c as keyof typeof CAT_COLOR] }} /><span className="grow t">{c}</span>
              <span className="mut">{Math.round((v / total) * 100)}%</span><b style={{ width: 70, textAlign: 'right' }}>{eur(v)}</b>
            </div>
          ))}
        </div>
      </div>
      {expenses.filter((e) => e.month === month).slice(0, all ? 99 : 2).map((e) => {
        const left = pending(e).length
        return (
          <div className="card row" key={e.id} onClick={() => onOpen(e.id)} style={{ cursor: 'pointer', padding: 14, opacity: e.hidden ? 0.55 : 1 }}>
            <Avatar m={e.paidBy} />
            <div className="grow"><div className="t">{e.title}</div>
              <div className="mut">{e.paidBy === ME ? 'You' : e.paidBy} paid · {e.date} · {splitText(e)}</div></div>
            <div style={{ textAlign: 'right' }}><b>{eur(e.amount)}</b>
              <div>{e.hidden ? <span className="chip grey">Not shared</span> : left === 0 ? <span className="chip ok">Settled</span> : <span className="chip warn">{left} to pay</span>}</div></div>
          </div>
        )
      })}
      {expenses.filter((e) => e.month === month).length > 2 && <button className="link" onClick={() => setAll(!all)}>{all ? 'Show fewer' : `Show all ${expenses.filter((e) => e.month === month).length} bills`}</button>}
    </>}
  </>
}
