import Link from 'next/link'
import { getCategories } from '@/lib/data'

export const metadata = {
  title: 'Categories',
  description: 'Browse all video categories on XpandoraX. Find content by your preferred category.',
}

export default async function CategoriesPage() {
  const categories = await getCategories()

  return (
    <div className="min-h-screen py-8 sm:py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold">Categories</h1>
          <p className="text-surface-400 mt-1">{categories.length} categories available</p>
        </div>

        {/* Categories Grid */}
        {categories.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {categories.map((category) => (
              <Link
                key={category.slug}
                href={`/category/${category.slug}`}
                className="card p-6 text-center hover:bg-primary-600/10 group transition-all hover:scale-105"
              >
                {/* Icon */}
                <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-surface-700 group-hover:bg-primary-600/20 flex items-center justify-center transition-colors">
                  <svg className="w-7 h-7 text-surface-400 group-hover:text-primary-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2m10 2V2M3 8h18M5 4h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2z" />
                  </svg>
                </div>
                
                <h2 className="font-semibold text-sm sm:text-base group-hover:text-primary-400 transition-colors">
                  {category.name}
                </h2>
                
                <p className="text-xs sm:text-sm text-surface-500 mt-1">
                  {category.videoCount || 0} videos
                </p>
                
                {category.description && (
                  <p className="text-xs text-surface-600 mt-2 line-clamp-2">
                    {category.description}
                  </p>
                )}
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <svg className="w-16 h-16 text-surface-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <h2 className="text-xl font-semibold mb-2">No Categories Found</h2>
            <p className="text-surface-400">No categories available at this time.</p>
          </div>
        )}

        {/* Featured Categories Section */}
        {categories.filter(c => c.isFeatured).length > 0 && (
          <div className="mt-16">
            <h2 className="text-xl sm:text-2xl font-bold mb-6">Featured Categories</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {categories.filter(c => c.isFeatured).map((category) => (
                <Link
                  key={category.slug}
                  href={`/category/${category.slug}`}
                  className="card overflow-hidden group"
                >
                  <div className="h-32 bg-gradient-to-r from-primary-600/30 via-surface-800 to-primary-600/30 relative flex items-center justify-center">
                    <h3 className="text-2xl font-bold group-hover:text-primary-400 transition-colors">
                      {category.name}
                    </h3>
                  </div>
                  <div className="p-4">
                    <p className="text-surface-400 text-sm line-clamp-2">
                      {category.description || `Browse ${category.videoCount || 0} videos in ${category.name}`}
                    </p>
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-sm text-surface-500">{category.videoCount || 0} videos</span>
                      <span className="text-primary-400 text-sm font-medium group-hover:translate-x-1 transition-transform">
                        View All
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
