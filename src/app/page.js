import Link from 'next/link'
import VideoGrid from '@/components/VideoGrid'
import { getFeaturedVideos, getLatestVideos, getTrendingVideos, getCategories, getTopModels } from '@/lib/data'

export default async function HomePage() {
  const [featuredVideos, latestVideos, trendingVideos, categories, topModels] = await Promise.all([
    getFeaturedVideos(6),
    getLatestVideos(12),
    getTrendingVideos(6),
    getCategories(),
    getTopModels(8),
  ])

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-gray-900 via-gray-950 to-gray-950 py-16 lg:py-24">
        <div className="absolute inset-0 bg-[url('/images/hero-pattern.svg')] opacity-5"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-white via-red-200 to-red-500 bg-clip-text text-transparent">
              Premium Adult Entertainment
            </h1>
            <p className="text-lg md:text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
              Discover exclusive content from top studios and professional models. 
              High-quality videos updated daily.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/videos" className="btn-primary text-lg px-8 py-3">
                Browse Videos
              </Link>
              <Link href="/models" className="btn-secondary text-lg px-8 py-3">
                Explore Models
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Videos */}
      <section className="py-12 lg:py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl md:text-3xl font-bold">
              <span className="text-red-500">⭐</span> Featured Videos
            </h2>
            <Link href="/videos?filter=featured" className="text-red-500 hover:text-red-400 font-medium">
              View All →
            </Link>
          </div>
          <VideoGrid videos={featuredVideos} />
        </div>
      </section>

      {/* Categories Grid */}
      <section className="py-12 lg:py-16 bg-gray-900/50">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold mb-8">
            <span className="text-red-500">📂</span> Browse Categories
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {categories.slice(0, 12).map((category) => (
              <Link
                key={category.slug}
                href={`/category/${category.slug}`}
                className="card p-4 text-center hover:bg-red-600/10 group"
              >
                <span className="text-3xl mb-2 block">{category.icon || '📁'}</span>
                <span className="font-medium group-hover:text-red-400 transition-colors">
                  {category.name}
                </span>
                <span className="text-sm text-gray-500 block mt-1">
                  {category.videoCount || 0} videos
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Latest Videos */}
      <section className="py-12 lg:py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl md:text-3xl font-bold">
              <span className="text-red-500">🆕</span> Latest Videos
            </h2>
            <Link href="/videos?sort=latest" className="text-red-500 hover:text-red-400 font-medium">
              View All →
            </Link>
          </div>
          <VideoGrid videos={latestVideos} />
        </div>
      </section>

      {/* Top Models */}
      <section className="py-12 lg:py-16 bg-gray-900/50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl md:text-3xl font-bold">
              <span className="text-red-500">👤</span> Top Models
            </h2>
            <Link href="/models" className="text-red-500 hover:text-red-400 font-medium">
              View All →
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
            {topModels.map((model) => (
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
                    <div className="w-full h-full flex items-center justify-center text-4xl text-gray-600">
                      👤
                    </div>
                  )}
                </div>
                <div className="p-3 text-center">
                  <h3 className="font-medium text-sm truncate group-hover:text-red-400 transition-colors">
                    {model.name}
                  </h3>
                  <p className="text-xs text-gray-500">{model.videoCount || 0} videos</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Trending Videos */}
      <section className="py-12 lg:py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl md:text-3xl font-bold">
              <span className="text-red-500">🔥</span> Trending Now
            </h2>
            <Link href="/videos?sort=trending" className="text-red-500 hover:text-red-400 font-medium">
              View All →
            </Link>
          </div>
          <VideoGrid videos={trendingVideos} />
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 lg:py-24 bg-gradient-to-r from-red-600/20 via-gray-900 to-red-600/20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Want Your Content Featured?
          </h2>
          <p className="text-gray-400 mb-8 max-w-xl mx-auto">
            Are you a content creator or studio? Submit your content for review and get featured on our platform.
          </p>
          <Link href="/upload-request" className="btn-primary text-lg px-8 py-3 inline-block">
            Submit Content
          </Link>
        </div>
      </section>
    </div>
  )
}
