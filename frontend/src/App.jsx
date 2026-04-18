import { useState } from 'react';
import { Routes, Route, NavLink } from 'react-router-dom';
import DashboardPage from './pages/DashboardPage.jsx';
import PlazosFijosPage from './pages/PlazosFijosPage.jsx';
import CryptosPage from './pages/CryptosPage.jsx';
import LoginPage from './components/LoginPage.jsx';

export default function App() {
  const [authed, setAuthed] = useState(() => localStorage.getItem('auth') === '1');

  if (!authed) return <LoginPage onLogin={() => setAuthed(true)} />;

  return (
    <div className="app">
      <nav className="navbar">
        <span className="navbar-brand">Investment Manager</span>
        <div className="nav-links">
          <NavLink to="/" end>Dashboard</NavLink>
          <NavLink to="/plazos-fijos">Plazos Fijos</NavLink>
          <NavLink to="/cryptos">Cryptos</NavLink>
        </div>
      </nav>
      <main className="main-content">
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/plazos-fijos" element={<PlazosFijosPage />} />
          <Route path="/cryptos" element={<CryptosPage />} />
        </Routes>
      </main>
    </div>
  );
}
