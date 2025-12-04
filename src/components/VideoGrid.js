import Link from 'next/link'

export default function VideoGrid({ videos = [], columns = 'auto', loading = false }) {
  // Loading skeleton
  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3 sm:gap-4 lg:gap-5">
        {[...Array(12)].map((_, index) => (
          <div key={index} className="card overflow-hidden animate-pulse">
            <div className="aspect-video bg-gray-800" />
            <div className="p-3">
              <div className="h-4 bg-gray-800 rounded mb-2" />
              <div className="h-3 bg-gray-800 rounded w-2/3" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (!videos.length) {
    return (
      <div className="text-center py-12 px-4">
        <div className="text-5xl mb-4">🎬</div>
        <p className="text-gray-400 text-lg">No videos found.</p>
        <p className="text-gray-500 text-sm mt-2">Try adjusting your search or filters.</p>
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

  // Dynamic grid columns based on prop
  const getGridClasses = () => {
    switch (columns) {
      case 'compact':
        return 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8'
      case 'wide':
        return 'grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
      case 'auto':
      default:
        return 'grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6'
    }
  }

  return (
    <div className={`grid ${getGridClasses()} gap-3 sm:gap-4 lg:gap-5`}>
      {videos.map((video, index) => (
        <Link
          key={video.id || video.slug || index}
          href={`/video/${video.id || video.slug}`}
          className="card overflow-hidden group thumbnail-hover focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-950"
          style={{ animationDelay: `${index * 50}ms` }}
        >
          {/* Thumbnail */}
          <div className="aspect-video bg-gray-800 relative overflow-hidden">
            {video.thumbnail ? (
              <img
                src={video.thumbnail}
                alt={video.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                loading="lazy"
                decoding="async"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-3xl sm:text-4xl text-gray-600">
                🎬
              </div>
            )}

            {/* Duration Badge */}
            {video.duration && (
              <span className="absolute bottom-1.5 right-1.5 sm:bottom-2 sm:right-2 bg-black/80 text-white text-[10px] sm:text-xs font-medium px-1.5 py-0.5 sm:px-2 sm:py-1 rounded">
                {formatDuration(video.duration)}
              </span>
            )}

            {/* Quality Badge */}
            {video.quality && (
              <span className="absolute top-1.5 left-1.5 sm:top-2 sm:left-2 bg-red-600 text-white text-[10px] sm:text-xs font-bold px-1.5 py-0.5 sm:px-2 sm:py-1 rounded">
                {video.quality}
              </span>
            )}

            {/* Play Icon Overlay - Hidden on touch devices, shown on hover for desktop */}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30 pointer-events-none">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-red-600/90 flex items-center justify-center transform group-hover:scale-110 transition-transform">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
            </div>

            {/* Touch feedback overlay for mobile */}
            <div className="absolute inset-0 bg-red-600/0 active:bg-red-600/20 transition-colors md:hidden" />
          </div>

          {/* Info */}
          <div className="p-2.5 sm:p-3">
            <h3 className="font-medium text-xs sm:text-sm line-clamp-2 group-hover:text-red-400 transition-colors mb-1.5 sm:mb-2 leading-tight">
              {video.title}
            </h3>
            
            <div className="flex items-center justify-between text-[10px] sm:text-xs text-gray-500 gap-2">
              <span className="flex items-center gap-1">
                <span className="hidden sm:inline">👁️</span>
                {formatViews(video.views)} views
              </span>
              {video.models && video.models.length > 0 && (
                <span className="truncate max-w-[80px] sm:max-w-[100px]">
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
