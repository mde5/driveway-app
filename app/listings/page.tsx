import { Suspense } from 'react'
import ListingsContent from './ListingsContent'

export default function ListingsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center text-zinc-400">
          Loading...
        </div>
      }
    >
      <ListingsContent />
    </Suspense>
  )
}
