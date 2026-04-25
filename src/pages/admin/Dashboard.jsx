import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { dashboardApi } from '../../services/adminApi'
import AdminLayout from './AdminLayout'

const fmtPrice = (n) => `$${parseFloat(n || 0).toLocaleString('es-AR')}`
const fmtDate = (d) => new Date(d).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })

const statusLabels = { pending: 'Pendiente', paid: 'Pagada', shipped: 'Enviada', delivered: 'Entregada', cancelled: 'Cancelada' }

export default function Dashboard() {
  const { token } = useAuth()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    dashboardApi.get(token)
      .then(res => setData(res.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [token])

  if (loading) return <AdminLayout title="Dashboard"><div className="admin-empty"><div className="product-detail__spinner" /></div></AdminLayout>

  const { stats, ordersByStatus, lowStockProducts, recentOrders } = data || {}

  return (
    <AdminLayout title="Dashboard">
      {/* KPI Stats */}
      <div className="admin-stats">
        <div className="admin-stat">
          <div className="admin-stat__icon admin-stat__icon--revenue">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
          </div>
          <div className="admin-stat__info">
            <div className="admin-stat__label">Ingresos</div>
            <div className="admin-stat__value">{fmtPrice(stats?.revenue)}</div>
          </div>
        </div>
        <div className="admin-stat">
          <div className="admin-stat__icon admin-stat__icon--orders">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
          </div>
          <div className="admin-stat__info">
            <div className="admin-stat__label">Órdenes</div>
            <div className="admin-stat__value">{stats?.totalOrders || 0}</div>
          </div>
        </div>
        <div className="admin-stat">
          <div className="admin-stat__icon admin-stat__icon--products">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/></svg>
          </div>
          <div className="admin-stat__info">
            <div className="admin-stat__label">Productos</div>
            <div className="admin-stat__value">{stats?.activeProducts || 0}</div>
          </div>
        </div>
        <div className="admin-stat">
          <div className="admin-stat__icon admin-stat__icon--customers">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
          </div>
          <div className="admin-stat__info">
            <div className="admin-stat__label">Clientes</div>
            <div className="admin-stat__value">{stats?.totalCustomers || 0}</div>
          </div>
        </div>
      </div>

      <div className="admin-grid admin-grid--2">
        {/* Recent Orders */}
        <div className="admin-card">
          <div className="admin-card__header">
            <h3 className="admin-card__title">Órdenes Recientes</h3>
          </div>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Cliente</th>
                <th>Total</th>
                <th>Estado</th>
                <th>Fecha</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders?.length === 0 && <tr><td colSpan="4" style={{ textAlign: 'center', color: 'var(--admin-text-muted)' }}>Sin órdenes</td></tr>}
              {recentOrders?.map(order => (
                <tr key={order.id}>
                  <td>{order.user?.firstName || order.user?.email}</td>
                  <td>{fmtPrice(order.totalPrice)}</td>
                  <td><span className={`admin-badge admin-badge--${order.status}`}>{statusLabels[order.status]}</span></td>
                  <td style={{ color: 'var(--admin-text-muted)', fontSize: '0.78rem' }}>{fmtDate(order.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Low Stock */}
        <div className="admin-card">
          <div className="admin-card__header">
            <h3 className="admin-card__title">⚠️ Stock Bajo</h3>
          </div>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Producto</th>
                <th>Stock</th>
              </tr>
            </thead>
            <tbody>
              {lowStockProducts?.length === 0 && <tr><td colSpan="2" style={{ textAlign: 'center', color: 'var(--admin-text-muted)' }}>Todo en orden ✅</td></tr>}
              {lowStockProducts?.map(p => (
                <tr key={p.id}>
                  <td style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {p.images?.[0] && <img src={p.images[0]} alt="" className="admin-table__img" />}
                    {p.name}
                  </td>
                  <td><span className={`admin-stock ${p.stock <= 5 ? 'admin-stock--low' : 'admin-stock--medium'}`}>{p.stock} u.</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  )
}
