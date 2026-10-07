'use client'

import { useRef, useState } from 'react'
import { Loader2, Plus, X } from 'lucide-react'
import { uploadProductImage } from '../../actions'

export function ImageUploader({ images, onChange }: { images: string[]; onChange: (images: string[]) => void }) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return
    setError(null)
    setUploading(true)
    try {
      const uploaded: string[] = []
      for (const file of Array.from(files)) {
        const formData = new FormData()
        formData.append('file', file)
        const url = await uploadProductImage(formData)
        uploaded.push(url)
      }
      onChange([...images, ...uploaded])
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Upload failed')
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  function removeImage(url: string) {
    onChange(images.filter(i => i !== url))
  }

  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-gray-700">Images</label>
      <div className="flex flex-wrap gap-3">
        {images.map(url => (
          <div key={url} className="group relative h-20 w-20 overflow-hidden rounded-lg border border-gray-200">
            <img src={url} alt="" className="h-full w-full object-cover" />
            <button
              type="button"
              onClick={() => removeImage(url)}
              className="absolute right-1 top-1 rounded-full bg-black/60 p-0.5 text-white opacity-0 transition-opacity group-hover:opacity-100"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="flex h-20 w-20 flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-gray-300 text-gray-400 hover:border-indigo-400 hover:text-indigo-500 disabled:opacity-50"
        >
          {uploading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Plus className="h-5 w-5" />}
          <span className="text-[10px]">{uploading ? 'Uploading' : 'Add'}</span>
        </button>
      </div>
      <input ref={inputRef} type="file" accept="image/*" multiple className="hidden" onChange={e => handleFiles(e.target.files)} />
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  )
}
