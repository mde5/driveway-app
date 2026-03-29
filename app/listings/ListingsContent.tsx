'use client'
import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { collection, getDocs } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import Image from 'next/image'
import Link from 'next/link'
import dynamic from 'next/dynamic'

const MapView = dynamic(() => import('./MapView'), { ssr: false })

type Listing = {
  id: string
  address: string
  neighbourhood: string
  lat: number
  lng: number
  pricePerHour: number
  pricePerDay: number
  description: string
  imageUrl: string
  available: boolean
}

// Calculates straight-line distance in km between two lat/lng points.
function haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number) {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

export default function ListingsContent() {
  const searchParams = useSearchParams()
  const address = searchParams.get('address') ?? ''
  const date = searchParams.get('date') ?? ''

  const [center, setCenter] = useState<{ lat: number; lng: number } | null>(null)
  const [listings, setListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [hoveredId, setHoveredId] = useState<string | null>(null)

  useEffect(() => {
    if (!address) return

    async function load() {
      setLoading(true)
      setError(null)
      try {
        // Geocode the typed address into lat/lng coordinates
        const geoRes = await fetch(
          `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`
        )
        const geoData = await geoRes.json()
        if (geoData.status !== 'OK') {
          throw new Error(`Geocoding failed: ${geoData.status}${geoData.error_message ? ' — ' + geoData.error_message : ''}`)
        }
        const { lat, lng } = geoData.results[0].geometry.location
        setCenter({ lat, lng })

        // Fetch all listings and filter to those within 10km
        const snap = await getDocs(collection(db, 'listings'))
        const all: Listing[] = snap.docs.map(d => ({ id: d.id, ...d.data() } as Listing))
        const nearby = all
          .filter(l => haversineDistance(lat, lng, l.lat, l.lng) <= 10)
          .sort(
            (a, b) =>
              haversineDistance(lat, lng, a.lat, a.lng) -
              haversineDistance(lat, lng, b.lat, b.lng)
          )
        setListings(nearby)
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : 'Something went wrong.')
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [address])

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center text-zinc-400">
        Searching near {address}…
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4">
        <p className="text-red-500">{error}</p>
        <Link href="/" className="text-sm underline">
          Try again
        </Link>
      </div>
    )
  }

  return (
    <div className="flex h-screen flex-col">
      {/* Header */}
      <div className="flex items-center gap-4 border-b px-6 py-4">
        <Link href="/" className="text-sm text-zinc-500 hover:text-black">
          ← Back
        </Link>
        <p>
          <span className="font-semibold">{listings.length} spot{listings.length !== 1 ? 's' : ''}</span>
          <span className="text-zinc-500"> near {address}</span>
          {date && <span className="ml-2 text-sm text-zinc-400">· {date}</span>}
        </p>
      </div>

      {/* Two-column layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Listing list */}
        <div className="w-2/5 overflow-y-auto border-r">
          {listings.length === 0 ? (
            <p className="p-8 text-center text-zinc-400">
              No spots found nearby. Try a different location.
            </p>
          ) : (
            <ul>
              {listings.map(listing => (
                <li key={listing.id}>
                  <Link
                    href={`/listing?id=${listing.id}&date=${date}&address=${encodeURIComponent(address)}`}
                    className={`flex gap-4 border-b p-4 transition-colors hover:bg-zinc-50 ${hoveredId === listing.id ? 'bg-zinc-50' : ''}`}
                    onMouseEnter={() => setHoveredId(listing.id)}
                    onMouseLeave={() => setHoveredId(null)}
                  >
                    <div className="relative h-20 w-28 flex-shrink-0 overflow-hidden rounded-lg bg-zinc-100">
                      <Image
                        src={listing.imageUrl}
                        alt={listing.address}
                        fill
                        style={{ objectFit: 'cover' }}
                        unoptimized
                      />
                    </div>
                    <div className="flex flex-col justify-center gap-1">
                      <p className="text-sm font-semibold">{listing.neighbourhood}</p>
                      <p className="line-clamp-1 text-xs text-zinc-500">{listing.address}</p>
                      <p className="text-sm">
                        <span className="font-semibold">${listing.pricePerHour}/hr</span>
                        <span className="ml-2 text-xs text-zinc-400">
                          ${listing.pricePerDay}/day
                        </span>
                      </p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Map */}
        <div className="flex-1">
          {center && (
            <MapView
              center={center}
              listings={listings}
              hoveredId={hoveredId}
              date={date}
              address={address}
            />
          )}
        </div>
      </div>
    </div>
  )
}
