'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { collection, addDoc } from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { db, storage } from '@/lib/firebase'
import { useAuth } from '@/context/AuthContext'
import Link from 'next/link'

const PLACEHOLDER_IMAGE = 'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?w=800'

type FormData = {
  address: string
  neighbourhood: string
  description: string
  pricePerHour: number
  pricePerDay: number
  photo: FileList
}

export default function NewListingPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<FormData>()

  useEffect(() => {
    if (!loading && !user) router.replace('/login?redirect=/host/new')
  }, [user, loading, router])

  if (loading || !user) return null

  async function onSubmit(data: FormData) {
    try {
      // Convert address to coordinates
      const geoRes = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(data.address)}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`
      )
      const geoData = await geoRes.json()
      if (geoData.status !== 'OK') {
        setError('address', { message: 'Address not found. Try including the city (e.g. "123 Main St, Toronto, ON").' })
        return
      }
      const { lat, lng } = geoData.results[0].geometry.location

      // Upload photo if provided, otherwise use placeholder
      let imageUrl = PLACEHOLDER_IMAGE
      const file = data.photo?.[0]
      if (file) {
        const ext = file.name.split('.').pop()
        const storageRef = ref(storage, `listing-photos/${user!.uid}/${Date.now()}.${ext}`)
        await uploadBytes(storageRef, file)
        imageUrl = await getDownloadURL(storageRef)
      }

      await addDoc(collection(db, 'listings'), {
        ownerUid: user!.uid,
        address: data.address,
        neighbourhood: data.neighbourhood,
        description: data.description,
        pricePerHour: Number(data.pricePerHour),
        pricePerDay: Number(data.pricePerDay),
        lat,
        lng,
        imageUrl,
        available: true,
      })

      router.push('/host/listings')
    } catch (e) {
      console.error('Failed to publish listing:', e)
      setError('root', { message: 'Something went wrong. Please try again.' })
    }
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-8">
      <Link href="/host/listings" className="mb-6 inline-block text-sm text-zinc-500 hover:text-zinc-900">
        ← Your listings
      </Link>
      <h1 className="mb-6 text-2xl font-bold tracking-tight text-slate-700">List your driveway</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div>
          <label className="mb-1 block text-sm font-medium">Address</label>
          <input
            type="text"
            placeholder="123 Main St, Toronto, ON"
            className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            {...register('address', { required: 'Address is required' })}
          />
          {errors.address && <p className="mt-1 text-xs text-red-500">{errors.address.message}</p>}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Neighbourhood / Area</label>
          <input
            type="text"
            placeholder="e.g. King West, Distillery District"
            className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            {...register('neighbourhood', { required: 'Neighbourhood is required' })}
          />
          {errors.neighbourhood && <p className="mt-1 text-xs text-red-500">{errors.neighbourhood.message}</p>}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Description</label>
          <textarea
            rows={3}
            placeholder="Describe your space — access instructions, nearby landmarks, any restrictions..."
            className="w-full resize-none rounded-lg border border-zinc-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            {...register('description', { required: 'Description is required' })}
          />
          {errors.description && <p className="mt-1 text-xs text-red-500">{errors.description.message}</p>}
        </div>

        <div className="flex gap-4">
          <div className="flex-1">
            <label className="mb-1 block text-sm font-medium">Price per hour ($)</label>
            <input
              type="number"
              min={1}
              placeholder="5"
              className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              {...register('pricePerHour', { required: 'Required', min: { value: 1, message: 'Min $1' } })}
            />
            {errors.pricePerHour && <p className="mt-1 text-xs text-red-500">{errors.pricePerHour.message}</p>}
          </div>
          <div className="flex-1">
            <label className="mb-1 block text-sm font-medium">Price per day ($)</label>
            <input
              type="number"
              min={1}
              placeholder="30"
              className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              {...register('pricePerDay', { required: 'Required', min: { value: 1, message: 'Min $1' } })}
            />
            {errors.pricePerDay && <p className="mt-1 text-xs text-red-500">{errors.pricePerDay.message}</p>}
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">
            Photo <span className="font-normal text-zinc-400">(optional)</span>
          </label>
          <input
            type="file"
            accept="image/*"
            className="w-full text-sm text-zinc-500 file:mr-3 file:rounded-lg file:border-0 file:bg-zinc-100 file:px-3 file:py-1.5 file:text-sm file:font-medium hover:file:bg-zinc-200"
            {...register('photo')}
          />
        </div>

        {errors.root && <p className="text-sm text-red-500">{errors.root.message}</p>}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-lg bg-indigo-600 py-3 text-sm font-semibold text-white transition-colors hover:bg-indigo-700 disabled:opacity-50"
        >
          {isSubmitting ? 'Publishing...' : 'Publish listing'}
        </button>
      </form>
    </div>
  )
}
