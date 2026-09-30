import { AV_COLOR, initial } from './lib'

export const Avatar = ({ m, small }: { m: string; small?: boolean }) => (
  <div className={'av' + (small ? ' s' : '')} style={{ background: AV_COLOR[m] }}>{initial(m)}</div>
)
export const Avatars = ({ names }: { names: string[] }) => <div className="avs">{names.map((n) => <Avatar key={n} m={n} small />)}</div>
