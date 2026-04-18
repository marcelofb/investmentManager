import { useState } from 'react';

const today = () => new Date().toISOString().split('T')[0];

export default function CryptoForm({ initial, onSubmit, onCancel, loading }) {
  const [form, setForm] = useState({
    activo: initial?.activo ?? '',
    plataforma: initial?.plataforma ?? '',
    cantidad: initial?.cantidad ?? '',
    staking: initial?.staking ?? false,
    tnaStaking: initial?.tnaStaking ?? '',
    fechaInicio: initial?.fechaInicio
      ? new Date(initial.fechaInicio).toISOString().split('T')[0]
      : today(),
  });
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!form.activo.trim()) e.activo = 'Ingresá el activo';
    if (!form.plataforma.trim()) e.plataforma = 'Ingresá la plataforma';
    if (!form.cantidad || Number(form.cantidad) <= 0)
      e.cantidad = 'Ingresá una cantidad válida';
    if (form.staking) {
      if (!form.tnaStaking || Number(form.tnaStaking) <= 0)
        e.tnaStaking = 'Ingresá la TNA del staking';
      if (!form.fechaInicio)
        e.fechaInicio = 'Seleccioná la fecha de inicio del staking';
    }
    return e;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    onSubmit({
      activo: form.activo.toLowerCase().trim(),
      plataforma: form.plataforma.trim(),
      cantidad: Number(form.cantidad),
      staking: form.staking,
      tnaStaking: form.staking ? Number(form.tnaStaking) : 0,
      fechaInicio: form.fechaInicio,
    });
  };

  const set = (field) => (e) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const setCheck = (field) => (e) =>
    setForm((prev) => ({ ...prev, [field]: e.target.checked }));

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-group">
        <label>
          Activo <span className="helper">(ID de CoinGecko)</span>
        </label>
        <input
          className={`form-control ${errors.activo ? 'error' : ''}`}
          type="text"
          value={form.activo}
          onChange={set('activo')}
          placeholder="Ej: bitcoin, ethereum, solana"
        />
        {errors.activo ? (
          <p className="form-error">{errors.activo}</p>
        ) : (
          <p className="form-hint">
            Usá el ID exacto de CoinGecko (en minúsculas)
          </p>
        )}
      </div>

      <div className="form-group">
        <label>Plataforma</label>
        <input
          className={`form-control ${errors.plataforma ? 'error' : ''}`}
          type="text"
          value={form.plataforma}
          onChange={set('plataforma')}
          placeholder="Ej: Binance, Lemon, Belo"
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
          placeholder="Ej: 0.5"
        />
        {errors.cantidad && <p className="form-error">{errors.cantidad}</p>}
      </div>

      <div className="form-group">
        <label className="form-check">
          <input
            type="checkbox"
            checked={form.staking}
            onChange={setCheck('staking')}
          />
          ¿Hacés staking con este activo?
        </label>
      </div>

      {form.staking && (
        <>
          <div className="form-group">
            <label>TNA del staking (%)</label>
            <input
              className={`form-control ${errors.tnaStaking ? 'error' : ''}`}
              type="number"
              min="0"
              step="0.01"
              value={form.tnaStaking}
              onChange={set('tnaStaking')}
              placeholder="Ej: 5.5"
            />
            {errors.tnaStaking && (
              <p className="form-error">{errors.tnaStaking}</p>
            )}
          </div>

          <div className="form-group">
            <label>Fecha de inicio del staking</label>
            <input
              className={`form-control ${errors.fechaInicio ? 'error' : ''}`}
              type="date"
              value={form.fechaInicio}
              onChange={set('fechaInicio')}
            />
            {errors.fechaInicio && (
              <p className="form-error">{errors.fechaInicio}</p>
            )}
          </div>
        </>
      )}

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
