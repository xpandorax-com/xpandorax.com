import Link from 'next/link'
import { getModels, searchModels } from '@/lib/data'
import Pagination from '@/components/Pagination'
import { PAGINATION } from '@/utils/config'

export const metadata = {
  title: 'Models',
  description: 'Browse professional adult models on XpandoraX. View profiles, photos, and videos.',
}

export default async function ModelsPage({ searchParams }) {
  const params = await searchParams
  const page = parseInt(params.page) || 1
  const query = params.q || ''
  const sort = params.sort || 'popular'
  
  let result
  if (query) {
    result = await searchModels(query, { page, limit: PAGINATION.MODELS_PER_PAGE })
  } else {
    result = await getModels({ page, sort, limit: PAGINATION.MODELS_PER_PAGE })
  }
  
  const { models, total, totalPages } = result

  return (
    <div className="min-h-screen py-8 sm:py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">
              {query ? `Search: "${query}"` : 'All Models'}
            </h1>
            <p className="text-surface-400 mt-1">{total} models</p>
          </div>
          
          {/* Search and Sort */}
          <div className="flex flex-col sm:flex-row gap-3">
            <form action="/models" method="GET" className="relative">
              <input
                type="text"
                name="q"
                placeholder="Search models..."
                defaultValue={query}
                className="w-full sm:w-64 bg-surface-800 border border-surface-700 rounded-lg pl-10 pr-4 py-2 text-white placeholder-surface-500 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
              />
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </form>
            
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
        </div>

        {/* Models Grid */}
        {models.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
            {models.map((model) => (
              <Link
                key={model.slug}
                href={`/model/${model.slug}`}
                className="card overflow-hidden group"
              >
                <div className="aspect-[3/4] bg-surface-800 relative">
                  {model.avatar ? (
                    <img
                      src={model.avatar}
                      alt={model.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <svg className="w-16 h-16 text-surface-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                  )}
                  
                  {/* Verified Badge */}
                  {model.isVerified && (
                    <div className="absolute top-2 right-2 bg-primary-500 text-white p-1 rounded-full">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </div>
                
                <div className="p-3 sm:p-4">
                  <h2 className="font-semibold truncate group-hover:text-primary-400 transition-colors">
                    {model.name}
                  </h2>
                  <div className="flex items-center justify-between mt-1 text-xs sm:text-sm text-surface-400">
                    <span>{model.videoCount || 0} videos</span>
                    {model.nationality && (
                      <span className="truncate ml-2">{model.nationality}</span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <svg className="w-16 h-16 text-surface-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <h2 className="text-xl font-semibold mb-2">No Models Found</h2>
            <p className="text-surface-400 mb-6">
              {query ? `No models matching "${query}"` : 'No models available at this time.'}
            </p>
            {query && (
              <Link href="/models" className="btn-primary px-6 py-2">
                View All Models
              </Link>
            )}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-10">
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              basePath="/models"
              queryParams={{ q: query, sort }}
            />
          </div>
        )}
      </div>
    </div>
  )
}
