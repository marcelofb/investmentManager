import { formatARS, formatDate, formatPercent } from '../utils/formatters';

export default function PlazoFijoCard({ plazo, onEdit, onDelete, onPrecancelar }) {
  const progress = Math.min((plazo.diasTranscurridos / 365) * 100, 100);
  const progressColor = progress >= 100 ? 'success' : progress >= 60 ? 'warning' : '';

  return (
    <div className="item-card">
      <div className="card-header">
        <span className="card-title">Plazo Fijo</span>
        <div className="card-badges">
          {plazo.vencido ? (
            <span className="badge success">Vencido</span>
          ) : plazo.precancelable ? (
            <span className="badge success">Precancelable</span>
          ) : (
            <span className="badge warning">
              Bloqueado hasta día 30
            </span>
          )}
        </div>
      </div>

      <div className="card-body">
        <div className="data-row">
          <span className="row-label">Monto invertido</span>
          <span className="row-value">{formatARS(plazo.monto)}</span>
        </div>
        <div className="data-row">
          <span className="row-label">TNA</span>
          <span className="row-value">{formatPercent(plazo.tna)}</span>
        </div>
        <div className="data-row">
          <span className="row-label">Fecha inicio</span>
          <span className="row-value">{formatDate(plazo.fechaInicio)}</span>
        </div>
        <div className="data-row">
          <span className="row-label">Fecha vencimiento</span>
          <span className="row-value">{formatDate(plazo.fechaVencimiento)}</span>
        </div>

        <div className="progress-container">
          <div className="progress-label">
            <span>Días transcurridos</span>
            <span>{plazo.diasTranscurridos} / 365</span>
          </div>
          <div className="progress-bar">
            <div
              className={`progress-fill ${progressColor}`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="data-row">
          <span className="row-label">Intereses acumulados</span>
          <span className="row-value" style={{ color: 'var(--success)' }}>
            {formatARS(plazo.intereses)}
          </span>
        </div>
        <div className="data-row highlight">
          <span className="row-label">Monto actual</span>
          <span className="row-value">{formatARS(plazo.montoActual)}</span>
        </div>
      </div>

      <div className="card-footer">
        <button className="btn btn-ghost btn-sm" onClick={() => onEdit(plazo)}>
          Editar
        </button>
        {plazo.precancelable && (
          <button
            className="btn btn-warning-ghost btn-sm"
            onClick={() => onPrecancelar(plazo)}
          >
            Precancelar
          </button>
        )}
        <button
          className="btn btn-danger-ghost btn-sm"
          onClick={() => onDelete(plazo._id)}
        >
          Eliminar
        </button>
      </div>
    </div>
  );
}
