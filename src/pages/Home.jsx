import { Link } from 'react-router-dom'
import { useT } from '../i18n'
export default function Home() {
  const t = useT()
  return (
    <div className="hero">
      <div>
        <h1>{t('Меньше сомнений.')}<em>{t('Лучше образ.')}</em></h1>
        <p className="lede">{t('Собирай образы из вещей, которые уже есть в шкафу, и докупай только то, чего не хватает.')}</p>
        <Link className="btn" to="/discover">{t('Открыть каталог')}</Link>{' '}
        <Link className="chip" to="/stylist" style={{ marginLeft: 12 }}>AI Stylist</Link>
      </div>
    </div>
  )
}
