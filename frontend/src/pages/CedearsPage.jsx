import { useState, useEffect, useCallback } from 'react';
import { cedearsAPI } from '../services/api';
import CedearCard from '../components/CedearCard';
import CedearForm from '../components/CedearForm';
import Modal from '../components/Modal';
import { formatARS, formatUSD } from '../utils/formatters';
import ServerWakeLoader from '../components/ServerWakeLoader';

export default function CedearsPage() {
  const [positions, setPositions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState(null);

  const fetchPositions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await cedearsAPI.getAll();
      setPositions(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPositions();
  }, [fetchPositions]);

  const handleSubmit = async (data) => {
    try {
      setSaving(true);
      setError(null);
      if (editItem) {
        const updated = await cedearsAPI.update(editItem._id, data);
        setPositions((prev) => prev.map((p) => (p._id === updated._id ? updated : p)));
      } else {
        const created = await cedearsAPI.create(data);
        setPositions((prev) => [created, ...prev]);
      }
      handleClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (pos) => {
    setEditItem(pos);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar este CEDEAR?')) return;
    try {
      await cedearsAPI.remove(id);
      setPositions((prev) => prev.filter((p) => p._id !== id));
    } catch (err) {
      setError(err.message);
    }
  };

  const handleClose = () => {
    setShowForm(false);
    setEditItem(null);
  };

  const totalARS = positions.reduce((acc, p) => acc + p.montoTotalARS, 0);
  const totalUSD = positions.reduce((acc, p) => acc + p.montoTotalUSD, 0);

  return (
    <div>
      <div className="page-header">
        <h2>CEDEARs</h2>
        <button className="btn btn-primary" onClick={() => setShowForm(true)}>
          + Nuevo CEDEAR
        </button>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {positions.length > 0 && (
        <div className="summary-grid">
          <div className="summary-card">
            <div className="s-label">Valor total en ARS</div>
            <div className="s-value blue">{formatARS(totalARS)}</div>
          </div>
          <div className="summary-card">
            <div className="s-label">Valor total en USD</div>
            <div className="s-value green">{formatUSD(totalUSD)}</div>
          </div>
          <div className="summary-card">
            <div className="s-label">Posiciones</div>
            <div className="s-value">{positions.length}</div>
          </div>
        </div>
      )}

      {loading ? (
        <ServerWakeLoader />
      ) : positions.length === 0 ? (
        <div className="empty-state">
          <h3>Sin CEDEARs</h3>
          <p>Registrá tu primer CEDEAR para seguirlo en ARS.</p>
        </div>
      ) : (
        <div className="cards-grid">
          {positions.map((p) => (
            <CedearCard key={p._id} position={p} onEdit={handleEdit} onDelete={handleDelete} />
          ))}
        </div>
      )}

      {showForm && (
        <Modal title={editItem ? 'Editar CEDEAR' : 'Nuevo CEDEAR'} onClose={handleClose}>
          <CedearForm
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
