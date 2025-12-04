import Link from 'next/link'

export const metadata = {
  title: 'Pictures',
  description: 'Browse photo galleries on XpandoraX.',
}

export default function PicturesPage() {
  return (
    <div className="min-h-screen py-8 sm:py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto text-center">
          {/* Icon */}
          <div className="w-24 h-24 mx-auto mb-8 rounded-full bg-surface-800 flex items-center justify-center">
            <svg className="w-12 h-12 text-surface-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold mb-4">Pictures Coming Soon</h1>
          
          <p className="text-surface-400 mb-8 max-w-md mx-auto">
            We are working on bringing you an extensive collection of high-quality photo galleries. Check back soon for updates.
          </p>

          <div className="card p-6 mb-8">
            <h2 className="font-semibold mb-3">What to Expect</h2>
            <ul className="text-surface-400 text-sm space-y-2 text-left">
              <li className="flex items-center gap-2">
                <svg className="w-4 h-4 text-primary-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                High-resolution photo galleries
              </li>
              <li className="flex items-center gap-2">
                <svg className="w-4 h-4 text-primary-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Professional model portfolios
              </li>
              <li className="flex items-center gap-2">
                <svg className="w-4 h-4 text-primary-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Exclusive behind-the-scenes content
              </li>
              <li className="flex items-center gap-2">
                <svg className="w-4 h-4 text-primary-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Easy browsing and filtering
              </li>
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/videos" className="btn-primary px-6 py-3">
              Browse Videos
            </Link>
            <Link href="/models" className="btn-secondary px-6 py-3">
              View Models
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
