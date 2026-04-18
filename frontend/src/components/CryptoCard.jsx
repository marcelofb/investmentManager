import { formatUSD, formatCryptoPrice, formatDate, formatPercent } from '../utils/formatters';

export default function CryptoCard({ position, onEdit, onDelete }) {
  const {
    activo,
    plataforma,
    cantidad,
    precio,
    monto,
    staking,
    tnaStaking,
    montoStaking,
    montoTotal,
    fechaInicio,
  } = position;

  return (
    <div className="item-card">
      <div className="card-header">
        <span className="card-title" style={{ textTransform: 'uppercase' }}>
          {activo}
        </span>
        <div className="card-badges">
          <span className="badge neutral">{plataforma}</span>
          {staking && <span className="badge primary">Staking</span>}
        </div>
      </div>

      <div className="card-body">
        <div className="data-row">
          <span className="row-label">Precio actual</span>
          <span className="row-value">{formatCryptoPrice(precio)}</span>
        </div>
        <div className="data-row">
          <span className="row-label">Cantidad</span>
          <span className="row-value">{cantidad}</span>
        </div>
        <div className="data-row">
          <span className="row-label">Monto</span>
          <span className="row-value">{formatUSD(monto)}</span>
        </div>

        {staking && (
          <>
            <div className="divider" />
            <div className="data-row">
              <span className="row-label">TNA staking</span>
              <span className="row-value">{formatPercent(tnaStaking)}</span>
            </div>
            <div className="data-row">
              <span className="row-label">Staking desde</span>
              <span className="row-value">{formatDate(fechaInicio)}</span>
            </div>
            <div className="data-row">
              <span className="row-label">Rendimiento staking</span>
              <span className="row-value" style={{ color: 'var(--success)' }}>
                {formatUSD(montoStaking)}
              </span>
            </div>
          </>
        )}

        <div className="data-row highlight">
          <span className="row-label">Monto total</span>
          <span className="row-value">{formatUSD(montoTotal)}</span>
        </div>
      </div>

      <div className="card-footer">
        <button className="btn btn-ghost btn-sm" onClick={() => onEdit(position)}>
          Editar
        </button>
        <button
          className="btn btn-danger-ghost btn-sm"
          onClick={() => onDelete(position._id)}
        >
          Eliminar
        </button>
      </div>
    </div>
  );
}
