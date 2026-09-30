import { useState } from 'react'
import Icon from './Icon'
import Sheet from './Sheet'
import SplitEditor from './SplitEditor'
import { Avatar } from './Avatar'
import { Consent, Invite } from './Onboarding'
import Profile from './Profile'
import Activity from './Activity'
import Bills from './Bills'
import Goals from './Goals'
import Privacy from './Privacy'
import {
  CATS, ICON, IBAN, ME, PROFILE, autoDecision, eur, equalShares, MEMBERS, owesMe, pairwise, pending, seedExpenses, seedFilters,
  seedGoals, seedTxs, shareOf, splitText, txExpense, type Expense, type Shares, type Tx,
} from './lib'

type Tab = 'profile' | 'activity' | 'bills' | 'goals' | 'privacy'
const TABS: [Tab, string, string][] = [['profile', 'user', 'Profile'], ['activity', 'spark', 'Activity'], ['bills', 'bills', 'Bills'], ['goals', 'target', 'Goals'], ['privacy', 'shield', 'Privacy']]
const TITLES: Record<Tab, string> = { profile: 'Your profile', activity: 'Activity', bills: 'Bills', goals: 'Household goals', privacy: 'Privacy' }

export default function App() {
  const [stage, setStage] = useState<'consent' | 'invite' | 'app'>('consent')
  const [tab, setTab] = useState<Tab>('profile')
  const [filters, setFilters] = useState(seedFilters)
  const [kw, setKw] = useState<string[]>([])
  const [goals, setGoals] = useState(seedGoals)
  const [manual, setManual] = useState(seedExpenses)
  const [txs, setTxs] = useState(seedTxs)
  const [open, setOpen] = useState<number | null>(null)
  const [sharing, setSharing] = useState<Tx | null>(null)
  const [editing, setEditing] = useState<Expense | null>(null)
  const [draft, setDraft] = useState<Shares | null>(null)
  const [paying, setPaying] = useState<Expense | null>(null)
  const [paid, setPaid] = useState(false)
  const [purge, setPurge] = useState(false)

  const decisionOf = (t: Tx) => t.decision ?? autoDecision(t, filters, kw)
  const patchTx = (id: number, p: Partial<Tx>) => setTxs((xs) => xs.map((t) => (t.id === id ? { ...t, ...p } : t)))
  const patchExpense = (id: number, p: Partial<Expense>) => {
    if (id >= 1000) patchTx(id - 1000, { settled: p.settled, requested: p.requested, shares: p.shares } as Partial<Tx>)
    else setManual((xs) => xs.map((e) => (e.id === id ? { ...e, ...p } : e)))
  }
  const stopSharing = (e: Expense) => (e.id >= 1000 ? patchTx(e.id - 1000, { decision: 'private' }) : patchExpense(e.id, { hidden: true }))

  const expenses: Expense[] = [...txs.filter((t) => decisionOf(t) === 'shared').map(txExpense), ...manual]
  const live = expenses.filter((e) => !e.hidden)
  const pair = pairwise(live)
  const toPay = live.filter(owesMe)
  const toPayTotal = toPay.reduce((s, e) => s + shareOf(e, ME), 0)
  const current = expenses.find((e) => e.id === open)

  const reset = () => {
    setManual(seedExpenses); setTxs(seedTxs); setFilters(seedFilters); setKw([]); setGoals(seedGoals)
    setPurge(false); setTab('profile'); setStage('consent')
  }
  const strip = (p: Record<string, number>) => Object.fromEntries(Object.entries(p).filter(([, v]) => v > 0))
  const saveSplit = () => {
    if (!draft) return
    if (sharing) patchTx(sharing.id, { decision: 'shared', shares: strip(draft) })
    else if (editing) patchExpense(editing.id, { shares: strip(draft) })
    setSharing(null); setEditing(null); setDraft(null)
  }
  const leave = (e: Expense) => {
    const rest = Object.fromEntries(Object.entries(e.shares).filter(([m]) => m !== ME))
    const sum = Object.values(rest).reduce((a, b) => a + b, 0)
    patchExpense(e.id, { shares: Object.fromEntries(Object.entries(rest).map(([m, v]) => [m, (v / sum) * 100])) })
    setOpen(null)
  }
  const pay = () => {
    if (!paying) return
    patchExpense(paying.id, { settled: [...paying.settled, ME] })
    setPaid(true)
    setTimeout(() => { setPaid(false); setPaying(null) }, 1400)
  }

  const splitTarget = sharing ? { amount: sharing.amount, payer: ME, initial: sharing.shares ?? equalShares(MEMBERS), title: sharing.merchant }
    : editing ? { amount: editing.amount, payer: editing.paidBy, initial: editing.shares, title: editing.title } : null

  return (
    <div className="phone">
      <div className="top">
        <div><div className="lab">Roommates · 4 people</div><h1>{stage === 'app' ? TITLES[tab] : 'Roommates'}</h1></div>
        <div className="logo"><img src="/kbc-logo.svg" alt="KBC" /></div>
      </div>

      {stage === 'consent' && <Consent onDone={() => setStage('invite')} />}
      {stage === 'invite' && <Invite onDone={() => setStage('app')} />}

      {stage === 'app' && <div className="body">
        {tab === 'profile' && <Profile pair={pair} toPayCount={toPay.length} toPayTotal={toPayTotal} goBills={() => setTab('bills')} />}
        {tab === 'activity' && <Activity txs={txs} decisionOf={decisionOf} onShare={(t) => { setSharing(t); setDraft(t.shares ?? equalShares(MEMBERS)) }} onPrivate={(t) => patchTx(t.id, { decision: 'private' })} />}
        {tab === 'bills' && <Bills expenses={expenses} onOpen={setOpen} onPay={(e) => setPaying(e)} onRequest={(id) => patchExpense(id, { requested: true })} />}
        {tab === 'goals' && <Goals goals={goals} setGoals={setGoals} />}
        {tab === 'privacy' && <Privacy cats={CATS} icons={ICON} filters={filters} setFilters={setFilters} kw={kw} setKw={setKw} onPurge={() => setPurge(true)} />}
      </div>}

      {stage === 'app' && <div className="tabs">
        {TABS.map(([k, i, l]) => <button key={k} className={tab === k ? 'on' : ''} onClick={() => setTab(k)}><Icon name={i} size={22} />{l}</button>)}
      </div>}

      {current && !editing && !paying && (
        <Sheet onClose={() => setOpen(null)}>
          <div className="row" style={{ marginBottom: 16 }}>
            <Avatar m={current.paidBy} />
            <div className="grow"><h3>{current.title}</h3><div className="mut">Paid by {current.paidBy === ME ? 'you' : current.paidBy}, {current.date}</div></div>
            <b style={{ fontSize: 18 }}>{eur(current.amount)}</b>
          </div>
          <div className="mut" style={{ marginBottom: 4 }}>Split: {splitText(current)}</div>
          <div className="divide">
            {Object.keys(current.shares).filter((m) => current.shares[m] > 0).map((m) => (
              <div className="row" key={m} style={{ padding: '9px 0' }}>
                <Avatar m={m} /><div className="grow t">{m}</div><span className="mut">{eur(shareOf(current, m))}</span>
                {m === current.paidBy ? <span className="chip">Paid</span> : current.settled.includes(m) ? <span className="chip ok">Paid back</span> : <span className="chip warn">To pay</span>}
              </div>
            ))}
          </div>
          <div style={{ display: 'grid', gap: 10, marginTop: 16 }}>
            {owesMe(current) && <button className="btn block" onClick={() => { setPaying(current) }}>Pay {current.paidBy} {eur(shareOf(current, ME))}</button>}
            {current.paidBy === ME && <button className="btn ghost block" onClick={() => { setEditing(current); setDraft(current.shares) }}>Change split</button>}
            {current.paidBy === ME && !current.requested && pending(current).length > 0 && <button className="btn block" onClick={() => patchExpense(current.id, { requested: true })}>Request money</button>}
            {current.paidBy === ME && (current.hidden
              ? <button className="btn block" onClick={() => patchExpense(current.id, { hidden: false })}>Share again</button>
              : <button className="btn ghost block" onClick={() => { stopSharing(current); setOpen(null) }}>Stop sharing this bill</button>)}
            {current.paidBy !== ME && (current.shares[ME] ?? 0) > 0 && !current.settled.includes(ME) &&
              <button className="btn ghost block" onClick={() => leave(current)}>Leave this split</button>}
          </div>
        </Sheet>
      )}

      {splitTarget && (
        <Sheet onClose={() => { setSharing(null); setEditing(null); setDraft(null) }}>
          <div className="row" style={{ marginBottom: 14 }}>
            <div className="grow"><h3>{sharing ? `Share ${splitTarget.title}` : `Split ${splitTarget.title}`}</h3><div className="mut">Choose who shares the {eur(splitTarget.amount)}</div></div>
          </div>
          <SplitEditor key={splitTarget.title} amount={splitTarget.amount} payer={splitTarget.payer} initial={splitTarget.initial} onChange={setDraft} />
          <button className="btn block" style={{ marginTop: 16 }} disabled={!draft} onClick={saveSplit}>{sharing ? 'Share with roommates' : 'Save split'}</button>
        </Sheet>
      )}

      {paying && (
        <Sheet onClose={() => !paid && setPaying(null)}>
          {paid ? (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <div className="ico" style={{ margin: '0 auto 12px', background: 'var(--okbg)', color: 'var(--ok)', width: 56, height: 56 }}><Icon name="check" size={28} /></div>
              <h3>Sent to {paying.paidBy}</h3><div className="mut">{eur(shareOf(paying, ME))} from your account</div>
            </div>
          ) : <>
            <h3>Pay {paying.paidBy}</h3>
            <div className="mut" style={{ marginBottom: 16 }}>{paying.title}, your part of {eur(paying.amount)}</div>
            <div className="card divide" style={{ background: 'var(--bg)', padding: '4px 16px', marginBottom: 16 }}>
              <div className="row" style={{ padding: '12px 0' }}><span className="mut grow">Amount</span><b style={{ fontSize: 18 }}>{eur(shareOf(paying, ME))}</b></div>
              <div className="row" style={{ padding: '12px 0' }}><span className="mut grow">To</span><span className="b">{paying.paidBy} · {IBAN[paying.paidBy]}</span></div>
              <div className="row" style={{ padding: '12px 0' }}><span className="mut grow">From</span><span className="b">{PROFILE.name} · Current account</span></div>
            </div>
            <button className="btn block" onClick={pay}><Icon name="bank" size={18} />Confirm with PIN</button>
          </>}
        </Sheet>
      )}

      {purge && (
        <Sheet onClose={() => setPurge(false)}>
          <h3>Stop sharing?</h3>
          <p className="mut" style={{ margin: '4px 0 18px' }}>Your shared payments disappear for your roommates and your invite codes stop working.</p>
          <button className="btn dangerfill block" onClick={reset}>Yes, delete shared data</button>
          <button className="btn ghost block" style={{ marginTop: 10 }} onClick={() => setPurge(false)}>Cancel</button>
        </Sheet>
      )}
    </div>
  )
}
