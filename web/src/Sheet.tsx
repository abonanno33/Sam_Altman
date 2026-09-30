import type { ReactNode } from 'react'

export default function Sheet({ children, onClose }: { children: ReactNode; onClose: () => void }) {
  return <div className="sheet" onClick={onClose}><div onClick={(e) => e.stopPropagation()}><div className="handle" />{children}</div></div>
}
