'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useAuth } from '@/context/AuthContext'
import Link from 'next/link'

type Booking = {
  id: string
  listingAddress: string
  hours: number
  total: number
  date: string
  createdAt: { seconds: number } | null
}

export default function BookingsPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [fetching, setFetching] = useState(true)

  useEffect(() => {
    if (!loading && !user) router.replace('/login?redirect=/bookings')
  }, [user, loading, router])

  useEffect(() => {
    if (!user) return
    const q = query(
      collection(db, 'bookings'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    )
    getDocs(q).then(snap => {
      setBookings(snap.docs.map(d => ({ id: d.id, ...d.data() } as Booking)))
      setFetching(false)
    })
  }, [user])

  if (loading || !user) return null

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <div className="mb-6">
        <Link href="/dashboard" className="mb-1 block text-sm text-zinc-500 hover:text-zinc-900">
          ← Dashboard
        </Link>
        <h1 className="text-2xl font-bold tracking-tight text-slate-700">My bookings</h1>
      </div>

      {fetching ? (
        <p className="text-zinc-400">Loading...</p>
      ) : bookings.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-200 py-16 text-center">
          <p className="mb-4 text-zinc-500">You haven&apos;t made any bookings yet.</p>
          <Link href="/" className="text-sm font-medium text-indigo-600 underline underline-offset-2">
            Find parking
          </Link>
        </div>
      ) : (
        <ul className="space-y-4">
          {bookings.map(booking => (
            <li key={booking.id} className="rounded-xl border border-zinc-200 p-5 space-y-3">
              <div>
                <p className="font-medium text-zinc-900">{booking.listingAddress}</p>
                <p className="text-sm text-zinc-500">{booking.date}</p>
              </div>
              <div className="flex gap-6 border-t border-zinc-100 pt-3 text-sm">
                <div>
                  <p className="text-xs text-zinc-400 uppercase tracking-wide">Duration</p>
                  <p className="font-medium">{booking.hours} hour{booking.hours !== 1 ? 's' : ''}</p>
                </div>
                <div>
                  <p className="text-xs text-zinc-400 uppercase tracking-wide">Total paid</p>
                  <p className="font-medium">${booking.total} CAD</p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
