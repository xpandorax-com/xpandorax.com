import Link from 'next/link'
import VideoPlayer from '@/components/VideoPlayer'
import VideoGrid from '@/components/VideoGrid'
import { getVideoById, getRelatedVideos } from '@/lib/data'
import { notFound } from 'next/navigation'

export async function generateMetadata({ params }) {
  const { id } = await params
  const video = await getVideoById(id)
  
  if (!video) {
    return { title: 'Video Not Found' }
  }

  return {
    title: video.title,
    description: video.description?.substring(0, 160) || `Watch ${video.title} on XpandoraX`,
    openGraph: {
      title: video.title,
      description: video.description?.substring(0, 160),
      type: 'video.other',
      images: video.thumbnail ? [{ url: video.thumbnail }] : [],
    },
  }
}

export default async function VideoPage({ params }) {
  const { id } = await params
  const video = await getVideoById(id)

  if (!video) {
    notFound()
  }

  const relatedVideos = await getRelatedVideos(id, 6)

  // Format duration
  const formatDuration = (seconds) => {
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = seconds % 60
    if (h > 0) {
      return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
    }
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  // Format views
  const formatViews = (views) => {
    if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M`
    if (views >= 1000) return `${(views / 1000).toFixed(1)}K`
    return views.toString()
  }

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        {/* Video Player */}
        <div className="mb-6">
          <VideoPlayer
            src={video.videoUrl}
            poster={video.thumbnail}
            title={video.title}
          />
        </div>

        {/* Video Info */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <h1 className="text-2xl md:text-3xl font-bold mb-4">
              {video.title}
            </h1>

            {/* Stats */}
            <div className="flex flex-wrap gap-4 text-gray-400 mb-6">
              <span className="flex items-center gap-1">
                <span>👁️</span> {formatViews(video.views || 0)} views
              </span>
              <span className="flex items-center gap-1">
                <span>⏱️</span> {formatDuration(video.duration || 0)}
              </span>
              <span className="flex items-center gap-1">
                <span>📅</span> {formatDate(video.createdAt || new Date())}
              </span>
              {video.quality && (
                <span className="bg-red-600 text-white text-xs font-bold px-2 py-1 rounded">
                  {video.quality}
                </span>
              )}
            </div>

            {/* Description */}
            {video.description && (
              <div className="card p-6 mb-6">
                <h2 className="font-semibold mb-2">Description</h2>
                <p className="text-gray-400 whitespace-pre-wrap">
                  {video.description}
                </p>
              </div>
            )}

            {/* Tags */}
            {video.tags && video.tags.length > 0 && (
              <div className="mb-6">
                <h2 className="font-semibold mb-3">Tags</h2>
                <div className="flex flex-wrap gap-2">
                  {video.tags.map((tag) => (
                    <Link
                      key={tag}
                      href={`/videos?q=${encodeURIComponent(tag)}`}
                      className="bg-gray-800 hover:bg-gray-700 px-3 py-1 rounded-full text-sm transition-colors"
                    >
                      #{tag}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Models */}
            {video.models && video.models.length > 0 && (
              <div className="card p-6 mb-6">
                <h2 className="font-semibold mb-4">Models</h2>
                <div className="space-y-3">
                  {video.models.map((model) => (
                    <Link
                      key={model.slug}
                      href={`/model/${model.slug}`}
                      className="flex items-center gap-3 hover:bg-gray-800 p-2 rounded-lg transition-colors"
                    >
                      <div className="w-12 h-12 rounded-full bg-gray-800 overflow-hidden">
                        {model.avatar ? (
                          <img src={model.avatar} alt={model.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xl">👤</div>
                        )}
                      </div>
                      <span className="font-medium hover:text-red-400">{model.name}</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Categories */}
            {video.categories && video.categories.length > 0 && (
              <div className="card p-6 mb-6">
                <h2 className="font-semibold mb-4">Categories</h2>
                <div className="flex flex-wrap gap-2">
                  {video.categories.map((category) => (
                    <Link
                      key={category.slug}
                      href={`/category/${category.slug}`}
                      className="bg-gray-800 hover:bg-red-600/20 hover:text-red-400 px-3 py-1 rounded-lg text-sm transition-colors"
                    >
                      {category.name}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Producer */}
            {video.producer && (
              <div className="card p-6">
                <h2 className="font-semibold mb-4">Studio</h2>
                <Link
                  href={`/producer/${video.producer.slug}`}
                  className="flex items-center gap-3 hover:bg-gray-800 p-2 rounded-lg transition-colors"
                >
                  <div className="w-12 h-12 rounded bg-gray-800 overflow-hidden">
                    {video.producer.logo ? (
                      <img src={video.producer.logo} alt={video.producer.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xl">🏢</div>
                    )}
                  </div>
                  <span className="font-medium hover:text-red-400">{video.producer.name}</span>
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Related Videos */}
        {relatedVideos.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-6">
              <span className="text-red-500">🎬</span> Related Videos
            </h2>
            <VideoGrid videos={relatedVideos} />
          </div>
        )}
      </div>
    </div>
  )
}
