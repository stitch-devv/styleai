import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../auth'
import { useT } from '../i18n'
export default function ForgotPassword() {
  const t = useT()
  const { resetPassword } = useAuth()
  const [email, setEmail] = useState(''), [msg, setMsg] = useState(''), [busy, setBusy] = useState(false)
  const submit = async e => {
    e.preventDefault(); setBusy(true); setMsg('')
    const { error } = await resetPassword(email.trim())
    setBusy(false)
    // Одинаковый ответ для любого адреса, чтобы нельзя было проверять, кто зарегистрирован
    setMsg(error && /rate|limit/i.test(error.message) ? error.message : t('Если такой адрес зарегистрирован, мы отправили письмо со ссылкой для сброса пароля.'))
  }
  return (
    <section style={{ maxWidth: 420 }}>
      <h2>{t('Сброс пароля')}</h2>
      <form className="form" onSubmit={submit}>
        <input type="email" required placeholder="Email" autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} />
        <p className="why" role="status">{msg}</p>
        <button className="btn" type="submit" disabled={busy}>{t('Отправить ссылку')}</button>
        <Link className="why" to="/login">{t('Назад ко входу')}</Link>
      </form>
    </section>
  )
}
