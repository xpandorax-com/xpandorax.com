/**
 * Utility helper functions
 * Common formatting and transformation utilities
 */

/**
 * Format duration from seconds to readable string
 * @param {number} seconds - Duration in seconds
 * @returns {string} Formatted duration string (e.g., "1:23:45" or "23:45")
 */
export function formatDuration(seconds) {
  if (!seconds || seconds < 0) return '0:00'
  
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = Math.floor(seconds % 60)
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`
}

/**
 * Format view count to human-readable string
 * @param {number} views - Number of views
 * @returns {string} Formatted view count (e.g., "1.5M", "234K", "1,234")
 */
export function formatViews(views) {
  if (!views || views < 0) return '0'
  
  if (views >= 1000000) {
    return `${(views / 1000000).toFixed(1)}M`
  }
  if (views >= 1000) {
    return `${(views / 1000).toFixed(1)}K`
  }
  return views.toLocaleString()
}

/**
 * Format date to human-readable string
 * @param {string|Date} dateString - Date to format
 * @param {object} options - Intl.DateTimeFormat options
 * @returns {string} Formatted date string
 */
export function formatDate(dateString, options = {}) {
  if (!dateString) return ''
  
  const defaultOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    ...options,
  }
  
  return new Date(dateString).toLocaleDateString('en-US', defaultOptions)
}

/**
 * Format relative time (e.g., "2 days ago")
 * @param {string|Date} dateString - Date to format
 * @returns {string} Relative time string
 */
export function formatRelativeTime(dateString) {
  if (!dateString) return ''
  
  const date = new Date(dateString)
  const now = new Date()
  const diffInSeconds = Math.floor((now - date) / 1000)
  
  const intervals = [
    { label: 'year', seconds: 31536000 },
    { label: 'month', seconds: 2592000 },
    { label: 'week', seconds: 604800 },
    { label: 'day', seconds: 86400 },
    { label: 'hour', seconds: 3600 },
    { label: 'minute', seconds: 60 },
  ]
  
  for (const interval of intervals) {
    const count = Math.floor(diffInSeconds / interval.seconds)
    if (count >= 1) {
      return `${count} ${interval.label}${count !== 1 ? 's' : ''} ago`
    }
  }
  
  return 'Just now'
}

/**
 * Generate slug from string
 * @param {string} text - Text to convert to slug
 * @returns {string} URL-friendly slug
 */
export function generateSlug(text) {
  if (!text) return ''
  
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/**
 * Truncate text to specified length
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} Truncated text with ellipsis if needed
 */
export function truncateText(text, maxLength = 100) {
  if (!text || text.length <= maxLength) return text || ''
  return text.substring(0, maxLength).trim() + '...'
}

/**
 * Build URL with query parameters
 * @param {string} baseUrl - Base URL path
 * @param {object} params - Query parameters object
 * @returns {string} URL with query string
 */
export function buildUrl(baseUrl, params = {}) {
  const url = new URL(baseUrl, 'http://placeholder')
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.set(key, String(value))
    }
  })
  
  return url.pathname + url.search
}

/**
 * Parse query parameters from URL
 * @param {URLSearchParams} searchParams - URL search parameters
 * @returns {object} Parsed parameters object
 */
export function parseSearchParams(searchParams) {
  const params = {}
  
  for (const [key, value] of searchParams.entries()) {
    params[key] = value
  }
  
  return params
}

/**
 * Debounce function execution
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
export function debounce(func, wait = 300) {
  let timeout
  
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

/**
 * Class name utility for conditional classes
 * @param  {...any} classes - Class names or conditional objects
 * @returns {string} Combined class names
 */
export function cn(...classes) {
  return classes
    .filter(Boolean)
    .map(cls => {
      if (typeof cls === 'string') return cls
      if (typeof cls === 'object') {
        return Object.entries(cls)
          .filter(([, value]) => value)
          .map(([key]) => key)
          .join(' ')
      }
      return ''
    })
    .join(' ')
    .trim()
}
