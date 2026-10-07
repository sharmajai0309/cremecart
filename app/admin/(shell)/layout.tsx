import Link from 'next/link'
import { LayoutDashboard, ShoppingBag, Package, Bell, MapPin, Tag, LogOut, Users, Boxes, Star, TrendingUp, Home, Mail, Send, Layers, Palette } from 'lucide-react'
import { logout } from '../login/actions'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const nav = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Orders', href: '/admin/orders', icon: ShoppingBag },
    { name: 'Products', href: '/admin/products', icon: Package },
    { name: 'Categories', href: '/admin/categories', icon: Layers },
    { name: 'Inventory', href: '/admin/inventory', icon: Boxes },
    { name: 'Customers', href: '/admin/customers', icon: Users },
    { name: 'Sales', href: '/admin/sales', icon: TrendingUp },
    { name: 'Reviews', href: '/admin/reviews', icon: Star },
    { name: 'Locations', href: '/admin/locations', icon: MapPin },
    { name: 'Coupons', href: '/admin/coupons', icon: Tag },
    { name: 'Homepage', href: '/admin/homepage', icon: Home },
    { name: 'Theme', href: '/admin/theme', icon: Palette },
    { name: 'Messages', href: '/admin/messages', icon: Mail },
    { name: 'Newsletter', href: '/admin/newsletter', icon: Send },
  ]

  return (
    <div className="flex min-h-screen bg-[#f3f4f6]">
      {/* Sidebar */}
      <aside className="w-64 border-r border-gray-200 bg-white">
        <div className="flex h-16 items-center border-b border-gray-200 px-6">
          <Link href="/" className="font-serif text-xl font-bold text-primary">Crème<span className="text-accent">Admin</span></Link>
        </div>
        <nav className="p-4 space-y-1">
          {nav.map(item => (
            <Link key={item.name} href={item.href} className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900">
              <item.icon className="h-4 w-4" />
              {item.name}
            </Link>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <header className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-8">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Store Operations</h2>
          <div className="flex items-center gap-4">
            <button className="text-gray-400 hover:text-gray-600"><Bell className="h-5 w-5" /></button>
            <div className="h-8 w-8 rounded-full bg-gray-200 border-2 border-white shadow-sm overflow-hidden">
               <img src="https://ui-avatars.com/api/?name=Admin&background=2f4237&color=fff" alt="Admin" />
            </div>
            <form action={logout}>
              <button className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-600" title="Sign out">
                <LogOut className="h-4 w-4" />
              </button>
            </form>
          </div>
        </header>
        <main className="flex-1 overflow-auto p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
