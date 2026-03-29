import Link from 'next/link'

export default function Home() {
  return (
    <div className="flex min-h-full flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-4 text-center">
        <h1 className="text-3xl font-semibold">Driveway App</h1>
        <p className="text-zinc-500">Rent out your driveway, or find parking near you.</p>
        <div className="flex flex-col gap-3 pt-2">
          <Link
            href="/signup"
            className="rounded-md bg-black py-2 text-sm font-medium text-white hover:bg-zinc-800"
          >
            Get started
          </Link>
          <Link
            href="/login"
            className="rounded-md border border-zinc-300 py-2 text-sm font-medium hover:bg-zinc-50"
          >
            Sign in
          </Link>
        </div>
      </div>
    </div>
  )
}
