import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { adminCustomersApi } from '../../services/adminApi'
import AdminLayout from './AdminLayout'

const fmtPrice = (n) => `$${parseFloat(n || 0).toLocaleString('es-AR')}`
const fmtDate = (d) => new Date(d).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' })

export default function Customers() {
  const { token } = useAuth()
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    adminCustomersApi.list(token)
      .then(res => setCustomers(res.data.customers))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [token])

  const filtered = customers.filter(c =>
    (c.email + ' ' + (c.firstName || '') + ' ' + (c.lastName || '')).toLowerCase().includes(search.toLowerCase())
  )

  const getTotal = (orders) => orders?.reduce((sum, o) => sum + parseFloat(o.totalPrice || 0), 0) || 0

  return (
    <AdminLayout title="Clientes">
      <div className="admin-filters">
        <div className="admin-filters__search">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input placeholder="Buscar clientes..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <span style={{ color: 'var(--admin-text-muted)', fontSize: '0.82rem' }}>{filtered.length} clientes</span>
      </div>

      <div className="admin-card">
        {loading ? <div className="admin-empty"><div className="product-detail__spinner" /></div> : (
          <table className="admin-table">
            <thead>
              <tr><th>Cliente</th><th>Email</th><th>Órdenes</th><th>Total Compras</th><th>Registrado</th></tr>
            </thead>
            <tbody>
              {filtered.length === 0 && <tr><td colSpan="5" style={{ textAlign: 'center', color: 'var(--admin-text-muted)' }}>Sin clientes</td></tr>}
              {filtered.map(c => (
                <tr key={c.id}>
                  <td style={{ fontWeight: 600 }}>{c.firstName ? `${c.firstName} ${c.lastName || ''}` : '—'}</td>
                  <td style={{ color: 'var(--admin-text-muted)' }}>{c.email}</td>
                  <td>{c.orders?.length || 0}</td>
                  <td style={{ fontWeight: 600 }}>{fmtPrice(getTotal(c.orders))}</td>
                  <td style={{ color: 'var(--admin-text-muted)', fontSize: '0.78rem' }}>{fmtDate(c.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </AdminLayout>
  )
}
