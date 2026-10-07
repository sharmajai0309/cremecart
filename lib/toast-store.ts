import { create } from 'zustand'

export type Toast = { id: number; message: string }

type ToastState = {
  toasts: Toast[]
  showToast: (message: string) => void
  dismissToast: (id: number) => void
}

let nextId = 0

// Deliberately separate from the persisted cart/wishlist store — toast
// state is ephemeral UI feedback and has no business in localStorage.
export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  showToast: (message) => {
    const id = nextId++
    set((state) => ({ toasts: [...state.toasts, { id, message }] }))
    setTimeout(() => {
      set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }))
    }, 3000)
  },
  dismissToast: (id) => set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
}))
