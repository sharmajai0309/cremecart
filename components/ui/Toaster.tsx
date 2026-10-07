'use client'

import { CheckCircle2, X } from 'lucide-react'
import { useToastStore } from '@/lib/toast-store'

export function Toaster() {
  const { toasts, dismissToast } = useToastStore()

  if (toasts.length === 0) return null

  return (
    <div className="fixed right-4 top-4 z-[100] flex flex-col gap-2 sm:right-5 sm:top-5">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          role="status"
          className="animate-in fade-in slide-in-from-top-2 duration-200 flex items-center gap-2.5 rounded-xl bg-primary py-3 pl-4 pr-3 text-sm font-medium text-white shadow-xl"
        >
          <CheckCircle2 className="h-4 w-4 shrink-0 text-[#d2e8d8]" />
          <span>{toast.message}</span>
          <button onClick={() => dismissToast(toast.id)} aria-label="Dismiss" className="ml-1 rounded-full p-0.5 text-white/60 transition-colors hover:text-white">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ))}
    </div>
  )
}
