import { useEffect, useState } from 'react'

type Item = { id: number; text: string }

export default function App() {
  const [items, setItems] = useState<Item[]>([])
  const [text, setText] = useState('')

  const load = () => fetch('/api/items').then((r) => r.json()).then(setItems)
  useEffect(() => { load() }, [])

  const add = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!text.trim()) return
    await fetch('/api/items', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    })
    setText('')
    load()
  }

  return (
    <main style={{ maxWidth: 480, margin: '4rem auto', fontFamily: 'sans-serif' }}>
      <h1>Tectonic Hackathon</h1>
      <form onSubmit={add}>
        <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Add something" />
        <button>Add</button>
      </form>
      <ul>{items.map((i) => <li key={i.id}>{i.text}</li>)}</ul>
    </main>
  )
}
