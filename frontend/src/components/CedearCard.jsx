import { formatARS, formatUSD } from '../utils/formatters';

export default function CedearCard({ position, onEdit, onDelete }) {
  const {
    ticker,
    plataforma,
    cantidad,
    precioARS,
    precioUSD,
    montoARS,
    montoUSD,
    montoTotalARS,
    montoTotalUSD,
  } = position;

  return (
    <div className="item-card">
      <div className="card-header">
        <span className="card-title">{ticker}</span>
        <div className="card-badges">
          <span className="badge neutral">{plataforma}</span>
        </div>
      </div>

      <div className="card-body">
        <div className="data-row">
          <span className="row-label">Precio actual</span>
          <span className="row-value">{formatARS(precioARS)}</span>
        </div>
        <div className="data-row">
          <span className="row-label">Precio USD</span>
          <span className="row-value">{formatUSD(precioUSD)}</span>
        </div>
        <div className="data-row">
          <span className="row-label">Cantidad</span>
          <span className="row-value">{cantidad}</span>
        </div>
        <div className="data-row">
          <span className="row-label">Monto</span>
          <span className="row-value">{formatARS(montoARS)}</span>
        </div>
        <div className="data-row highlight">
          <span className="row-label">Monto total</span>
          <span className="row-value">{formatARS(montoTotalARS)}</span>
        </div>
        <div className="data-row">
          <span className="row-label">Equivalente USD</span>
          <span className="row-value">{formatUSD(montoTotalUSD)}</span>
        </div>
      </div>

      <div className="card-footer">
        <button className="btn btn-ghost btn-sm" onClick={() => onEdit(position)}>
          Editar
        </button>
        <button className="btn btn-danger-ghost btn-sm" onClick={() => onDelete(position._id)}>
          Eliminar
        </button>
      </div>
    </div>
  );
}
