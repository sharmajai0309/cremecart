import Link from 'next/link'
import { ArrowLeft, Check, Clock3, Moon, Truck, Zap, type LucideIcon } from 'lucide-react'
import { DeliveryEstimator } from '@/components/ui/DeliveryEstimator'

const options: [LucideIcon, string, string, string][] = [
  [Zap, '60-minute delivery', 'Selected cakes in eligible areas', 'From ₹99'],
  [Truck, 'Same-day delivery', 'Order before 8 PM for delivery today', 'From ₹49'],
  [Clock3, 'Fixed time slot', 'Choose a convenient one-hour window', 'From ₹69'],
  [Moon, 'Midnight delivery', 'A sweet surprise between 11 PM–12 AM', 'From ₹149'],
]

export default function DeliveryPage() {
  return (
    <main className="min-h-screen bg-surface text-ink">
      <header className="border-b border-line bg-white px-5 py-5">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <Link href="/" className="font-serif text-2xl font-semibold text-primary">Crème<span className="text-accent">Cart</span></Link>
          <Link href="/shop" className="text-sm font-semibold text-ink">Shop cakes</Link>
        </div>
      </header>
      <section className="mx-auto max-w-6xl px-5 py-12">
        <Link href="/" className="flex items-center gap-2 text-sm text-ink-soft"><ArrowLeft className="h-4 w-4" /> Back home</Link>
        <p className="mt-10 text-[11px] font-bold uppercase tracking-[.2em] text-accent">Delivery, your way</p>
        <h1 className="mt-2 font-serif text-5xl">Freshness on your time.</h1>
        <p className="mt-4 max-w-xl leading-7 text-ink-soft">Tell us where and when, and we'll show you cakes that can reach you at their absolute best.</p>
        <div className="mt-8 max-w-xl">
          <DeliveryEstimator />
        </div>
        <div className="mt-12 grid gap-4 sm:grid-cols-2">
          {options.map(([Icon, title, text, price]) => (
            <article key={title} className="rounded-2xl border border-line bg-white p-6">
              <Icon className="h-6 w-6 text-accent" />
              <h2 className="mt-8 font-serif text-2xl">{title}</h2>
              <p className="mt-2 text-sm leading-6 text-ink-soft">{text}</p>
              <div className="mt-6 flex items-center justify-between border-t border-line pt-4 text-sm">
                <span className="font-semibold">{price}</span>
                <span className="flex items-center gap-1 text-primary"><Check className="h-4 w-4" /> Area dependent</span>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  )
}
