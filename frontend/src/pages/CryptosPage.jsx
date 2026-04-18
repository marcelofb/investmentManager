import { useState, useEffect, useCallback } from 'react';
import { cryptosAPI } from '../services/api';
import CryptoCard from '../components/CryptoCard';
import CryptoForm from '../components/CryptoForm';
import Modal from '../components/Modal';
import { formatUSD } from '../utils/formatters';

export default function CryptosPage() {
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
      const data = await cryptosAPI.getAll();
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
        const updated = await cryptosAPI.update(editItem._id, data);
        setPositions((prev) =>
          prev.map((p) => (p._id === updated._id ? updated : p))
        );
      } else {
        const created = await cryptosAPI.create(data);
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
    if (!window.confirm('¿Eliminar esta posición?')) return;
    try {
      await cryptosAPI.remove(id);
      setPositions((prev) => prev.filter((p) => p._id !== id));
    } catch (err) {
      setError(err.message);
    }
  };

  const handleClose = () => {
    setShowForm(false);
    setEditItem(null);
  };

  const totalPortfolio = positions.reduce((acc, p) => acc + p.montoTotal, 0);
  const totalStaking = positions
    .filter((p) => p.staking)
    .reduce((acc, p) => acc + p.montoStaking, 0);

  return (
    <div>
      <div className="page-header">
        <h2>Portafolio Crypto</h2>
        <button className="btn btn-primary" onClick={() => setShowForm(true)}>
          + Nueva posición
        </button>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {positions.length > 0 && (
        <div className="summary-grid">
          <div className="summary-card">
            <div className="s-label">Valor total portafolio</div>
            <div className="s-value blue">{formatUSD(totalPortfolio)}</div>
          </div>
          <div className="summary-card">
            <div className="s-label">Rendimiento staking</div>
            <div className="s-value green">{formatUSD(totalStaking)}</div>
          </div>
          <div className="summary-card">
            <div className="s-label">Posiciones activas</div>
            <div className="s-value">{positions.length}</div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="loading-state">Cargando precios...</div>
      ) : positions.length === 0 ? (
        <div className="empty-state">
          <h3>Sin posiciones</h3>
          <p>
            Registrá tu primera posición para hacer seguimiento de tu portafolio.
          </p>
        </div>
      ) : (
        <div className="cards-grid">
          {positions.map((p) => (
            <CryptoCard
              key={p._id}
              position={p}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {showForm && (
        <Modal
          title={editItem ? 'Editar Posición' : 'Nueva Posición'}
          onClose={handleClose}
        >
          <CryptoForm
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
