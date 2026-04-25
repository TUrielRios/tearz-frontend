import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { productsApi } from '../services/api'
import { useCart } from '../contexts/CartContext'

export default function ProductDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { addItem } = useCart()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedSize, setSelectedSize] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [added, setAdded] = useState(false)

  useEffect(() => {
    window.scrollTo(0, 0)
    productsApi.getById(id)
      .then(res => {
        setProduct(res.data.product)
        if (res.data.product.sizes?.length) setSelectedSize(res.data.product.sizes[0])
      })
      .catch(() => navigate('/'))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <div className="product-detail__loading">
        <div className="product-detail__spinner" />
      </div>
    )
  }

  if (!product) return null

  const displayPrice = (p) => `$${parseFloat(p).toLocaleString('es-AR')}`

  const handleAddToCart = () => {
    if (!selectedSize) return
    addItem(product, selectedSize, quantity)
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  return (
    <section className="product-detail">
      <button className="product-detail__back" onClick={() => navigate(-1)}>
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
        Volver
      </button>

      <div className="product-detail__grid">
        <div className="product-detail__images">
          <div className="product-detail__main-image">
            <img src={product.images?.[0] || product.image} alt={product.name} />
            {product.badge && <span className="product-card__badge">{product.badge}</span>}
          </div>
        </div>

        <div className="product-detail__info">
          {product.category && <span className="product-detail__category">{product.category.name}</span>}
          <h1 className="product-detail__name">{product.name}</h1>

          <div className="product-detail__price-wrapper">
            {product.oldPrice && <span className="product-detail__old-price">{displayPrice(product.oldPrice)}</span>}
            <span className="product-detail__price">{displayPrice(product.price)}</span>
          </div>

          <p className="product-detail__description">{product.description}</p>

          {product.colors?.length > 0 && (
            <div className="product-detail__section">
              <span className="product-detail__label">COLOR</span>
              <div className="product-detail__colors">
                {product.colors.map((color, i) => (
                  <span key={i} className="product-detail__color-swatch" style={{ background: color, border: color === '#ffffff' || color === '#f5f5f5' ? '2px solid #ddd' : '2px solid transparent' }} />
                ))}
              </div>
            </div>
          )}

          {product.sizes?.length > 0 && (
            <div className="product-detail__section">
              <span className="product-detail__label">TALLE</span>
              <div className="product-detail__sizes">
                {product.sizes.map(size => (
                  <button key={size} className={`product-detail__size-btn ${selectedSize === size ? 'active' : ''}`} onClick={() => setSelectedSize(size)}>
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="product-detail__section">
            <span className="product-detail__label">CANTIDAD</span>
            <div className="product-detail__quantity">
              <button onClick={() => setQuantity(q => Math.max(1, q - 1))}>−</button>
              <span>{quantity}</span>
              <button onClick={() => setQuantity(q => q + 1)}>+</button>
            </div>
          </div>

          <button className={`product-detail__add-btn ${added ? 'added' : ''}`} onClick={handleAddToCart} disabled={!selectedSize}>
            {added ? '✓ AGREGADO AL CARRITO' : 'AGREGAR AL CARRITO'}
          </button>

          <div className="product-detail__extras">
            <div className="product-detail__extra">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
              Envío gratis en compras superiores a $50.000
            </div>
            <div className="product-detail__extra">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
              Cambios y devoluciones gratis
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
