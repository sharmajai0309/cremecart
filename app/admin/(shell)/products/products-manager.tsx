'use client'

import { useState, useTransition } from 'react'
import { Plus, Search, Edit, Trash2, RotateCcw, Download } from 'lucide-react'
import { activateProduct, deactivateProduct } from '../../actions'
import { ProductForm } from './product-form'
import { Pagination } from '@/components/admin/pagination'

type Variant = { id: string; weight: string; price_multiplier: number; serves: string; sort_order: number }

type Product = {
  id: string
  name: string
  sku: string
  category: string
  subcategories: string[] | null
  base_price: number
  sale_price: number | null
  stock: number
  is_active: boolean
  images: string[]
  default_weight: string
  eggless_available: boolean
  description: string
  flavors: string[]
  ingredients: string[]
  allergens: string[]
  shelf_life: string
  eggless_price_premium: number
  bestseller: boolean
  delivery_eligibility: string[]
  slug: string
  product_variants: Variant[]
}

export function ProductsManager({
  products,
  categories,
  query,
  category,
  page,
  pageSize,
  total,
}: {
  products: Product[]
  categories: string[]
  query: string
  category: string
  page: number
  pageSize: number
  total: number
}) {
  const [editing, setEditing] = useState<Product | 'new' | null>(null)
  const [isPending, startTransition] = useTransition()

  return (
    <div>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Products CMS</h1>
          <p className="text-sm text-gray-500">Manage catalog, pricing, variations, and availability.</p>
        </div>
        <div className="flex gap-3">
          <a href="/admin/export/products" className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
            <Download className="h-4 w-4" /> Export CSV
          </a>
          <button
            onClick={() => setEditing('new')}
            className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
          >
            <Plus className="h-4 w-4" /> Add Product
          </button>
        </div>
      </div>

      <form method="get" action="/admin/products" className="mb-6 flex flex-wrap items-center gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            name="q"
            defaultValue={query}
            type="text"
            placeholder="Search SKU or Name..."
            className="rounded-lg border border-gray-300 py-2 pl-10 pr-4 text-sm"
          />
        </div>
        <select name="category" defaultValue={category} className="rounded-lg border border-gray-300 px-3 py-2 text-sm">
          <option value="all">All categories</option>
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <button type="submit" className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">Search</button>
        {(query || category !== 'all') && <a href="/admin/products" className="text-sm text-gray-500 hover:text-gray-700">Clear</a>}
      </form>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm text-gray-600">
          <thead className="bg-gray-50 text-gray-900 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 font-semibold">Product</th>
              <th className="px-6 py-4 font-semibold">SKU / Category</th>
              <th className="px-6 py-4 font-semibold">Base Price</th>
              <th className="px-6 py-4 font-semibold">Status</th>
              <th className="px-6 py-4 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {products.length === 0 && (
              <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-400">No products found.</td></tr>
            )}
            {products.map(product => (
              <tr key={product.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-4">
                    <img src={product.images[0]} alt={product.name} className="h-12 w-12 rounded-lg object-cover border border-gray-200" />
                    <div>
                      <p className="font-medium text-gray-900">{product.name}</p>
                      <p className="text-xs text-gray-500">
                        {product.default_weight}{product.eggless_available && ' • Eggless Opt'}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <p className="font-medium text-gray-900">{product.sku}</p>
                  <span className="mt-1 inline-block rounded bg-gray-100 px-1.5 py-0.5 text-[10px] font-medium text-gray-600">{product.category}</span>
                </td>
                <td className="px-6 py-4 font-medium text-gray-900">
                  ₹{product.sale_price || product.base_price}
                  {product.sale_price && <span className="ml-2 text-xs text-gray-400 line-through">₹{product.base_price}</span>}
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${product.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                    {product.is_active ? 'Active' : 'Deactivated'}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button onClick={() => setEditing(product)} className="rounded p-1 text-indigo-600 hover:bg-indigo-50"><Edit className="h-4 w-4" /></button>
                    {product.is_active ? (
                      <button
                        disabled={isPending}
                        onClick={() => startTransition(() => deactivateProduct(product.id))}
                        className="rounded p-1 text-red-600 hover:bg-red-50 disabled:opacity-50"
                        title="Deactivate"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    ) : (
                      <button
                        disabled={isPending}
                        onClick={() => startTransition(() => activateProduct(product.id))}
                        className="rounded p-1 text-green-600 hover:bg-green-50 disabled:opacity-50"
                        title="Reactivate"
                      >
                        <RotateCcw className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <Pagination
          basePath="/admin/products"
          searchParams={{ q: query || undefined, category: category !== 'all' ? category : undefined }}
          page={page}
          pageSize={pageSize}
          total={total}
        />
      </div>

      {editing && (
        <ProductForm
          categories={categories}
          product={editing === 'new' ? undefined : {
            id: editing.id,
            name: editing.name,
            slug: editing.slug,
            sku: editing.sku,
            description: editing.description,
            category: editing.category,
            base_price: Number(editing.base_price),
            sale_price: editing.sale_price ? Number(editing.sale_price) : null,
            default_weight: editing.default_weight,
            flavors: editing.flavors,
            ingredients: editing.ingredients,
            allergens: editing.allergens,
            shelf_life: editing.shelf_life,
            eggless_available: editing.eggless_available,
            eggless_price_premium: Number(editing.eggless_price_premium),
            stock: editing.stock,
            images: editing.images,
            bestseller: editing.bestseller,
            is_active: editing.is_active,
            delivery_eligibility: editing.delivery_eligibility,
            variants: editing.product_variants,
          }}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  )
}
