'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import Link from 'next/link'

export default function DashboardPage() {
  const { user, loading, logout } = useAuth()
  const router = useRouter()

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user) router.replace('/login')
  }, [user, loading, router])

  if (loading || !user) return null

  async function handleLogout() {
    await logout()
    router.push('/login')
  }

  return (
    <div className="flex min-h-full flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-4 text-center">
        <h1 className="text-2xl font-bold tracking-tight text-slate-700">Dashboard</h1>
        <p className="text-sm text-zinc-500">Signed in as <span className="font-medium text-zinc-900">{user.email}</span></p>
        <div className="flex flex-col gap-3 pt-2">
          <Link
            href="/"
            className="rounded-md bg-indigo-600 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition-colors"
          >
            Find parking
          </Link>
          <Link
            href="/bookings"
            className="rounded-md border border-zinc-300 py-2 text-sm font-medium hover:bg-zinc-50 transition-colors"
          >
            My bookings
          </Link>
          <Link
            href="/host/listings"
            className="rounded-md border border-zinc-300 py-2 text-sm font-medium hover:bg-zinc-50 transition-colors"
          >
            Your listings
          </Link>
          <Link
            href="/host/new"
            className="rounded-md border border-zinc-300 py-2 text-sm font-medium hover:bg-zinc-50 transition-colors"
          >
            List your driveway
          </Link>
          <button
            onClick={handleLogout}
            className="rounded-md border border-zinc-300 py-2 text-sm font-medium hover:bg-zinc-50 transition-colors"
          >
            Sign out
          </button>
        </div>
      </div>
    </div>
  )
}
