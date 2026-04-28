const VITE_API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'
const API_URL = VITE_API_URL.endsWith('/') ? VITE_API_URL.slice(0, -1) : VITE_API_URL

console.log('🌐 [Admin] Conectando a Backend en:', API_URL)

const getHeaders = (token) => {
  const headers = { 'Content-Type': 'application/json' }
  if (token) headers.Authorization = `Bearer ${token}`
  return headers
}

const authHeaders = (token) => ({ Authorization: `Bearer ${token}` })

const handleResponse = async (res) => {
  const data = await res.json()
  if (!res.ok) throw { status: res.status, ...data }
  return data
}

// ─── Dashboard ─────────────────────────────────────────
export const dashboardApi = {
  get: (token) =>
    fetch(`${API_URL}/admin/dashboard`, { headers: getHeaders(token) }).then(handleResponse),
}

// ─── Products (admin) ──────────────────────────────────
export const adminProductsApi = {
  list: (token, params = {}) => {
    const clean = Object.fromEntries(Object.entries(params).filter(([_, v]) => v !== undefined && v !== null && v !== ''))
    const query = new URLSearchParams(clean).toString()
    return fetch(`${API_URL}/products${query ? `?${query}` : ''}`, { headers: getHeaders(token) }).then(handleResponse)
  },
  getById: (id, token) =>
    fetch(`${API_URL}/products/${id}`, { headers: getHeaders(token) }).then(handleResponse),
  create: (body, token) =>
    fetch(`${API_URL}/products`, { method: 'POST', headers: getHeaders(token), body: JSON.stringify(body) }).then(handleResponse),
  update: (id, body, token) =>
    fetch(`${API_URL}/products/${id}`, { method: 'PUT', headers: getHeaders(token), body: JSON.stringify(body) }).then(handleResponse),
  delete: (id, token) =>
    fetch(`${API_URL}/products/${id}`, { method: 'DELETE', headers: getHeaders(token) }).then(handleResponse),
}

// ─── Categories (admin) ────────────────────────────────
export const adminCategoriesApi = {
  list: (token) =>
    fetch(`${API_URL}/categories`, { headers: getHeaders(token) }).then(handleResponse),
  create: (body, token) =>
    fetch(`${API_URL}/categories`, { method: 'POST', headers: getHeaders(token), body: JSON.stringify(body) }).then(handleResponse),
  update: (id, body, token) =>
    fetch(`${API_URL}/categories/${id}`, { method: 'PUT', headers: getHeaders(token), body: JSON.stringify(body) }).then(handleResponse),
  delete: (id, token) =>
    fetch(`${API_URL}/categories/${id}`, { method: 'DELETE', headers: getHeaders(token) }).then(handleResponse),
}

// ─── Orders (admin) ────────────────────────────────────
export const adminOrdersApi = {
  list: (token, params = {}) => {
    const query = new URLSearchParams(params).toString()
    return fetch(`${API_URL}/admin/orders${query ? `?${query}` : ''}`, { headers: getHeaders(token) }).then(handleResponse)
  },
  getById: (id, token) =>
    fetch(`${API_URL}/orders/${id}`, { headers: getHeaders(token) }).then(handleResponse),
  updateStatus: (id, status, token) =>
    fetch(`${API_URL}/orders/${id}/status`, { method: 'PUT', headers: getHeaders(token), body: JSON.stringify({ status }) }).then(handleResponse),
  ship: (id, body, token) =>
    fetch(`${API_URL}/admin/orders/${id}/ship`, { method: 'POST', headers: getHeaders(token), body: JSON.stringify(body) }).then(handleResponse),
}

// ─── Coupons (admin) ───────────────────────────────────
export const adminCouponsApi = {
  list: (token) =>
    fetch(`${API_URL}/coupons`, { headers: getHeaders(token) }).then(handleResponse),
  create: (body, token) =>
    fetch(`${API_URL}/coupons`, { method: 'POST', headers: getHeaders(token), body: JSON.stringify(body) }).then(handleResponse),
  update: (id, body, token) =>
    fetch(`${API_URL}/coupons/${id}`, { method: 'PUT', headers: getHeaders(token), body: JSON.stringify(body) }).then(handleResponse),
  delete: (id, token) =>
    fetch(`${API_URL}/coupons/${id}`, { method: 'DELETE', headers: getHeaders(token) }).then(handleResponse),
}

// ─── Customers (admin) ─────────────────────────────────
export const adminCustomersApi = {
  list: (token) =>
    fetch(`${API_URL}/admin/customers`, { headers: getHeaders(token) }).then(handleResponse),
}

// ─── Site Content ──────────────────────────────────────
export const siteContentApi = {
  getAll: (token) =>
    fetch(`${API_URL}/admin/site-content`, { headers: getHeaders(token) }).then(handleResponse),
  upsert: (key, value, token) =>
    fetch(`${API_URL}/admin/site-content`, { method: 'PUT', headers: getHeaders(token), body: JSON.stringify({ key, value }) }).then(handleResponse),
}

// ─── Journal Posts (admin) ─────────────────────────────
export const adminJournalApi = {
  list: (token) =>
    fetch(`${API_URL}/admin/journals`, { headers: getHeaders(token) }).then(handleResponse),
  getById: (id, token) =>
    fetch(`${API_URL}/admin/journals/${id}`, { headers: getHeaders(token) }).then(handleResponse),
  create: (body, token) =>
    fetch(`${API_URL}/admin/journals`, { method: 'POST', headers: getHeaders(token), body: JSON.stringify(body) }).then(handleResponse),
  update: (id, body, token) =>
    fetch(`${API_URL}/admin/journals/${id}`, { method: 'PUT', headers: getHeaders(token), body: JSON.stringify(body) }).then(handleResponse),
  delete: (id, token) =>
    fetch(`${API_URL}/admin/journals/${id}`, { method: 'DELETE', headers: getHeaders(token) }).then(handleResponse),
}

// ─── Upload ────────────────────────────────────────────
export const uploadApi = {
  images: (files, token) => {
    const formData = new FormData()
    files.forEach(file => formData.append('images', file))
    return fetch(`${API_URL}/admin/upload`, {
      method: 'POST',
      headers: authHeaders(token),
      body: formData,
    }).then(handleResponse)
  },
}
