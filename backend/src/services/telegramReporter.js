const TELEGRAM_API_BASE = 'https://api.telegram.org';

function getTelegramConfig() {
  return {
    token: process.env.TELEGRAM_BOT_TOKEN,
    chatId: process.env.TELEGRAM_CHAT_ID,
  };
}

export function isTelegramConfigured() {
  const { token, chatId } = getTelegramConfig();
  return Boolean(token && chatId);
}

export async function sendTelegramMessage(text) {
  const { token, chatId } = getTelegramConfig();

  if (!token || !chatId) {
    throw new Error('Telegram no configurado: faltan TELEGRAM_BOT_TOKEN o TELEGRAM_CHAT_ID');
  }

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
    throw new Error(`Telegram API error: ${response.status} - ${body}`);
  }

  return response.json();
}
