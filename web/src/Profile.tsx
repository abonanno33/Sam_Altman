import Icon from './Icon'
import { Avatar } from './Avatar'
import { MEMBERS, ME, PROFILE, eur } from './lib'

export default function Profile({ pair, toPayCount, toPayTotal, goBills }: {
  pair: Record<string, number>; toPayCount: number; toPayTotal: number; goBills: () => void
}) {
  const net = Object.values(pair).reduce((a, b) => a + b, 0)
  return <>
    <div className="card">
      <div className="row" style={{ marginBottom: 16 }}>
        <div className="av" style={{ background: '#1e6fd9', width: 56, height: 56, fontSize: 22 }}>{PROFILE.initial}</div>
        <div><div className="b" style={{ fontSize: 18 }}>{PROFILE.name}</div><div className="mut">Rue Haute 12, Brussels</div></div>
      </div>
      <div className="mut">Your status</div>
      <div className={'big ' + (net < 0 ? 'neg' : 'pos')}>{net < 0 ? '−' : '+'}{eur(Math.abs(net))}</div>
      <div className="mut" style={{ marginTop: 6 }}>{Math.abs(net) < 0.005 ? 'You are all square' : net < 0 ? 'You owe more than you are owed' : 'You are owed more than you owe'}</div>
    </div>

    <div className="card divide" style={{ padding: '4px 16px' }}>
      {MEMBERS.filter((m) => m !== ME).map((m) => {
        const v = pair[m]
        return (
          <div className="row" key={m} style={{ padding: '12px 0' }}>
            <Avatar m={m} />
            <div className="grow"><div className="t">{m}</div>
              <div className="mut">{Math.abs(v) < 0.005 ? 'All settled' : v < 0 ? `You owe ${m}` : `${m} owes you`}</div></div>
            <b className={v < -0.005 ? 'neg' : v > 0.005 ? 'pos' : ''}>{v < -0.005 ? '−' : v > 0.005 ? '+' : ''}{eur(Math.abs(v))}</b>
          </div>
        )
      })}
    </div>

    {toPayCount > 0 && (
      <div className="card dark">
        <div className="lab">To pay</div>
        <div style={{ fontSize: 16, fontWeight: 600, margin: '8px 0 14px' }}>{eur(toPayTotal)} across {toPayCount} {toPayCount === 1 ? 'bill' : 'bills'} for your roommates.</div>
        <button className="btn white" onClick={goBills}>Go to bills<Icon name="chevron" size={16} /></button>
      </div>
    )}
  </>
}
