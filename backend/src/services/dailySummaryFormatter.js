function formatUsd(value) {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  }).format(value);
}

function formatSignedUsd(value) {
  const abs = formatUsd(Math.abs(value));
  if (value > 0) return `+${abs}`;
  if (value < 0) return `-${abs}`;
  return abs;
}

function formatSignedPercent(value) {
  if (!Number.isFinite(value)) return 'N/D';
  if (value > 0) return `+${value.toFixed(2)}%`;
  if (value < 0) return `${value.toFixed(2)}%`;
  return '0.00%';
}

function formatDateInTimezone(date, timezone) {
  return new Intl.DateTimeFormat('es-AR', {
    timeZone: timezone,
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(date);
}

export function buildDailySummaryMessage({
  timezone,
  now,
  patrimonioTotalUSD,
  previousPatrimonioTotalUSD,
}) {
  const deltaAbs =
    typeof previousPatrimonioTotalUSD === 'number'
      ? patrimonioTotalUSD - previousPatrimonioTotalUSD
      : null;

  const deltaPct =
    typeof previousPatrimonioTotalUSD === 'number' && previousPatrimonioTotalUSD > 0
      ? (deltaAbs / previousPatrimonioTotalUSD) * 100
      : null;

  const lines = [
    `Reporte diario de patrimonio`,
    `Fecha: ${formatDateInTimezone(now, timezone)}`,
    `Total: ${formatUsd(patrimonioTotalUSD)}`,
  ];

  if (deltaAbs === null) {
    lines.push('Variacion diaria: N/D (primer registro)');
  } else {
    lines.push(`Variacion diaria: ${formatSignedUsd(deltaAbs)} (${formatSignedPercent(deltaPct)})`);
  }

  return lines.join('\n');
}
