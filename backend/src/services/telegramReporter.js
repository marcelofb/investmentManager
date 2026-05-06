const TELEGRAM_API_BASE = 'https://api.telegram.org';

function getTelegramConfig() {
  const raw = process.env.TELEGRAM_CHAT_ID ?? '';
  const chatIds = raw.split(',').map((id) => id.trim()).filter(Boolean);
  return {
    token: process.env.TELEGRAM_BOT_TOKEN,
    chatIds,
  };
}

export function isTelegramConfigured() {
  const { token, chatIds } = getTelegramConfig();
  return Boolean(token && chatIds.length > 0);
}

async function sendToChat(token, chatId, text) {
  const url = `${TELEGRAM_API_BASE}/bot${token}/sendMessage`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      disable_web_page_preview: true,
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Telegram API error (chat_id=${chatId}): ${response.status} - ${body}`);
  }

  return response.json();
}

export async function sendTelegramMessage(text) {
  const { token, chatIds } = getTelegramConfig();

  if (!token || chatIds.length === 0) {
    throw new Error('Telegram no configurado: faltan TELEGRAM_BOT_TOKEN o TELEGRAM_CHAT_ID');
  }

  const results = await Promise.allSettled(
    chatIds.map((chatId) => sendToChat(token, chatId, text)),
  );

  const failures = results.filter((r) => r.status === 'rejected');
  if (failures.length > 0) {
    const messages = failures.map((r) => r.reason?.message).join('; ');
    throw new Error(`Telegram: ${failures.length} envío(s) fallaron: ${messages}`);
  }

  return results.map((r) => r.value);
}
