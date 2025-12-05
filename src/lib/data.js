/**
 * Data access layer for the application
 * Provides functions to fetch and manipulate content data
 */

import { mockVideos, mockCategories, mockModels, mockProducers, mockGalleries } from './mockData'

const delay = (ms = 50) => new Promise(resolve => setTimeout(resolve, ms))

// =============================================================================
// VIDEO FUNCTIONS
// =============================================================================

/**
 * Get paginated videos with filtering and sorting
 * @param {object} options - Query options
 * @returns {Promise<object>} Paginated video results
 */
export async function getVideos({ page = 1, limit = 24, sort = 'latest', category = '', search = '' } = {}) {
  await delay()
  
  let videos = [...mockVideos]
  
  if (category) {
    videos = videos.filter(video => 
      video.categories.some(cat => cat.slug === category)
    )
  }
  
  if (search) {
    const searchTerm = search.toLowerCase()
    videos = videos.filter(video =>
      video.title.toLowerCase().includes(searchTerm) ||
      video.description?.toLowerCase().includes(searchTerm) ||
      video.tags?.some(tag => tag.toLowerCase().includes(searchTerm))
    )
  }
  
  videos = sortVideos(videos, sort)
  
  const totalCount = videos.length
  const totalPages = Math.ceil(totalCount / limit)
  const startIndex = (page - 1) * limit
  const paginatedVideos = videos.slice(startIndex, startIndex + limit)
  
  return {
    videos: paginatedVideos,
    totalPages,
    totalCount,
    page,
  }
}

/**
 * Get featured videos
 * @param {number} limit - Maximum number of videos to return
 * @returns {Promise<Array>} Array of featured videos
 */
export async function getFeaturedVideos(limit = 6) {
  await delay()
  
  return mockVideos
    .filter(video => video.status === 'published')
    .sort((a, b) => b.views - a.views)
    .slice(0, limit)
}

/**
 * Get latest videos
 * @param {number} limit - Maximum number of videos to return
 * @returns {Promise<Array>} Array of latest videos
 */
export async function getLatestVideos(limit = 12) {
  await delay()
  
  return mockVideos
    .filter(video => video.status === 'published')
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, limit)
}

/**
 * Get trending videos
 * @param {number} limit - Maximum number of videos to return
 * @returns {Promise<Array>} Array of trending videos
 */
export async function getTrendingVideos(limit = 6) {
  await delay()
  
  return mockVideos
    .filter(video => video.status === 'published')
    .sort((a, b) => b.likes - a.likes)
    .slice(0, limit)
}

/**
 * Get video by ID or slug
 * @param {string} id - Video ID or slug
 * @returns {Promise<object|null>} Video object or null
 */
export async function getVideoById(id) {
  await delay()
  
  return mockVideos.find(video => video.id === id || video.slug === id) || null
}

/**
 * Get related videos based on categories
 * @param {string} videoId - Current video ID
 * @param {number} limit - Maximum number of videos to return
 * @returns {Promise<Array>} Array of related videos
 */
export async function getRelatedVideos(videoId, limit = 6) {
  await delay()
  
  const video = mockVideos.find(v => v.id === videoId || v.slug === videoId)
  if (!video) return []
  
  return mockVideos
    .filter(v => 
      v.id !== videoId && 
      v.categories.some(cat => 
        video.categories.some(vCat => vCat.slug === cat.slug)
      )
    )
    .slice(0, limit)
}

/**
 * Search videos
 * @param {string} query - Search query
 * @param {number} limit - Maximum number of videos to return
 * @returns {Promise<object>} Search results with videos and total count
 */
export async function searchVideos(query, limit = 12) {
  await delay()
  
  const searchTerm = query.toLowerCase()
  const videos = mockVideos.filter(video =>
    video.title.toLowerCase().includes(searchTerm) ||
    video.description?.toLowerCase().includes(searchTerm) ||
    video.tags?.some(tag => tag.toLowerCase().includes(searchTerm))
  )
  
  return {
    videos: videos.slice(0, limit),
    total: videos.length,
  }
}

// =============================================================================
// CATEGORY FUNCTIONS
// =============================================================================

/**
 * Get all categories sorted by order
 * @returns {Promise<Array>} Array of categories
 */
export async function getCategories() {
  await delay()
  
  return [...mockCategories].sort((a, b) => (a.order || 0) - (b.order || 0))
}

/**
 * Get category by slug
 * @param {string} slug - Category slug
 * @returns {Promise<object|null>} Category object or null
 */
export async function getCategoryBySlug(slug) {
  await delay()
  
  return mockCategories.find(category => category.slug === slug) || null
}

/**
 * Get videos for a specific category
 * @param {string} slug - Category slug
 * @param {object} options - Query options
 * @returns {Promise<object>} Paginated video results
 */
export async function getCategoryVideos(slug, { page = 1, limit = 24, sort = 'latest' } = {}) {
  await delay()
  
  let videos = mockVideos.filter(video => 
    video.categories.some(cat => cat.slug === slug)
  )
  
  videos = sortVideos(videos, sort)
  
  const totalCount = videos.length
  const totalPages = Math.ceil(totalCount / limit)
  const startIndex = (page - 1) * limit
  const paginatedVideos = videos.slice(startIndex, startIndex + limit)
  
  return {
    videos: paginatedVideos,
    totalPages,
    totalCount,
    page,
  }
}

// =============================================================================
// MODEL FUNCTIONS
// =============================================================================

/**
 * Get paginated models with filtering and sorting
 * @param {object} options - Query options
 * @returns {Promise<object>} Paginated model results
 */
export async function getModels({ page = 1, limit = 24, sort = 'popular', search = '' } = {}) {
  await delay()
  
  let models = [...mockModels]
  
  if (search) {
    const searchTerm = search.toLowerCase()
    models = models.filter(model =>
      model.name.toLowerCase().includes(searchTerm) ||
      model.bio?.toLowerCase().includes(searchTerm) ||
      model.country?.toLowerCase().includes(searchTerm)
    )
  }
  
  models = sortModels(models, sort)
  
  const totalCount = models.length
  const totalPages = Math.ceil(totalCount / limit)
  const startIndex = (page - 1) * limit
  const paginatedModels = models.slice(startIndex, startIndex + limit)
  
  return {
    models: paginatedModels,
    totalPages,
    totalCount,
    page,
  }
}

/**
 * Get top models by views
 * @param {number} limit - Maximum number of models to return
 * @returns {Promise<Array>} Array of top models
 */
export async function getTopModels(limit = 8) {
  await delay()
  
  return [...mockModels]
    .sort((a, b) => b.views - a.views)
    .slice(0, limit)
}

/**
 * Get model by slug
 * @param {string} slug - Model slug
 * @returns {Promise<object|null>} Model object or null
 */
export async function getModelBySlug(slug) {
  await delay()
  
  return mockModels.find(model => model.slug === slug) || null
}

/**
 * Get videos for a specific model
 * @param {string} slug - Model slug
 * @param {object} options - Query options
 * @returns {Promise<object>} Paginated video results
 */
export async function getModelVideos(slug, { page = 1, limit = 24 } = {}) {
  await delay()
  
  const videos = mockVideos.filter(video =>
    video.models.some(model => model.slug === slug)
  )
  
  const totalCount = videos.length
  const totalPages = Math.ceil(totalCount / limit)
  const startIndex = (page - 1) * limit
  const paginatedVideos = videos.slice(startIndex, startIndex + limit)
  
  return {
    videos: paginatedVideos,
    totalPages,
    totalCount,
    page,
  }
}

/**
 * Search models
 * @param {string} query - Search query
 * @param {number} limit - Maximum number of models to return
 * @returns {Promise<object>} Search results with models and total count
 */
export async function searchModels(query, limit = 8) {
  await delay()
  
  const searchTerm = query.toLowerCase()
  const models = mockModels.filter(model =>
    model.name.toLowerCase().includes(searchTerm) ||
    model.bio?.toLowerCase().includes(searchTerm) ||
    model.country?.toLowerCase().includes(searchTerm)
  )
  
  return {
    models: models.slice(0, limit),
    total: models.length,
  }
}

// =============================================================================
// PRODUCER FUNCTIONS
// =============================================================================

/**
 * Get paginated producers with sorting
 * @param {object} options - Query options
 * @returns {Promise<object>} Paginated producer results
 */
export async function getProducers({ page = 1, limit = 24, sort = 'popular' } = {}) {
  await delay()
  
  let producers = [...mockProducers]
  
  producers = sortProducers(producers, sort)
  
  const totalCount = producers.length
  const totalPages = Math.ceil(totalCount / limit)
  const startIndex = (page - 1) * limit
  const paginatedProducers = producers.slice(startIndex, startIndex + limit)
  
  return {
    producers: paginatedProducers,
    totalPages,
    totalCount,
    page,
  }
}

/**
 * Get producer by slug
 * @param {string} slug - Producer slug
 * @returns {Promise<object|null>} Producer object or null
 */
export async function getProducerBySlug(slug) {
  await delay()
  
  return mockProducers.find(producer => producer.slug === slug) || null
}

/**
 * Get videos for a specific producer
 * @param {string} slug - Producer slug
 * @param {object} options - Query options
 * @returns {Promise<object>} Paginated video results
 */
export async function getProducerVideos(slug, { page = 1, limit = 24 } = {}) {
  await delay()
  
  const videos = mockVideos.filter(video => video.producer?.slug === slug)
  
  const totalCount = videos.length
  const totalPages = Math.ceil(totalCount / limit)
  const startIndex = (page - 1) * limit
  const paginatedVideos = videos.slice(startIndex, startIndex + limit)
  
  return {
    videos: paginatedVideos,
    totalPages,
    totalCount,
    page,
  }
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Sort videos by specified criteria
 * @param {Array} videos - Array of videos to sort
 * @param {string} sort - Sort criteria
 * @returns {Array} Sorted videos array
 */
function sortVideos(videos, sort) {
  const sortedVideos = [...videos]
  
  switch (sort) {
    case 'popular':
    case 'views':
      return sortedVideos.sort((a, b) => b.views - a.views)
    case 'trending':
      return sortedVideos.sort((a, b) => b.likes - a.likes)
    case 'duration':
      return sortedVideos.sort((a, b) => b.duration - a.duration)
    case 'latest':
    default:
      return sortedVideos.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  }
}

/**
 * Sort models by specified criteria
 * @param {Array} models - Array of models to sort
 * @param {string} sort - Sort criteria
 * @returns {Array} Sorted models array
 */
function sortModels(models, sort) {
  const sortedModels = [...models]
  
  switch (sort) {
    case 'videos':
      return sortedModels.sort((a, b) => b.videoCount - a.videoCount)
    case 'name':
      return sortedModels.sort((a, b) => a.name.localeCompare(b.name))
    case 'latest':
      return sortedModels
    case 'popular':
    default:
      return sortedModels.sort((a, b) => b.views - a.views)
  }
}

/**
 * Sort producers by specified criteria
 * @param {Array} producers - Array of producers to sort
 * @param {string} sort - Sort criteria
 * @returns {Array} Sorted producers array
 */
function sortProducers(producers, sort) {
  const sortedProducers = [...producers]
  
  switch (sort) {
    case 'videos':
      return sortedProducers.sort((a, b) => b.videoCount - a.videoCount)
    case 'name':
      return sortedProducers.sort((a, b) => a.name.localeCompare(b.name))
    case 'latest':
      return sortedProducers
    case 'popular':
    default:
      return sortedProducers.sort((a, b) => b.views - a.views)
  }
}

// =============================================================================
// GALLERY FUNCTIONS
// =============================================================================

/**
 * Get paginated galleries with filtering and sorting
 * @param {object} options - Query options
 * @returns {Promise<object>} Paginated gallery results
 */
export async function getGalleries({ page = 1, limit = 12, sort = 'latest', category = '', model = '' } = {}) {
  await delay()
  
  let galleries = [...mockGalleries]
  
  if (category) {
    galleries = galleries.filter(gallery => gallery.category === category)
  }
  
  if (model) {
    galleries = galleries.filter(gallery => gallery.model === model)
  }
  
  galleries = sortGalleries(galleries, sort)
  
  const totalCount = galleries.length
  const totalPages = Math.ceil(totalCount / limit)
  const startIndex = (page - 1) * limit
  const paginatedGalleries = galleries.slice(startIndex, startIndex + limit)
  
  return {
    galleries: paginatedGalleries,
    totalPages,
    totalCount,
    page,
  }
}

/**
 * Get featured galleries
 * @param {number} limit - Maximum number of galleries to return
 * @returns {Promise<Array>} Array of featured galleries
 */
export async function getFeaturedGalleries(limit = 6) {
  await delay()
  
  return mockGalleries
    .filter(gallery => gallery.featured)
    .sort((a, b) => b.views - a.views)
    .slice(0, limit)
}

/**
 * Get gallery by ID or slug
 * @param {string} id - Gallery ID or slug
 * @returns {Promise<object|null>} Gallery object or null
 */
export async function getGalleryById(id) {
  await delay()
  
  return mockGalleries.find(gallery => gallery.id === id || gallery.slug === id) || null
}

/**
 * Get galleries by model
 * @param {string} modelSlug - Model slug
 * @param {number} limit - Maximum number of galleries to return
 * @returns {Promise<Array>} Array of galleries
 */
export async function getGalleriesByModel(modelSlug, limit = 6) {
  await delay()
  
  return mockGalleries
    .filter(gallery => gallery.model === modelSlug)
    .slice(0, limit)
}

/**
 * Sort galleries by specified criteria
 * @param {Array} galleries - Array of galleries to sort
 * @param {string} sort - Sort criteria
 * @returns {Array} Sorted galleries array
 */
function sortGalleries(galleries, sort) {
  const sortedGalleries = [...galleries]
  
  switch (sort) {
    case 'popular':
      return sortedGalleries.sort((a, b) => b.views - a.views)
    case 'most-liked':
      return sortedGalleries.sort((a, b) => b.likes - a.likes)
    case 'photos':
      return sortedGalleries.sort((a, b) => b.photoCount - a.photoCount)
    case 'latest':
    default:
      return sortedGalleries.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  }
}
