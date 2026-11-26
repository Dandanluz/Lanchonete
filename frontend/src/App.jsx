import { Navigate, NavLink, Outlet, Route, Routes } from 'react-router-dom'
import { useAuth } from './auth.jsx'
import Login from './pages/Login.jsx'
import Venda from './pages/Venda.jsx'
import Acampantes from './pages/Acampantes.jsx'
import Itens from './pages/Itens.jsx'
import Historico from './pages/Historico.jsx'

function Layout() {
  const { admin, sair } = useAuth()

  const link = ({ isActive }) =>
    `whitespace-nowrap rounded-md px-3 py-2 font-medium ${
      isActive ? 'bg-pinho text-white' : 'text-tinta hover:bg-linha/60'
    }`

  return (
    <div className="min-h-screen">
      <header className="border-b border-linha bg-papel">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3">
          <span className="text-lg font-bold text-pinho">Cantina</span>
          <div className="flex items-center gap-3 text-sm">
            <span className="text-tinta-suave">{admin.nome}</span>
            <button onClick={sair} className="font-semibold text-pinho underline underline-offset-2">
              Sair
            </button>
          </div>
        </div>
        <nav className="mx-auto flex max-w-5xl gap-1 overflow-x-auto px-4 pb-2">
          <NavLink to="/venda" className={link}>Vender</NavLink>
          <NavLink to="/acampantes" className={link}>Acampantes</NavLink>
          <NavLink to="/itens" className={link}>Itens</NavLink>
          <NavLink to="/historico" className={link}>Histórico</NavLink>
        </nav>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-6">
        <Outlet />
      </main>
    </div>
  )
}

function Protegida() {
  const { admin, carregando } = useAuth()
  if (carregando) return <p className="p-6 text-tinta-suave">Carregando…</p>
  return admin ? <Layout /> : <Navigate to="/login" replace />
}

export default function App() {
  const { admin } = useAuth()

  return (
    <Routes>
      <Route path="/login" element={admin ? <Navigate to="/venda" replace /> : <Login />} />
      <Route element={<Protegida />}>
        <Route path="/venda" element={<Venda />} />
        <Route path="/acampantes" element={<Acampantes />} />
        <Route path="/itens" element={<Itens />} />
        <Route path="/historico" element={<Historico />} />
      </Route>
      <Route path="*" element={<Navigate to="/venda" replace />} />
    </Routes>
  )
}
