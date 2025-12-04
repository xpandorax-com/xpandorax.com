import Link from 'next/link'
import VideoGrid from '@/components/VideoGrid'
import { searchVideos, searchModels } from '@/lib/data'

export const metadata = {
  title: 'Search Results',
  description: 'Search for videos and models.',
}

export default async function SearchPage({ searchParams }) {
  const params = await searchParams
  const query = params?.q || ''
  const type = params?.type || 'all'

  if (!query) {
    return (
      <div className="min-h-screen py-8">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-3xl font-bold mb-4">Search</h1>
          <p className="text-gray-400 mb-8">Enter a search term to find videos and models.</p>
          <form action="/search" method="get" className="max-w-md mx-auto">
            <input
              type="text"
              name="q"
              placeholder="Search..."
              autoFocus
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-red-500"
            />
          </form>
        </div>
      </div>
    )
  }

  const [videoResults, modelResults] = await Promise.all([
    type === 'all' || type === 'videos' ? searchVideos(query, 12) : { videos: [], total: 0 },
    type === 'all' || type === 'models' ? searchModels(query, 8) : { models: [], total: 0 },
  ])

  const totalResults = videoResults.total + modelResults.total

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            Search Results for &quot;{query}&quot;
          </h1>
          <p className="text-gray-400">
            Found {totalResults} results
          </p>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-8">
          <Link
            href={`/search?q=${encodeURIComponent(query)}&type=all`}
            className={`px-4 py-2 rounded-lg transition-colors ${
              type === 'all' ? 'bg-red-600 text-white' : 'bg-gray-800 hover:bg-gray-700'
            }`}
          >
            All
          </Link>
          <Link
            href={`/search?q=${encodeURIComponent(query)}&type=videos`}
            className={`px-4 py-2 rounded-lg transition-colors ${
              type === 'videos' ? 'bg-red-600 text-white' : 'bg-gray-800 hover:bg-gray-700'
            }`}
          >
            Videos ({videoResults.total})
          </Link>
          <Link
            href={`/search?q=${encodeURIComponent(query)}&type=models`}
            className={`px-4 py-2 rounded-lg transition-colors ${
              type === 'models' ? 'bg-red-600 text-white' : 'bg-gray-800 hover:bg-gray-700'
            }`}
          >
            Models ({modelResults.total})
          </Link>
        </div>

        {/* No Results */}
        {totalResults === 0 && (
          <div className="text-center py-16">
            <p className="text-gray-400 text-lg mb-4">No results found for &quot;{query}&quot;</p>
            <p className="text-gray-500">Try a different search term or browse our categories.</p>
          </div>
        )}

        {/* Models Results */}
        {modelResults.models.length > 0 && (type === 'all' || type === 'models') && (
          <div className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">
                <span className="text-red-500">👤</span> Models
              </h2>
              {type === 'all' && modelResults.total > 8 && (
                <Link href={`/search?q=${encodeURIComponent(query)}&type=models`} className="text-red-500 hover:text-red-400">
                  View all {modelResults.total} models →
                </Link>
              )}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
              {modelResults.models.map((model) => (
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
                      <div className="w-full h-full flex items-center justify-center text-3xl text-gray-600">
                        👤
                      </div>
                    )}
                  </div>
                  <div className="p-2 text-center">
                    <h3 className="font-medium text-sm truncate group-hover:text-red-400 transition-colors">
                      {model.name}
                    </h3>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Video Results */}
        {videoResults.videos.length > 0 && (type === 'all' || type === 'videos') && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">
                <span className="text-red-500">🎥</span> Videos
              </h2>
              {type === 'all' && videoResults.total > 12 && (
                <Link href={`/search?q=${encodeURIComponent(query)}&type=videos`} className="text-red-500 hover:text-red-400">
                  View all {videoResults.total} videos →
                </Link>
              )}
            </div>
            <VideoGrid videos={videoResults.videos} />
          </div>
        )}
      </div>
    </div>
  )
}
