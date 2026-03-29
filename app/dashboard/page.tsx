'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'

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
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="text-zinc-500 text-sm">Signed in as <span className="font-medium text-white">{user.email}</span></p>
        <button
          onClick={handleLogout}
          className="rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium hover:bg-zinc-50"
        >
          Sign out
        </button>
      </div>
    </div>
  )
}
