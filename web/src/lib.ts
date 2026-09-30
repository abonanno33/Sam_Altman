export const ME = 'You'
export const MEMBERS = ['You', 'Emma', 'Lucas', 'Sofia']
export const PROFILE = { name: 'Alex Peeters', initial: 'A' }
export const initial = (m: string) => (m === ME ? PROFILE.initial : m[0])
export const AV_COLOR: Record<string, string> = { You: '#1E6FD9', Emma: '#C25A12', Lucas: '#0B2545', Sofia: '#E39A5B' }
export const IBAN: Record<string, string> = { Emma: 'BE68 •••• •••• 4512', Lucas: 'BE12 •••• •••• 0934', Sofia: 'BE55 •••• •••• 7781' }

export type Cat = 'Rent' | 'Utilities' | 'Groceries' | 'Drinks' | 'Household' | 'Leisure' | 'Personal'
export const ICON: Record<Cat, string> = { Rent: 'home', Utilities: 'bolt', Groceries: 'cart', Drinks: 'drink', Household: 'roll', Leisure: 'ticket', Personal: 'user' }
export const CAT_COLOR: Record<Cat, string> = { Rent: '#0B2545', Groceries: '#1E6FD9', Utilities: '#C25A12', Household: '#7FB2F0', Drinks: '#F2B27F', Leisure: '#B4BFCD', Personal: '#8A98AB' }
export const CATS = Object.keys(ICON) as Cat[]

export type Shares = Record<string, number>
export type Expense = {
  id: number; title: string; cat: Cat; amount: number; paidBy: string; shares: Shares
  requested: boolean; settled: string[]; date: string; month: string; hidden?: boolean
}
export type Tx = {
  id: number; merchant: string; cat: Cat; amount: number; date: string; month: string; score: number; reason: string
  decision?: 'shared' | 'private'; shares?: Shares; settled: string[]; requested: boolean
}
export type Contribution = { id: number; who: string; amount: number; date: string; note?: string }
export type Goal = { id: number; name: string; target: number; contribs: Contribution[] }

export const MONTHS = [['Sep', 'September'], ['Aug', 'August'], ['Jul', 'July']] as const

export const eur = (n: number) => '€' + n.toFixed(2)
export const equalShares = (names: string[]): Shares => Object.fromEntries(names.map((n) => [n, 100 / names.length]))
export const shareOf = (e: Expense, m: string) => (e.amount * (e.shares[m] ?? 0)) / 100
export const debtors = (e: Expense) => Object.keys(e.shares).filter((m) => m !== e.paidBy && e.shares[m] > 0)
export const pending = (e: Expense) => debtors(e).filter((m) => !e.settled.includes(m))
export const owesMe = (e: Expense) => e.paidBy !== ME && e.requested && (e.shares[ME] ?? 0) > 0 && !e.settled.includes(ME)
export const isEqual = (s: Shares) => { const v = Object.values(s); return v.every((x) => Math.abs(x - v[0]) < 0.01) }
export const splitText = (e: Expense) => {
  const names = Object.keys(e.shares).filter((m) => e.shares[m] > 0)
  return isEqual(e.shares) ? 'equal' : names.map((m) => `${Math.round(e.shares[m])}%`).join(' / ')
}

/** Net position with each roommate: positive means they owe you. */
export function pairwise(xs: Expense[]): Record<string, number> {
  const p: Record<string, number> = Object.fromEntries(MEMBERS.filter((m) => m !== ME).map((m) => [m, 0]))
  for (const e of xs) {
    if (e.paidBy === ME) pending(e).forEach((m) => (p[m] += shareOf(e, m)))
    else if ((e.shares[ME] ?? 0) > 0 && !e.settled.includes(ME)) p[e.paidBy] -= shareOf(e, ME)
  }
  return p
}

const past = (id: number, title: string, cat: Cat, amount: number, paidBy: string, date: string, month: string, shares: Shares = equalShares(MEMBERS)): Expense => ({
  id, title, cat, amount, paidBy, shares, requested: true, settled: MEMBERS.filter((m) => m !== paidBy), date, month,
})

export const seedExpenses: Expense[] = [
  { id: 1, title: 'Rent October', cat: 'Rent', amount: 1600, paidBy: 'Emma', shares: equalShares(MEMBERS), requested: true, settled: ['Lucas'], date: '28 Sep', month: 'Sep' },
  { id: 2, title: 'Engie electricity', cat: 'Utilities', amount: 96, paidBy: 'You', shares: equalShares(MEMBERS), requested: false, settled: [], date: '27 Sep', month: 'Sep' },
  { id: 3, title: 'Colruyt groceries', cat: 'Groceries', amount: 64.8, paidBy: 'Lucas', shares: equalShares(MEMBERS), requested: true, settled: [], date: '25 Sep', month: 'Sep' },
  { id: 4, title: 'Toilet paper and soap', cat: 'Household', amount: 18.4, paidBy: 'Sofia', shares: equalShares(MEMBERS), requested: true, settled: ['You'], date: '22 Sep', month: 'Sep' },
  past(10, 'Rent September', 'Rent', 1600, 'Emma', '28 Aug', 'Aug'),
  past(11, 'Engie electricity', 'Utilities', 88, 'You', '26 Aug', 'Aug'),
  past(12, 'Proximus internet', 'Utilities', 49, 'You', '24 Aug', 'Aug'),
  past(13, 'Delhaize groceries', 'Groceries', 71.3, 'Sofia', '19 Aug', 'Aug'),
  past(14, 'Drinks for the barbecue', 'Drinks', 42, 'Lucas', '9 Aug', 'Aug', { Lucas: 50, You: 20, Emma: 15, Sofia: 15 }),
  past(20, 'Rent August', 'Rent', 1600, 'Emma', '28 Jul', 'Jul'),
  past(21, 'Engie electricity', 'Utilities', 79, 'You', '26 Jul', 'Jul'),
  past(22, 'Colruyt groceries', 'Groceries', 58.6, 'Lucas', '15 Jul', 'Jul'),
]

const tx = (id: number, merchant: string, cat: Cat, amount: number, date: string, score: number, reason: string): Tx =>
  ({ id, merchant, cat, amount, date, month: 'Sep', score, reason, settled: [], requested: true })
export const seedTxs: Tx[] = [
  tx(1, 'Colruyt', 'Groceries', 64.2, '29 Sep', 0.96, 'Groceries are usually shared'),
  tx(2, 'Proximus', 'Utilities', 49, '29 Sep', 0.93, 'Monthly internet bill'),
  tx(3, 'Zara Home', 'Household', 89.9, '28 Sep', 0.72, 'Home items are often shared'),
  tx(4, 'Sephora', 'Personal', 54.3, '28 Sep', 0.08, 'Personal care is rarely shared'),
  tx(5, 'IKEA', 'Household', 39, '26 Sep', 0.58, 'Could be for the flat'),
  tx(6, 'Delhaize', 'Groceries', 27.8, '26 Sep', 0.91, 'Groceries are usually shared'),
  tx(7, 'Kinepolis', 'Leisure', 31, '24 Sep', 0.4, 'Shared only if you went together'),
  tx(8, 'Pharmacy', 'Personal', 18.5, '23 Sep', 0.1, 'Health items are rarely shared'),
]

export const seedFilters = Object.fromEntries(CATS.map((c) => [c, c !== 'Personal'])) as Record<string, boolean>

export const seedGoals: Goal[] = [
  { id: 1, name: 'Vacuum cleaner', target: 320, contribs: [
    { id: 1, who: 'Emma', amount: 100, date: '20 Sep', note: 'First batch' },
    { id: 2, who: 'You', amount: 50, date: '21 Sep' },
    { id: 3, who: 'Lucas', amount: 40, date: '24 Sep' },
  ] },
  { id: 2, name: 'Living room sofa', target: 1500, contribs: [
    { id: 4, who: 'You', amount: 450, date: '2 Sep' }, { id: 5, who: 'Emma', amount: 300, date: '4 Sep' }, { id: 6, who: 'Lucas', amount: 150, date: '9 Sep' },
  ] },
]

export type Decision = 'shared' | 'private' | undefined
export function autoDecision(t: Tx, filters: Record<string, boolean>, kw: string[]): Decision {
  if (kw.some((k) => t.merchant.toLowerCase().includes(k.toLowerCase()))) return 'shared'
  if (!filters[t.cat]) return 'private'
  if (t.score >= 0.8) return 'shared'
  if (t.score <= 0.25) return 'private'
  return undefined
}
export const txExpense = (t: Tx): Expense => ({
  id: 1000 + t.id, title: t.merchant, cat: t.cat, amount: t.amount, paidBy: ME, shares: t.shares ?? equalShares(MEMBERS),
  requested: t.requested, settled: t.settled, date: t.date, month: t.month,
})
