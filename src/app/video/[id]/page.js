import { notFound } from 'next/navigation'
import Link from 'next/link'
import VideoPlayer from '@/components/VideoPlayer'
import VideoGrid from '@/components/VideoGrid'
import { getVideoById, getRelatedVideos } from '@/lib/data'
import { formatViews, formatRelativeTime, formatDuration } from '@/utils/helpers'

export async function generateMetadata({ params }) {
  const { id } = await params
  const video = await getVideoById(id)
  
  if (!video) {
    return { title: 'Video Not Found' }
  }
  
  return {
    title: video.title,
    description: video.description || `Watch ${video.title} on XpandoraX.`,
    openGraph: {
      title: video.title,
      description: video.description,
      type: 'video.other',
      images: video.thumbnail ? [video.thumbnail] : [],
    },
  }
}

export default async function VideoPage({ params }) {
  const { id } = await params
  const video = await getVideoById(id)
  
  if (!video) {
    notFound()
  }
  
  const relatedVideos = await getRelatedVideos(video.id, 8)

  return (
    <div className="min-h-screen py-4 sm:py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Video Player */}
            <VideoPlayer
              src={video.videoUrl}
              poster={video.thumbnail}
              title={video.title}
            />
            
            {/* Video Info */}
            <div className="space-y-4">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold">{video.title}</h1>
              
              <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-surface-400 text-sm">
                <span className="flex items-center gap-1.5">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  {formatViews(video.views)} views
                </span>
                
                <span className="flex items-center gap-1.5">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {formatDuration(video.duration)}
                </span>
                
                <span className="flex items-center gap-1.5">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {formatRelativeTime(video.publishedAt)}
                </span>
                
                {video.quality && (
                  <span className="bg-primary-600 text-white px-2 py-0.5 rounded text-xs font-medium">
                    {video.quality}
                  </span>
                )}
              </div>
              
              {/* Models */}
              {video.models?.length > 0 && (
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-surface-400 text-sm">Models:</span>
                  {video.models.map((model) => (
                    <Link
                      key={model.slug}
                      href={`/model/${model.slug}`}
                      className="bg-surface-800 hover:bg-surface-700 px-3 py-1 rounded-full text-sm transition-colors"
                    >
                      {model.name}
                    </Link>
                  ))}
                </div>
              )}
              
              {/* Categories */}
              {video.categories?.length > 0 && (
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-surface-400 text-sm">Categories:</span>
                  {video.categories.map((category) => (
                    <Link
                      key={category.slug}
                      href={`/category/${category.slug}`}
                      className="bg-surface-800 hover:bg-surface-700 px-3 py-1 rounded-full text-sm transition-colors"
                    >
                      {category.name}
                    </Link>
                  ))}
                </div>
              )}
              
              {/* Producer/Studio */}
              {video.producer && (
                <div className="flex items-center gap-2">
                  <span className="text-surface-400 text-sm">Studio:</span>
                  <Link
                    href={`/producer/${video.producer.slug}`}
                    className="text-primary-400 hover:text-primary-300 text-sm transition-colors"
                  >
                    {video.producer.name}
                  </Link>
                </div>
              )}
              
              {/* Description */}
              {video.description && (
                <div className="card p-4">
                  <h2 className="font-semibold mb-2">Description</h2>
                  <p className="text-surface-400 text-sm whitespace-pre-line">{video.description}</p>
                </div>
              )}
              
              {/* Tags */}
              {video.tags?.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {video.tags.map((tag) => (
                    <Link
                      key={tag}
                      href={`/search?q=${encodeURIComponent(tag)}`}
                      className="text-surface-400 hover:text-white text-xs transition-colors"
                    >
                      #{tag}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          {/* Sidebar - Related Videos */}
          <div className="lg:col-span-1">
            <h2 className="text-lg font-bold mb-4">Related Videos</h2>
            <div className="space-y-4">
              {relatedVideos.map((relatedVideo) => (
                <Link
                  key={relatedVideo.id}
                  href={`/video/${relatedVideo.id}`}
                  className="flex gap-3 group"
                >
                  <div className="w-32 sm:w-40 flex-shrink-0">
                    <div className="aspect-video bg-surface-800 rounded-lg overflow-hidden relative">
                      {relatedVideo.thumbnail ? (
                        <img
                          src={relatedVideo.thumbnail}
                          alt={relatedVideo.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <svg className="w-8 h-8 text-surface-600" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z" />
                          </svg>
                        </div>
                      )}
                      <div className="absolute bottom-1 right-1 bg-black/80 text-white text-xs px-1.5 py-0.5 rounded">
                        {formatDuration(relatedVideo.duration)}
                      </div>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-sm line-clamp-2 group-hover:text-primary-400 transition-colors">
                      {relatedVideo.title}
                    </h3>
                    <p className="text-surface-500 text-xs mt-1">{formatViews(relatedVideo.views)} views</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
