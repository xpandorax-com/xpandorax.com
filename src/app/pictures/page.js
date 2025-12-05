import Link from 'next/link'
import { getGalleries, getFeaturedGalleries } from '@/lib/data'
import { formatViews, formatRelativeTime } from '@/utils/helpers'
import Pagination from '@/components/Pagination'
import SortSelect from '@/components/SortSelect'

export const metadata = {
  title: 'Pictures',
  description: 'Browse high-quality photo galleries featuring professional models on XpandoraX.',
}

const SORT_OPTIONS = [
  { value: 'latest', label: 'Latest' },
  { value: 'popular', label: 'Most Viewed' },
  { value: 'most-liked', label: 'Most Liked' },
  { value: 'photos', label: 'Most Photos' },
]

function GalleryCard({ gallery }) {
  const placeholderColors = [
    'from-pink-600 to-purple-600',
    'from-blue-600 to-cyan-600',
    'from-orange-600 to-red-600',
    'from-green-600 to-teal-600',
    'from-indigo-600 to-violet-600',
    'from-rose-600 to-pink-600',
  ]
  const colorIndex = gallery.id.charCodeAt(gallery.id.length - 1) % placeholderColors.length
  const gradientClass = placeholderColors[colorIndex]

  return (
    <Link href={`/pictures/${gallery.slug}`} className="group block">
      <article className="card overflow-hidden hover:ring-2 hover:ring-primary-500 transition-all">
        {/* Thumbnail */}
        <div className="relative aspect-[4/3] overflow-hidden">
          {gallery.coverImage ? (
            <img
              src={gallery.coverImage}
              alt={gallery.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className={`w-full h-full bg-gradient-to-br ${gradientClass} flex items-center justify-center`}>
              <svg className="w-16 h-16 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}
          
          {/* Photo Count Badge */}
          <div className="absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
            </svg>
            {gallery.photoCount} photos
          </div>

          {/* Featured Badge */}
          {gallery.featured && (
            <div className="absolute top-2 right-2 bg-primary-600 text-white text-xs px-2 py-1 rounded font-medium">
              Featured
            </div>
          )}

          {/* Hover Overlay */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
            <span className="opacity-0 group-hover:opacity-100 transition-opacity text-white font-medium bg-primary-600 px-4 py-2 rounded">
              View Gallery
            </span>
          </div>
        </div>

        {/* Info */}
        <div className="p-4">
          <h3 className="font-semibold text-white group-hover:text-primary-400 transition-colors line-clamp-1 mb-1">
            {gallery.title}
          </h3>
          
          <p className="text-sm text-surface-400 line-clamp-2 mb-3">
            {gallery.description}
          </p>

          <div className="flex items-center justify-between text-xs text-surface-500">
            <span className="hover:text-primary-400 transition-colors">
              {gallery.modelName}
            </span>
            <span>{formatRelativeTime(gallery.createdAt)}</span>
          </div>

          <div className="flex items-center gap-4 mt-2 pt-2 border-t border-surface-700 text-xs text-surface-500">
            <span className="flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              {formatViews(gallery.views)}
            </span>
            <span className="flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
              </svg>
              {formatViews(gallery.likes)}
            </span>
          </div>
        </div>
      </article>
    </Link>
  )
}

function FeaturedGalleryCard({ gallery }) {
  const placeholderColors = [
    'from-pink-600 to-purple-600',
    'from-blue-600 to-cyan-600',
    'from-orange-600 to-red-600',
  ]
  const colorIndex = gallery.id.charCodeAt(gallery.id.length - 1) % placeholderColors.length
  const gradientClass = placeholderColors[colorIndex]

  return (
    <Link href={`/pictures/${gallery.slug}`} className="group block">
      <article className="relative aspect-[16/9] rounded-xl overflow-hidden">
        {gallery.coverImage ? (
          <img
            src={gallery.coverImage}
            alt={gallery.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className={`w-full h-full bg-gradient-to-br ${gradientClass}`} />
        )}
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        
        {/* Content */}
        <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6">
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-primary-600 text-white text-xs px-2 py-1 rounded font-medium">
              Featured
            </span>
            <span className="bg-black/50 text-white text-xs px-2 py-1 rounded">
              {gallery.photoCount} photos
            </span>
          </div>
          <h3 className="font-bold text-lg sm:text-xl text-white group-hover:text-primary-300 transition-colors mb-1">
            {gallery.title}
          </h3>
          <p className="text-sm text-white/70 line-clamp-1 mb-2">
            {gallery.description}
          </p>
          <div className="flex items-center gap-4 text-xs text-white/60">
            <span>{gallery.modelName}</span>
            <span>{formatViews(gallery.views)} views</span>
          </div>
        </div>
      </article>
    </Link>
  )
}

export default async function PicturesPage({ searchParams }) {
  const params = await searchParams
  const page = parseInt(params?.page) || 1
  const sort = params?.sort || 'latest'
  
  const [galleriesData, featuredGalleries] = await Promise.all([
    getGalleries({ page, limit: 12, sort }),
    getFeaturedGalleries(3),
  ])
  
  const { galleries, totalPages, totalCount } = galleriesData

  return (
    <div className="min-h-screen py-8 sm:py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">Photo Galleries</h1>
          <p className="text-surface-400">
            Browse {totalCount} high-quality photo galleries featuring professional models
          </p>
        </div>

        {/* Featured Section */}
        {page === 1 && featuredGalleries.length > 0 && (
          <section className="mb-12">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-primary-500" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              Featured Galleries
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {featuredGalleries.map((gallery) => (
                <FeaturedGalleryCard key={gallery.id} gallery={gallery} />
              ))}
            </div>
          </section>
        )}

        {/* Sort Controls */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-surface-400">
            {totalCount} galleries found
          </p>
          <SortSelect options={SORT_OPTIONS} currentSort={sort} />
        </div>

        {/* Gallery Grid */}
        {galleries.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 mb-8">
            {galleries.map((gallery) => (
              <GalleryCard key={gallery.id} gallery={gallery} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-surface-400">No galleries found.</p>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            baseUrl="/pictures"
          />
        )}

        {/* Categories Section */}
        <section className="mt-12 pt-8 border-t border-surface-700">
          <h2 className="text-lg font-semibold mb-4">Browse by Category</h2>
          <div className="flex flex-wrap gap-2">
            {['Professional', 'Amateur', 'Boudoir', 'Outdoor', 'Studio', 'Fashion', 'Artistic'].map((cat) => (
              <Link
                key={cat}
                href={`/pictures?category=${cat.toLowerCase()}`}
                className="px-4 py-2 bg-surface-800 hover:bg-surface-700 rounded-lg text-sm transition-colors"
              >
                {cat}
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
