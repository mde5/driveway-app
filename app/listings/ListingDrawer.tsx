'use client'
import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { doc, getDoc } from 'firebase/firestore'
import { httpsCallable } from 'firebase/functions'
import { db, functions } from '@/lib/firebase'
import { useAuth } from '@/context/AuthContext'
import Image from 'next/image'

type Listing = {
  id: string
  address: string
  neighbourhood: string
  pricePerHour: number
  pricePerDay: number
  description: string
  imageUrl: string
}

export default function ListingDrawer({ id, onDismiss }: { id: string; onDismiss: () => void }) {
  const searchParams = useSearchParams()
  const date = searchParams.get('date') ?? ''
  const { user } = useAuth()
  const router = useRouter()

  const [listing, setListing] = useState<Listing | null>(null)
  const [loading, setLoading] = useState(true)
  const [hours, setHours] = useState(2)
  const [reserving, setReserving] = useState(false)
  const [reserveError, setReserveError] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    setListing(null)
    getDoc(doc(db, 'listings', id)).then(snap => {
      if (snap.exists()) setListing({ id: snap.id, ...snap.data() } as Listing)
      setLoading(false)
    })
  }, [id])

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onDismiss()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onDismiss])

  const hourlyTotal = listing ? listing.pricePerHour * hours : 0
  const usesDayRate = listing ? hourlyTotal >= listing.pricePerDay : false
  const total = listing
    ? usesDayRate ? listing.pricePerDay : hourlyTotal
    : 0

  async function handleReserve() {
    if (!user) {
      router.push(`/login?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`)
      return
    }
    setReserving(true)
    setReserveError(null)
    try {
      const createCheckoutSession = httpsCallable(functions, 'createCheckoutSession')
      const result = await createCheckoutSession({
        listingId: id,
        listingAddress: listing!.address,
        hours,
        total,
        date,
        origin: window.location.origin,
      })
      const { url } = result.data as { url: string }
      window.location.href = url
    } catch (e: unknown) {
      console.error(e)
      setReserveError('Could not start checkout. Please try again.')
      setReserving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto py-8">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50" onClick={onDismiss} />

      {/* Panel */}
      <div className="relative z-10 mx-4 w-full max-w-2xl rounded-2xl bg-white shadow-2xl">
        {/* Close button */}
        <button
          onClick={onDismiss}
          className="absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-zinc-500 shadow-sm hover:bg-white hover:text-black"
          aria-label="Close"
        >
          ✕
        </button>

        {loading && (
          <div className="flex h-64 items-center justify-center text-zinc-400">Loading…</div>
        )}

        {!loading && !listing && (
          <div className="flex h-64 items-center justify-center text-zinc-500">
            Listing not found.
          </div>
        )}

        {listing && (
          <div className="px-6 py-8">
            {/* Photo */}
            <div className="relative mb-6 h-64 w-full overflow-hidden rounded-xl bg-zinc-100">
              <Image
                src={listing.imageUrl}
                alt={listing.address}
                fill
                style={{ objectFit: 'cover' }}
                unoptimized
              />
            </div>

            {/* Details */}
            <div className="space-y-4">
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-slate-700">
                  {listing.neighbourhood}
                </h2>
                <p className="text-zinc-500">{listing.address}</p>
                {date && <p className="mt-1 text-sm text-zinc-400">{date}</p>}
              </div>
              <p className="text-zinc-600">{listing.description}</p>
              <div className="flex gap-8 border-y border-zinc-100 py-4">
                <div>
                  <p className="text-xs uppercase tracking-wide text-zinc-400">Per hour</p>
                  <p className="text-xl font-semibold">${listing.pricePerHour}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-zinc-400">Per day</p>
                  <p className="text-xl font-semibold">${listing.pricePerDay}</p>
                </div>
              </div>
            </div>

            {/* Booking widget */}
            <div className="mt-8 space-y-4 rounded-xl border border-zinc-200 p-6">
              <h3 className="text-lg font-semibold">Reserve this spot</h3>
              <div>
                <label className="mb-1 block text-sm text-zinc-500">Number of hours</label>
                <input
                  type="number"
                  min={1}
                  max={24}
                  value={hours}
                  onChange={e => setHours(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-24 rounded-lg border border-zinc-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
                />
                {usesDayRate && (
                  <p className="mt-1 text-xs text-zinc-400">Day rate applied (8+ hours)</p>
                )}
              </div>
              <div className="flex items-end justify-between border-t border-zinc-100 pt-4">
                <div>
                  <p className="text-sm text-zinc-500">
                    {usesDayRate ? '1 day' : `${hours} hour${hours !== 1 ? 's' : ''}`}
                  </p>
                  <p className="text-3xl font-bold">${total}</p>
                </div>
                {reserveError && <p className="text-sm text-red-500">{reserveError}</p>}
                <button
                  className="cursor-pointer rounded-lg bg-yellow-400 px-6 py-3 text-sm font-semibold text-gray-900 transition-colors hover:bg-yellow-500 disabled:opacity-50"
                  onClick={handleReserve}
                  disabled={reserving}
                >
                  {reserving ? 'Loading...' : 'Reserve'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
