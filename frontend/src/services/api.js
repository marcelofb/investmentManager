const BASE_URL = import.meta.env.VITE_API_URL ?? '/api';

async function request(method, path, body) {
  const options = {
    method,
    headers: { 'Content-Type': 'application/json' },
  };
  if (body !== undefined) options.body = JSON.stringify(body);

  const res = await fetch(`${BASE_URL}${path}`, options);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Error en la solicitud');
  return data;
}

export const dashboardAPI = {
  get: () => request('GET', '/dashboard'),
};

export const plazosAPI = {
  getAll: () => request('GET', '/plazos-fijos'),
  getHistorial: () => request('GET', '/plazos-fijos/historial'),
  create: (data) => request('POST', '/plazos-fijos', data),
  update: (id, data) => request('PUT', `/plazos-fijos/${id}`, data),
  precancelar: (id) => request('POST', `/plazos-fijos/${id}/precancelar`),
  remove: (id) => request('DELETE', `/plazos-fijos/${id}`),
};

export const cryptosAPI = {
  getAll: () => request('GET', '/cryptos'),
  create: (data) => request('POST', '/cryptos', data),
  update: (id, data) => request('PUT', `/cryptos/${id}`, data),
  remove: (id) => request('DELETE', `/cryptos/${id}`),
};
