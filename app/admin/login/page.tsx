import { login } from './actions'

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const { error } = await searchParams

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f3f4f6]">
      <form action={login} className="w-full max-w-sm rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
        <h1 className="font-serif text-2xl font-bold text-primary">
          Crème<span className="text-accent">Admin</span>
        </h1>
        <p className="mt-1 text-sm text-gray-500">Sign in to manage the store.</p>

        {error && (
          <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
        )}

        <div className="mt-6 space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              name="email"
              required
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              name="password"
              required
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        <button
          type="submit"
          className="mt-6 w-full rounded-lg bg-indigo-600 py-2.5 text-sm font-medium text-white hover:bg-indigo-700"
        >
          Sign in
        </button>
      </form>
    </div>
  )
}
