import { Link } from 'react-router-dom'
export default function Home() {
  return (
    <div className="hero">
      <div>
        <h1>Меньше сомнений.<em>Лучше образ.</em></h1>
        <p className="lede">Собирай образы из вещей, которые уже есть в шкафу, и докупай только то, чего не хватает.</p>
        <Link className="btn" to="/discover">Открыть каталог</Link>
      </div>
    </div>
  )
}
