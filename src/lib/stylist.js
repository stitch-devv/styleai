export const SLOTS = ['top', 'bottom', 'shoes', 'outer']
const lum = h => { const n = parseInt(h.slice(1), 16); return (0.2126 * (n >> 16) + 0.7152 * ((n >> 8) & 255) + 0.0722 * (n & 255)) / 255 }
const tone = h => lum(h) < 0.3 ? 'dark' : lum(h) > 0.65 ? 'light' : 'mid'
export const lookCost = (l, owned) => SLOTS.reduce((s, k) => l[k] && !owned.has(l[k].id) ? s + Number(l[k].price) : s, 0)
export function buildLooks({ products, owned, occasion, style, budget, offset = 0 }) {
  const outer = ['work', 'date', 'travel'].includes(occasion) || style === 'classic'
  const pool = c => products.filter(p => p.category === c && p.styles.includes(style) && (budget > 0 || owned.has(p.id)))
  const D = outer ? pool('outer') : [null]
  const res = []
  for (const top of pool('top')) for (const bottom of pool('bottom')) {
    if (tone(top.hex) === tone(bottom.hex) && tone(top.hex) !== 'mid') continue
    for (const shoes of pool('shoes')) for (const o of D) {
      const l = { top, bottom, shoes }; if (o) l.outer = o
      if (lookCost(l, owned) > budget) continue
      res.push({ l, score: SLOTS.filter(k => l[k] && owned.has(l[k].id)).length * 2 })
    }
  }
  res.sort((a, b) => b.score - a.score || a.l.top.id - b.l.top.id || a.l.shoes.id - b.l.shoes.id)
  const start = res.length ? offset % res.length : 0, seen = new Set(), out = []
  for (const r of res.slice(start).concat(res.slice(0, start))) {
    const k = r.l.top.id + '-' + r.l.bottom.id
    if (seen.has(k)) continue
    seen.add(k); out.push(r.l); if (out.length === 3) break
  }
  return out
}
export const why = (l, owned, t = x => x) => {
  const n = SLOTS.filter(k => l[k] && owned.has(l[k].id)).length
  return `${t('Светлое и тёмное чередуются:')} ${l.top.name.toLowerCase()} ${t('сверху')}, ${l.bottom.name.toLowerCase()} ${t('снизу')}. ` + (n ? `${t('Уже есть вещей')}: ${n}.` : t('Все вещи новые.'))
}
