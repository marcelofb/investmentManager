import { useState, useEffect, useCallback } from 'react';
import { cryptosAPI } from '../services/api';
import CryptoCard from '../components/CryptoCard';
import CryptoForm from '../components/CryptoForm';
import Modal from '../components/Modal';
import { formatUSD, formatBTC, formatQuantity } from '../utils/formatters';
import ServerWakeLoader from '../components/ServerWakeLoader';

export default function CryptosPage() {
  const [positions, setPositions] = useState([]);
  const [bitcoinGoal, setBitcoinGoal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState(null);

  const refreshBitcoinGoal = async () => {
    const summary = await cryptosAPI.getBitcoinGoal();
    setBitcoinGoal(summary);
  };

  const fetchPositions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [data, goal] = await Promise.all([
        cryptosAPI.getAll(),
        cryptosAPI.getBitcoinGoal(),
      ]);
      setPositions(data);
      setBitcoinGoal(goal);
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
      await refreshBitcoinGoal();
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
      await refreshBitcoinGoal();
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
  const btcApprox = positions
    .filter((p) => p.activo === 'bitcoin')
    .reduce((total, p) => total + p.cantidad, 0);

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
          <div
            className="summary-card"
            title="BTC nativo registrado; no incluye recompensas de staking ni WBTC"
          >
            <div className="s-label">Tenencia BTC aproximada</div>
            <div className="s-value">{formatBTC(btcApprox)} BTC</div>
          </div>
          <div className="summary-card">
            <div className="s-label">Posiciones activas</div>
            <div className="s-value">{positions.length}</div>
          </div>
        </div>
      )}

      {!loading && bitcoinGoal && (
        <section className="summary-card bitcoin-goal-card">
          <div className="s-label bitcoin-goal-heading">Escenario para alcanzar 1 BTC</div>
          <div className="bitcoin-goal-grid">
            <div className="bitcoin-goal-item">
              <div className="s-label">BTC actuales</div>
              <div className="s-value">{formatBTC(bitcoinGoal.btcApprox)} BTC</div>
            </div>
            <div className="bitcoin-goal-item">
              <div className="s-label">Tether disponible</div>
              <div className="s-value">{formatQuantity(bitcoinGoal.usdtAvailable)} USDT</div>
              <div className="bitcoin-goal-detail">
                {bitcoinGoal.usdtValueUSD === null
                  ? 'Valor en USD no disponible'
                  : `≈ ${formatUSD(bitcoinGoal.usdtValueUSD)}`}
              </div>
            </div>
            <div className="bitcoin-goal-item">
              <div className="s-label">BTC que podrías comprar</div>
              <div className="s-value">
                {bitcoinGoal.btcPurchasable === null
                  ? 'No disponible'
                  : `${formatBTC(bitcoinGoal.btcPurchasable)} BTC`}
              </div>
              <div className="bitcoin-goal-detail">
                {bitcoinGoal.bitcoinPriceUSD === null
                  ? 'Precio BTC no disponible'
                  : `A ${formatUSD(bitcoinGoal.bitcoinPriceUSD)} / BTC`}
              </div>
            </div>
            <div className="bitcoin-goal-item">
              <div className="s-label">Total estimado</div>
              <div className="s-value">
                {bitcoinGoal.btcProjected === null
                  ? 'No disponible'
                  : `${formatBTC(bitcoinGoal.btcProjected)} BTC`}
              </div>
            </div>
            <div className="bitcoin-goal-item">
              <div className="s-label">Faltante para 1 BTC</div>
              <div className="s-value">
                {bitcoinGoal.btcRemaining === null
                  ? 'No disponible'
                  : `${formatBTC(bitcoinGoal.btcRemaining)} BTC`}
              </div>
            </div>
            <div className="bitcoin-goal-item">
              <div className="s-label">Precio máximo de BTC para llegar a 1</div>
              <div className="s-value">
                {bitcoinGoal.goalReached
                  ? 'Objetivo alcanzado'
                  : bitcoinGoal.targetBitcoinPriceUSD !== null
                    ? `${formatUSD(bitcoinGoal.targetBitcoinPriceUSD)} / BTC`
                    : bitcoinGoal.usdtAvailable === 0
                      ? 'Sin USDT disponible'
                      : 'No disponible'}
              </div>
            </div>
          </div>
          <div className="bitcoin-goal-progress-label">
            Progreso estimado usando todo el USDT
          </div>
          <div
            className="bitcoin-goal-progress"
            role="progressbar"
            aria-label="Progreso estimado hacia 1 BTC"
            aria-valuemin="0"
            aria-valuemax="100"
            aria-valuenow={Math.min(100, Math.max(0, (bitcoinGoal.btcProjected ?? bitcoinGoal.btcApprox) * 100))}
          >
            <div
              className="bitcoin-goal-progress-fill"
              style={{
                width: `${Math.min(100, Math.max(0, (bitcoinGoal.btcProjected ?? bitcoinGoal.btcApprox) * 100))}%`,
              }}
            />
          </div>
          <p className="bitcoin-goal-note">
            Estimación al precio consultado; no incluye comisiones ni diferencias de ejecución.
            No suma recompensas estimadas de staking ni WBTC.
          </p>
        </section>
      )}

      {loading ? (
        <ServerWakeLoader />
      ) : positions.length === 0 ? (
        <div className="empty-state">
          <h3>Sin posiciones</h3>
          <p>
            Registrá tu primera posición para hacer seguimiento de tu portafolio.
          </p>
          <p>Tenencia BTC aproximada: {formatBTC(btcApprox)} BTC.</p>
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
