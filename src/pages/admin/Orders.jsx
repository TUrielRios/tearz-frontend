import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { adminOrdersApi } from '../../services/adminApi'
import AdminLayout from './AdminLayout'

const fmtPrice = (n) => `$${parseFloat(n || 0).toLocaleString('es-AR')}`
const fmtDate = (d) => new Date(d).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
const statusLabels = { pending: 'Pendiente', paid: 'Pagada', shipped: 'Enviada', delivered: 'Entregada', cancelled: 'Cancelada' }
const statusColors = { pending: '#f59e0b', paid: '#22c55e', shipped: '#3b82f6', delivered: '#10b981', cancelled: '#ef4444' }
const statusFlow = { pending: ['paid', 'cancelled'], paid: ['cancelled'], shipped: ['delivered'], delivered: [], cancelled: [] }

export default function Orders() {
  const { token } = useAuth()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('')
  const [detail, setDetail] = useState(null)
  const [toast, setToast] = useState(null)
  // Ship modal state
  const [shipModal, setShipModal] = useState(false)
  const [shipLoading, setShipLoading] = useState(false)
  const [trackingCode, setTrackingCode] = useState('')
  const [adminNotes, setAdminNotes] = useState('')

  const load = () => {
    const params = {}
    if (filter) params.status = filter
    adminOrdersApi.list(token, params)
      .then(res => setOrders(res.data.orders))
      .catch(console.error)
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [token, filter])

  const showToast = (msg, error = false) => {
    setToast({ msg, error })
    setTimeout(() => setToast(null), 3500)
  }

  const updateStatus = async (orderId, status) => {
    try {
      await adminOrdersApi.updateStatus(orderId, status, token)
      showToast(`Orden actualizada a: ${statusLabels[status]}`)
      load()
      setDetail(null)
    } catch (err) { showToast(err.message || 'Error', true) }
  }

  const openShipModal = () => {
    setTrackingCode('')
    setAdminNotes('')
    setShipModal(true)
  }

  const handleShip = async () => {
    setShipLoading(true)
    try {
      await adminOrdersApi.ship(detail.id, { trackingCode, adminNotes }, token)
      showToast('✅ Orden despachada — cliente notificado por email')
      setShipModal(false)
      setDetail(null)
      load()
    } catch (err) {
      showToast(err.message || 'Error al despachar', true)
    } finally {
      setShipLoading(false)
    }
  }

  return (
    <AdminLayout title="Órdenes">
      <div className="admin-filters">
        <select className="admin-form__select" value={filter} onChange={e => setFilter(e.target.value)} style={{ minWidth: '160px' }}>
          <option value="">Todas</option>
          {Object.entries(statusLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <span style={{ color: 'var(--admin-text-muted)', fontSize: '0.82rem' }}>{orders.length} órdenes</span>
      </div>

      <div className="admin-card">
        {loading ? <div className="admin-empty"><div className="product-detail__spinner" /></div> : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Cliente</th>
                <th>Items</th>
                <th>Total</th>
                <th>Estado</th>
                <th>Tracking</th>
                <th>Fecha</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 && <tr><td colSpan="8" style={{ textAlign: 'center', color: 'var(--admin-text-muted)' }}>Sin órdenes</td></tr>}
              {orders.map(o => (
                <tr key={o.id}>
                  <td style={{ fontFamily: 'monospace', color: 'var(--admin-text-muted)', fontSize: '0.72rem' }}>{o.id.slice(0, 8)}...</td>
                  <td>{o.user?.firstName ? `${o.user.firstName} ${o.user.lastName || ''}` : o.user?.email}</td>
                  <td>{o.items?.length || 0}</td>
                  <td style={{ fontWeight: 600 }}>{fmtPrice(o.totalPrice)}</td>
                  <td><span className={`admin-badge admin-badge--${o.status}`}>{statusLabels[o.status]}</span></td>
                  <td style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: o.trackingCode ? '#2563eb' : 'var(--admin-text-muted)' }}>
                    {o.trackingCode || '—'}
                  </td>
                  <td style={{ color: 'var(--admin-text-muted)', fontSize: '0.78rem' }}>{fmtDate(o.createdAt)}</td>
                  <td><button className="admin-btn admin-btn--secondary admin-btn--sm" onClick={() => setDetail(o)}>Ver</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Order Detail Modal */}
      {detail && (
        <div className="admin-modal__overlay" onClick={() => setDetail(null)}>
          <div className="admin-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '720px' }}>
            <div className="admin-modal__header">
              <h3 className="admin-modal__title">Orden #{detail.id.slice(0, 8)}</h3>
              <button className="admin-modal__close" onClick={() => setDetail(null)}>✕</button>
            </div>
            <div className="admin-modal__body">
              {/* Customer + Total */}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--admin-text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '4px' }}>Cliente</div>
                  <div style={{ fontWeight: 600 }}>{detail.user?.firstName} {detail.user?.lastName}</div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--admin-text-muted)' }}>{detail.user?.email}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--admin-text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '4px' }}>Total</div>
                  <div style={{ fontWeight: 700, fontSize: '1.3rem' }}>{fmtPrice(detail.totalPrice)}</div>
                </div>
              </div>

              {/* Status + Date */}
              <div style={{ marginBottom: '16px' }}>
                <span className={`admin-badge admin-badge--${detail.status}`}>{statusLabels[detail.status]}</span>
                <span style={{ marginLeft: '12px', fontSize: '0.78rem', color: 'var(--admin-text-muted)' }}>{fmtDate(detail.createdAt)}</span>
              </div>

              {/* Shipping address */}
              {detail.shippingAddress && (
                <div style={{ background: 'var(--admin-bg)', borderRadius: '6px', padding: '12px 16px', marginBottom: '16px', fontSize: '0.84rem' }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--admin-text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '4px' }}>Dirección de envío</div>
                  <div>{typeof detail.shippingAddress === 'string' ? detail.shippingAddress : JSON.stringify(detail.shippingAddress)}</div>
                </div>
              )}

              {/* Tracking code (if exists) */}
              {detail.trackingCode && (
                <div style={{ background: '#eff6ff', border: '1px solid #93c5fd', borderRadius: '6px', padding: '12px 16px', marginBottom: '16px' }}>
                  <div style={{ fontSize: '0.72rem', color: '#1e40af', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '4px' }}>Número de tracking Andreani</div>
                  <div style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '1.05rem', color: '#1e3a8a' }}>{detail.trackingCode}</div>
                </div>
              )}

              {/* Items table */}
              <table className="admin-table" style={{ marginBottom: '20px' }}>
                <thead><tr><th>Producto</th><th>Cant.</th><th>Precio</th></tr></thead>
                <tbody>
                  {detail.items?.map(item => (
                    <tr key={item.id}>
                      <td style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        {item.product?.images?.[0] && <img src={item.product.images[0]} alt="" className="admin-table__img" />}
                        <div>
                          <div style={{ fontWeight: 600 }}>{item.product?.name || 'Producto'}</div>
                          {item.size && <div style={{ fontSize: '0.72rem', color: 'var(--admin-text-muted)' }}>Talle: {item.size}</div>}
                        </div>
                      </td>
                      <td>{item.quantity}</td>
                      <td>{fmtPrice(item.price)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Actions */}
              <div style={{ borderTop: '1px solid var(--admin-border)', paddingTop: '16px' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--admin-text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '10px' }}>Acciones</div>
                <div className="admin-actions" style={{ gap: '10px' }}>
                  {/* 🚚 DESPACHAR BUTTON — only for paid orders */}
                  {detail.status === 'paid' && (
                    <button
                      className="admin-btn admin-btn--primary"
                      onClick={openShipModal}
                      style={{ background: '#2563eb', display: 'flex', alignItems: 'center', gap: '6px' }}
                    >
                      🚚 Marcar como Despachado
                    </button>
                  )}
                  {statusFlow[detail.status]?.map(s => (
                    s !== 'cancelled' ? null :
                    <button key={s} className="admin-btn admin-btn--sm admin-btn--danger" onClick={() => updateStatus(detail.id, s)}>
                      {statusLabels[s]}
                    </button>
                  ))}
                  {detail.status === 'shipped' && (
                    <button className="admin-btn admin-btn--primary admin-btn--sm" onClick={() => updateStatus(detail.id, 'delivered')}>
                      📦 Marcar como Entregado
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Ship Order Modal */}
      {shipModal && detail && (
        <div className="admin-modal__overlay" onClick={() => setShipModal(false)}>
          <div className="admin-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '480px' }}>
            <div className="admin-modal__header">
              <h3 className="admin-modal__title">🚚 Despachar Orden #{detail.id.slice(0, 8)}</h3>
              <button className="admin-modal__close" onClick={() => setShipModal(false)}>✕</button>
            </div>
            <div className="admin-modal__body">
              <p style={{ color: 'var(--admin-text-muted)', fontSize: '0.88rem', marginBottom: '20px' }}>
                Al confirmar, la orden pasa a <strong>Enviada</strong> y el cliente recibe un email automático con el número de seguimiento.
              </p>

              <div className="admin-form__group">
                <label className="admin-form__label">
                  Número de Tracking Andreani
                  <span style={{ color: 'var(--admin-text-muted)', fontWeight: 400, marginLeft: '6px' }}>(opcional)</span>
                </label>
                <input
                  className="admin-form__input"
                  type="text"
                  placeholder="Ej: 01234567890"
                  value={trackingCode}
                  onChange={e => setTrackingCode(e.target.value)}
                  style={{ fontFamily: 'monospace', fontSize: '1rem', letterSpacing: '1px' }}
                />
                <small style={{ color: 'var(--admin-text-muted)', fontSize: '0.75rem', marginTop: '4px', display: 'block' }}>
                  El cliente recibirá un link directo para rastrear en andreani.com
                </small>
              </div>

              <div className="admin-form__group" style={{ marginTop: '16px' }}>
                <label className="admin-form__label">
                  Nota para el cliente
                  <span style={{ color: 'var(--admin-text-muted)', fontWeight: 400, marginLeft: '6px' }}>(opcional)</span>
                </label>
                <textarea
                  className="admin-form__input"
                  rows={3}
                  placeholder="Ej: Tu paquete salió esta tarde, cualquier consulta no dudes en escribirnos."
                  value={adminNotes}
                  onChange={e => setAdminNotes(e.target.value)}
                  style={{ resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '24px' }}>
                <button
                  className="admin-btn admin-btn--primary"
                  style={{ flex: 1, background: '#2563eb' }}
                  onClick={handleShip}
                  disabled={shipLoading}
                >
                  {shipLoading ? 'Procesando...' : '🚚 Confirmar despacho y notificar cliente'}
                </button>
                <button className="admin-btn admin-btn--secondary" onClick={() => setShipModal(false)}>
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {toast && <div className={`admin-toast ${toast.error ? 'admin-toast--error' : ''}`}>{toast.msg}</div>}
    </AdminLayout>
  )
}
