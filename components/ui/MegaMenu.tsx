import Link from 'next/link'
import { ChevronDown } from 'lucide-react'

const categories = {
  Cakes: {
    Types: ['Classic Cakes', 'Bento Cakes', 'Designer Cakes', 'Photo Cakes', 'Cheesecakes', 'Pinata Cakes', 'Pull Me Up Cakes'],
    Flavours: ['Chocolate', 'Vanilla', 'Red Velvet', 'Butterscotch', 'Pineapple', 'Rasmalai', 'Biscoff'],
    Featured: [{ name: 'Bestsellers', url: '/shop?sort=popular' }, { name: 'New Arrivals', url: '/shop?sort=new' }, { name: 'Eggless Options', url: '/shop?category=eggless' }]
  },
  Occasions: {
    Events: ['Birthday', 'Anniversary', 'Wedding', 'Baby Shower', 'Congratulations', 'Farewell'],
    For: ['For Her', 'For Him', 'For Kids', 'For Parents', 'For Friend'],
  },
  Gifting: {
    Options: [
      { name: 'Gift Hampers', url: '/hampers' },
      { name: 'Chocolate Hampers', url: '/hampers' },
      { name: 'Dessert Boxes', url: '/desserts' },
      { name: 'Make Your Own Hamper', url: '/make-your-own-hamper' },
    ],
  }
}

export function MegaMenu() {
  return (
    <nav className="hidden flex-1 items-center justify-center gap-6 text-[13px] font-medium text-ink-variant xl:flex">
      <div className="group relative">
        <button className="flex items-center gap-1 py-4 hover:text-accent">
          Cakes <ChevronDown className="h-3.5 w-3.5 transition group-hover:rotate-180" />
        </button>
        <div className="absolute left-1/2 top-[100%] hidden -translate-x-1/2 pt-2 group-hover:block">
          <div className="flex gap-10 rounded-2xl border border-line bg-white p-6 shadow-xl w-[600px]">
            <div>
              <h3 className="mb-4 font-serif text-sm font-semibold text-primary">Types</h3>
              <ul className="grid gap-2.5">
                {categories.Cakes.Types.map(item => (
                  <li key={item}><Link href={`/shop?category=${item.toLowerCase().replace(/ /g, '-')}`} className="text-sm text-ink-soft hover:text-accent">{item}</Link></li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="mb-4 font-serif text-sm font-semibold text-primary">Flavours</h3>
              <ul className="grid gap-2.5">
                {categories.Cakes.Flavours.map(item => (
                  <li key={item}><Link href={`/shop?flavor=${item.toLowerCase()}`} className="text-sm text-ink-soft hover:text-accent">{item}</Link></li>
                ))}
              </ul>
            </div>
            <div className="rounded-xl bg-surface p-4 flex-1">
               <h3 className="mb-3 font-serif text-sm font-semibold text-primary">Featured</h3>
               <ul className="grid gap-2">
                {categories.Cakes.Featured.map(item => (
                  <li key={item.name}><Link href={item.url} className="text-sm text-accent font-medium hover:underline">{item.name}</Link></li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="group relative">
        <button className="flex items-center gap-1 py-4 hover:text-accent">
          Occasions <ChevronDown className="h-3.5 w-3.5 transition group-hover:rotate-180" />
        </button>
        <div className="absolute left-1/2 top-[100%] hidden -translate-x-1/2 pt-2 group-hover:block">
          <div className="flex gap-10 rounded-2xl border border-line bg-white p-6 shadow-xl w-[400px]">
             <div>
              <h3 className="mb-4 font-serif text-sm font-semibold text-primary">Events</h3>
              <ul className="grid gap-2.5">
                {categories.Occasions.Events.map(item => (
                  <li key={item}><Link href={`/shop?occasion=${item.toLowerCase().replace(/ /g, '-')}`} className="text-sm text-ink-soft hover:text-accent">{item}</Link></li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="mb-4 font-serif text-sm font-semibold text-primary">For</h3>
              <ul className="grid gap-2.5">
                {categories.Occasions.For.map(item => (
                  <li key={item}><Link href={`/shop?for=${item.toLowerCase().replace(/ /g, '-')}`} className="text-sm text-ink-soft hover:text-accent">{item}</Link></li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      <Link href="/photo-cakes" className="py-4 hover:text-accent">Photo Cakes</Link>
      <Link href="/desserts" className="py-4 hover:text-accent">Desserts</Link>
      
      <div className="group relative">
        <button className="flex items-center gap-1 py-4 hover:text-accent">
          Gifting <ChevronDown className="h-3.5 w-3.5 transition group-hover:rotate-180" />
        </button>
        <div className="absolute left-1/2 top-[100%] hidden -translate-x-1/2 pt-2 group-hover:block">
          <div className="rounded-2xl border border-line bg-white p-6 shadow-xl w-[250px]">
             <ul className="grid gap-3">
                {categories.Gifting.Options.map(item => (
                  <li key={item.name}><Link href={item.url} className="text-sm text-ink-soft hover:text-accent">{item.name}</Link></li>
                ))}
              </ul>
          </div>
        </div>
      </div>

      <Link href="/delivery" className="py-4 text-accent font-bold">60 Min Delivery</Link>
    </nav>
  )
}
