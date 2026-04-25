import React, { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useCart } from '../contexts/CartContext'

export default function CheckoutStatus({ variant }) {
  const location = useLocation()
  const navigate = useNavigate()
  const { clearCart } = useCart()
  const [orderId, setOrderId] = useState('')

  useEffect(() => {
    // Mercado Pago params
    const searchParams = new URLSearchParams(location.search)
    const external_reference = searchParams.get('external_reference')
    const order_id = searchParams.get('order')
    
    // Clear cart and redirect if successful or pending
    if (variant === 'success' || variant === 'pending') {
      clearCart()
      // Redirect to home after 3 seconds
      const timer = setTimeout(() => {
        navigate('/')
      }, 3000)
      return () => clearTimeout(timer)
    }
    
    setOrderId(external_reference || order_id || '')
  }, [location, variant, clearCart, navigate])

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
          <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '30px' }}>
            Nº de Orden: <strong>#{orderId}</strong>
          </p>
        )}

        {variant === 'failure' ? (
          <button onClick={() => navigate('/checkout')} className="btn btn--primary" style={{ width: '100%' }}>
            VOLVER A INTENTAR
          </button>
        ) : (
          <Link to="/" className="btn btn--primary" style={{ display: 'block', width: '100%', textDecoration: 'none' }}>
            SEGUIR COMPRANDO
          </Link>
        )}
      </div>
    </div>
  )
}
