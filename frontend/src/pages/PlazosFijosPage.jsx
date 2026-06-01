import { useState, useEffect, useCallback } from 'react';
import { plazosAPI } from '../services/api';
import PlazoFijoCard from '../components/PlazoFijoCard';
import PlazoFijoForm from '../components/PlazoFijoForm';
import Modal from '../components/Modal';
import { formatARS, formatDate } from '../utils/formatters';
import ServerWakeLoader from '../components/ServerWakeLoader';

export default function PlazosFijosPage() {
  const [plazos, setPlazos] = useState([]);
  const [historial, setHistorial] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState(null);

  const fetchPlazos = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [data, hist] = await Promise.all([
        plazosAPI.getAll(),
        plazosAPI.getHistorial(),
      ]);
      setHistorial(hist);
      setPlazos(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPlazos();
  }, [fetchPlazos]);

  const handleSubmit = async (data) => {
    try {
      setSaving(true);
      setError(null);
      if (editItem) {
        const updated = await plazosAPI.update(editItem._id, data);
        setPlazos((prev) =>
          prev.map((p) => (p._id === updated._id ? updated : p))
        );
      } else {
        const created = await plazosAPI.create(data);
        setPlazos((prev) => [created, ...prev]);
      }
      handleClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (plazo) => {
    setEditItem(plazo);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar este plazo fijo?')) return;
    try {
      await plazosAPI.remove(id);
      setPlazos((prev) => prev.filter((p) => p._id !== id));
    } catch (err) {
      setError(err.message);
    }
  };

  const handlePrecancelar = async (plazo) => {
    const confirmMsg =
      `¿Precancelar este plazo fijo?\n\n` +
      `Monto a cobrar: ${formatARS(plazo.montoActual)}\n` +
      `(incluye intereses hasta hoy)`;
    if (!window.confirm(confirmMsg)) return;
    try {
      await plazosAPI.precancelar(plazo._id);
      const hist = await plazosAPI.getHistorial();
      setPlazos((prev) => prev.filter((p) => p._id !== plazo._id));
      setHistorial(hist);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleClose = () => {
    setShowForm(false);
    setEditItem(null);
  };

  const totals = plazos.reduce(
    (acc, p) => ({
      monto: acc.monto + p.monto,
      intereses: acc.intereses + p.intereses,
      montoActual: acc.montoActual + p.montoActual,
    }),
    { monto: 0, intereses: 0, montoActual: 0 }
  );

  return (
    <div>
      <div className="page-header">
        <h2>Plazos Fijos</h2>
        <button className="btn btn-primary" onClick={() => setShowForm(true)}>
          + Nuevo
        </button>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {plazos.length > 0 && (
        <div className="summary-grid">
          <div className="summary-card">
            <div className="s-label">Total invertido</div>
            <div className="s-value">{formatARS(totals.monto)}</div>
          </div>
          <div className="summary-card">
            <div className="s-label">Intereses totales</div>
            <div className="s-value green">{formatARS(totals.intereses)}</div>
          </div>
          <div className="summary-card">
            <div className="s-label">Monto actual total</div>
            <div className="s-value blue">{formatARS(totals.montoActual)}</div>
          </div>
          <div className="summary-card">
            <div className="s-label">Plazos activos</div>
            <div className="s-value">{plazos.length}</div>
          </div>
        </div>
      )}

      {loading ? (
        <ServerWakeLoader />
      ) : plazos.length === 0 ? (
        <div className="empty-state">
          <h3>Sin plazos fijos</h3>
          <p>Creá tu primer plazo fijo para empezar a hacer seguimiento.</p>
        </div>
      ) : (
        <div className="cards-grid">
          {plazos.map((p) => (
            <PlazoFijoCard
              key={p._id}
              plazo={p}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onPrecancelar={handlePrecancelar}
            />
          ))}
        </div>
      )}

      {historial.length > 0 && (
        <div className="historial-section">
          <h3 className="historial-title">Historial</h3>
          <div className="historial-list">
            {historial.map((p) => (
              <div key={p._id} className="historial-item">
                <div className="historial-item-left">
                  <span className={`badge ${p.estado === 'vencido' ? 'info' : 'neutral'}`}>
                    {p.estado === 'vencido' ? 'Vencido' : 'Precancelado'}
                  </span>
                  <span className="historial-fecha">
                    {p.estado === 'vencido' ? 'Venció' : 'Precancelado'} el {formatDate(p.fechaCierre)}
                  </span>
                </div>
                <div className="historial-item-right">
                  <span className="historial-monto">{formatARS(p.montoCobrado)}</span>
                  <span className="historial-monto-orig">invertido: {formatARS(p.monto)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {showForm && (
        <Modal
          title={editItem ? 'Editar Plazo Fijo' : 'Nuevo Plazo Fijo'}
          onClose={handleClose}
        >
          <PlazoFijoForm
            initial={editItem}
            onSubmit={handleSubmit}
            onCancel={handleClose}
            loading={saving}
          />
        </Modal>
      )}
    </div>
  );
}
