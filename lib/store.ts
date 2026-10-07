import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type CartItem = {
  id: string
  productId: string
  name: string
  price: number
  quantity: number
  weight: string
  isEggless: boolean
  flavor?: string
  message?: string
  image: string
  deliveryDate?: string
  deliverySlot?: string
  deliveryType?: string
  hamperBoxId?: string
  hamperTreatIds?: string[]
}

type StoreState = {
  location: string
  pincode: string
  setLocation: (location: string) => void
  setPincode: (pincode: string) => void
  
  cart: CartItem[]
  addToCart: (item: CartItem) => void
  removeFromCart: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void

  wishlist: string[]
  toggleWishlist: (productId: string) => void
  setWishlist: (ids: string[]) => void

  couponCode: string | null
  couponDiscount: number
  setCoupon: (code: string, discount: number) => void
  clearCoupon: () => void
}

export const useStore = create<StoreState>()(
  persist(
    (set) => ({
      location: 'Delhi NCR',
      pincode: '',
      setLocation: (location) => set({ location }),
      setPincode: (pincode) => set({ pincode }),
      
      cart: [],
      addToCart: (item) => set((state) => {
        const existing = state.cart.find(c => c.id === item.id)
        if (existing) {
          return {
            cart: state.cart.map(c => c.id === item.id ? { ...c, quantity: c.quantity + item.quantity } : c)
          }
        }
        return { cart: [...state.cart, item] }
      }),
      removeFromCart: (id) => set((state) => ({
        cart: state.cart.filter(c => c.id !== id)
      })),
      updateQuantity: (id, quantity) => set((state) => ({
        cart: state.cart.map(c => c.id === id ? { ...c, quantity } : c)
      })),
      clearCart: () => set({ cart: [], couponCode: null, couponDiscount: 0 }),
      
      wishlist: [],
      toggleWishlist: (productId) => set((state) => ({
        wishlist: state.wishlist.includes(productId)
          ? state.wishlist.filter(id => id !== productId)
          : [...state.wishlist, productId]
      })),
      setWishlist: (ids) => set({ wishlist: ids }),

      couponCode: null,
      couponDiscount: 0,
      setCoupon: (code, discount) => set({ couponCode: code, couponDiscount: discount }),
      clearCoupon: () => set({ couponCode: null, couponDiscount: 0 }),
    }),
    {
      name: 'cremecart-storage',
    }
  )
)
