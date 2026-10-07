import Link from 'next/link'
import { StorefrontShell } from '@/components/storefront-shell'
import { FileText } from 'lucide-react'

export const metadata = {
  title: 'Terms of Service — CrèmeCart',
  description: 'Terms and conditions governing orders and services at CrèmeCart Patisserie.',
}

export default function TermsOfServicePage() {
  return (
    <StorefrontShell title="Terms of Service" subtitle="Artisanal standards and policies for every handcrafted order.">
      <div className="mx-auto max-w-4xl px-5 py-12 text-ink">
        <div className="rounded-2xl border border-line bg-white p-8 md:p-12 shadow-sm space-y-8">
          <div className="flex items-center gap-3 text-accent pb-4 border-b border-line">
            <FileText className="h-6 w-6" />
            <span className="text-sm font-semibold tracking-wide uppercase">Patisserie Terms &amp; Conditions</span>
          </div>

          <section className="space-y-3">
            <h2 className="font-serif text-2xl font-semibold text-primary">1. Perishable Nature of Products</h2>
            <p className="text-sm leading-relaxed text-ink-soft">
              All cakes, entremets, cheesecakes, and baked hampers from CrèmeCart are fresh, perishable culinary creations crafted to order without artificial stabilizers. Please store all cakes under refrigeration (2°C–5°C) immediately upon handover.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-serif text-2xl font-semibold text-primary">2. Delivery Windows &amp; Handover</h2>
            <p className="text-sm leading-relaxed text-ink-soft">
              We offer designated delivery slots (including Express 60-min, Same-Day, and Midnight windows). Deliveries are performed via climate-guarded dispatch vehicles. Please ensure someone is available at the provided delivery address to receive the order during your selected slot.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-serif text-2xl font-semibold text-primary">3. Customizations &amp; Messages</h2>
            <p className="text-sm leading-relaxed text-ink-soft">
              Custom cake messages and photo prints are handcrafted exactly according to customer input provided at checkout. High-resolution imagery is recommended for photo cakes to ensure pristine print fidelity.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-serif text-2xl font-semibold text-primary">4. Cancellations &amp; Refunds</h2>
            <p className="text-sm leading-relaxed text-ink-soft">
              Due to the perishable and made-to-order nature of fresh cakes, orders already in the baking or dispatch phase cannot be cancelled. In the rare event of transit damage or quality variance, please notify our concierge within 2 hours of receipt with photos.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-serif text-2xl font-semibold text-primary">5. Governing Law</h2>
            <p className="text-sm leading-relaxed text-ink-soft">
              These terms are governed by the laws of India, under the jurisdiction of the courts of New Delhi. For assistance, reach us anytime via our{' '}
              <Link href="/contact" className="font-semibold text-accent underline">
                concierge contact
              </Link>.
            </p>
          </section>
        </div>
      </div>
    </StorefrontShell>
  )
}
