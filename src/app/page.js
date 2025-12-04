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
      <section className="relative bg-gradient-to-b from-surface-900 via-surface-950 to-surface-950 py-10 sm:py-14 lg:py-24">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary-900/20 via-transparent to-transparent"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 bg-gradient-to-r from-white via-primary-200 to-primary-500 bg-clip-text text-transparent px-2">
              Premium Adult Entertainment
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-surface-400 mb-6 sm:mb-8 max-w-2xl mx-auto px-4">
              Discover exclusive content from top studios and professional models. High-quality videos updated daily.
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
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold">Featured</h2>
            <Link href="/videos?filter=featured" className="text-primary-500 hover:text-primary-400 font-medium text-sm sm:text-base whitespace-nowrap">
              View All
            </Link>
          </div>
          <VideoGrid videos={featuredVideos} />
        </div>
      </section>

      {/* Categories */}
      <section className="py-8 sm:py-10 lg:py-16 bg-surface-900/50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-5 sm:mb-8">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold">Categories</h2>
            <Link href="/categories" className="text-primary-500 hover:text-primary-400 font-medium text-sm sm:text-base whitespace-nowrap">
              View All
            </Link>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4">
            {categories.slice(0, 12).map((category) => (
              <Link
                key={category.slug}
                href={`/category/${category.slug}`}
                className="card p-4 text-center hover:bg-primary-600/10 group transition-colors"
              >
                <span className="font-medium text-sm sm:text-base group-hover:text-primary-400 transition-colors">
                  {category.name}
                </span>
                <span className="text-xs sm:text-sm text-surface-500 block mt-1">
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
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold">Latest</h2>
            <Link href="/videos?sort=latest" className="text-primary-500 hover:text-primary-400 font-medium text-sm sm:text-base whitespace-nowrap">
              View All
            </Link>
          </div>
          <VideoGrid videos={latestVideos} />
        </div>
      </section>

      {/* Top Models */}
      <section className="py-8 sm:py-10 lg:py-16 bg-surface-900/50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-5 sm:mb-8">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold">Top Models</h2>
            <Link href="/models" className="text-primary-500 hover:text-primary-400 font-medium text-sm sm:text-base whitespace-nowrap">
              View All
            </Link>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8 gap-3 sm:gap-4">
            {topModels.map((model) => (
              <Link
                key={model.slug}
                href={`/model/${model.slug}`}
                className="card overflow-hidden group"
              >
                <div className="aspect-[3/4] bg-surface-800 relative">
                  {model.avatar ? (
                    <img
                      src={model.avatar}
                      alt={model.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <svg className="w-12 h-12 text-surface-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                  )}
                </div>
                <div className="p-2 sm:p-3 text-center">
                  <h3 className="font-medium text-xs sm:text-sm truncate group-hover:text-primary-400 transition-colors">
                    {model.name}
                  </h3>
                  <p className="text-xs text-surface-500">{model.videoCount || 0} videos</p>
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
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold">Trending</h2>
            <Link href="/videos?sort=trending" className="text-primary-500 hover:text-primary-400 font-medium text-sm sm:text-base whitespace-nowrap">
              View All
            </Link>
          </div>
          <VideoGrid videos={trendingVideos} />
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-10 sm:py-14 lg:py-24 bg-gradient-to-r from-primary-600/20 via-surface-900 to-primary-600/20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4">
            Want Your Content Featured?
          </h2>
          <p className="text-surface-400 text-sm sm:text-base mb-6 sm:mb-8 max-w-xl mx-auto px-4">
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
