import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../auth'
import { useT } from '../i18n'
export default function Login() {
  const t = useT()
  const { signIn, signUp } = useAuth()
  const nav = useNavigate()
  const [up, setUp] = useState(false)
  const [email, setEmail] = useState('')
  const [pw, setPw] = useState('')
  const [msg, setMsg] = useState('')
  async function submit(e) {
    e.preventDefault(); setMsg('')
    if (pw.length < 6) return setMsg(t('Пароль: минимум 6 символов.'))
    const { data, error } = await (up ? signUp(email, pw) : signIn(email, pw))
    if (error) return setMsg(error.message)
    if (up && !data.session) return setMsg(t('Проверь почту: мы отправили ссылку для подтверждения.'))
    nav('/discover')
  }
  return (
    <section style={{ maxWidth: 420 }}>
      <h2>{up ? t('Регистрация') : t('Вход')}</h2>
      <form onSubmit={submit} className="form">
        <input type="email" required placeholder="Email" autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} />
        <input type="password" required placeholder={t('Пароль, от 6 символов')} autoComplete={up ? 'new-password' : 'current-password'} value={pw} onChange={e => setPw(e.target.value)} />
        <p role="alert" className="why">{msg}</p>
        <button className="btn" type="submit">{up ? t('Создать аккаунт') : t('Войти')}</button>
        <button className="chip" type="button" onClick={() => setUp(u => !u)}>{up ? t('Уже есть аккаунт') : t('Нет аккаунта')}</button>
      {!up && <Link className="why" to="/forgot-password">{t('Забыли пароль?')}</Link>}
      </form>
    </section>
  )
}
