import { Suspense } from 'react'
import SuccessContent from './SuccessContent'

export default function SuccessPage() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center text-zinc-400">Loading...</div>}>
      <SuccessContent />
    </Suspense>
  )
}
