'use client'
import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { doc, getDoc } from 'firebase/firestore'
import { httpsCallable } from 'firebase/functions'
import { db, functions } from '@/lib/firebase'
import Image from 'next/image'
import Link from 'next/link'

type Listing = {
  id: string
  address: string
  neighbourhood: string
  pricePerHour: number
  pricePerDay: number
  description: string
  imageUrl: string
}

export default function ListingContent() {
  const searchParams = useSearchParams()
  const id = searchParams.get('id') ?? ''
  const date = searchParams.get('date') ?? ''
  const address = searchParams.get('address') ?? ''

  const [listing, setListing] = useState<Listing | null>(null)
  const [hours, setHours] = useState(2)
  const [loading, setLoading] = useState(true)
  const [reserving, setReserving] = useState(false)
  const [reserveError, setReserveError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    getDoc(doc(db, 'listings', id)).then(snap => {
      if (snap.exists()) setListing({ id: snap.id, ...snap.data() } as Listing)
      setLoading(false)
    })
  }, [id])

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center text-zinc-400">Loading...</div>
    )
  }

  if (!listing) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4">
        <p className="text-zinc-500">Listing not found.</p>
        <Link href="/" className="text-sm underline">
          Go home
        </Link>
      </div>
    )
  }

  // Apply day rate whenever it's cheaper than the hourly total
  const hourlyTotal = listing.pricePerHour * hours
  const usesDayRate = hourlyTotal >= listing.pricePerDay
  const total = usesDayRate ? listing.pricePerDay : hourlyTotal

  async function handleReserve() {
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

  const backHref = address
    ? `/listings?address=${encodeURIComponent(address)}&date=${date}`
    : '/listings'

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <Link href={backHref} className="mb-6 inline-block text-sm text-zinc-500 hover:text-black">
        ← Back to results
      </Link>

      {/* Photo */}
      <div className="relative mb-6 h-72 w-full overflow-hidden rounded-xl bg-zinc-100">
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
          <h1 className="text-2xl font-bold tracking-tight text-slate-700">{listing.neighbourhood}</h1>
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
        <h2 className="text-lg font-semibold">Reserve this spot</h2>
        <div>
          <label className="mb-1 block text-sm text-zinc-500">Number of hours</label>
          <input
            type="number"
            min={1}
            max={24}
            value={hours}
            onChange={e => setHours(Math.max(1, parseInt(e.target.value) || 1))}
            className="w-24 rounded-lg border border-zinc-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
            className="rounded-lg bg-indigo-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-indigo-700 disabled:opacity-50"
            onClick={handleReserve}
            disabled={reserving}
          >
            {reserving ? 'Loading...' : 'Reserve'}
          </button>
        </div>
      </div>
    </div>
  )
}
