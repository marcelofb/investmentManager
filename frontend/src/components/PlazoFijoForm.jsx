import { useState } from 'react';

const today = () => new Date().toISOString().split('T')[0];

export default function PlazoFijoForm({ initial, onSubmit, onCancel, loading }) {
  const [form, setForm] = useState({
    monto: initial?.monto ?? '',
    tna: initial?.tna ?? '',
    fechaInicio: initial?.fechaInicio
      ? new Date(initial.fechaInicio).toISOString().split('T')[0]
      : today(),
  });
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!form.monto || Number(form.monto) <= 0) e.monto = 'Ingresá un monto válido';
    if (!form.tna || Number(form.tna) <= 0) e.tna = 'Ingresá una TNA válida';
    if (!form.fechaInicio) e.fechaInicio = 'Seleccioná la fecha de inicio';
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
      monto: Number(form.monto),
      tna: Number(form.tna),
      fechaInicio: form.fechaInicio,
    });
  };

  const set = (field) => (e) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-group">
        <label>Monto ($)</label>
        <input
          className={`form-control ${errors.monto ? 'error' : ''}`}
          type="number"
          min="0"
          step="0.01"
          value={form.monto}
          onChange={set('monto')}
          placeholder="Ej: 100000"
        />
        {errors.monto && <p className="form-error">{errors.monto}</p>}
      </div>

      <div className="form-group">
        <label>TNA (%)</label>
        <input
          className={`form-control ${errors.tna ? 'error' : ''}`}
          type="number"
          min="0"
          step="0.01"
          value={form.tna}
          onChange={set('tna')}
          placeholder="Ej: 110.5"
        />
        {errors.tna && <p className="form-error">{errors.tna}</p>}
      </div>

      <div className="form-group">
        <label>Fecha de inicio</label>
        <input
          className={`form-control ${errors.fechaInicio ? 'error' : ''}`}
          type="date"
          value={form.fechaInicio}
          onChange={set('fechaInicio')}
        />
        {errors.fechaInicio && <p className="form-error">{errors.fechaInicio}</p>}
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
