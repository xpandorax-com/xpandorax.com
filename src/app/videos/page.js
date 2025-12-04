import { getVideos } from '@/lib/data'
import VideoGrid from '@/components/VideoGrid'
import Pagination from '@/components/Pagination'
import SortSelect from '@/components/SortSelect'
import { SORT_OPTIONS, PAGINATION } from '@/utils/config'

export const metadata = {
  title: 'Videos',
  description: 'Browse our collection of premium adult videos from top studios and professional models.',
}

export default async function VideosPage({ searchParams }) {
  const params = await searchParams
  const page = parseInt(params.page) || 1
  const sort = params.sort || 'latest'
  const filter = params.filter || null
  
  const { videos, total, totalPages } = await getVideos({
    page,
    sort,
    filter,
    limit: PAGINATION.VIDEOS_PER_PAGE,
  })

  const getPageTitle = () => {
    if (filter === 'featured') return 'Featured Videos'
    if (sort === 'trending') return 'Trending Videos'
    if (sort === 'popular') return 'Popular Videos'
    return 'All Videos'
  }

  return (
    <div className="min-h-screen py-8 sm:py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">{getPageTitle()}</h1>
            <p className="text-surface-400 mt-1">{total} videos available</p>
          </div>
          <SortSelect currentSort={sort} options={SORT_OPTIONS.VIDEOS} />
        </div>

        {/* Filter Tags */}
        {filter && (
          <div className="mb-6">
            <div className="inline-flex items-center gap-2 bg-surface-800 px-3 py-1.5 rounded-full">
              <span className="text-sm text-surface-300">Filter: {filter}</span>
              <a 
                href="/videos" 
                className="w-5 h-5 flex items-center justify-center bg-surface-700 hover:bg-surface-600 rounded-full text-surface-400 hover:text-white transition-colors"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </a>
            </div>
          </div>
        )}

        {/* Video Grid */}
        <VideoGrid videos={videos} />

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-10">
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              basePath="/videos"
              queryParams={{ sort, filter }}
            />
          </div>
        )}
      </div>
    </div>
  )
}
