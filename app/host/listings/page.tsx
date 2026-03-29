'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { collection, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useAuth } from '@/context/AuthContext'
import Image from 'next/image'
import Link from 'next/link'

type Listing = {
  id: string
  address: string
  neighbourhood: string
  pricePerHour: number
  pricePerDay: number
  imageUrl: string
}

export default function HostListingsPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [listings, setListings] = useState<Listing[]>([])
  const [fetching, setFetching] = useState(true)

  useEffect(() => {
    if (!loading && !user) router.replace('/login')
  }, [user, loading, router])

  useEffect(() => {
    if (!user) return
    const q = query(collection(db, 'listings'), where('ownerUid', '==', user.uid))
    getDocs(q).then(snap => {
      setListings(snap.docs.map(d => ({ id: d.id, ...d.data() } as Listing)))
      setFetching(false)
    })
  }, [user])

  async function handleDelete(id: string) {
    if (!confirm('Delete this listing? This cannot be undone.')) return
    await deleteDoc(doc(db, 'listings', id))
    setListings(prev => prev.filter(l => l.id !== id))
  }

  if (loading || !user) return null

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <Link href="/dashboard" className="mb-1 block text-sm text-zinc-500 hover:text-zinc-900">
            ← Dashboard
          </Link>
          <h1 className="text-2xl font-semibold">Your listings</h1>
        </div>
        <Link
          href="/host/new"
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-700"
        >
          + New listing
        </Link>
      </div>

      {fetching ? (
        <p className="text-zinc-400">Loading...</p>
      ) : listings.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-200 py-16 text-center">
          <p className="mb-4 text-zinc-500">You haven&apos;t listed any driveways yet.</p>
          <Link href="/host/new" className="text-sm font-medium text-indigo-600 underline underline-offset-2">
            List your first space
          </Link>
        </div>
      ) : (
        <ul className="space-y-4">
          {listings.map(listing => (
            <li key={listing.id} className="flex gap-4 rounded-xl border border-zinc-200 p-4">
              <div className="relative h-20 w-28 flex-shrink-0 overflow-hidden rounded-lg bg-zinc-100">
                <Image
                  src={listing.imageUrl}
                  alt={listing.address}
                  fill
                  style={{ objectFit: 'cover' }}
                  unoptimized
                />
              </div>
              <div className="flex flex-1 flex-col justify-between">
                <div>
                  <p className="text-sm font-medium">{listing.neighbourhood}</p>
                  <p className="text-xs text-zinc-500">{listing.address}</p>
                </div>
                <p className="text-sm">
                  <span className="font-semibold">${listing.pricePerHour}/hr</span>
                  <span className="ml-2 text-xs text-zinc-400">${listing.pricePerDay}/day</span>
                </p>
              </div>
              <button
                onClick={() => handleDelete(listing.id)}
                className="self-start text-xs text-red-400 hover:text-red-600"
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
