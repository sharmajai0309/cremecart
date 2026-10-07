import Link from 'next/link'
import { StorefrontShell } from '@/components/storefront-shell'
import { ShieldCheck } from 'lucide-react'

export const metadata = {
  title: 'Privacy Policy — CrèmeCart',
  description: 'How CrèmeCart collects, uses, and protects your personal information.',
}

export default function PrivacyPolicyPage() {
  return (
    <StorefrontShell title="Privacy Policy" subtitle="Your trust and privacy are sacred to our craft.">
      <div className="mx-auto max-w-4xl px-5 py-12 text-ink">
        <div className="rounded-2xl border border-line bg-white p-8 md:p-12 shadow-sm space-y-8">
          <div className="flex items-center gap-3 text-accent pb-4 border-b border-line">
            <ShieldCheck className="h-6 w-6" />
            <span className="text-sm font-semibold tracking-wide uppercase">Commitment to Data Privacy</span>
          </div>

          <section className="space-y-3">
            <h2 className="font-serif text-2xl font-semibold text-primary">1. Information We Collect</h2>
            <p className="text-sm leading-relaxed text-ink-soft">
              When you create an account, place an order, or subscribe to our newsletter at CrèmeCart, we collect necessary personal details including your name, contact phone number, delivery address, email, and recipient details for gifting orders.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-serif text-2xl font-semibold text-primary">2. How We Use Your Data</h2>
            <p className="text-sm leading-relaxed text-ink-soft">
              Your information is exclusively used to fulfill your cake and confectionary orders, dispatch dispatch-accurate delivery slots, coordinate live tracking via SMS/WhatsApp, process secure payments, and provide concierge customer support.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-serif text-2xl font-semibold text-primary">3. Payment Security</h2>
            <p className="text-sm leading-relaxed text-ink-soft">
              We never store complete credit/debit card numbers or CVV on our servers. All digital transactions are securely processed through RBI-authorized payment gateways (such as Razorpay) complying with PCI-DSS Tier 1 security standards.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-serif text-2xl font-semibold text-primary">4. Cookies &amp; Local Storage</h2>
            <p className="text-sm leading-relaxed text-ink-soft">
              We use essential cookies and browser storage solely to maintain your active shopping cart, remember your selected delivery city/pincode, and keep you securely logged into your account.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-serif text-2xl font-semibold text-primary">5. Contact Our Concierge</h2>
            <p className="text-sm leading-relaxed text-ink-soft">
              If you have any questions regarding your data or wish to request data deletion, please reach out to our concierge at{' '}
              <Link href="/contact" className="font-semibold text-accent underline">
                our contact page
              </Link>{' '}
              or email concierge@cremecart.com.
            </p>
          </section>
        </div>
      </div>
    </StorefrontShell>
  )
}
