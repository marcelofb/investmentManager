import { useState } from 'react';

const today = () => new Date().toISOString().split('T')[0];

export default function CedearForm({ initial, onSubmit, onCancel, loading }) {
  const [form, setForm] = useState({
    ticker: initial?.ticker ?? '',
    plataforma: initial?.plataforma ?? '',
    cantidad: initial?.cantidad ?? '',
    fechaAlta: initial?.createdAt ? new Date(initial.createdAt).toISOString().split('T')[0] : today(),
  });
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!form.ticker.trim()) e.ticker = 'Ingresá el ticker';
    if (!form.plataforma.trim()) e.plataforma = 'Ingresá la plataforma';
    if (!form.cantidad || Number(form.cantidad) <= 0) e.cantidad = 'Ingresá una cantidad válida';
    return e;
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }

    onSubmit({
      ticker: form.ticker.trim().toUpperCase(),
      plataforma: form.plataforma.trim(),
      cantidad: Number(form.cantidad),
    });
  };

  const set = (field) => (event) =>
    setForm((prev) => ({ ...prev, [field]: event.target.value }));

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-group">
        <label>
          Ticker <span className="helper">(ej: NVDA, AAPL, MSFT)</span>
        </label>
        <input
          className={`form-control ${errors.ticker ? 'error' : ''}`}
          type="text"
          value={form.ticker}
          onChange={set('ticker')}
          placeholder="Ej: NVDA"
        />
        {errors.ticker ? <p className="form-error">{errors.ticker}</p> : <p className="form-hint">La app agrega automáticamente el sufijo .BA para Yahoo.</p>}
      </div>

      <div className="form-group">
        <label>Plataforma</label>
        <input
          className={`form-control ${errors.plataforma ? 'error' : ''}`}
          type="text"
          value={form.plataforma}
          onChange={set('plataforma')}
          placeholder="Ej: BYMA, IOL, Mercado Pago"
        />
        {errors.plataforma && <p className="form-error">{errors.plataforma}</p>}
      </div>

      <div className="form-group">
        <label>Cantidad</label>
        <input
          className={`form-control ${errors.cantidad ? 'error' : ''}`}
          type="number"
          min="0"
          step="any"
          value={form.cantidad}
          onChange={set('cantidad')}
          placeholder="Ej: 10"
        />
        {errors.cantidad && <p className="form-error">{errors.cantidad}</p>}
      </div>

      <div className="form-actions">
        <button type="button" className="btn btn-ghost" onClick={onCancel}>
          Cancelar
        </button>
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Guardando...' : 'Guardar'}
        </button>
      </div>
    </form>
  );
}
