import { createContext, useContext, useEffect, useState } from 'react'
const Ctx = createContext(null)
export const useCart = () => useContext(Ctx)
export function CartProvider({ children }) {
  const [items, setItems] = useState(() => { try { return JSON.parse(localStorage.getItem('cart')) || [] } catch { return [] } })
  useEffect(() => { localStorage.setItem('cart', JSON.stringify(items)) }, [items])
  const add = (p, size) => setItems(a => {
    const i = a.find(x => x.id === p.id && x.size === size)
    return i ? a.map(x => x === i ? { ...x, qty: x.qty + 1 } : x) : [...a, { id: p.id, name: p.name, price: Number(p.price), hex: p.hex, size, qty: 1 }]
  })
  const setQty = (id, size, qty) => setItems(a => a.map(x => x.id === id && x.size === size ? { ...x, qty } : x).filter(x => x.qty > 0))
  const clear = () => setItems([])
  const total = items.reduce((s, x) => s + x.price * x.qty, 0)
  const count = items.reduce((s, x) => s + x.qty, 0)
  return <Ctx.Provider value={{ items, add, setQty, clear, total, count }}>{children}</Ctx.Provider>
}
