import { Routes, Route } from 'react-router-dom'
import Home from './pages/home/Home'
import Header from './components/header/Header'
import Footer from './components/footer/Footer'
import Professores from './pages/professores/Professores'
import Pesquisador from './pages/pesquisador/Pesquisador'
import Sobre from './pages/sobre/Sobre'
import AdminLogin from './pages/admin-login/AdminLogin'
import Admin from './pages/admin/Admin'
import RequireAdmin from './components/requireAdmin/RequireAdmin'

function App() {
  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <Header />
      <main style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/professores" element={<Professores />} />
          <Route path="/pesquisador/:id" element={<Pesquisador />} />
          <Route path="/sobre" element={<Sobre />} />
          <Route path="/admin-login" element={<AdminLogin />} />
          <Route
              path="/admin"
              element={
                  <RequireAdmin>
                      <Admin />
                  </RequireAdmin>
              }
          />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}

export default App