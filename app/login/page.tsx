import { Suspense } from 'react'
import LoginContent from './LoginContent'

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center text-zinc-400">
          Loading...
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  )
}
