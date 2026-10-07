'use client'

import Link from 'next/link'

// Server-friendly pagination: it only renders Links and takes plain props, so
// both Server Components (orders) and Client Components (products) can use it.
// Preserves the current query string (search/filter) across pages.
export function Pagination({
  basePath,
  searchParams,
  page,
  pageSize,
  total,
}: {
  basePath: string
  searchParams: Record<string, string | undefined>
  page: number
  pageSize: number
  total: number
}) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize))

  const href = (p: number) => {
    const sp = new URLSearchParams()
    for (const [k, v] of Object.entries(searchParams)) {
      if (v && k !== 'page') sp.set(k, v)
    }
    if (p > 1) sp.set('page', String(p))
    const qs = sp.toString()
    return qs ? `${basePath}?${qs}` : basePath
  }

  const start = total === 0 ? 0 : (page - 1) * pageSize + 1
  const end = Math.min(page * pageSize, total)

  const win = 2
  const pages: number[] = []
  for (let p = Math.max(1, page - win); p <= Math.min(totalPages, page + win); p++) pages.push(p)

  return (
    <div className="flex flex-col items-center justify-between gap-3 border-t border-gray-200 px-6 py-4 sm:flex-row">
      <p className="text-xs text-gray-500">
        {total === 0 ? 'No results' : `Showing ${start}–${end} of ${total}`}
      </p>
      <div className="flex items-center gap-1">
        <PageLink href={href(page - 1)} disabled={page <= 1}>Prev</PageLink>
        {pages[0] > 1 && (
          <>
            <PageLink href={href(1)}>1</PageLink>
            {pages[0] > 2 && <span className="px-1 text-gray-400">…</span>}
          </>
        )}
        {pages.map(p => (
          <Link
            key={p}
            href={href(p)}
            className={`rounded-md px-3 py-1.5 text-xs font-medium ${p === page ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
          >
            {p}
          </Link>
        ))}
        {pages[pages.length - 1] < totalPages && (
          <>
            {pages[pages.length - 1] < totalPages - 1 && <span className="px-1 text-gray-400">…</span>}
            <PageLink href={href(totalPages)}>{totalPages}</PageLink>
          </>
        )}
        <PageLink href={href(page + 1)} disabled={page >= totalPages}>Next</PageLink>
      </div>
    </div>
  )
}

function PageLink({ href, disabled, children }: { href: string; disabled?: boolean; children: React.ReactNode }) {
  if (disabled) {
    return <span className="cursor-not-allowed rounded-md px-3 py-1.5 text-xs font-medium text-gray-300">{children}</span>
  }
  return <Link href={href} className="rounded-md px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100">{children}</Link>
}
