import Link from 'next/link'
import { getModels } from '@/lib/data'

export const metadata = {
  title: 'Models',
  description: 'Browse our collection of professional models.',
}

export default async function ModelsPage({ searchParams }) {
  const params = await searchParams
  const page = parseInt(params?.page) || 1
  const sort = params?.sort || 'popular'
  const search = params?.q || ''

  const { models, totalPages, totalCount } = await getModels({
    page,
    limit: 24,
    sort,
    search,
  })

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            <span className="text-red-500">👤</span> Models
          </h1>
          <p className="text-gray-400">
            Showing {models.length} of {totalCount} models
          </p>
        </div>

        {/* Search and Sort */}
        <div className="flex flex-wrap gap-4 mb-8">
          <form action="/models" method="get" className="flex-1 md:max-w-md">
            <input
              type="text"
              name="q"
              defaultValue={search}
              placeholder="Search models..."
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:border-red-500"
            />
          </form>

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
            <option value="popular">Most Popular</option>
            <option value="videos">Most Videos</option>
            <option value="name">Name A-Z</option>
            <option value="latest">Newest</option>
          </select>
        </div>

        {/* Models Grid */}
        {models.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {models.map((model) => (
              <Link
                key={model.slug}
                href={`/model/${model.slug}`}
                className="card overflow-hidden group"
              >
                <div className="aspect-[3/4] bg-gray-800 relative">
                  {model.avatar ? (
                    <img
                      src={model.avatar}
                      alt={model.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-5xl text-gray-600">
                      👤
                    </div>
                  )}
                  {model.verified && (
                    <div className="absolute top-2 right-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                      ✓ Verified
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-semibold truncate group-hover:text-red-400 transition-colors">
                    {model.name}
                  </h3>
                  <p className="text-sm text-gray-500">{model.videoCount || 0} videos</p>
                  {model.country && (
                    <p className="text-sm text-gray-600 mt-1">{model.country}</p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-gray-400 text-lg">No models found.</p>
            <Link href="/models" className="text-red-500 hover:text-red-400 mt-2 inline-block">
              Clear search
            </Link>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-12">
            {page > 1 && (
              <Link
                href={`/models?page=${page - 1}&sort=${sort}${search ? `&q=${search}` : ''}`}
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
                href={`/models?page=${page + 1}&sort=${sort}${search ? `&q=${search}` : ''}`}
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
