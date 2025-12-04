'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function SearchForm({ placeholder = 'Search...', defaultValue = '', compact = false }) {
  const router = useRouter()
  const [query, setQuery] = useState(defaultValue)

  const handleSubmit = (event) => {
    event.preventDefault()
    const trimmedQuery = query.trim()
    if (trimmedQuery) {
      router.push(`/search?q=${encodeURIComponent(trimmedQuery)}`)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="relative">
      <input
        type="text"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder={placeholder}
        className={`w-full bg-surface-800 border border-surface-700 rounded-lg focus:outline-none focus:border-primary-500 transition-colors ${
          compact ? 'px-3 py-1.5 text-sm pr-8' : 'px-4 py-2 pr-10'
        }`}
        aria-label="Search"
      />
      <button
        type="submit"
        className={`absolute right-0 top-0 bottom-0 flex items-center justify-center text-surface-400 hover:text-white transition-colors ${
          compact ? 'px-2' : 'px-3'
        }`}
        aria-label="Submit search"
      >
        <svg
          className={compact ? 'w-4 h-4' : 'w-5 h-5'}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </button>
    </form>
  )
}
