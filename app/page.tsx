'use client'

import Link from 'next/link'
import SearchForm from './SearchForm'
import { useAuth } from '@/context/AuthContext'

export default function Home() {
  const { user } = useAuth()

  return (
    <div className="flex min-h-full flex-col items-center justify-center px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="mb-6 flex justify-center">
            <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-yellow-400 shadow-lg">
              <span className="text-6xl font-black text-gray-900 leading-none">P</span>
            </div>
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-slate-700">Find parking near you</h1>
          <p className="mt-3 text-zinc-500">Rent a private driveway by the hour or day — no apps, no hassle.</p>
        </div>
        <SearchForm />
        <p className="text-center text-sm text-zinc-400">
          Have a driveway or parking spot sitting empty?{' '}
          <Link href={user ? '/host/new' : '/signup'} className="text-yellow-600 underline underline-offset-2 font-medium">
            List your space
          </Link>
        </p>
      </div>
    </div>
  )
}
