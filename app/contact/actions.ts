'use server'

import { createClient } from '@/lib/supabase/server'

export async function submitContactMessage(input: { name: string; email: string; orderNumber?: string; message: string }) {
  if (!input.name.trim() || !input.email.trim() || !input.message.trim()) {
    throw new Error('Please fill in your name, email and message.')
  }
  const supabase = await createClient()
  const { error } = await supabase.from('contact_messages').insert({
    name: input.name,
    email: input.email,
    order_number: input.orderNumber || null,
    message: input.message,
  })
  if (error) throw new Error(error.message)
}
