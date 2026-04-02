'use client'
import Form from 'next/form'

export default function SearchForm() {
  const today = new Date().toISOString().split('T')[0]

  return (
    <Form action="/listings" className="space-y-3">
      <input
        name="address"
        placeholder="Where are you going? (e.g. CN Tower, Toronto)"
        required
        autoComplete="off"
        className="w-full rounded-lg border border-zinc-200 bg-white px-4 py-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
      />
      <input
        type="date"
        name="date"
        required
        defaultValue={today}
        className="w-full rounded-lg border border-zinc-200 bg-white px-4 py-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
      />
      <button
        type="submit"
        className="w-full cursor-pointer rounded-lg bg-yellow-400 py-3 text-sm font-semibold text-gray-900 hover:bg-yellow-500 transition-colors"
      >
        Search parking
      </button>
    </Form>
  )
}
