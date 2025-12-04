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
      {/* Hero Section - Responsive */}
      <section className="relative bg-gradient-to-b from-gray-900 via-gray-950 to-gray-950 py-10 sm:py-14 lg:py-24">
        <div className="absolute inset-0 bg-[url('/images/hero-pattern.svg')] opacity-5"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-responsive-hero font-bold mb-4 sm:mb-6 bg-gradient-to-r from-white via-red-200 to-red-500 bg-clip-text text-transparent px-2">
              Premium Adult Entertainment
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-gray-400 mb-6 sm:mb-8 max-w-2xl mx-auto px-4">
              Discover exclusive content from top studios and professional models. 
              High-quality videos updated daily.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 px-4">
              <Link href="/videos" className="btn-primary text-base sm:text-lg px-6 sm:px-8 py-3">
                Browse Videos
              </Link>
              <Link href="/models" className="btn-secondary text-base sm:text-lg px-6 sm:px-8 py-3">
                Explore Models
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Videos */}
      <section className="py-8 sm:py-10 lg:py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-5 sm:mb-8">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold">
              <span className="text-red-500">⭐</span> Featured
            </h2>
            <Link href="/videos?filter=featured" className="text-red-500 hover:text-red-400 font-medium text-sm sm:text-base whitespace-nowrap">
              View All →
            </Link>
          </div>
          <VideoGrid videos={featuredVideos} />
        </div>
      </section>

      {/* Categories Grid - Horizontal scroll on mobile */}
      <section className="py-8 sm:py-10 lg:py-16 bg-gray-900/50">
        <div className="container mx-auto px-4">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-5 sm:mb-8">
            <span className="text-red-500">📂</span> Categories
          </h2>
          
          {/* Mobile: Horizontal scroll, Desktop: Grid */}
          <div className="flex md:grid overflow-x-auto md:overflow-visible pb-4 md:pb-0 gap-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 md:gap-4 swipe-hint md:swipe-hint-none">
            {categories.slice(0, 12).map((category) => (
              <Link
                key={category.slug}
                href={`/category/${category.slug}`}
                className="card p-3 sm:p-4 text-center hover:bg-red-600/10 group flex-shrink-0 w-28 sm:w-auto"
              >
                <span className="text-2xl sm:text-3xl mb-2 block">{category.icon || '📁'}</span>
                <span className="font-medium text-xs sm:text-sm group-hover:text-red-400 transition-colors line-clamp-1">
                  {category.name}
                </span>
                <span className="text-[10px] sm:text-sm text-gray-500 block mt-1">
                  {category.videoCount || 0} videos
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Latest Videos */}
      <section className="py-8 sm:py-10 lg:py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-5 sm:mb-8">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold">
              <span className="text-red-500">🆕</span> Latest
            </h2>
            <Link href="/videos?sort=latest" className="text-red-500 hover:text-red-400 font-medium text-sm sm:text-base whitespace-nowrap">
              View All →
            </Link>
          </div>
          <VideoGrid videos={latestVideos} />
        </div>
      </section>

      {/* Top Models - Horizontal scroll on mobile */}
      <section className="py-8 sm:py-10 lg:py-16 bg-gray-900/50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-5 sm:mb-8">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold">
              <span className="text-red-500">👤</span> Top Models
            </h2>
            <Link href="/models" className="text-red-500 hover:text-red-400 font-medium text-sm sm:text-base whitespace-nowrap">
              View All →
            </Link>
          </div>
          
          {/* Mobile: Horizontal scroll, Desktop: Grid */}
          <div className="flex lg:grid overflow-x-auto lg:overflow-visible pb-4 lg:pb-0 gap-3 sm:gap-4 lg:grid-cols-8 swipe-hint lg:swipe-hint-none">
            {topModels.map((model) => (
              <Link
                key={model.slug}
                href={`/model/${model.slug}`}
                className="card overflow-hidden group flex-shrink-0 w-28 sm:w-32 lg:w-auto"
              >
                <div className="aspect-[3/4] bg-gray-800 relative">
                  {model.avatar ? (
                    <img
                      src={model.avatar}
                      alt={model.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-3xl sm:text-4xl text-gray-600">
                      👤
                    </div>
                  )}
                </div>
                <div className="p-2 sm:p-3 text-center">
                  <h3 className="font-medium text-xs sm:text-sm truncate group-hover:text-red-400 transition-colors">
                    {model.name}
                  </h3>
                  <p className="text-[10px] sm:text-xs text-gray-500">{model.videoCount || 0} videos</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Trending Videos */}
      <section className="py-8 sm:py-10 lg:py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-5 sm:mb-8">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold">
              <span className="text-red-500">🔥</span> Trending
            </h2>
            <Link href="/videos?sort=trending" className="text-red-500 hover:text-red-400 font-medium text-sm sm:text-base whitespace-nowrap">
              View All →
            </Link>
          </div>
          <VideoGrid videos={trendingVideos} />
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-10 sm:py-14 lg:py-24 bg-gradient-to-r from-red-600/20 via-gray-900 to-red-600/20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4">
            Want Your Content Featured?
          </h2>
          <p className="text-gray-400 text-sm sm:text-base mb-6 sm:mb-8 max-w-xl mx-auto px-4">
            Are you a content creator or studio? Submit your content for review and get featured on our platform.
          </p>
          <Link href="/upload-request" className="btn-primary text-base sm:text-lg px-6 sm:px-8 py-3 inline-flex">
            Submit Content
          </Link>
        </div>
      </section>
    </div>
  )
}
