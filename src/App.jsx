import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './auth'
import Layout from './components/Layout'
import { Loading } from './components/State'
import Home from './pages/Home'
import Discover from './pages/Discover'
import Login from './pages/Login'
import Wardrobe from './pages/Wardrobe'
import Favorites from './pages/Favorites'
function Protected({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <Loading />
  return user ? children : <Navigate to="/login" replace />
}
export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/discover" element={<Discover />} />
        <Route path="/login" element={<Login />} />
        <Route path="/wardrobe" element={<Protected><Wardrobe /></Protected>} />
        <Route path="/favorites" element={<Protected><Favorites /></Protected>} />
        <Route path="*" element={<section><h2>404</h2><p>Такой страницы нет.</p></section>} />
      </Route>
    </Routes>
  )
}
