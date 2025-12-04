import Link from 'next/link'
import { getProducers } from '@/lib/data'
import Pagination from '@/components/Pagination'
import { PAGINATION } from '@/utils/config'

export const metadata = {
  title: 'Studios',
  description: 'Browse professional adult content studios and producers on XpandoraX.',
}

export default async function ProducersPage({ searchParams }) {
  const params = await searchParams
  const page = parseInt(params.page) || 1
  const sort = params.sort || 'popular'
  
  const { producers, total, totalPages } = await getProducers({
    page,
    sort,
    limit: PAGINATION.PRODUCERS_PER_PAGE,
  })

  return (
    <div className="min-h-screen py-8 sm:py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Studios</h1>
            <p className="text-surface-400 mt-1">{total} studios</p>
          </div>
          
          <select
            defaultValue={sort}
            onChange={(e) => {
              const url = new URL(window.location.href)
              url.searchParams.set('sort', e.target.value)
              window.location.href = url.toString()
            }}
            className="bg-surface-800 border border-surface-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary-500"
          >
            <option value="popular">Most Popular</option>
            <option value="latest">Recently Added</option>
            <option value="name">Alphabetical</option>
          </select>
        </div>

        {/* Producers Grid */}
        {producers.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {producers.map((producer) => (
              <Link
                key={producer.slug}
                href={`/producer/${producer.slug}`}
                className="card overflow-hidden group"
              >
                {/* Banner/Logo */}
                <div className="h-32 bg-gradient-to-r from-primary-600/20 via-surface-800 to-primary-600/20 relative">
                  {producer.bannerImage ? (
                    <img
                      src={producer.bannerImage}
                      alt={`${producer.name} banner`}
                      className="w-full h-full object-cover"
                    />
                  ) : null}
                  
                  {/* Logo */}
                  <div className="absolute -bottom-6 left-4 w-12 h-12 rounded-lg border-2 border-surface-900 overflow-hidden bg-surface-800">
                    {producer.logo ? (
                      <img
                        src={producer.logo}
                        alt={producer.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <svg className="w-6 h-6 text-surface-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                      </div>
                    )}
                  </div>
                  
                  {/* Verified Badge */}
                  {producer.isVerified && (
                    <div className="absolute top-2 right-2 bg-primary-500 text-white p-1 rounded-full">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </div>
                
                <div className="p-4 pt-8">
                  <h2 className="font-semibold text-lg group-hover:text-primary-400 transition-colors">
                    {producer.name}
                  </h2>
                  
                  {producer.description && (
                    <p className="text-surface-400 text-sm mt-2 line-clamp-2">
                      {producer.description}
                    </p>
                  )}
                  
                  <div className="flex items-center gap-4 mt-4 text-sm text-surface-400">
                    <span>{producer.videoCount || 0} videos</span>
                    <span>{producer.modelCount || 0} models</span>
                  </div>
                  
                  {producer.website && (
                    <div className="mt-3">
                      <span className="text-xs text-primary-400">{producer.website}</span>
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <svg className="w-16 h-16 text-surface-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <h2 className="text-xl font-semibold mb-2">No Studios Found</h2>
            <p className="text-surface-400">No studios available at this time.</p>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-10">
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              basePath="/producers"
              queryParams={{ sort }}
            />
          </div>
        )}
      </div>
    </div>
  )
}
