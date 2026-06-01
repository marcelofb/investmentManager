import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { dashboardAPI } from '../services/api';
import { formatUSD, formatARS } from '../utils/formatters';
import ServerWakeLoader from '../components/ServerWakeLoader';

export default function DashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchDashboard = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await dashboardAPI.get();
      setData(result);
      setLastUpdated(new Date());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  if (loading) return <ServerWakeLoader />;

  if (error)
    return (
      <div>
        <div className="alert alert-danger">{error}</div>
        <button className="btn btn-primary" onClick={fetchDashboard}>
          Reintentar
        </button>
      </div>
    );

  const pctPlazos =
    data.patrimonioTotalUSD > 0
      ? (data.plazos.totalUSD / data.patrimonioTotalUSD) * 100
      : 0;
  const pctCryptos =
    data.patrimonioTotalUSD > 0
      ? (data.cryptos.totalUSD / data.patrimonioTotalUSD) * 100
      : 0;

  return (
    <div>
      <div className="page-header">
        <h2>Dashboard</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {lastUpdated && (
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              Actualizado: {lastUpdated.toLocaleTimeString('es-AR')}
            </span>
          )}
          <button className="btn btn-ghost btn-sm" onClick={fetchDashboard}>
            ↻ Actualizar
          </button>
        </div>
      </div>

      {/* Patrimonio total */}
      <div className="patrimonio-card">
        <div className="patrimonio-label">Patrimonio Total</div>
        <div className="patrimonio-value">{formatUSD(data.patrimonioTotalUSD)}</div>
        <div className="patrimonio-sub">
          Dólar oficial: <strong>${data.dolarOficial.toLocaleString('es-AR')} ARS</strong>
        </div>
      </div>

      {/* Breakdown */}
      <div className="dashboard-breakdown">
        <Link to="/plazos-fijos" className="breakdown-card">
          <div className="breakdown-icon">🏦</div>
          <div className="breakdown-info">
            <div className="breakdown-title">Plazos Fijos</div>
            <div className="breakdown-usd">{formatUSD(data.plazos.totalUSD)}</div>
            <div className="breakdown-secondary">{formatARS(data.plazos.totalARS)}</div>
            <div className="breakdown-meta">{data.plazos.count} plazo{data.plazos.count !== 1 ? 's' : ''}</div>
          </div>
          <div className="breakdown-pct">{pctPlazos.toFixed(1)}%</div>
        </Link>

        <Link to="/cryptos" className="breakdown-card">
          <div className="breakdown-icon">₿</div>
          <div className="breakdown-info">
            <div className="breakdown-title">Cryptos</div>
            <div className="breakdown-usd">{formatUSD(data.cryptos.totalUSD)}</div>
            <div className="breakdown-secondary">&nbsp;</div>
            <div className="breakdown-meta">{data.cryptos.count} posición{data.cryptos.count !== 1 ? 'es' : ''}</div>
          </div>
          <div className="breakdown-pct">{pctCryptos.toFixed(1)}%</div>
        </Link>
      </div>

      {/* Barra de distribución */}
      {data.patrimonioTotalUSD > 0 && (
        <div className="distribution-bar-container">
          <div className="distribution-bar-label">
            <span>Distribución del portfolio</span>
          </div>
          <div className="distribution-bar">
            <div
              className="distribution-segment plazos"
              style={{ width: `${pctPlazos}%` }}
              title={`Plazos Fijos: ${pctPlazos.toFixed(1)}%`}
            />
            <div
              className="distribution-segment cryptos"
              style={{ width: `${pctCryptos}%` }}
              title={`Cryptos: ${pctCryptos.toFixed(1)}%`}
            />
          </div>
          <div className="distribution-legend">
            <span className="legend-item plazos">● Plazos Fijos</span>
            <span className="legend-item cryptos">● Cryptos</span>
          </div>
        </div>
      )}
    </div>
  );
}
