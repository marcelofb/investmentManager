const DOLAR_API_URL = 'https://dolarapi.com/v1/dolares/oficial';

export async function getDolarOficial() {
  const res = await fetch(DOLAR_API_URL);
  if (!res.ok) throw new Error(`DolarAPI error: ${res.status}`);
  const data = await res.json();
  return parseFloat(data.venta);
}
