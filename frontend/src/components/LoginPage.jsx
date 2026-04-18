import { useState } from 'react';

export default function LoginPage({ onLogin }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    if (password === import.meta.env.VITE_APP_PASSWORD) {
      localStorage.setItem('auth', '1');
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
