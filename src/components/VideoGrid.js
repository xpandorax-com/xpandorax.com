import Link from 'next/link'

export default function VideoGrid({ videos = [] }) {
  if (!videos.length) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400">No videos found.</p>
      </div>
    )
  }

  // Format duration
  const formatDuration = (seconds) => {
    if (!seconds) return ''
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = seconds % 60
    if (h > 0) {
      return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
    }
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  // Format views
  const formatViews = (views) => {
    if (!views) return '0'
    if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M`
    if (views >= 1000) return `${(views / 1000).toFixed(1)}K`
    return views.toString()
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
      {videos.map((video, index) => (
        <Link
          key={video.id || video.slug || index}
          href={`/video/${video.id || video.slug}`}
          className="card overflow-hidden group thumbnail-hover"
        >
          {/* Thumbnail */}
          <div className="aspect-video bg-gray-800 relative overflow-hidden">
            {video.thumbnail ? (
              <img
                src={video.thumbnail}
                alt={video.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                loading="lazy"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-4xl text-gray-600">
                🎬
              </div>
            )}

            {/* Duration Badge */}
            {video.duration && (
              <span className="absolute bottom-2 right-2 bg-black/80 text-white text-xs font-medium px-2 py-1 rounded">
                {formatDuration(video.duration)}
              </span>
            )}

            {/* Quality Badge */}
            {video.quality && (
              <span className="absolute top-2 left-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded">
                {video.quality}
              </span>
            )}

            {/* Play Icon Overlay */}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30">
              <div className="w-14 h-14 rounded-full bg-red-600/90 flex items-center justify-center">
                <svg className="w-6 h-6 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Info */}
          <div className="p-3">
            <h3 className="font-medium text-sm line-clamp-2 group-hover:text-red-400 transition-colors mb-2">
              {video.title}
            </h3>
            
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>{formatViews(video.views)} views</span>
              {video.models && video.models.length > 0 && (
                <span className="truncate ml-2">
                  {video.models[0]?.name}
                </span>
              )}
            </div>
          </div>
        </Link>
      ))}
    </div>
  )
}
