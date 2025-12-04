import Link from 'next/link'

export default function Pagination({ currentPage, totalPages, baseUrl, queryParams = {} }) {
  if (totalPages <= 1) return null

  const buildUrl = (page) => {
    const params = new URLSearchParams()
    Object.entries({ ...queryParams, page }).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.set(key, String(value))
      }
    })
    return `${baseUrl}?${params.toString()}`
  }

  const getPageNumbers = () => {
    const pages = []
    const showPages = 5
    let start = Math.max(1, currentPage - Math.floor(showPages / 2))
    let end = Math.min(totalPages, start + showPages - 1)
    
    if (end - start + 1 < showPages) {
      start = Math.max(1, end - showPages + 1)
    }

    if (start > 1) {
      pages.push(1)
      if (start > 2) pages.push('...')
    }

    for (let i = start; i <= end; i++) {
      pages.push(i)
    }

    if (end < totalPages) {
      if (end < totalPages - 1) pages.push('...')
      pages.push(totalPages)
    }

    return pages
  }

  return (
    <nav className="flex items-center justify-center gap-2 mt-12" aria-label="Pagination">
      {/* Previous */}
      {currentPage > 1 ? (
        <Link
          href={buildUrl(currentPage - 1)}
          className="px-4 py-2 rounded-lg bg-surface-800 hover:bg-surface-700 transition-colors flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span className="hidden sm:inline">Previous</span>
        </Link>
      ) : (
        <span className="px-4 py-2 rounded-lg bg-surface-800/50 text-surface-500 cursor-not-allowed flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span className="hidden sm:inline">Previous</span>
        </span>
      )}

      {/* Page Numbers */}
      <div className="hidden sm:flex items-center gap-1">
        {getPageNumbers().map((page, index) => (
          page === '...' ? (
            <span key={`ellipsis-${index}`} className="px-3 py-2 text-surface-500">
              ...
            </span>
          ) : (
            <Link
              key={page}
              href={buildUrl(page)}
              className={`px-3 py-2 rounded-lg transition-colors ${
                page === currentPage
                  ? 'bg-primary-600 text-white'
                  : 'bg-surface-800 hover:bg-surface-700'
              }`}
            >
              {page}
            </Link>
          )
        ))}
      </div>

      {/* Mobile Page Info */}
      <span className="sm:hidden px-4 py-2 text-surface-400">
        Page {currentPage} of {totalPages}
      </span>

      {/* Next */}
      {currentPage < totalPages ? (
        <Link
          href={buildUrl(currentPage + 1)}
          className="px-4 py-2 rounded-lg bg-surface-800 hover:bg-surface-700 transition-colors flex items-center gap-2"
        >
          <span className="hidden sm:inline">Next</span>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      ) : (
        <span className="px-4 py-2 rounded-lg bg-surface-800/50 text-surface-500 cursor-not-allowed flex items-center gap-2">
          <span className="hidden sm:inline">Next</span>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </span>
      )}
    </nav>
  )
}
