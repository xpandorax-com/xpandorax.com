import VideoGrid from '@/components/VideoGrid'
import Pagination from '@/components/Pagination'
import { searchVideos } from '@/lib/data'
import { PAGINATION } from '@/utils/config'

export const metadata = {
  title: 'Search',
  description: 'Search for videos, models, and content on XpandoraX.',
}

export default async function SearchPage({ searchParams }) {
  const params = await searchParams
  const query = params.q || ''
  const page = parseInt(params.page) || 1
  
  let result = { videos: [], total: 0, totalPages: 0 }
  
  if (query.trim()) {
    result = await searchVideos(query, {
      page,
      limit: PAGINATION.VIDEOS_PER_PAGE,
    })
  }
  
  const { videos, total, totalPages } = result

  return (
    <div className="min-h-screen py-8 sm:py-12">
      <div className="container mx-auto px-4">
        {/* Search Header */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold mb-6">Search</h1>
          
          {/* Search Form */}
          <form action="/search" method="GET" className="max-w-2xl">
            <div className="relative">
              <input
                type="text"
                name="q"
                placeholder="Search videos, models, categories..."
                defaultValue={query}
                autoFocus
                className="w-full bg-surface-800 border border-surface-700 rounded-xl pl-12 pr-4 py-4 text-white placeholder-surface-500 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 text-lg"
              />
              <svg 
                className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-500" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 btn-primary px-6 py-2"
              >
                Search
              </button>
            </div>
          </form>
        </div>

        {/* Results */}
        {query.trim() ? (
          <>
            <div className="mb-6">
              <h2 className="text-lg text-surface-400">
                {total > 0 ? (
                  <>Found <span className="text-white font-medium">{total}</span> results for "<span className="text-white">{query}</span>"</>
                ) : (
                  <>No results found for "<span className="text-white">{query}</span>"</>
                )}
              </h2>
            </div>

            {videos.length > 0 ? (
              <>
                <VideoGrid videos={videos} />
                
                {totalPages > 1 && (
                  <div className="mt-10">
                    <Pagination
                      currentPage={page}
                      totalPages={totalPages}
                      basePath="/search"
                      queryParams={{ q: query }}
                    />
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-16">
                <svg className="w-16 h-16 text-surface-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h2 className="text-xl font-semibold mb-2">No Results Found</h2>
                <p className="text-surface-400 mb-6">Try adjusting your search terms or browse our categories.</p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <a href="/videos" className="btn-primary px-6 py-2">
                    Browse Videos
                  </a>
                  <a href="/categories" className="btn-secondary px-6 py-2">
                    View Categories
                  </a>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-16">
            <svg className="w-16 h-16 text-surface-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <h2 className="text-xl font-semibold mb-2">Search XpandoraX</h2>
            <p className="text-surface-400">Enter a search term to find videos, models, and more.</p>
          </div>
        )}

        {/* Popular Searches */}
        {!query.trim() && (
          <div className="mt-12">
            <h3 className="text-lg font-semibold mb-4">Popular Searches</h3>
            <div className="flex flex-wrap gap-2">
              {['Amateur', 'Professional', 'HD', 'New', 'Popular', 'Trending'].map((term) => (
                <a
                  key={term}
                  href={`/search?q=${encodeURIComponent(term)}`}
                  className="bg-surface-800 hover:bg-surface-700 px-4 py-2 rounded-full text-sm transition-colors"
                >
                  {term}
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
