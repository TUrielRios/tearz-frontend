import { createContext, useContext, useState, useEffect } from 'react'

const CartContext = createContext(null)

const CART_KEY = 'tearz_cart'

const loadCart = () => {
  try {
    const saved = localStorage.getItem(CART_KEY)
    return saved ? JSON.parse(saved) : []
  } catch { return [] }
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(loadCart)
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    localStorage.setItem(CART_KEY, JSON.stringify(items))
  }, [items])

  const addItem = (product, size, quantity = 1) => {
    setItems(prev => {
      const key = `${product.id}_${size}`
      const existing = prev.find(i => `${i.productId}_${i.size}` === key)
      if (existing) {
        return prev.map(i =>
          `${i.productId}_${i.size}` === key
            ? { ...i, quantity: i.quantity + quantity }
            : i
        )
      }
      return [...prev, {
        productId: product.id,
        name: product.name,
        price: parseFloat(product.price),
        image: product.images?.[0] || product.image || '',
        size,
        quantity,
      }]
    })
    setIsOpen(true)
  }

  const removeItem = (productId, size) => {
    setItems(prev => prev.filter(i => !(i.productId === productId && i.size === size)))
  }

  const updateQuantity = (productId, size, quantity) => {
    if (quantity <= 0) return removeItem(productId, size)
    setItems(prev => prev.map(i =>
      i.productId === productId && i.size === size ? { ...i, quantity } : i
    ))
  }

  const clearCart = () => setItems([])

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0)
  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0)
  const shippingCost = 0
  const total = subtotal

  return (
    <CartContext.Provider value={{
      items, addItem, removeItem, updateQuantity, clearCart,
      totalItems, subtotal, shippingCost, total,
      isOpen, setIsOpen,
    }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => useContext(CartContext)
