export const formatARS = (amount) =>
  new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);

export const formatUSD = (amount) =>
  new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);

export const formatCryptoPrice = (price) => {
  if (price >= 1) {
    return formatUSD(price);
  }
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 6,
  }).format(price);
};

export const formatDate = (date) =>
  new Date(date).toLocaleDateString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    timeZone: 'UTC',
  });

const AR_TIMEZONE = 'America/Argentina/Buenos_Aires';

// Devuelve YYYY-MM-DD según el calendario de Argentina (no UTC)
export const dateInputAR = (date = new Date()) =>
  new Intl.DateTimeFormat('en-CA', {
    timeZone: AR_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date(date));

export const formatPercent = (value) => `${Number(value).toFixed(2)}%`;
