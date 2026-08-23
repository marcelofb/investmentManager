import { useState } from 'react';

export default function LiquidezForm({ initial, onSubmit, onCancel, loading }) {
  const [form, setForm] = useState({
    ars: initial?.ars ?? '',
    usd: initial?.usd ?? '',
  });
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};

    if (form.ars === '' && form.usd === '') {
      e.ars = 'Ingresá al menos un valor';
    }

    if (form.ars !== '' && Number(form.ars) < 0) {
      e.ars = 'El monto en ARS no puede ser negativo';
    }

    if (form.usd !== '' && Number(form.usd) < 0) {
      e.usd = 'El monto en USD no puede ser negativo';
    }

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
      ars: Number(form.ars || 0),
      usd: Number(form.usd || 0),
    });
  };

  const setField = (field) => (event) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }));
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-group">
        <label>Liquidez en ARS</label>
        <input
          type="number"
          min="0"
          step="0.01"
          className={`form-control ${errors.ars ? 'error' : ''}`}
          value={form.ars}
          onChange={setField('ars')}
          placeholder="Ej: 500000"
        />
        {errors.ars && <p className="form-error">{errors.ars}</p>}
      </div>

      <div className="form-group">
        <label>Liquidez en USD</label>
        <input
          type="number"
          min="0"
          step="0.01"
          className={`form-control ${errors.usd ? 'error' : ''}`}
          value={form.usd}
          onChange={setField('usd')}
          placeholder="Ej: 1500"
        />
        {errors.usd && <p className="form-error">{errors.usd}</p>}
      </div>

      <div className="form-actions">
        <button type="button" className="btn btn-ghost" onClick={onCancel}>Cancelar</button>
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Guardando...' : 'Guardar'}
        </button>
      </div>
    </form>
  );
}
