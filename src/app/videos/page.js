import Link from 'next/link'
import VideoGrid from '@/components/VideoGrid'
import SearchForm from '@/components/SearchForm'
import { getVideos, getCategories } from '@/lib/data'

export const metadata = {
  title: 'Videos',
  description: 'Browse our collection of premium adult videos.',
}

export default async function VideosPage({ searchParams }) {
  const params = await searchParams
  const page = parseInt(params?.page) || 1
  const sort = params?.sort || 'latest'
  const category = params?.category || ''
  const search = params?.q || ''

  const { videos, totalPages, totalCount } = await getVideos({
    page,
    limit: 24,
    sort,
    category,
    search,
  })

  const categories = await getCategories()

  const sortOptions = [
    { value: 'latest', label: 'Latest' },
    { value: 'popular', label: 'Most Popular' },
    { value: 'trending', label: 'Trending' },
    { value: 'views', label: 'Most Viewed' },
    { value: 'duration', label: 'Longest' },
  ]

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            <span className="text-red-500">🎥</span> Videos
          </h1>
          <p className="text-gray-400">
            Showing {videos.length} of {totalCount} videos
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-8">
          {/* Search */}
          <div className="w-full md:w-auto flex-1 md:max-w-md">
            <SearchForm placeholder="Search videos..." defaultValue={search} />
          </div>

          {/* Sort Dropdown */}
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
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          {/* Category Filter */}
          <select
            defaultValue={category}
            onChange={(e) => {
              const url = new URL(window.location.href)
              if (e.target.value) {
                url.searchParams.set('category', e.target.value)
              } else {
                url.searchParams.delete('category')
              }
              url.searchParams.delete('page')
              window.location.href = url.toString()
            }}
            className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:border-red-500"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.slug} value={cat.slug}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* Video Grid */}
        {videos.length > 0 ? (
          <VideoGrid videos={videos} />
        ) : (
          <div className="text-center py-16">
            <p className="text-gray-400 text-lg">No videos found.</p>
            <Link href="/videos" className="text-red-500 hover:text-red-400 mt-2 inline-block">
              Clear filters
            </Link>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-12">
            {page > 1 && (
              <Link
                href={`/videos?page=${page - 1}&sort=${sort}${category ? `&category=${category}` : ''}${search ? `&q=${search}` : ''}`}
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
                href={`/videos?page=${page + 1}&sort=${sort}${category ? `&category=${category}` : ''}${search ? `&q=${search}` : ''}`}
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
