'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AgeGatePage() {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleVerify = () => {
    setLoading(true)
    // Set cookie for 30 days
    document.cookie = 'age_verified=true; max-age=2592000; path=/; SameSite=Strict'
    router.push('/')
  }

  const handleDecline = () => {
    window.location.href = 'https://www.google.com'
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 p-4">
      <div className="age-gate-blur bg-gray-900/90 border border-gray-800 rounded-2xl p-8 md:p-12 max-w-lg w-full text-center shadow-2xl">
        {/* Warning Icon */}
        <div className="text-6xl mb-6">⚠️</div>

        {/* Title */}
        <h1 className="text-2xl md:text-3xl font-bold mb-4">
          Age Verification Required
        </h1>

        {/* Warning Text */}
        <p className="text-gray-400 mb-6 leading-relaxed">
          This website contains adult content that is only suitable for individuals 
          who are <span className="text-red-500 font-semibold">18 years of age or older</span>.
        </p>

        {/* Legal Notice */}
        <div className="bg-gray-800/50 rounded-lg p-4 mb-8 text-sm text-gray-500">
          <p>
            By entering, you confirm that you are at least 18 years old and legally 
            permitted to view adult content in your jurisdiction. You also agree to 
            our Terms of Service and Privacy Policy.
          </p>
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={handleVerify}
            disabled={loading}
            className="btn-primary text-lg px-8 py-3 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Verifying...
              </>
            ) : (
              <>✓ Yes, I&apos;m 18+</>
            )}
          </button>
          <button
            onClick={handleDecline}
            className="btn-secondary text-lg px-8 py-3"
          >
            ✕ No, Exit
          </button>
        </div>

        {/* Additional Info */}
        <p className="mt-8 text-xs text-gray-600">
          If you are under 18 years of age, please leave this site immediately.
        </p>
      </div>
    </div>
  )
}
