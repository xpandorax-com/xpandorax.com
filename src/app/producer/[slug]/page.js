import Link from 'next/link'
import VideoGrid from '@/components/VideoGrid'
import { getProducerBySlug, getProducerVideos } from '@/lib/data'
import { notFound } from 'next/navigation'

export async function generateMetadata({ params }) {
  const { slug } = await params
  const producer = await getProducerBySlug(slug)
  
  if (!producer) {
    return { title: 'Producer Not Found' }
  }

  return {
    title: producer.name,
    description: producer.description?.substring(0, 160) || `Watch videos from ${producer.name} on XpandoraX`,
  }
}

export default async function ProducerPage({ params, searchParams }) {
  const { slug } = await params
  const searchParamsResolved = await searchParams
  const page = parseInt(searchParamsResolved?.page) || 1

  const producer = await getProducerBySlug(slug)

  if (!producer) {
    notFound()
  }

  const { videos, totalPages, totalCount } = await getProducerVideos(slug, {
    page,
    limit: 24,
  })

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        {/* Producer Header */}
        <div className="card overflow-hidden mb-8">
          {/* Banner */}
          <div className="h-32 md:h-48 bg-gradient-to-r from-gray-800 to-gray-900 relative">
            {producer.banner && (
              <img
                src={producer.banner}
                alt={producer.name}
                className="w-full h-full object-cover"
              />
            )}
          </div>

          {/* Info */}
          <div className="p-6 md:p-8 relative">
            {/* Logo */}
            <div className="absolute -top-12 left-6 md:left-8">
              <div className="w-24 h-24 rounded-lg bg-gray-800 border-4 border-gray-900 overflow-hidden">
                {producer.logo ? (
                  <img
                    src={producer.logo}
                    alt={producer.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-3xl">
                    🏢
                  </div>
                )}
              </div>
            </div>

            <div className="pt-10 md:pt-0 md:pl-32">
              <h1 className="text-2xl md:text-3xl font-bold mb-2">{producer.name}</h1>
              
              {/* Stats */}
              <div className="flex flex-wrap gap-4 text-gray-400 mb-4">
                <span><strong className="text-white">{totalCount}</strong> videos</span>
                {producer.views && (
                  <span><strong className="text-white">{(producer.views / 1000000).toFixed(1)}M</strong> views</span>
                )}
                {producer.subscribers && (
                  <span><strong className="text-white">{producer.subscribers.toLocaleString()}</strong> subscribers</span>
                )}
              </div>

              {/* Description */}
              {producer.description && (
                <p className="text-gray-400 mb-4">{producer.description}</p>
              )}

              {/* Website Link */}
              {producer.website && (
                <a
                  href={producer.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary inline-block"
                >
                  Visit Website →
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Videos */}
        <div>
          <h2 className="text-2xl font-bold mb-6">
            <span className="text-red-500">🎥</span> Videos from {producer.name}
          </h2>

          {videos.length > 0 ? (
            <VideoGrid videos={videos} />
          ) : (
            <div className="text-center py-16">
              <p className="text-gray-400 text-lg">No videos found for this studio.</p>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-12">
              {page > 1 && (
                <Link
                  href={`/producer/${slug}?page=${page - 1}`}
                  className="btn-secondary px-4 py-2"
                >
                  ← Previous
                </Link>
              )}
              
              <span className="flex items-center px-4 text-gray-400">
                Page {page} of {totalPages}
              </span>

              {page < totalPages && (
                <Link
                  href={`/producer/${slug}?page=${page + 1}`}
                  className="btn-secondary px-4 py-2"
                >
                  Next →
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
