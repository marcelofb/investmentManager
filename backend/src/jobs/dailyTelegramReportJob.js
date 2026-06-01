import DailySnapshot from '../models/DailySnapshot.js';
import { getPatrimonioSnapshot } from '../services/patrimonioService.js';
import { buildDailySummaryMessage } from '../services/dailySummaryFormatter.js';
import { isTelegramConfigured, sendTelegramMessage } from '../services/telegramReporter.js';

const DEFAULT_TIMEZONE = 'America/Argentina/Buenos_Aires';

function getDateKeyInTimezone(date, timezone) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date);

  const year = parts.find((part) => part.type === 'year')?.value;
  const month = parts.find((part) => part.type === 'month')?.value;
  const day = parts.find((part) => part.type === 'day')?.value;

  return `${year}-${month}-${day}`;
}

async function getPreviousSnapshot(dateKey) {
  return DailySnapshot.findOne({ dateKey: { $lt: dateKey } })
    .sort({ dateKey: -1 })
    .lean();
}

export async function runDailyTelegramReport({ force = false } = {}) {
  if (!isTelegramConfigured()) {
    console.warn('[daily-telegram-report] Saltado: Telegram no configurado');
    return { sent: false, reason: 'telegram_not_configured' };
  }

  const timezone = process.env.REPORT_TIMEZONE || DEFAULT_TIMEZONE;
  const now = new Date();
  const dateKey = getDateKeyInTimezone(now, timezone);

  const existingSnapshot = await DailySnapshot.findOne({ dateKey }).lean();
  if (existingSnapshot && !force) {
    console.info(`[daily-telegram-report] Saltado: ya existe reporte para ${dateKey}`);
    return { sent: false, reason: 'already_sent_today', dateKey };
  }

  console.info('[daily-telegram-report] Obteniendo snapshot de patrimonio...');
  const snapshot = await getPatrimonioSnapshot();
  console.info(`[daily-telegram-report] Snapshot obtenido: $${snapshot.patrimonioTotalUSD}`);
  const previousSnapshot = await getPreviousSnapshot(dateKey);

  const message = buildDailySummaryMessage({
    timezone,
    now,
    patrimonioTotalUSD: snapshot.patrimonioTotalUSD,
    previousPatrimonioTotalUSD: previousSnapshot?.patrimonioTotalUSD,
  });

  console.info('[daily-telegram-report] Enviando mensaje a Telegram...');
  await sendTelegramMessage(message);

  await DailySnapshot.findOneAndUpdate(
    { dateKey },
    {
      dateKey,
      patrimonioTotalUSD: snapshot.patrimonioTotalUSD,
      sentAt: now,
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  console.info(`[daily-telegram-report] Enviado correctamente para ${dateKey}`);
  return { sent: true, dateKey, patrimonioTotalUSD: snapshot.patrimonioTotalUSD };
}

