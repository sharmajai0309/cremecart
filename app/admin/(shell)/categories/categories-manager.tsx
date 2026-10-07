'use client'

import { useState, useTransition } from 'react'
import { Edit2, Plus, Trash2, X } from 'lucide-react'
import { createCategory, deleteCategory, renameCategory } from '../../actions'

type Category = { id: string; name: string; slug: string; sort_order: number }

export function CategoriesManager({ categories }: { categories: Category[] }) {
  const [adding, setAdding] = useState(false)
  const [newName, setNewName] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function startEdit(cat: Category) {
    setEditingId(cat.id)
    setEditName(cat.name)
  }

  function saveEdit() {
    if (!editingId) return
    startTransition(async () => {
      try {
        await renameCategory(editingId, editName)
        setEditingId(null)
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to rename')
      }
    })
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
          <p className="text-sm text-gray-500">Manage the categories products can be assigned to.</p>
        </div>
        <button onClick={() => setAdding(true)} className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700">
          <Plus className="h-4 w-4" /> Add Category
        </button>
      </div>

      {error && <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

      {adding && (
        <div className="mb-6 flex items-end gap-3 rounded-xl border border-gray-200 bg-white p-4">
          <div className="flex-1">
            <label className="mb-1 block text-xs font-medium text-gray-700">Category Name</label>
            <input value={newName} onChange={e => setNewName(e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
          </div>
          <button
            disabled={isPending || !newName.trim()}
            onClick={() => startTransition(async () => { await createCategory(newName); setNewName(''); setAdding(false) })}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            Add
          </button>
          <button onClick={() => setAdding(false)} className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Cancel</button>
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm text-gray-600">
          <thead className="bg-gray-50 text-gray-900 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 font-semibold">Name</th>
              <th className="px-6 py-4 font-semibold">Slug</th>
              <th className="px-6 py-4 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {categories.length === 0 && (
              <tr><td colSpan={3} className="px-6 py-12 text-center text-gray-400">No categories yet.</td></tr>
            )}
            {categories.map(cat => (
              <tr key={cat.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 font-medium text-gray-900">
                  {editingId === cat.id ? (
                    <div className="flex items-center gap-2">
                      <input value={editName} onChange={e => setEditName(e.target.value)} className="rounded border border-gray-300 px-2 py-1 text-sm" autoFocus />
                      <button onClick={saveEdit} disabled={isPending} className="text-xs font-semibold text-indigo-600">Save</button>
                      <button onClick={() => setEditingId(null)} className="text-gray-400"><X className="h-3.5 w-3.5" /></button>
                    </div>
                  ) : cat.name}
                </td>
                <td className="px-6 py-4 text-gray-500">{cat.slug}</td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button onClick={() => startEdit(cat)} className="rounded p-1 text-indigo-600 hover:bg-indigo-50"><Edit2 className="h-4 w-4" /></button>
                    <button
                      disabled={isPending}
                      onClick={() => startTransition(() => deleteCategory(cat.id))}
                      className="rounded p-1 text-red-600 hover:bg-red-50 disabled:opacity-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
