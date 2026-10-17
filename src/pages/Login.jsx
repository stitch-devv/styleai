import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../auth'
export default function Login() {
  const { signIn, signUp } = useAuth()
  const nav = useNavigate()
  const [up, setUp] = useState(false)
  const [email, setEmail] = useState('')
  const [pw, setPw] = useState('')
  const [msg, setMsg] = useState('')
  async function submit(e) {
    e.preventDefault(); setMsg('')
    if (pw.length < 6) return setMsg('Пароль: минимум 6 символов.')
    const { data, error } = await (up ? signUp(email, pw) : signIn(email, pw))
    if (error) return setMsg(error.message)
    if (up && !data.session) return setMsg('Проверь почту: мы отправили ссылку для подтверждения.')
    nav('/discover')
  }
  return (
    <section style={{ maxWidth: 420 }}>
      <h2>{up ? 'Регистрация' : 'Вход'}</h2>
      <form onSubmit={submit} className="form">
        <input type="email" required placeholder="Email" autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} />
        <input type="password" required placeholder="Пароль, от 6 символов" autoComplete={up ? 'new-password' : 'current-password'} value={pw} onChange={e => setPw(e.target.value)} />
        <p role="alert" className="why">{msg}</p>
        <button className="btn" type="submit">{up ? 'Создать аккаунт' : 'Войти'}</button>
        <button className="chip" type="button" onClick={() => setUp(u => !u)}>{up ? 'Уже есть аккаунт' : 'Нет аккаунта'}</button>
      </form>
    </section>
  )
}
