import { useState } from 'react'
import Icon from './Icon'

export function Toggle({ on, set }: { on: boolean; set: (v: boolean) => void }) {
  return <button className={'toggle' + (on ? ' on' : '')} onClick={() => set(!on)} aria-pressed={on}><span /></button>
}

export default function Privacy({ cats, icons, filters, setFilters, kw, setKw, onPurge }: {
  cats: string[]; icons: Record<string, string>; filters: Record<string, boolean>; setFilters: (f: Record<string, boolean>) => void
  kw: string[]; setKw: (k: string[]) => void; onPurge: () => void
}) {
  const [text, setText] = useState('')
  const add = (e: React.FormEvent) => { e.preventDefault(); const v = text.trim(); if (v && !kw.includes(v)) setKw([...kw, v]); setText('') }
  return <>
    <div className="mut" style={{ margin: '0 4px' }}>Payments in these categories are shared automatically when they look shared</div>
    <div className="card divide" style={{ padding: '4px 16px' }}>
      {cats.map((c) => (
        <div className="row" key={c} style={{ padding: '4px 0' }}>
          <div className="ico s"><Icon name={icons[c]} size={18} /></div><div className="grow t">{c}</div>
          <Toggle on={!!filters[c]} set={(v) => setFilters({ ...filters, [c]: v })} />
        </div>
      ))}
    </div>
    <div className="card">
      <b>Always share</b>
      <div className="mut" style={{ margin: '2px 0 10px' }}>Merchants containing a keyword</div>
      <form className="row" onSubmit={add}>
        <input type="text" placeholder="Merchant or keyword" value={text} onChange={(e) => setText(e.target.value)} style={{ margin: 0 }} />
        <button className="iconbtn" aria-label="Add keyword"><Icon name="plus" size={20} /></button>
      </form>
      {kw.length > 0 && <div className="pills" style={{ marginTop: 12 }}>{kw.map((k) => <button key={k} className="kw" onClick={() => setKw(kw.filter((x) => x !== k))}>{k}<Icon name="close" size={12} /></button>)}</div>}
    </div>
    <button className="btn danger block" onClick={onPurge}>Stop sharing and delete data</button>
  </>
}
