import Link from 'next/link'
import VideoGrid from '@/components/VideoGrid'
import { getModelBySlug, getModelVideos } from '@/lib/data'
import { notFound } from 'next/navigation'

export async function generateMetadata({ params }) {
  const { slug } = await params
  const model = await getModelBySlug(slug)
  
  if (!model) {
    return { title: 'Model Not Found' }
  }

  return {
    title: model.name,
    description: model.bio?.substring(0, 160) || `Watch videos featuring ${model.name} on XpandoraX`,
    openGraph: {
      title: model.name,
      description: model.bio?.substring(0, 160),
      images: model.avatar ? [{ url: model.avatar }] : [],
    },
  }
}

export default async function ModelPage({ params, searchParams }) {
  const { slug } = await params
  const searchParamsResolved = await searchParams
  const page = parseInt(searchParamsResolved?.page) || 1

  const model = await getModelBySlug(slug)

  if (!model) {
    notFound()
  }

  const { videos, totalPages, totalCount } = await getModelVideos(slug, {
    page,
    limit: 24,
  })

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        {/* Model Header */}
        <div className="card p-6 md:p-8 mb-8">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Avatar */}
            <div className="shrink-0">
              <div className="w-32 h-40 md:w-48 md:h-64 rounded-lg bg-gray-800 overflow-hidden mx-auto md:mx-0">
                {model.avatar ? (
                  <img
                    src={model.avatar}
                    alt={model.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-6xl text-gray-600">
                    👤
                  </div>
                )}
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
                <h1 className="text-2xl md:text-3xl font-bold">{model.name}</h1>
                {model.verified && (
                  <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                    ✓ Verified
                  </span>
                )}
              </div>

              {/* Stats */}
              <div className="flex flex-wrap justify-center md:justify-start gap-4 text-gray-400 mb-4">
                <span><strong className="text-white">{totalCount}</strong> videos</span>
                {model.views && (
                  <span><strong className="text-white">{(model.views / 1000000).toFixed(1)}M</strong> views</span>
                )}
                {model.subscribers && (
                  <span><strong className="text-white">{model.subscribers.toLocaleString()}</strong> subscribers</span>
                )}
              </div>

              {/* Details */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
                {model.country && (
                  <div>
                    <span className="text-gray-500 block">Country</span>
                    <span>{model.country}</span>
                  </div>
                )}
                {model.age && (
                  <div>
                    <span className="text-gray-500 block">Age</span>
                    <span>{model.age}</span>
                  </div>
                )}
                {model.height && (
                  <div>
                    <span className="text-gray-500 block">Height</span>
                    <span>{model.height}</span>
                  </div>
                )}
                {model.measurements && (
                  <div>
                    <span className="text-gray-500 block">Measurements</span>
                    <span>{model.measurements}</span>
                  </div>
                )}
              </div>

              {/* Bio */}
              {model.bio && (
                <p className="text-gray-400 leading-relaxed">
                  {model.bio}
                </p>
              )}

              {/* Social Links */}
              {model.socialLinks && Object.keys(model.socialLinks).length > 0 && (
                <div className="flex flex-wrap gap-3 mt-4 justify-center md:justify-start">
                  {model.socialLinks.twitter && (
                    <a href={model.socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="btn-secondary px-3 py-1 text-sm">
                      Twitter
                    </a>
                  )}
                  {model.socialLinks.instagram && (
                    <a href={model.socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="btn-secondary px-3 py-1 text-sm">
                      Instagram
                    </a>
                  )}
                  {model.socialLinks.website && (
                    <a href={model.socialLinks.website} target="_blank" rel="noopener noreferrer" className="btn-secondary px-3 py-1 text-sm">
                      Website
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Videos */}
        <div>
          <h2 className="text-2xl font-bold mb-6">
            <span className="text-red-500">🎥</span> Videos featuring {model.name}
          </h2>

          {videos.length > 0 ? (
            <VideoGrid videos={videos} />
          ) : (
            <div className="text-center py-16">
              <p className="text-gray-400 text-lg">No videos found for this model.</p>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-12">
              {page > 1 && (
                <Link
                  href={`/model/${slug}?page=${page - 1}`}
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
                  href={`/model/${slug}?page=${page + 1}`}
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
