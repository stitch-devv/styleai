import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from './lib/supabase'
const Ctx = createContext(null)
export const useAuth = () => useContext(Ctx)
export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [role, setRole] = useState('user')
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => { setSession(data.session); setLoading(false) })
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s))
    return () => sub.subscription.unsubscribe()
  }, [])
  useEffect(() => {
    if (!session) return setRole('user')
    supabase.from('profiles').select('role').eq('id', session.user.id).single().then(({ data }) => setRole(data?.role || 'user'))
  }, [session])
  const value = { user: session?.user ?? null, role, loading,
    signIn: (email, password) => supabase.auth.signInWithPassword({ email, password }),
    signUp: (email, password) => supabase.auth.signUp({ email, password }),
    signOut: () => supabase.auth.signOut() }
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}
