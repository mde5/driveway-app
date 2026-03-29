'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { useAuth } from '@/context/AuthContext'
import Link from 'next/link'

type FormData = {
  email: string
  password: string
}

export default function LoginPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const { register, handleSubmit, formState: { errors, isSubmitting }, setError } = useForm<FormData>()

  // If already logged in, send to dashboard
  useEffect(() => {
    if (!loading && user) router.replace('/dashboard')
  }, [user, loading, router])

  async function onSubmit(data: FormData) {
    try {
      await signInWithEmailAndPassword(auth, data.email, data.password)
      router.push('/dashboard')
    } catch {
      setError('root', { message: 'Invalid email or password.' })
    }
  }

  async function handleGoogleSignIn() {
    try {
      await signInWithPopup(auth, new GoogleAuthProvider())
      router.push('/dashboard')
    } catch {
      setError('root', { message: 'Google sign-in failed. Please try again.' })
    }
  }

  if (loading) return null

  return (
    <div className="flex min-h-full flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-6">
        <h1 className="text-2xl font-bold tracking-tight text-slate-700 text-center">Sign in</h1>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              {...register('email', { required: 'Email is required' })}
            />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input
              type="password"
              className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              {...register('password', { required: 'Password is required' })}
            />
            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
          </div>

          {errors.root && <p className="text-red-500 text-sm">{errors.root.message}</p>}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-md bg-indigo-600 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
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
          <Link href="/signup" className="font-medium text-indigo-600 underline">Sign up</Link>
        </p>
      </div>
    </div>
  )
}
