export default function ProductCard({ p, fav, onFav, onWardrobe }) {
  return (
    <article className="card">
      <span className="sw" style={{ background: p.hex }} />
      <h3>{p.name}</h3>
      <p>{p.color} · ${p.price}</p>
      <div className="row">
        <button className="save" onClick={() => onWardrobe(p)}>В гардероб</button>
        <button className="fav" aria-pressed={fav} aria-label={`Избранное: ${p.name}`} onClick={() => onFav(p)}>♥</button>
      </div>
    </article>
  )
}
