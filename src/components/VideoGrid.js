import Link from 'next/link'
import { formatDuration, formatViews } from '@/utils/helpers'

function VideoSkeleton() {
  return (
    <div className="card overflow-hidden animate-pulse">
      <div className="aspect-video bg-surface-800" />
      <div className="p-3">
        <div className="h-4 bg-surface-800 rounded mb-2" />
        <div className="h-3 bg-surface-800 rounded w-2/3" />
      </div>
    </div>
  )
}

function EmptyState() {
  return (
    <div className="text-center py-12 px-4">
      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-surface-800 flex items-center justify-center">
        <svg className="w-8 h-8 text-surface-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      </div>
      <p className="text-surface-400 text-lg">No videos found</p>
      <p className="text-surface-500 text-sm mt-2">Try adjusting your search or filters</p>
    </div>
  )
}

function VideoCard({ video, index }) {
  const href = `/video/${video.id || video.slug}`
  
  return (
    <Link
      href={href}
      className="card overflow-hidden group focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-950 animate-fade-in"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      {/* Thumbnail */}
      <div className="aspect-video bg-surface-800 relative overflow-hidden">
        {video.thumbnail ? (
          <img
            src={video.thumbnail}
            alt={video.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
            decoding="async"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg className="w-12 h-12 text-surface-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </div>
        )}

        {/* Duration Badge */}
        {video.duration > 0 && (
          <span className="absolute bottom-1.5 right-1.5 sm:bottom-2 sm:right-2 bg-black/80 text-white text-xs font-medium px-1.5 py-0.5 sm:px-2 sm:py-1 rounded">
            {formatDuration(video.duration)}
          </span>
        )}

        {/* Quality Badge */}
        {video.quality && (
          <span className="absolute top-1.5 left-1.5 sm:top-2 sm:left-2 bg-primary-600 text-white text-xs font-bold px-1.5 py-0.5 sm:px-2 sm:py-1 rounded">
            {video.quality}
          </span>
        )}

        {/* Play Overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-primary-600/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity transform scale-75 group-hover:scale-100">
            <svg className="w-6 h-6 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="p-3">
        <h3 className="font-medium text-sm sm:text-base line-clamp-2 group-hover:text-primary-400 transition-colors">
          {video.title}
        </h3>
        <div className="flex items-center gap-2 mt-2 text-xs sm:text-sm text-surface-400">
          <span>{formatViews(video.views)} views</span>
          {video.models?.[0] && (
            <>
              <span className="text-surface-600">|</span>
              <span className="truncate">{video.models[0].name}</span>
            </>
          )}
        </div>
      </div>
    </Link>
  )
}

export default function VideoGrid({ videos = [], columns = 'auto', loading = false }) {
  if (loading) {
    return (
      <div className={`grid ${getGridClasses(columns)} gap-3 sm:gap-4 lg:gap-5`}>
        {Array.from({ length: 12 }).map((_, index) => (
          <VideoSkeleton key={index} />
        ))}
      </div>
    )
  }

  if (!videos.length) {
    return <EmptyState />
  }

  return (
    <div className={`grid ${getGridClasses(columns)} gap-3 sm:gap-4 lg:gap-5`}>
      {videos.map((video, index) => (
        <VideoCard
          key={video.id || video.slug || index}
          video={video}
          index={index}
        />
      ))}
    </div>
  )
}

function getGridClasses(columns) {
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
