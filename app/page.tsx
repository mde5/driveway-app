import Link from 'next/link'
import SearchForm from './SearchForm'

export default function Home() {
  return (
    <div className="flex min-h-full flex-col items-center justify-center px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-slate-700">Find parking near you</h1>
          <p className="mt-3 text-zinc-500">Rent a private driveway by the hour or day</p>
        </div>
        <SearchForm />
        <p className="text-center text-sm text-zinc-400">
          Have a driveway or parking spot sitting empty?{' '}
          <Link href="/signup" className="text-indigo-600 underline underline-offset-2">
            List your space
          </Link>
        </p>
      </div>
    </div>
  )
}
