import { useState } from 'react'
import Icon from './Icon'
import Sheet from './Sheet'
import { Avatar } from './Avatar'
import { ME, eur, type Goal } from './lib'

export default function Goals({ goals, setGoals }: { goals: Goal[]; setGoals: (g: Goal[]) => void }) {
  const [add, setAdd] = useState<Goal | 'new' | null>(null)
  const [amount, setAmount] = useState('')
  const [note, setNote] = useState('')
  const [name, setName] = useState('')
  const [target, setTarget] = useState('')
  const [open, setOpen] = useState<number | null>(null)

  const saved = (g: Goal) => g.contribs.reduce((s, c) => s + c.amount, 0)
  const close = () => { setAdd(null); setAmount(''); setNote(''); setName(''); setTarget('') }
  const save = () => {
    if (add === 'new') setGoals([...goals, { id: Date.now(), name, target: parseFloat(target), contribs: [] }])
    else if (add) setGoals(goals.map((g) => g.id === add.id ? { ...g, contribs: [{ id: Date.now(), who: ME, amount: parseFloat(amount), date: 'Today', note: note || undefined }, ...g.contribs] } : g))
    close()
  }

  return <>
    {goals.map((g) => {
      const s = saved(g), p = Math.min(s / g.target, 1)
      return (
        <div className="card" key={g.id}>
          <div className="head"><div className="t" style={{ fontSize: 16, fontWeight: 700 }}>{g.name}</div><b style={{ color: 'var(--ok)' }}>{Math.round(p * 100)}%</b></div>
          <div className="bar g" style={{ margin: '12px 0 8px' }}><div style={{ width: `${p * 100}%` }} /></div>
          <div className="mut">{eur(s)} of {eur(g.target)} · {eur(Math.max(g.target - s, 0))} to go</div>
          <div className="row" style={{ marginTop: 14 }}>
            <button className="btn sm" onClick={() => setAdd(g)}><Icon name="plus" size={16} />Log my contribution</button>
            <span className="grow" />
            <button className="link" onClick={() => setOpen(open === g.id ? null : g.id)}>{open === g.id ? 'Hide log' : `Log (${g.contribs.length})`}</button>
          </div>
          {open === g.id && <div className="divide" style={{ marginTop: 10 }}>
            {g.contribs.map((c) => (
              <div className="row" key={c.id} style={{ padding: '10px 0' }}>
                <Avatar m={c.who} />
                <div className="grow"><div className="t">{c.who === ME ? 'You' : c.who}</div><div className="mut">{c.date}{c.note ? ` · ${c.note}` : ''}</div></div>
                <b>{eur(c.amount)}</b>
              </div>
            ))}
            {!g.contribs.length && <div className="mut" style={{ padding: '10px 0' }}>Nothing logged yet</div>}
          </div>}
        </div>
      )
    })}
    <button className="btn ghost block" onClick={() => setAdd('new')}><Icon name="plus" size={16} />New household goal</button>

    {add && (
      <Sheet onClose={close}>
        {add === 'new' ? <>
          <h3>New household goal</h3>
          <div className="mut" style={{ marginBottom: 14 }}>Something you want to buy together</div>
          <input type="text" placeholder="Name, for example Dishwasher" value={name} onChange={(e) => setName(e.target.value)} style={{ marginBottom: 10 }} />
          <input type="text" inputMode="decimal" placeholder="Target in €" value={target} onChange={(e) => setTarget(e.target.value)} style={{ marginBottom: 16 }} />
          <button className="btn block" disabled={!name.trim() || !(parseFloat(target) > 0)} onClick={save}>Create goal</button>
        </> : <>
          <h3>{add.name}</h3>
          <div className="mut" style={{ marginBottom: 14 }}>Write down what you are putting towards it. This is a shared note, no money moves.</div>
          <input type="text" inputMode="decimal" placeholder="Amount in €" value={amount} onChange={(e) => setAmount(e.target.value)} style={{ marginBottom: 10 }} />
          <input type="text" placeholder="Note (optional)" value={note} onChange={(e) => setNote(e.target.value)} style={{ marginBottom: 16 }} />
          <button className="btn block" disabled={!(parseFloat(amount) > 0)} onClick={save}>Save to the log</button>
        </>}
      </Sheet>
    )}
  </>
}
