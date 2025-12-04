import { notFound } from 'next/navigation'
import Link from 'next/link'
import VideoGrid from '@/components/VideoGrid'
import Pagination from '@/components/Pagination'
import { getProducerBySlug, getProducerVideos } from '@/lib/data'
import { formatViews } from '@/utils/helpers'
import { PAGINATION } from '@/utils/config'

export async function generateMetadata({ params }) {
  const { slug } = await params
  const producer = await getProducerBySlug(slug)
  
  if (!producer) {
    return { title: 'Studio Not Found' }
  }
  
  return {
    title: producer.name,
    description: producer.description || `View content from ${producer.name} on XpandoraX.`,
    openGraph: {
      title: producer.name,
      description: producer.description,
      images: producer.logo ? [producer.logo] : [],
    },
  }
}

export default async function ProducerPage({ params, searchParams }) {
  const { slug } = await params
  const { page = 1 } = await searchParams
  
  const producer = await getProducerBySlug(slug)
  
  if (!producer) {
    notFound()
  }
  
  const { videos, total, totalPages } = await getProducerVideos(slug, {
    page: parseInt(page),
    limit: PAGINATION.VIDEOS_PER_PAGE,
  })

  return (
    <div className="min-h-screen py-8 sm:py-12">
      <div className="container mx-auto px-4">
        {/* Profile Header */}
        <div className="card overflow-hidden mb-8">
          {/* Banner */}
          <div className="h-32 sm:h-48 lg:h-56 bg-gradient-to-r from-primary-600/20 via-surface-800 to-primary-600/20 relative">
            {producer.bannerImage && (
              <img
                src={producer.bannerImage}
                alt={`${producer.name} banner`}
                className="w-full h-full object-cover"
              />
            )}
          </div>
          
          {/* Info */}
          <div className="relative px-4 sm:px-6 lg:px-8 pb-6">
            {/* Logo */}
            <div className="absolute -top-10 sm:-top-12 left-4 sm:left-6 lg:left-8">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl border-4 border-surface-900 overflow-hidden bg-surface-800">
                {producer.logo ? (
                  <img
                    src={producer.logo}
                    alt={producer.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <svg className="w-10 h-10 text-surface-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                )}
              </div>
              
              {producer.isVerified && (
                <div className="absolute -bottom-1 -right-1 bg-primary-500 text-white p-1.5 rounded-full border-2 border-surface-900">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </div>
            
            {/* Details */}
            <div className="pt-12 sm:pt-16">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold">{producer.name}</h1>
                  
                  <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-surface-400">
                    <span>{producer.videoCount || 0} videos</span>
                    <span>{producer.modelCount || 0} models</span>
                    <span>{formatViews(producer.totalViews || 0)} total views</span>
                  </div>
                </div>
                
                {/* Website Link */}
                {producer.website && (
                  <a
                    href={producer.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary px-4 py-2 inline-flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    Visit Website
                  </a>
                )}
              </div>
              
              {/* Description */}
              {producer.description && (
                <p className="text-surface-400 mt-4 max-w-3xl">{producer.description}</p>
              )}
              
              {/* Contact Info */}
              {producer.contactEmail && (
                <div className="mt-4 pt-4 border-t border-surface-700">
                  <span className="text-surface-500 text-sm">Contact: </span>
                  <a href={`mailto:${producer.contactEmail}`} className="text-primary-400 hover:text-primary-300 text-sm">
                    {producer.contactEmail}
                  </a>
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
                    basePath={`/producer/${slug}`}
                  />
                </div>
              )}
            </>
          ) : (
            <div className="card p-8 text-center">
              <p className="text-surface-400">No videos available from this studio.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
