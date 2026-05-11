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
  const [bundles, setBundles] = useState([])
  const [bundleDiscountTotal, setBundleDiscountTotal] = useState(0)

  useEffect(() => {
    localStorage.setItem(CART_KEY, JSON.stringify(items))
    calculateBundleDiscounts()
  }, [items, bundles])

  useEffect(() => {
    // Fetch active bundles from API
    fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/bundles`)
      .then(res => res.json())
      .then(res => {
        if (res.success) setBundles(res.data.bundles)
      })
      .catch(console.error)
  }, [])

  const calculateBundleDiscounts = () => {
    if (!bundles || bundles.length === 0 || items.length === 0) {
      setBundleDiscountTotal(0)
      return
    }

    let totalDiscount = 0
    // We clone items to track how many have been "used" for bundles
    let tempItems = items.map(i => ({ ...i }))

    // Sort bundles by discount percentage (highest first) to favor the user
    const sortedBundles = [...bundles].sort((a, b) => b.discountPercentage - a.discountPercentage)

    sortedBundles.forEach(bundle => {
      const requirements = [
        ...bundle.productIds.map(id => ({ type: 'product', id })),
        ...(bundle.categoryIds || []).map(id => ({ type: 'category', id }))
      ]
      
      if (requirements.length === 0) return

      // Find how many times this set of requirements can be applied
      let timesApplied = 0
      while (true) {
        let satisfied = true
        let usedIndices = []
        let currentIterationPrice = 0
        
        // We try to satisfy each requirement in the bundle
        for (const req of requirements) {
          let foundIndex = -1
          if (req.type === 'product') {
            foundIndex = tempItems.findIndex(i => i.productId === req.id && i.quantity > 0)
          } else {
            // Find any product that belongs to this category
            foundIndex = tempItems.findIndex(i => (i.categoryId === req.id || i.category_id === req.id) && i.quantity > 0)
          }
          
          if (foundIndex === -1) {
            satisfied = false
            break
          } else {
            // "Borrow" one quantity for this iteration
            tempItems[foundIndex].quantity -= 1
            usedIndices.push(foundIndex)
            currentIterationPrice += tempItems[foundIndex].price
          }
        }
        
        if (satisfied) {
          timesApplied++
          totalDiscount += (currentIterationPrice * (bundle.discountPercentage / 100))
        } else {
          // Put back the quantities if we couldn't satisfy the whole bundle in this iteration
          usedIndices.forEach(idx => {
            tempItems[idx].quantity += 1
          })
          break
        }
      }
    })

    setBundleDiscountTotal(totalDiscount)
  }

  const addItem = (product, size, quantity = 1) => {
    // Get max stock for this specific size/product
    const maxStock = (product.sizeStock && product.sizeStock[size] !== undefined)
      ? product.sizeStock[size]
      : (product.stock || 0)

    setItems(prev => {
      const key = `${product.id}_${size}`
      const existing = prev.find(i => `${i.productId}_${i.size}` === key)
      
      if (existing) {
        const newQuantity = Math.min(existing.quantity + quantity, maxStock)
        return prev.map(i =>
          `${i.productId}_${i.size}` === key
            ? { ...i, quantity: newQuantity, maxStock }
            : i
        )
      }
      
      // If adding for the first time, still respect maxStock
      const finalQuantity = Math.min(quantity, maxStock)
      
      return [...prev, {
        productId: product.id,
        categoryId: product.categoryId || product.category?.id || product.category_id,
        category_id: product.categoryId || product.category?.id || product.category_id,
        name: product.name,
        price: parseFloat(product.price),
        image: product.images?.[0] || product.image || '',
        size,
        quantity: finalQuantity,
        maxStock,
      }]
    })
    setIsOpen(true)
  }

  const removeItem = (productId, size) => {
    setItems(prev => prev.filter(i => !(i.productId === productId && i.size === size)))
  }

  const updateQuantity = (productId, size, quantity) => {
    if (quantity <= 0) return removeItem(productId, size)
    setItems(prev => prev.map(i => {
      if (i.productId === productId && i.size === size) {
        const finalQty = i.maxStock !== undefined ? Math.min(quantity, i.maxStock) : quantity
        return { ...i, quantity: finalQty }
      }
      return i
    }))
  }

  const clearCart = () => setItems([])

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0)
  const subtotalBeforeDiscounts = items.reduce((sum, i) => sum + i.price * i.quantity, 0)
  const shippingCost = 0
  const subtotal = subtotalBeforeDiscounts - bundleDiscountTotal
  const total = subtotal

  return (
    <CartContext.Provider value={{
      items, addItem, removeItem, updateQuantity, clearCart,
      totalItems, subtotal, subtotalBeforeDiscounts, bundleDiscountTotal, shippingCost, total,
      isOpen, setIsOpen,
    }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => useContext(CartContext)
