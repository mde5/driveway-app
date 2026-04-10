'use client'
import { APIProvider, Map, AdvancedMarker } from '@vis.gl/react-google-maps'
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

export default function MapView({ center, listings, hoveredId, date, address }: Props) {
  const router = useRouter()

  return (
    <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!}>
      <Map
        style={{ width: '100%', height: '100%' }}
        defaultCenter={center}
        defaultZoom={14}
        gestureHandling="greedy"
        mapId={process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID}
      >
        {listings.map(listing => {
          const hovered = listing.id === hoveredId
          return (
            <AdvancedMarker
              key={listing.id}
              position={{ lat: listing.lat, lng: listing.lng }}
              title={`${listing.address} — $${listing.pricePerHour}/hr`}
              onClick={() =>
                router.push(
                  `/listings?address=${encodeURIComponent(address)}&date=${date}&selected=${listing.id}`
                )
              }
            >
              <div
                style={{
                  background: hovered ? '#ca8a04' : '#facc15',
                  color: '#111827',
                  border: 'none',
                  borderRadius: '9999px',
                  padding: '4px 10px',
                  fontSize: '13px',
                  fontWeight: 700,
                  lineHeight: 1.2,
                  whiteSpace: 'nowrap',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.25)',
                  cursor: 'pointer',
                  transition: 'background 0.15s',
                }}
              >
                ${listing.pricePerHour}/hr
              </div>
            </AdvancedMarker>
          )
        })}
      </Map>
    </APIProvider>
  )
}
