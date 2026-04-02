'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { useAuth } from '@/context/AuthContext'
import Link from 'next/link'

type FormData = {
  email: string
  password: string
}

export default function LoginContent() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect') ?? '/dashboard'
  const { register, handleSubmit, formState: { errors, isSubmitting }, setError } = useForm<FormData>()

  // If already logged in, send to redirect destination
  useEffect(() => {
    if (!loading && user) router.replace(redirect)
  }, [user, loading, router, redirect])

  async function onSubmit(data: FormData) {
    try {
      await signInWithEmailAndPassword(auth, data.email, data.password)
      router.push(redirect)
    } catch {
      setError('root', { message: 'Invalid email or password.' })
    }
  }

  async function handleGoogleSignIn() {
    try {
      await signInWithPopup(auth, new GoogleAuthProvider())
      router.push(redirect)
    } catch {
      setError('root', { message: 'Google sign-in failed. Please try again.' })
    }
  }

  if (loading) return null

  const redirected = searchParams.get('redirect') !== null

  return (
    <div className="flex min-h-full flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-6">
        {redirected && (
          <p className="rounded-md bg-yellow-50 border border-yellow-200 px-4 py-3 text-sm text-yellow-800 text-center">
            Please sign in to continue.
          </p>
        )}
        <h1 className="text-2xl font-bold tracking-tight text-slate-700 text-center">Sign in</h1>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
              {...register('email', { required: 'Email is required' })}
            />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input
              type="password"
              className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
              {...register('password', { required: 'Password is required' })}
            />
            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
          </div>

          {errors.root && <p className="text-red-500 text-sm">{errors.root.message}</p>}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-md bg-yellow-400 py-2 text-sm font-medium text-gray-900 hover:bg-yellow-500 disabled:opacity-50"
          >
            {isSubmitting ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <div className="relative text-center text-sm text-zinc-400">
          <span className="bg-white px-2">or</span>
          <div className="absolute inset-0 top-1/2 border-t border-zinc-200 -z-10" />
        </div>

        <button
          onClick={handleGoogleSignIn}
          className="w-full rounded-md border border-zinc-300 py-2 text-sm font-medium hover:bg-zinc-50"
        >
          Continue with Google
        </button>

        <p className="text-center text-sm text-zinc-500">
          Don&apos;t have an account?{' '}
          <Link href="/signup" className="font-medium text-yellow-600 underline">Sign up</Link>
        </p>
      </div>
    </div>
  )
}
