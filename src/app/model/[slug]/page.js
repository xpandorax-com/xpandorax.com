import { notFound } from 'next/navigation'
import Link from 'next/link'
import VideoGrid from '@/components/VideoGrid'
import Pagination from '@/components/Pagination'
import { getModelBySlug, getModelVideos } from '@/lib/data'
import { formatViews } from '@/utils/helpers'
import { PAGINATION } from '@/utils/config'

export async function generateMetadata({ params }) {
  const { slug } = await params
  const model = await getModelBySlug(slug)
  
  if (!model) {
    return { title: 'Model Not Found' }
  }
  
  return {
    title: model.name,
    description: model.bio || `View ${model.name}'s profile and videos on XpandoraX.`,
    openGraph: {
      title: model.name,
      description: model.bio,
      images: model.avatar ? [model.avatar] : [],
    },
  }
}

export default async function ModelPage({ params, searchParams }) {
  const { slug } = await params
  const { page = 1 } = await searchParams
  
  const model = await getModelBySlug(slug)
  
  if (!model) {
    notFound()
  }
  
  const { videos, total, totalPages } = await getModelVideos(slug, {
    page: parseInt(page),
    limit: PAGINATION.VIDEOS_PER_PAGE,
  })

  return (
    <div className="min-h-screen py-8 sm:py-12">
      <div className="container mx-auto px-4">
        {/* Profile Header */}
        <div className="card overflow-hidden mb-8">
          {/* Cover Image */}
          <div className="h-32 sm:h-48 lg:h-64 bg-gradient-to-r from-primary-600/30 via-surface-800 to-primary-600/30 relative">
            {model.coverImage && (
              <img
                src={model.coverImage}
                alt={`${model.name} cover`}
                className="w-full h-full object-cover"
              />
            )}
          </div>
          
          {/* Profile Info */}
          <div className="relative px-4 sm:px-6 lg:px-8 pb-6">
            {/* Avatar */}
            <div className="absolute -top-12 sm:-top-16 left-4 sm:left-6 lg:left-8">
              <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full border-4 border-surface-900 overflow-hidden bg-surface-800">
                {model.avatar ? (
                  <img
                    src={model.avatar}
                    alt={model.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <svg className="w-12 h-12 text-surface-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                )}
              </div>
              
              {model.isVerified && (
                <div className="absolute bottom-0 right-0 bg-primary-500 text-white p-1.5 rounded-full border-2 border-surface-900">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </div>
            
            {/* Details */}
            <div className="pt-14 sm:pt-20">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
                    {model.name}
                  </h1>
                  
                  <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-surface-400">
                    {model.nationality && (
                      <span className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {model.nationality}
                      </span>
                    )}
                    
                    {model.age && (
                      <span>{model.age} years old</span>
                    )}
                    
                    <span>{model.videoCount || 0} videos</span>
                    <span>{formatViews(model.totalViews || 0)} total views</span>
                  </div>
                </div>
                
                {/* Social Links */}
                {model.socialLinks && Object.keys(model.socialLinks).length > 0 && (
                  <div className="flex gap-2">
                    {model.socialLinks.twitter && (
                      <a
                        href={model.socialLinks.twitter}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-secondary p-2"
                        aria-label="Twitter"
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                        </svg>
                      </a>
                    )}
                    {model.socialLinks.instagram && (
                      <a
                        href={model.socialLinks.instagram}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-secondary p-2"
                        aria-label="Instagram"
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" />
                        </svg>
                      </a>
                    )}
                  </div>
                )}
              </div>
              
              {/* Bio */}
              {model.bio && (
                <p className="text-surface-400 mt-4 max-w-3xl">{model.bio}</p>
              )}
              
              {/* Physical Details */}
              {(model.height || model.measurements || model.hairColor || model.eyeColor) && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-surface-700">
                  {model.height && (
                    <div>
                      <span className="text-surface-500 text-sm">Height</span>
                      <p className="font-medium">{model.height}</p>
                    </div>
                  )}
                  {model.measurements && (
                    <div>
                      <span className="text-surface-500 text-sm">Measurements</span>
                      <p className="font-medium">{model.measurements}</p>
                    </div>
                  )}
                  {model.hairColor && (
                    <div>
                      <span className="text-surface-500 text-sm">Hair Color</span>
                      <p className="font-medium capitalize">{model.hairColor}</p>
                    </div>
                  )}
                  {model.eyeColor && (
                    <div>
                      <span className="text-surface-500 text-sm">Eye Color</span>
                      <p className="font-medium capitalize">{model.eyeColor}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Videos Section */}
        <div>
          <h2 className="text-xl sm:text-2xl font-bold mb-6">Videos ({total})</h2>
          
          {videos.length > 0 ? (
            <>
              <VideoGrid videos={videos} />
              
              {totalPages > 1 && (
                <div className="mt-10">
                  <Pagination
                    currentPage={parseInt(page)}
                    totalPages={totalPages}
                    basePath={`/model/${slug}`}
                  />
                </div>
              )}
            </>
          ) : (
            <div className="card p-8 text-center">
              <p className="text-surface-400">No videos available for this model.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
