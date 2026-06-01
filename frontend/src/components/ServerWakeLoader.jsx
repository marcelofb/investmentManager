import { useState, useEffect } from 'react';

const MESSAGES = [
  { after: 0,  text: 'Cargando...' },
  { after: 5,  text: 'El servidor está despertando...' },
  { after: 15, text: 'Casi listo, esto puede tardar hasta un minuto la primera vez...' },
  { after: 35, text: 'Aguantá un poco más, ya casi...' },
];

export default function ServerWakeLoader() {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  const current = MESSAGES.filter((m) => elapsed >= m.after).at(-1);
  const isWaking = elapsed >= 5;
  // progress bar: 0% at 5s, 100% at 60s
  const progress = isWaking ? Math.min(((elapsed - 5) / 55) * 100, 100) : 0;

  return (
    <div className="wake-loader">
      <div className="wake-loader__spinner" />
      <p className="wake-loader__text">{current.text}</p>
      {isWaking && (
        <div className="wake-loader__bar-track">
          <div className="wake-loader__bar-fill" style={{ width: `${progress}%` }} />
        </div>
      )}
    </div>
  );
}
