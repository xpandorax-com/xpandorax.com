import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center py-16 px-4">
      <div className="text-center max-w-md">
        <div className="text-8xl font-bold text-primary-500 mb-4">404</div>
        <h1 className="text-2xl sm:text-3xl font-bold mb-4">Page Not Found</h1>
        <p className="text-surface-400 mb-8">
          The page you are looking for does not exist or has been moved.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/" className="btn-primary px-6 py-3">
            Go Home
          </Link>
          <Link href="/videos" className="btn-secondary px-6 py-3">
            Browse Videos
          </Link>
        </div>
      </div>
    </div>
  )
}
