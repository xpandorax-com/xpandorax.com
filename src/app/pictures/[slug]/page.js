import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getGalleryById, getGalleriesByModel } from '@/lib/data'
import { formatViews, formatRelativeTime } from '@/utils/helpers'

export async function generateMetadata({ params }) {
  const { slug } = await params
  const gallery = await getGalleryById(slug)
  
  if (!gallery) {
    return { title: 'Gallery Not Found' }
  }
  
  return {
    title: gallery.title,
    description: gallery.description,
  }
}

function GalleryImage({ index, galleryTitle }) {
  const placeholderColors = [
    'from-pink-600 to-purple-600',
    'from-blue-600 to-cyan-600',
    'from-orange-600 to-red-600',
    'from-green-600 to-teal-600',
    'from-indigo-600 to-violet-600',
    'from-rose-600 to-pink-600',
    'from-amber-600 to-orange-600',
    'from-emerald-600 to-green-600',
  ]
  const colorIndex = index % placeholderColors.length
  const gradientClass = placeholderColors[colorIndex]

  return (
    <div className="group relative aspect-square rounded-lg overflow-hidden cursor-pointer">
      <div className={`w-full h-full bg-gradient-to-br ${gradientClass} flex items-center justify-center`}>
        <span className="text-white/30 text-4xl font-bold">{index + 1}</span>
      </div>
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
        <svg className="w-10 h-10 text-white opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
        </svg>
      </div>
    </div>
  )
}

function RelatedGalleryCard({ gallery }) {
  const placeholderColors = [
    'from-pink-600 to-purple-600',
    'from-blue-600 to-cyan-600',
    'from-orange-600 to-red-600',
  ]
  const colorIndex = gallery.id.charCodeAt(gallery.id.length - 1) % placeholderColors.length
  const gradientClass = placeholderColors[colorIndex]

  return (
    <Link href={`/pictures/${gallery.slug}`} className="group block">
      <article className="card overflow-hidden">
        <div className="relative aspect-[4/3] overflow-hidden">
          {gallery.coverImage ? (
            <img
              src={gallery.coverImage}
              alt={gallery.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className={`w-full h-full bg-gradient-to-br ${gradientClass} flex items-center justify-center`}>
              <svg className="w-12 h-12 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}
          <div className="absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
            {gallery.photoCount} photos
          </div>
        </div>
        <div className="p-3">
          <h4 className="font-medium text-sm text-white group-hover:text-primary-400 transition-colors line-clamp-1">
            {gallery.title}
          </h4>
          <p className="text-xs text-surface-500 mt-1">{formatViews(gallery.views)} views</p>
        </div>
      </article>
    </Link>
  )
}

export default async function GalleryPage({ params }) {
  const { slug } = await params
  const gallery = await getGalleryById(slug)
  
  if (!gallery) {
    notFound()
  }

  const relatedGalleries = await getGalleriesByModel(gallery.model, 4)
  const filteredRelated = relatedGalleries.filter(g => g.id !== gallery.id).slice(0, 3)

  // Generate placeholder images based on photoCount
  const images = Array.from({ length: gallery.photoCount }, (_, i) => i)

  return (
    <div className="min-h-screen py-8 sm:py-12">
      <div className="container mx-auto px-4">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-surface-400 mb-6">
          <Link href="/" className="hover:text-white transition-colors">Home</Link>
          <span>/</span>
          <Link href="/pictures" className="hover:text-white transition-colors">Pictures</Link>
          <span>/</span>
          <span className="text-white">{gallery.title}</span>
        </nav>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold mb-2">{gallery.title}</h1>
              <p className="text-surface-400 max-w-2xl">{gallery.description}</p>
            </div>
            {gallery.featured && (
              <span className="bg-primary-600 text-white text-sm px-3 py-1 rounded-full font-medium flex-shrink-0">
                Featured
              </span>
            )}
          </div>

          {/* Meta Info */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-surface-400">
            <Link 
              href={`/model/${gallery.model}`}
              className="flex items-center gap-2 hover:text-primary-400 transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-surface-700 flex items-center justify-center">
                <span className="text-xs font-medium">{gallery.modelName.charAt(0)}</span>
              </div>
              <span>{gallery.modelName}</span>
            </Link>
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
              </svg>
              {gallery.photoCount} photos
            </span>
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              {formatViews(gallery.views)} views
            </span>
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
              </svg>
              {formatViews(gallery.likes)} likes
            </span>
            <span>{formatRelativeTime(gallery.createdAt)}</span>
          </div>

          {/* Tags */}
          {gallery.tags && gallery.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {gallery.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 bg-surface-800 rounded-full text-xs text-surface-400"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-3 mb-12">
          {images.map((index) => (
            <GalleryImage key={index} index={index} galleryTitle={gallery.title} />
          ))}
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-4 mb-12 pb-8 border-b border-surface-700">
          <button className="btn-primary flex items-center gap-2">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
            </svg>
            Like Gallery
          </button>
          <button className="btn-secondary flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
            Save to Collection
          </button>
          <button className="btn-secondary flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
            Share
          </button>
        </div>

        {/* Related Galleries */}
        {filteredRelated.length > 0 && (
          <section>
            <h2 className="text-lg font-semibold mb-4">More from {gallery.modelName}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredRelated.map((related) => (
                <RelatedGalleryCard key={related.id} gallery={related} />
              ))}
            </div>
          </section>
        )}

        {/* Back Link */}
        <div className="mt-8 pt-8 border-t border-surface-700">
          <Link 
            href="/pictures" 
            className="inline-flex items-center gap-2 text-primary-400 hover:text-primary-300 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to all galleries
          </Link>
        </div>
      </div>
    </div>
  )
}
