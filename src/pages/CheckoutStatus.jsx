import React, { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useCart } from '../contexts/CartContext'
import { useAuth } from '../contexts/AuthContext'
import { paymentsApi } from '../services/api'

export default function CheckoutStatus({ variant }) {
  const location = useLocation()
  const navigate = useNavigate()
  const { clearCart } = useCart()
  const { user } = useAuth()
  const [orderId, setOrderId] = useState('')
  const [verifying, setVerifying] = useState(false)
  const verificationStarted = React.useRef(false)

  useEffect(() => {
    // Mercado Pago params
    const searchParams = new URLSearchParams(location.search)
    const external_reference = searchParams.get('external_reference')
    const order_id = searchParams.get('order')
    const currentOrderId = external_reference || order_id || ''
    
    if (currentOrderId && currentOrderId !== orderId) {
      setOrderId(currentOrderId)
    }

    // Clear cart and verify if successful or pending
    if ((variant === 'success' || variant === 'pending') && !verificationStarted.current) {
      verificationStarted.current = true
      clearCart()

      // If we have an order ID, verify it with the backend manually
      if (currentOrderId && user?.token) {
        setVerifying(true)
        paymentsApi.verify(currentOrderId, user.token)
          .then(() => {
            console.log('✅ Pago verificado correctamente')
          })
          .catch(err => {
            console.error('❌ Error verificando pago:', err)
          })
          .finally(() => {
            setVerifying(false)
          })
      }

      // Redirect to home after 5 seconds
      const timer = setTimeout(() => {
        navigate('/')
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [location.search, variant, clearCart, navigate, user, orderId])

  const content = {
    success: {
      title: '¡Pago Aprobado!',
      text: 'Tu pago se procesó correctamente y estamos preparando tu orden.',
      color: '#059669',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#059669', marginBottom: '20px' }}>
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
          <polyline points="22 4 12 14.01 9 11.01"></polyline>
        </svg>
      )
    },
    failure: {
      title: 'Pago Rechazado',
      text: 'Hubo un problema procesando tu pago. Por favor intenta con otro medio de pago.',
      color: '#dc2626',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#dc2626', marginBottom: '20px' }}>
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="15" y1="9" x2="9" y2="15"></line>
          <line x1="9" y1="9" x2="15" y2="15"></line>
        </svg>
      )
    },
    pending: {
      title: 'Pago Pendiente',
      text: 'Tu pago está en proceso. Te enviaremos un email en cuanto Mercado Pago complete la validación.',
      color: '#d97706',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#d97706', marginBottom: '20px' }}>
          <circle cx="12" cy="12" r="10"></circle>
          <polyline points="12 6 12 12 16 14"></polyline>
        </svg>
      )
    }
  }

  const current = content[variant]

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', padding: '20px' }}>
      <div style={{ maxWidth: '500px', width: '100%', backgroundColor: '#fff', borderRadius: '12px', padding: '40px', textAlign: 'center', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' }}>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          {current.icon}
        </div>
        <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '15px', color: current.color }}>
          {current.title}
        </h1>
        <p style={{ fontSize: '16px', color: '#4b5563', marginBottom: '20px', lineHeight: 1.5 }}>
          {current.text}
        </p>
        
        {orderId && (
          <div style={{ marginBottom: '30px' }}>
            <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>
              Nº de Orden: <strong>#{orderId}</strong>
            </p>
            {verifying && (
              <p style={{ fontSize: '12px', color: '#9ca3af' }}>
                Verificando estado con el servidor...
              </p>
            )}
          </div>
        )}

        {variant === 'success' && (
          <a 
            href={`https://wa.me/5491160442035?text=${encodeURIComponent(`¡Hola! Acabo de realizar una compra (Orden #${orderId}). Te envío el comprobante para coordinar el envío.`)}`}
            target="_blank" 
            rel="noopener noreferrer"
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              gap: '10px', 
              width: '100%', 
              backgroundColor: '#25D366', 
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              padding: '15px',
              fontWeight: '600',
              fontSize: '14px',
              marginBottom: '12px', 
              textDecoration: 'none',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
            ENVIAR COMPROBANTE POR WHATSAPP
          </a>
        )}
        
        {variant === 'failure' ? (
          <button onClick={() => navigate('/checkout')} className="btn btn--primary" style={{ width: '100%' }}>
            VOLVER A INTENTAR
          </button>
        ) : (
          <Link to="/" className="btn btn--primary" style={{ display: 'block', width: '100%', textDecoration: 'none', backgroundColor: '#f3f4f6', color: '#4b5563', border: '1px solid #e5e7eb' }}>
            SEGUIR COMPRANDO
          </Link>
        )}
      </div>
    </div>
  )
}
