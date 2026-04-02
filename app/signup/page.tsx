'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { useAuth } from '@/context/AuthContext'
import Link from 'next/link'

type FormData = {
  email: string
  password: string
  confirmPassword: string
}

export default function SignupPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const { register, handleSubmit, watch, formState: { errors, isSubmitting }, setError } = useForm<FormData>()

  // If already logged in, send to dashboard
  useEffect(() => {
    if (!loading && user) router.replace('/dashboard')
  }, [user, loading, router])

  async function onSubmit(data: FormData) {
    try {
      await createUserWithEmailAndPassword(auth, data.email, data.password)
      router.push('/dashboard')
    } catch (err: unknown) {
      const code = (err as { code?: string }).code
      if (code === 'auth/email-already-in-use') {
        setError('email', { message: 'An account with this email already exists.' })
      } else {
        setError('root', { message: 'Something went wrong. Please try again.' })
      }
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
        <h1 className="text-2xl font-bold tracking-tight text-slate-700 text-center">Create an account</h1>

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
              {...register('password', { required: 'Password is required', minLength: { value: 6, message: 'Password must be at least 6 characters' } })}
            />
            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Confirm password</label>
            <input
              type="password"
              className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
              {...register('confirmPassword', {
                required: 'Please confirm your password',
                validate: (val) => val === watch('password') || 'Passwords do not match',
              })}
            />
            {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword.message}</p>}
          </div>

          {errors.root && <p className="text-red-500 text-sm">{errors.root.message}</p>}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full cursor-pointer rounded-md bg-yellow-400 py-2 text-sm font-medium text-gray-900 hover:bg-yellow-500 disabled:opacity-50"
          >
            {isSubmitting ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        <div className="relative text-center text-sm text-zinc-400">
          <span className="bg-white px-2">or</span>
          <div className="absolute inset-0 top-1/2 border-t border-zinc-200 -z-10" />
        </div>

        <button
          onClick={handleGoogleSignIn}
          className="w-full cursor-pointer rounded-md border border-zinc-300 py-2 text-sm font-medium hover:bg-zinc-100 transition-colors"
        >
          Continue with Google
        </button>

        <p className="text-center text-sm text-zinc-500">
          Already have an account?{' '}
          <Link href="/login" className="font-medium text-yellow-600 underline">Sign in</Link>
        </p>
      </div>
    </div>
  )
}
