import { mockVideos, mockCategories, mockModels, mockProducers } from './mockData'

// Helper function to simulate async data fetching
const delay = (ms = 100) => new Promise(resolve => setTimeout(resolve, ms))

// ============================================
// VIDEOS
// ============================================

export async function getVideos({ page = 1, limit = 24, sort = 'latest', category = '', search = '' } = {}) {
  await delay()
  
  let videos = [...mockVideos]
  
  // Filter by category
  if (category) {
    videos = videos.filter(v => v.categories.some(c => c.slug === category))
  }
  
  // Filter by search
  if (search) {
    const searchLower = search.toLowerCase()
    videos = videos.filter(v => 
      v.title.toLowerCase().includes(searchLower) ||
      v.description?.toLowerCase().includes(searchLower) ||
      v.tags?.some(t => t.toLowerCase().includes(searchLower))
    )
  }
  
  // Sort
  switch (sort) {
    case 'popular':
    case 'views':
      videos.sort((a, b) => b.views - a.views)
      break
    case 'trending':
      videos.sort((a, b) => b.likes - a.likes)
      break
    case 'duration':
      videos.sort((a, b) => b.duration - a.duration)
      break
    case 'latest':
    default:
      videos.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  }
  
  // Paginate
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

export async function getFeaturedVideos(limit = 6) {
  await delay()
  return mockVideos
    .filter(v => v.status === 'published')
    .sort((a, b) => b.views - a.views)
    .slice(0, limit)
}

export async function getLatestVideos(limit = 12) {
  await delay()
  return mockVideos
    .filter(v => v.status === 'published')
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, limit)
}

export async function getTrendingVideos(limit = 6) {
  await delay()
  return mockVideos
    .filter(v => v.status === 'published')
    .sort((a, b) => b.likes - a.likes)
    .slice(0, limit)
}

export async function getVideoById(id) {
  await delay()
  return mockVideos.find(v => v.id === id || v.slug === id) || null
}

export async function getRelatedVideos(videoId, limit = 6) {
  await delay()
  const video = mockVideos.find(v => v.id === videoId || v.slug === videoId)
  if (!video) return []
  
  return mockVideos
    .filter(v => v.id !== videoId && v.categories.some(c => 
      video.categories.some(vc => vc.slug === c.slug)
    ))
    .slice(0, limit)
}

export async function searchVideos(query, limit = 12) {
  await delay()
  const searchLower = query.toLowerCase()
  const videos = mockVideos.filter(v => 
    v.title.toLowerCase().includes(searchLower) ||
    v.description?.toLowerCase().includes(searchLower) ||
    v.tags?.some(t => t.toLowerCase().includes(searchLower))
  )
  
  return {
    videos: videos.slice(0, limit),
    total: videos.length,
  }
}

// ============================================
// CATEGORIES
// ============================================

export async function getCategories() {
  await delay()
  return mockCategories.sort((a, b) => (a.order || 0) - (b.order || 0))
}

export async function getCategoryBySlug(slug) {
  await delay()
  return mockCategories.find(c => c.slug === slug) || null
}

export async function getCategoryVideos(slug, { page = 1, limit = 24, sort = 'latest' } = {}) {
  await delay()
  
  let videos = mockVideos.filter(v => v.categories.some(c => c.slug === slug))
  
  // Sort
  switch (sort) {
    case 'popular':
    case 'views':
      videos.sort((a, b) => b.views - a.views)
      break
    case 'duration':
      videos.sort((a, b) => b.duration - a.duration)
      break
    case 'latest':
    default:
      videos.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  }
  
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

// ============================================
// MODELS
// ============================================

export async function getModels({ page = 1, limit = 24, sort = 'popular', search = '' } = {}) {
  await delay()
  
  let models = [...mockModels]
  
  // Filter by search
  if (search) {
    const searchLower = search.toLowerCase()
    models = models.filter(m => 
      m.name.toLowerCase().includes(searchLower) ||
      m.bio?.toLowerCase().includes(searchLower) ||
      m.country?.toLowerCase().includes(searchLower)
    )
  }
  
  // Sort
  switch (sort) {
    case 'videos':
      models.sort((a, b) => b.videoCount - a.videoCount)
      break
    case 'name':
      models.sort((a, b) => a.name.localeCompare(b.name))
      break
    case 'latest':
      // Keep default order
      break
    case 'popular':
    default:
      models.sort((a, b) => b.views - a.views)
  }
  
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

export async function getTopModels(limit = 8) {
  await delay()
  return mockModels
    .sort((a, b) => b.views - a.views)
    .slice(0, limit)
}

export async function getModelBySlug(slug) {
  await delay()
  return mockModels.find(m => m.slug === slug) || null
}

export async function getModelVideos(slug, { page = 1, limit = 24 } = {}) {
  await delay()
  
  const videos = mockVideos.filter(v => v.models.some(m => m.slug === slug))
  
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

export async function searchModels(query, limit = 8) {
  await delay()
  const searchLower = query.toLowerCase()
  const models = mockModels.filter(m => 
    m.name.toLowerCase().includes(searchLower) ||
    m.bio?.toLowerCase().includes(searchLower) ||
    m.country?.toLowerCase().includes(searchLower)
  )
  
  return {
    models: models.slice(0, limit),
    total: models.length,
  }
}

// ============================================
// PRODUCERS
// ============================================

export async function getProducers({ page = 1, limit = 24, sort = 'popular' } = {}) {
  await delay()
  
  let producers = [...mockProducers]
  
  // Sort
  switch (sort) {
    case 'videos':
      producers.sort((a, b) => b.videoCount - a.videoCount)
      break
    case 'name':
      producers.sort((a, b) => a.name.localeCompare(b.name))
      break
    case 'latest':
      // Keep default order
      break
    case 'popular':
    default:
      producers.sort((a, b) => b.views - a.views)
  }
  
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

export async function getProducerBySlug(slug) {
  await delay()
  return mockProducers.find(p => p.slug === slug) || null
}

export async function getProducerVideos(slug, { page = 1, limit = 24 } = {}) {
  await delay()
  
  const videos = mockVideos.filter(v => v.producer?.slug === slug)
  
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
