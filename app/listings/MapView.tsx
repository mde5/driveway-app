'use client'
import { APIProvider, Map, Marker } from '@vis.gl/react-google-maps'
import { useRouter } from 'next/navigation'

type Listing = {
  id: string
  lat: number
  lng: number
  pricePerHour: number
  address: string
}

type Props = {
  center: { lat: number; lng: number }
  listings: Listing[]
  hoveredId: string | null
  date: string
  address: string
}

export default function MapView({ center, listings, date, address }: Props) {
  const router = useRouter()

  return (
    <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!}>
      <Map
        style={{ width: '100%', height: '100%' }}
        defaultCenter={center}
        defaultZoom={14}
        gestureHandling="greedy"
      >
        {listings.map(listing => (
          <Marker
            key={listing.id}
            position={{ lat: listing.lat, lng: listing.lng }}
            title={`${listing.address} — $${listing.pricePerHour}/hr`}
            onClick={() =>
              router.push(
                `/listing?id=${listing.id}&date=${date}&address=${encodeURIComponent(address)}`
              )
            }
          />
        ))}
      </Map>
    </APIProvider>
  )
}
