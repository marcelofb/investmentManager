import { useState } from 'react';

async function sha256(text) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, '0')).join('');
}

export default function LoginPage({ onLogin }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    const hash = await sha256(password);
    const expectedHash = await sha256(import.meta.env.VITE_APP_PASSWORD);
    if (hash === expectedHash) {
      localStorage.setItem('auth', hash);
      onLogin();
    } else {
      setError(true);
      setPassword('');
    }
  }

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleSubmit}>
        <h2>Investment Manager</h2>
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => { setPassword(e.target.value); setError(false); }}
          autoFocus
        />
        {error && <p className="login-error">Contraseña incorrecta</p>}
        <button type="submit">Ingresar</button>
      </form>
    </div>
  );
}
