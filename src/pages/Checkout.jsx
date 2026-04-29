import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../contexts/CartContext'
import { useAuth } from '../contexts/AuthContext'
import { ordersApi, paymentsApi, couponsApi } from '../services/api'

export default function Checkout() {
  const navigate = useNavigate()
  const { user, token, isLoggedIn } = useAuth()
  const { items, total, subtotal, subtotalBeforeDiscounts, bundleDiscountTotal, clearCart } = useCart()

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [deliveryMethod, setDeliveryMethod] = useState('shipping') // 'shipping' | 'pickup'
  
  const [shippingAddress, setShippingAddress] = useState({
    street: '',
    city: '',
    state: '',
    zip: '',
    phone: '',
  })

  const shippingCost = deliveryMethod === 'pickup' ? 0 : 0
  const calculatedTotal = subtotal + shippingCost

  // Validate user and cart on mount
  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/')
    }
    if (items.length === 0) {
      navigate('/productos')
    }
  }, [isLoggedIn, items, navigate])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setShippingAddress((prev) => ({ ...prev, [name]: value }))
  }

  const handleCheckout = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // 1. Prepare items for backend
      if (!items || items.length === 0) {
        throw new Error('El carrito está vacío. Por favor selecciona productos antes de pagar.')
      }

      const orderItems = items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        size: item.size
      }))

      // 2. Create the order
      const orderData = {
        items: orderItems,
        shippingMethod: deliveryMethod
      }
      
      if (deliveryMethod === 'shipping') {
        orderData.shippingAddress = shippingAddress
      }

      const orderRes = await ordersApi.create(orderData, token)

      if (!orderRes.success || !orderRes.data?.order) {
        throw new Error(orderRes.message || 'Error al crear la orden')
      }

      const orderId = orderRes.data.order.id

      // 3. Create Mercado Pago preference
      const paymentRes = await paymentsApi.create(orderId, token)
      
      // 4. Redirect to Mercado Pago URL
      if (paymentRes.success && paymentRes.data?.paymentUrl) {
        window.location.href = paymentRes.data.paymentUrl
      } else {
        throw new Error(paymentRes.message || 'Error al obtener la url de pago de Mercado Pago')
      }

    } catch (err) {
      console.error('Checkout error:', err)
      if (err.status === 401 || err.message?.toLowerCase().includes('expirado')) {
        setError('Tu sesión ha expirado. Por favor, cierra sesión e inicia sesión nuevamente para continuar.')
      } else {
        const errorMsg = err.message || (typeof err === 'string' ? err : 'Error al procesar el pago. Por favor intente de nuevo.')
        setError(errorMsg)
      }
    } finally {
      setLoading(false)
    }
  }

  const formatPrice = (p) => `$${parseFloat(p).toLocaleString('es-AR')}`

  return (
    <div className="product-detail-container" style={{ padding: '40px 20px', minHeight: '80vh', maxWidth: '1000px', margin: '0 auto' }}>
      <h1 style={{ marginBottom: '20px', fontSize: '24px', fontWeight: 'bold' }}>Finalizar Compra</h1>
      
      {error && (
        <div style={{ backgroundColor: '#fee2e2', color: '#991b1b', padding: '12px', borderRadius: '4px', marginBottom: '20px' }}>
          {error}
        </div>
      )}

      <div style={{ display: 'flex', gap: '40px', flexWrap: 'wrap' }}>
        {/* Left Side - Form */}
        <div style={{ flex: '1 1 500px' }}>
          <form className="auth-modal__form" onSubmit={handleCheckout}>
            <div className="auth-modal__group">
              <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '15px' }}>Método de Entrega</h2>
              
              <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                <button
                  type="button"
                  onClick={() => setDeliveryMethod('shipping')}
                  style={{
                    flex: 1,
                    padding: '12px',
                    border: deliveryMethod === 'shipping' ? '2px solid #000' : '2px solid #e5e7eb',
                    backgroundColor: deliveryMethod === 'shipping' ? '#f3f4f6' : '#fff',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: deliveryMethod === 'shipping' ? '600' : '400',
                  }}
                >
                  Envío a coordinar por WhatsApp
                </button>
                <button
                  type="button"
                  onClick={() => setDeliveryMethod('pickup')}
                  style={{
                    flex: 1,
                    padding: '12px',
                    border: deliveryMethod === 'pickup' ? '2px solid #000' : '2px solid #e5e7eb',
                    backgroundColor: deliveryMethod === 'pickup' ? '#f3f4f6' : '#fff',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: deliveryMethod === 'pickup' ? '600' : '400',
                  }}
                >
                  Retirar en el local
                </button>
              </div>
            </div>

            {deliveryMethod === 'shipping' && (
              <>
                <div className="auth-modal__group">
                  <label className="auth-modal__label" htmlFor="street">Dirección completa</label>
                  <input
                    type="text"
                    id="street"
                    name="street"
                    className="auth-modal__input"
                    placeholder="Calle y Número, Depto, etc."
                    value={shippingAddress.street}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div style={{ display: 'flex', gap: '15px' }}>
                  <div className="auth-modal__group" style={{ flex: 1 }}>
                    <label className="auth-modal__label" htmlFor="city">Ciudad</label>
                    <input
                      type="text"
                      id="city"
                      name="city"
                      className="auth-modal__input"
                      placeholder="Ciudad"
                      value={shippingAddress.city}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="auth-modal__group" style={{ flex: 1 }}>
                    <label className="auth-modal__label" htmlFor="state">Provincia / Estado</label>
                    <input
                      type="text"
                      id="state"
                      name="state"
                      className="auth-modal__input"
                      placeholder="Provincia"
                      value={shippingAddress.state}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '15px' }}>
                  <div className="auth-modal__group" style={{ flex: 1 }}>
                    <label className="auth-modal__label" htmlFor="zip">Código Postal</label>
                    <input
                      type="text"
                      id="zip"
                      name="zip"
                      className="auth-modal__input"
                      placeholder="CP"
                      value={shippingAddress.zip}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="auth-modal__group" style={{ flex: 1 }}>
                    <label className="auth-modal__label" htmlFor="phone">Teléfono</label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      className="auth-modal__input"
                      placeholder="Ej: 11 1234 5678"
                      value={shippingAddress.phone}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
              </>
            )}

            <button 
              type="submit" 
              className="btn btn--primary" 
              style={{ width: '100%', marginTop: '20px', padding: '15px', display: 'flex', justifyContent: 'center' }}
              disabled={loading}
            >
              {loading ? (
                <div style={{ width: '20px', height: '20px', border: '3px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
              ) : (
                'IR A PAGAR A MERCADO PAGO'
              )}
            </button>
          </form>
        </div>

        {/* Right Side - Summary */}
        <div style={{ flex: '1 1 300px', backgroundColor: '#f9fafb', padding: '24px', borderRadius: '8px', border: '1px solid #e5e7eb', alignSelf: 'flex-start' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '20px', paddingBottom: '10px', borderBottom: '1px solid #e5e7eb' }}>Resumen de pedido</h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '20px' }}>
            {(items || []).map((item, index) => (
              <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <img src={item.image} alt={item.name} style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '4px' }} />
                  <div>
                    <span style={{ display: 'block', fontSize: '14px', fontWeight: '500' }}>{item.name}</span>
                    <span style={{ color: '#6b7280', fontSize: '12px' }}>Talle: {item.size} x{item.quantity}</span>
                  </div>
                </div>
                <span style={{ fontWeight: '500' }}>{formatPrice(item.price * item.quantity)}</span>
              </div>
            ))}
          </div>

          <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '15px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', color: '#4b5563' }}>
              <span>Subtotal</span>
              <span>{formatPrice(subtotalBeforeDiscounts)}</span>
            </div>
            {bundleDiscountTotal > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', color: 'var(--accent-color)', fontWeight: '600' }}>
                <span>Descuento Combo</span>
                <span>-{formatPrice(bundleDiscountTotal)}</span>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', color: '#4b5563' }}>
              <span>{deliveryMethod === 'pickup' ? 'Retirar en local' : 'Envío'}</span>
              <span>{deliveryMethod === 'pickup' ? <span style={{ color: '#059669', fontWeight: '500' }}>GRATIS</span> : <span style={{ fontWeight: '500' }}>A coordinar</span>}</span>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '15px', borderTop: '1px solid #e5e7eb' }}>
              <span style={{ fontSize: '18px', fontWeight: 'bold' }}>Total</span>
              <span style={{ fontSize: '20px', fontWeight: 'bold' }}>{formatPrice(calculatedTotal)}</span>
            </div>
          </div>
        </div>
      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
      `}} />
    </div>
  )
}
