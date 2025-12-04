export const metadata = {
  title: 'Pictures & Galleries',
  description: 'Browse photo galleries and pictures.',
}

export default function PicturesPage() {
  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            <span className="text-red-500">🖼️</span> Pictures & Galleries
          </h1>
          <p className="text-gray-400">
            Photo galleries coming soon
          </p>
        </div>

        {/* Coming Soon */}
        <div className="card p-12 text-center">
          <div className="text-6xl mb-6">🖼️</div>
          <h2 className="text-2xl font-bold mb-4">Coming Soon</h2>
          <p className="text-gray-400 max-w-md mx-auto">
            We&apos;re working on bringing you an amazing photo gallery experience. 
            Check back soon for high-quality picture sets and exclusive galleries.
          </p>
        </div>
      </div>
    </div>
  )
}
