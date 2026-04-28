const VITE_API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'
const API_URL = VITE_API_URL.endsWith('/') ? VITE_API_URL.slice(0, -1) : VITE_API_URL

console.log('🌐 Conectando a Backend en:', API_URL)

const getHeaders = (token) => {
  const headers = { 'Content-Type': 'application/json' }
  if (token) headers.Authorization = `Bearer ${token}`
  return headers
}

const handleResponse = async (res) => {
  const data = await res.json()
  if (!res.ok) throw { status: res.status, ...data }
  return data
}

// ─── Auth ──────────────────────────────────────────────
export const authApi = {
  register: (body) =>
    fetch(`${API_URL}/auth/register`, { method: 'POST', headers: getHeaders(), body: JSON.stringify(body) }).then(handleResponse),
  login: (body) =>
    fetch(`${API_URL}/auth/login`, { method: 'POST', headers: getHeaders(), body: JSON.stringify(body) }).then(handleResponse),
  refresh: (refreshToken) =>
    fetch(`${API_URL}/auth/refresh`, { method: 'POST', headers: getHeaders(), body: JSON.stringify({ refreshToken }) }).then(handleResponse),
  me: (token) =>
    fetch(`${API_URL}/auth/me`, { headers: getHeaders(token) }).then(handleResponse),
}

// ─── Products ──────────────────────────────────────────
export const productsApi = {
  list: (params = {}) => {
    const query = new URLSearchParams(params).toString()
    return fetch(`${API_URL}/products${query ? `?${query}` : ''}`).then(handleResponse)
  },
  getById: (id) =>
    fetch(`${API_URL}/products/${id}`).then(handleResponse),
}

// ─── Categories ────────────────────────────────────────
export const categoriesApi = {
  list: () =>
    fetch(`${API_URL}/categories`).then(handleResponse),
}

// ─── Orders ────────────────────────────────────────────
export const ordersApi = {
  create: (body, token) =>
    fetch(`${API_URL}/orders`, { method: 'POST', headers: getHeaders(token), body: JSON.stringify(body) }).then(handleResponse),
  list: (token, params = {}) => {
    const query = new URLSearchParams(params).toString()
    return fetch(`${API_URL}/orders${query ? `?${query}` : ''}`, { headers: getHeaders(token) }).then(handleResponse)
  },
  getById: (id, token) =>
    fetch(`${API_URL}/orders/${id}`, { headers: getHeaders(token) }).then(handleResponse),
}

// ─── Payments ──────────────────────────────────────────
export const paymentsApi = {
  create: (orderId, token) =>
    fetch(`${API_URL}/payments/create`, { method: 'POST', headers: getHeaders(token), body: JSON.stringify({ orderId }) }).then(handleResponse),
}

// ─── Coupons ───────────────────────────────────────────
export const couponsApi = {
  validate: (code, totalPrice, token) =>
    fetch(`${API_URL}/coupons/validate`, { method: 'POST', headers: getHeaders(token), body: JSON.stringify({ code, totalPrice }) }).then(handleResponse),
}

// ─── Site Content ──────────────────────────────────────
export const siteContentApi = {
  getAll: () =>
    fetch(`${API_URL}/site-content`).then(handleResponse),
}

// ─── Journal Posts ─────────────────────────────────────
export const journalApi = {
  listPublished: () =>
    fetch(`${API_URL}/journal`).then(handleResponse),
  getBySlug: (slug) =>
    fetch(`${API_URL}/journal/${slug}`).then(handleResponse),
}
