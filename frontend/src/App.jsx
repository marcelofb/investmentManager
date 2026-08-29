import { useState, useEffect } from 'react';
import { Routes, Route, NavLink } from 'react-router-dom';
import DashboardPage from './pages/DashboardPage.jsx';
import PlazosFijosPage from './pages/PlazosFijosPage.jsx';
import CryptosPage from './pages/CryptosPage.jsx';
import CedearsPage from './pages/CedearsPage.jsx';
import LoginPage from './components/LoginPage.jsx';

async function sha256(text) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, '0')).join('');
}

export default function App() {
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('auth');
    if (!stored) return;
    sha256(import.meta.env.VITE_APP_PASSWORD).then((expected) => {
      if (stored === expected) setAuthed(true);
    });
  }, []);

  if (!authed) return <LoginPage onLogin={() => setAuthed(true)} />;

  return (
    <div className="app">
      <nav className="navbar">
        <span className="navbar-brand">Investment Manager</span>
        <div className="nav-links">
          <NavLink to="/" end>Dashboard</NavLink>
          <NavLink to="/plazos-fijos">Plazos Fijos</NavLink>
          <NavLink to="/cryptos">Cryptos</NavLink>
          <NavLink to="/cedears">CEDEARs</NavLink>
        </div>
      </nav>
      <main className="main-content">
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/plazos-fijos" element={<PlazosFijosPage />} />
          <Route path="/cryptos" element={<CryptosPage />} />
          <Route path="/cedears" element={<CedearsPage />} />
        </Routes>
      </main>
    </div>
  );
}
