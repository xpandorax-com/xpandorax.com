import Link from 'next/link'
import VideoGrid from '@/components/VideoGrid'
import { getCategoryBySlug, getCategoryVideos } from '@/lib/data'
import { notFound } from 'next/navigation'

export async function generateMetadata({ params }) {
  const { slug } = await params
  const category = await getCategoryBySlug(slug)
  
  if (!category) {
    return { title: 'Category Not Found' }
  }

  return {
    title: category.name,
    description: category.description || `Browse ${category.name} videos on XpandoraX`,
  }
}

export default async function CategoryPage({ params, searchParams }) {
  const { slug } = await params
  const searchParamsResolved = await searchParams
  const page = parseInt(searchParamsResolved?.page) || 1
  const sort = searchParamsResolved?.sort || 'latest'

  const category = await getCategoryBySlug(slug)

  if (!category) {
    notFound()
  }

  const { videos, totalPages, totalCount } = await getCategoryVideos(slug, {
    page,
    limit: 24,
    sort,
  })

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        {/* Category Header */}
        <div className="card p-6 mb-8">
          <div className="flex items-center gap-4 mb-4">
            <span className="text-4xl">{category.icon || '📁'}</span>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">{category.name}</h1>
              <p className="text-gray-400">{totalCount} videos</p>
            </div>
          </div>
          {category.description && (
            <p className="text-gray-400">{category.description}</p>
          )}
        </div>

        {/* Sort Options */}
        <div className="flex justify-between items-center mb-6">
          <p className="text-gray-400">
            Showing page {page} of {totalPages}
          </p>
          <select
            defaultValue={sort}
            onChange={(e) => {
              const url = new URL(window.location.href)
              url.searchParams.set('sort', e.target.value)
              url.searchParams.delete('page')
              window.location.href = url.toString()
            }}
            className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:border-red-500"
          >
            <option value="latest">Latest</option>
            <option value="popular">Most Popular</option>
            <option value="views">Most Viewed</option>
            <option value="duration">Longest</option>
          </select>
        </div>

        {/* Videos */}
        {videos.length > 0 ? (
          <VideoGrid videos={videos} />
        ) : (
          <div className="text-center py-16">
            <p className="text-gray-400 text-lg">No videos in this category yet.</p>
            <Link href="/videos" className="text-red-500 hover:text-red-400 mt-2 inline-block">
              Browse all videos
            </Link>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-12">
            {page > 1 && (
              <Link
                href={`/category/${slug}?page=${page - 1}&sort=${sort}`}
                className="btn-secondary px-4 py-2"
              >
                ← Previous
              </Link>
            )}
            
            <span className="flex items-center px-4 text-gray-400">
              Page {page} of {totalPages}
            </span>

            {page < totalPages && (
              <Link
                href={`/category/${slug}?page=${page + 1}&sort=${sort}`}
                className="btn-secondary px-4 py-2"
              >
                Next →
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
