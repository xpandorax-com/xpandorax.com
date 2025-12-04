'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AgeGatePage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleConfirm = async () => {
    setIsLoading(true)
    
    // Set age verification cookie
    document.cookie = 'age_verified=true; path=/; max-age=31536000; SameSite=Strict'
    
    // Redirect to home page
    router.push('/')
    router.refresh()
  }

  const handleDecline = () => {
    window.location.href = 'https://www.google.com'
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-8 px-4 bg-surface-950">
      <div className="max-w-md w-full text-center">
        {/* Logo */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-primary-400 to-primary-600 bg-clip-text text-transparent">
            XpandoraX
          </h1>
        </div>

        {/* Card */}
        <div className="card p-6 sm:p-8">
          {/* Warning Icon */}
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-primary-600/20 flex items-center justify-center">
            <svg className="w-8 h-8 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>

          <h2 className="text-xl sm:text-2xl font-bold mb-4">Age Verification Required</h2>
          
          <p className="text-surface-400 mb-6">
            This website contains age-restricted content. You must be at least 18 years old (or the age of majority in your jurisdiction) to enter.
          </p>

          <div className="space-y-3 mb-6">
            <p className="text-sm text-surface-500">
              By clicking "I am 18 or older" you confirm that:
            </p>
            <ul className="text-sm text-surface-400 text-left list-disc list-inside space-y-1">
              <li>You are at least 18 years of age</li>
              <li>You are of legal age in your jurisdiction</li>
              <li>You consent to viewing adult content</li>
              <li>Viewing adult content is legal where you are located</li>
            </ul>
          </div>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleConfirm}
              disabled={isLoading}
              className="flex-1 btn-primary py-3 disabled:opacity-50"
            >
              {isLoading ? 'Loading...' : 'I am 18 or older'}
            </button>
            <button
              onClick={handleDecline}
              className="flex-1 btn-secondary py-3"
            >
              Exit
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-sm text-surface-500 space-y-2">
          <p>
            <a href="/privacy" className="hover:text-white transition-colors">Privacy Policy</a>
            <span className="mx-2">|</span>
            <a href="/terms" className="hover:text-white transition-colors">Terms of Service</a>
          </p>
          <p>All performers are 18 years of age or older.</p>
        </div>
      </div>
    </div>
  )
}
