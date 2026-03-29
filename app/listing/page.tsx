import { Suspense } from 'react'
import ListingContent from './ListingContent'

export default function ListingPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center text-zinc-400">
          Loading...
        </div>
      }
    >
      <ListingContent />
    </Suspense>
  )
}
