import { notFound } from 'next/navigation'
import VideoGrid from '@/components/VideoGrid'
import Pagination from '@/components/Pagination'
import SortSelect from '@/components/SortSelect'
import { getCategoryBySlug, getCategoryVideos } from '@/lib/data'
import { SORT_OPTIONS, PAGINATION } from '@/utils/config'

export async function generateMetadata({ params }) {
  const { slug } = await params
  const category = await getCategoryBySlug(slug)
  
  if (!category) {
    return { title: 'Category Not Found' }
  }
  
  return {
    title: category.name,
    description: category.description || `Browse ${category.name} videos on XpandoraX.`,
  }
}

export default async function CategoryPage({ params, searchParams }) {
  const { slug } = await params
  const { page = 1, sort = 'latest' } = await searchParams
  
  const category = await getCategoryBySlug(slug)
  
  if (!category) {
    notFound()
  }
  
  const { videos, total, totalPages } = await getCategoryVideos(slug, {
    page: parseInt(page),
    sort,
    limit: PAGINATION.VIDEOS_PER_PAGE,
  })

  return (
    <div className="min-h-screen py-8 sm:py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div>
              <nav className="text-sm text-surface-400 mb-2">
                <a href="/categories" className="hover:text-white transition-colors">Categories</a>
                <span className="mx-2">/</span>
                <span className="text-white">{category.name}</span>
              </nav>
              <h1 className="text-2xl sm:text-3xl font-bold">{category.name}</h1>
              {category.description && (
                <p className="text-surface-400 mt-2 max-w-2xl">{category.description}</p>
              )}
              <p className="text-surface-500 mt-2">{total} videos</p>
            </div>
            
            <SortSelect currentSort={sort} options={SORT_OPTIONS.VIDEOS} />
          </div>
        </div>

        {/* Videos Grid */}
        {videos.length > 0 ? (
          <>
            <VideoGrid videos={videos} />
            
            {totalPages > 1 && (
              <div className="mt-10">
                <Pagination
                  currentPage={parseInt(page)}
                  totalPages={totalPages}
                  basePath={`/category/${slug}`}
                  queryParams={{ sort }}
                />
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-16">
            <svg className="w-16 h-16 text-surface-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            <h2 className="text-xl font-semibold mb-2">No Videos Found</h2>
            <p className="text-surface-400">No videos in this category yet.</p>
          </div>
        )}
      </div>
    </div>
  )
}
