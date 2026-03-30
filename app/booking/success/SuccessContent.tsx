'use client'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

export default function SuccessContent() {
  const searchParams = useSearchParams()
  const address = searchParams.get('address') ?? ''
  const hours = searchParams.get('hours') ?? ''
  const total = searchParams.get('total') ?? ''
  const date = searchParams.get('date') ?? ''

  return (
    <div className="flex min-h-full flex-col items-center justify-center px-4">
      <div className="w-full max-w-md space-y-6 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
          <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-700">Booking confirmed!</h1>
          <p className="mt-2 text-zinc-500">Your parking spot has been reserved.</p>
        </div>

        <div className="rounded-xl border border-zinc-200 p-5 text-left space-y-2">
          {address && (
            <div className="flex justify-between text-sm">
              <span className="text-zinc-500">Location</span>
              <span className="font-medium text-right max-w-xs">{address}</span>
            </div>
          )}
          {date && (
            <div className="flex justify-between text-sm">
              <span className="text-zinc-500">Date</span>
              <span className="font-medium">{date}</span>
            </div>
          )}
          {hours && (
            <div className="flex justify-between text-sm">
              <span className="text-zinc-500">Duration</span>
              <span className="font-medium">{hours} hour{hours !== '1' ? 's' : ''}</span>
            </div>
          )}
          {total && (
            <div className="flex justify-between text-sm border-t border-zinc-100 pt-2 mt-2">
              <span className="text-zinc-500">Total paid</span>
              <span className="font-semibold">${total} CAD</span>
            </div>
          )}
        </div>

        <Link
          href="/"
          className="block w-full rounded-lg bg-indigo-600 py-3 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors"
        >
          Find more parking
        </Link>
      </div>
    </div>
  )
}
