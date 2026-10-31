const AR_TIMEZONE = 'America/Argentina/Buenos_Aires';
const MS_POR_DIA = 1000 * 60 * 60 * 24;

const arFormatter = new Intl.DateTimeFormat('en-CA', {
  timeZone: AR_TIMEZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

// Fecha de hoy en Argentina, expresada como medianoche UTC (igual que las fechas guardadas desde los formularios)
export function hoyAR(now = new Date()) {
  return new Date(`${arFormatter.format(now)}T00:00:00.000Z`);
}

export function diasTranscurridosAR(fechaInicio, now = new Date()) {
  return Math.floor((hoyAR(now) - new Date(fechaInicio)) / MS_POR_DIA);
}
