'use client'

import { useTransition } from 'react'
import { Trash2, Mail, MailOpen } from 'lucide-react'
import { deleteContactMessage, markContactMessageRead } from '../../actions'

type Message = {
  id: string
  name: string
  email: string
  order_number: string | null
  message: string
  is_read: boolean
  created_at: string
}

export function MessagesManager({ messages }: { messages: Message[] }) {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Contact Messages</h1>
        <p className="text-sm text-gray-500">Notes submitted through the storefront contact form.</p>
      </div>

      <div className="space-y-3">
        {messages.length === 0 && (
          <p className="rounded-xl border border-gray-200 bg-white px-6 py-12 text-center text-gray-400">No messages yet.</p>
        )}
        {messages.map(m => <MessageRow key={m.id} message={m} />)}
      </div>
    </div>
  )
}

function MessageRow({ message }: { message: Message }) {
  const [isPending, startTransition] = useTransition()

  return (
    <div className={`rounded-xl border bg-white p-5 shadow-sm ${message.is_read ? 'border-gray-200' : 'border-indigo-300'}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="font-semibold text-gray-900">{message.name} <span className="font-normal text-gray-500">· {message.email}</span></p>
          {message.order_number && <p className="text-xs text-gray-500">Order: {message.order_number}</p>}
          <p className="mt-2 text-sm text-gray-700">{message.message}</p>
          <p className="mt-2 text-xs text-gray-400">{new Date(message.created_at).toLocaleString('en-IN')}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            disabled={isPending}
            onClick={() => startTransition(() => markContactMessageRead(message.id, !message.is_read))}
            className="rounded p-1.5 text-gray-500 hover:bg-gray-100 disabled:opacity-50"
            title={message.is_read ? 'Mark unread' : 'Mark read'}
          >
            {message.is_read ? <MailOpen className="h-4 w-4" /> : <Mail className="h-4 w-4 text-indigo-600" />}
          </button>
          <button
            disabled={isPending}
            onClick={() => startTransition(() => deleteContactMessage(message.id))}
            className="rounded p-1.5 text-red-600 hover:bg-red-50 disabled:opacity-50"
            title="Delete"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
