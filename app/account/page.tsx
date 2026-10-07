'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import type { User } from '@supabase/supabase-js'
import { Edit2, Heart, LogOut, MapPin, Package, Plus, Settings, Trash2, X } from 'lucide-react'
import { StorefrontShell } from '@/components/storefront-shell'
import { createClient } from '@/lib/supabase/client'
import { useStore } from '@/lib/store'
import { getProducts } from '@/lib/queries'
import type { Product } from '@/lib/data'
import { ProductCard } from '@/components/ui/ProductCard'
import { ProductGridSkeleton } from '@/components/ui/ProductGridSkeleton'

type OrderRow = {
  id: string
  order_number: string
  status: string
  total_amount: number
  created_at: string
  order_items: { product_name: string; image: string | null; quantity: number }[]
}

type Address = {
  id: string
  label: string
  full_name: string
  phone: string
  line1: string
  line2: string
  city: string
  pincode: string
  is_default: boolean
}

export default function AccountPage() {
  const supabase = createClient()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('orders')

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user)
      setLoading(false)
    })
  }, [supabase])

  if (loading) {
    return (
      <StorefrontShell>
        <div className="mx-auto max-w-6xl px-5 py-20 text-center text-ink-soft">Loading…</div>
      </StorefrontShell>
    )
  }

  if (!user) {
    return (
      <StorefrontShell>
        <div className="mx-auto max-w-md px-5 py-20 text-center">
          <h1 className="font-serif text-3xl text-ink">Sign in to your account</h1>
          <p className="mt-2 text-ink-soft">Track orders, save addresses and manage your wishlist.</p>
          <Link href="/login" className="mt-6 inline-block rounded-xl bg-primary px-6 py-3 font-medium text-white">Sign in</Link>
        </div>
      </StorefrontShell>
    )
  }

  const fullName = (user.user_metadata?.full_name as string) || user.email || 'Account'
  const phone = (user.user_metadata?.phone as string) || ''

  return (
    <StorefrontShell>
      <div className="mx-auto max-w-6xl px-5 py-10 sm:px-8 lg:px-16">
        <h1 className="font-serif text-4xl tracking-tight text-ink">My Account</h1>

        <div className="mt-8 flex flex-col gap-8 lg:flex-row lg:items-start">
          <aside className="w-full shrink-0 rounded-2xl border border-line bg-white lg:w-64">
            <div className="border-b border-line p-6 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-surface-container text-2xl font-bold text-accent">
                {fullName.charAt(0).toUpperCase()}
              </div>
              <h2 className="mt-3 font-semibold text-ink">{fullName}</h2>
              <p className="text-sm text-ink-soft">{phone || user.email}</p>
            </div>
            <nav className="p-4 flex flex-col space-y-1">
              {[
                { id: 'orders', label: 'My Orders', icon: Package },
                { id: 'addresses', label: 'Saved Addresses', icon: MapPin },
                { id: 'wishlist', label: 'Wishlist', icon: Heart },
                { id: 'settings', label: 'Settings', icon: Settings },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${activeTab === tab.id ? 'bg-surface-high text-primary' : 'text-ink-soft hover:bg-gray-50'}`}
                >
                  <tab.icon className="h-4 w-4" /> {tab.label}
                </button>
              ))}
              <button
                onClick={() => supabase.auth.signOut().then(() => window.location.assign('/'))}
                className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-red-500 hover:bg-red-50 transition mt-4"
              >
                <LogOut className="h-4 w-4" /> Logout
              </button>
            </nav>
          </aside>

          <div className="flex-1 rounded-2xl border border-line bg-white p-6 md:p-8">
            {activeTab === 'orders' && <OrdersTab userId={user.id} />}
            {activeTab === 'addresses' && <AddressesTab userId={user.id} defaultName={fullName} defaultPhone={phone} />}
            {activeTab === 'wishlist' && <WishlistTab />}
            {activeTab === 'settings' && <SettingsTab user={user} />}
          </div>
        </div>
      </div>
    </StorefrontShell>
  )
}

function OrdersTab({ userId }: { userId: string }) {
  const supabase = createClient()
  const [orders, setOrders] = useState<OrderRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase
      .from('orders')
      .select('id, order_number, status, total_amount, created_at, order_items(product_name, image, quantity)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setOrders((data as OrderRow[]) ?? [])
        setLoading(false)
      })
  }, [supabase, userId])

  return (
    <div>
      <h2 className="text-xl font-bold text-ink">Order History</h2>
      {loading ? (
        <div className="mt-6 animate-pulse space-y-4">
          {[1, 2].map(i => <div key={i} className="h-24 rounded-xl bg-surface-container" />)}
        </div>
      ) : orders.length === 0 ? (
        <p className="mt-6 text-sm text-ink-soft">No orders yet. Your placed orders will show up here.</p>
      ) : (
        <div className="mt-6 space-y-4">
          {orders.map(order => (
            <div key={order.id} className="flex flex-col gap-4 rounded-xl border border-line-strong p-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex gap-4">
                <img src={order.order_items[0]?.image ?? undefined} alt={order.order_items[0]?.product_name} className="h-20 w-20 rounded-lg object-cover bg-surface-container" />
                <div>
                  <p className="font-semibold text-ink">{order.order_items[0]?.product_name}{order.order_items.length > 1 && ` +${order.order_items.length - 1} more`}</p>
                  <p className="text-sm text-ink-soft capitalize">Order #{order.order_number} · {order.status.replace(/_/g, ' ')}</p>
                  <p className="mt-1 text-sm font-medium text-ink">₹{Number(order.total_amount).toLocaleString('en-IN')}</p>
                </div>
              </div>
              <Link href={`/track-order?order=${order.order_number}`} className="rounded-lg border border-line-strong px-4 py-2 text-center text-sm font-semibold text-ink hover:bg-gray-50">
                Track Order
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function AddressesTab({ userId, defaultName, defaultPhone }: { userId: string; defaultName: string; defaultPhone: string }) {
  const supabase = createClient()
  const [addresses, setAddresses] = useState<Address[]>([])
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(false)

  function refresh() {
    supabase.from('addresses').select('*').order('is_default', { ascending: false }).then(({ data }) => {
      setAddresses((data as Address[]) ?? [])
      setLoading(false)
    })
  }

  useEffect(refresh, [supabase])

  async function handleDelete(id: string) {
    await supabase.from('addresses').delete().eq('id', id)
    refresh()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-ink">Saved Addresses</h2>
        <button onClick={() => setAdding(true)} className="flex items-center gap-1.5 text-sm font-semibold text-accent">
          <Plus className="h-4 w-4" /> Add New
        </button>
      </div>

      {loading ? (
        <div className="grid animate-pulse gap-4 sm:grid-cols-2">
          {[1, 2].map(i => <div key={i} className="h-28 rounded-xl bg-surface-container" />)}
        </div>
      ) : addresses.length === 0 && !adding ? (
        <p className="text-sm text-ink-soft">No saved addresses yet.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {addresses.map(addr => (
            <div key={addr.id} className={`rounded-xl border p-5 ${addr.is_default ? 'border-primary bg-surface-high' : 'border-line-strong bg-white'}`}>
              <div className="flex justify-between items-start">
                <span className="rounded bg-primary px-2 py-1 text-[10px] font-bold text-white uppercase tracking-wider">{addr.label}</span>
                <button onClick={() => handleDelete(addr.id)} className="text-gray-400 hover:text-red-500"><Trash2 className="h-4 w-4" /></button>
              </div>
              <p className="mt-3 font-semibold text-ink">{addr.full_name}</p>
              <p className="mt-1 text-sm text-ink-soft leading-relaxed">{addr.line1}, {addr.line2}<br />{addr.city}, {addr.pincode}<br />+91 {addr.phone}</p>
            </div>
          ))}
        </div>
      )}

      {adding && (
        <NewAddressForm
          userId={userId}
          defaultName={defaultName}
          defaultPhone={defaultPhone}
          onDone={() => { setAdding(false); refresh() }}
        />
      )}
    </div>
  )
}

function NewAddressForm({ userId, defaultName, defaultPhone, onDone }: { userId: string; defaultName: string; defaultPhone: string; onDone: () => void }) {
  const supabase = createClient()
  const [form, setForm] = useState({ label: 'Home', full_name: defaultName, phone: defaultPhone, line1: '', line2: '', city: '', pincode: '' })
  const [saving, setSaving] = useState(false)

  async function handleSave() {
    setSaving(true)
    await supabase.from('addresses').insert({ ...form, user_id: userId })
    setSaving(false)
    onDone()
  }

  return (
    <div className="mt-6 rounded-xl border border-line bg-surface p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-ink">New Address</h3>
        <button onClick={onDone} className="text-gray-400 hover:text-black"><X className="h-4 w-4" /></button>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <input placeholder="Label (Home/Work)" value={form.label} onChange={e => setForm({ ...form, label: e.target.value })} className="rounded-lg border border-line-strong px-3 py-2 text-sm" />
        <input placeholder="Full Name" value={form.full_name} onChange={e => setForm({ ...form, full_name: e.target.value })} className="rounded-lg border border-line-strong px-3 py-2 text-sm" />
        <input placeholder="Phone" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="rounded-lg border border-line-strong px-3 py-2 text-sm" />
        <input placeholder="Pincode" value={form.pincode} onChange={e => setForm({ ...form, pincode: e.target.value })} className="rounded-lg border border-line-strong px-3 py-2 text-sm" />
        <input placeholder="House/Flat, Building" value={form.line1} onChange={e => setForm({ ...form, line1: e.target.value })} className="rounded-lg border border-line-strong px-3 py-2 text-sm sm:col-span-2" />
        <input placeholder="Street, Area" value={form.line2} onChange={e => setForm({ ...form, line2: e.target.value })} className="rounded-lg border border-line-strong px-3 py-2 text-sm sm:col-span-2" />
        <input placeholder="City" value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} className="rounded-lg border border-line-strong px-3 py-2 text-sm sm:col-span-2" />
      </div>
      <button
        onClick={handleSave}
        disabled={saving || !form.full_name || !form.line1 || !form.city || !form.pincode}
        className="mt-4 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
      >
        {saving ? 'Saving…' : 'Save Address'}
      </button>
    </div>
  )
}

function WishlistTab() {
  const { wishlist } = useStore()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getProducts().then(setProducts).catch(console.error).finally(() => setLoading(false))
  }, [])

  const saved = products.filter(p => wishlist.includes(p.id))

  return (
    <div>
      <h2 className="text-xl font-bold text-ink">Wishlist</h2>
      {loading ? (
        <div className="mt-6"><ProductGridSkeleton count={3} /></div>
      ) : saved.length === 0 ? (
        <p className="mt-6 text-sm text-ink-soft">No saved cakes yet. <Link href="/shop" className="font-semibold text-accent">Browse cakes</Link></p>
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3">
          {saved.map(p => <ProductCard key={p.id} product={p} />)}
        </div>
      )}
    </div>
  )
}

function SettingsTab({ user }: { user: User }) {
  const supabase = createClient()
  const [fullName, setFullName] = useState((user.user_metadata?.full_name as string) || '')
  const [phone, setPhone] = useState((user.user_metadata?.phone as string) || '')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  async function handleSave() {
    setSaving(true)
    setSaved(false)
    await supabase.auth.updateUser({ data: { full_name: fullName, phone } })
    setSaving(false)
    setSaved(true)
  }

  return (
    <div>
      <h2 className="text-xl font-bold text-ink">Profile Settings</h2>
      <div className="mt-6 max-w-sm space-y-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink">Full Name</label>
          <input value={fullName} onChange={e => setFullName(e.target.value)} className="w-full rounded-xl border border-line-strong px-4 py-2.5 text-sm outline-none focus:border-accent" />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink">Mobile Number</label>
          <input value={phone} onChange={e => setPhone(e.target.value)} maxLength={10} className="w-full rounded-xl border border-line-strong px-4 py-2.5 text-sm outline-none focus:border-accent" />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink">Email</label>
          <input value={user.email} disabled className="w-full rounded-xl border border-line-strong bg-gray-50 px-4 py-2.5 text-sm text-gray-400" />
        </div>
        {saved && <p className="text-sm text-green-600">Saved.</p>}
        <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50">
          <Edit2 className="h-4 w-4" /> {saving ? 'Saving…' : 'Save Changes'}
        </button>
      </div>
    </div>
  )
}
