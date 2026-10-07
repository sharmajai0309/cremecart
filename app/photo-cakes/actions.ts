'use server'

import { createAdminClient } from '@/lib/supabase/server'

// Photo-cake images are uploaded with the secret-key client (same pattern as
// product/review images) and stored under a `photo-cakes/` prefix in the public
// `product-images` bucket. Only the resulting public URL is put in the cart and
// saved on the order — no more base64 blobs in localStorage.
export async function uploadPhotoCakeImage(formData: FormData) {
  const supabase = createAdminClient()
  const file = formData.get('file') as File
  if (!file) throw new Error('No file provided')
  if (!file.type.startsWith('image/')) throw new Error('Please upload an image file.')
  if (file.size > 5 * 1024 * 1024) throw new Error('Image must be 5MB or smaller.')

  const ext = (file.name.split('.').pop() || 'png').toLowerCase()
  const path = `photo-cakes/${crypto.randomUUID()}.${ext}`

  const { error } = await supabase.storage.from('product-images').upload(path, file, {
    contentType: file.type,
    upsert: false,
  })
  if (error) throw new Error(error.message)

  const { data } = supabase.storage.from('product-images').getPublicUrl(path)
  return data.publicUrl
}
