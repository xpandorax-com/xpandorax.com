import Link from 'next/link'
import { getProducers } from '@/lib/data'

export const metadata = {
  title: 'Producers & Studios',
  description: 'Browse content from professional studios and producers.',
}

export default async function ProducersPage({ searchParams }) {
  const params = await searchParams
  const page = parseInt(params?.page) || 1
  const sort = params?.sort || 'popular'

  const { producers, totalPages, totalCount } = await getProducers({
    page,
    limit: 24,
    sort,
  })

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            <span className="text-red-500">🏢</span> Studios & Producers
          </h1>
          <p className="text-gray-400">
            Discover content from {totalCount} professional studios
          </p>
        </div>

        {/* Sort */}
        <div className="flex justify-end mb-6">
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

        {/* Producers Grid */}
        {producers.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {producers.map((producer) => (
              <Link
                key={producer.slug}
                href={`/producer/${producer.slug}`}
                className="card overflow-hidden group"
              >
                <div className="aspect-video bg-gray-800 relative">
                  {producer.banner ? (
                    <img
                      src={producer.banner}
                      alt={producer.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
                      <span className="text-4xl">🏢</span>
                    </div>
                  )}
                  {producer.logo && (
                    <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                      <img
                        src={producer.logo}
                        alt={producer.name}
                        className="h-8 object-contain"
                      />
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-lg mb-1 group-hover:text-red-400 transition-colors">
                    {producer.name}
                  </h3>
                  <p className="text-sm text-gray-500">{producer.videoCount || 0} videos</p>
                  {producer.description && (
                    <p className="text-sm text-gray-400 mt-2 line-clamp-2">
                      {producer.description}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-gray-400 text-lg">No producers found.</p>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-12">
            {page > 1 && (
              <Link
                href={`/producers?page=${page - 1}&sort=${sort}`}
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
                href={`/producers?page=${page + 1}&sort=${sort}`}
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
