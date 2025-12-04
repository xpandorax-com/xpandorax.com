/**
 * Application configuration constants
 * Centralized configuration management for the platform
 */

export const CONFIG = {
  site: {
    name: 'XpandoraX',
    description: 'Premium adult content platform featuring high-quality videos and professional models',
    url: process.env.NEXT_PUBLIC_SITE_URL || 'https://xpandorax.com',
  },
  
  pagination: {
    defaultLimit: 24,
    maxLimit: 100,
  },
  
  video: {
    qualityOptions: ['4K', '1080p', '720p', '480p'],
    statusOptions: ['draft', 'published', 'featured', 'archived'],
  },
  
  sorting: {
    videos: [
      { value: 'latest', label: 'Latest' },
      { value: 'popular', label: 'Most Popular' },
      { value: 'trending', label: 'Trending' },
      { value: 'views', label: 'Most Viewed' },
      { value: 'duration', label: 'Longest' },
    ],
    models: [
      { value: 'popular', label: 'Most Popular' },
      { value: 'videos', label: 'Most Videos' },
      { value: 'name', label: 'Name A-Z' },
      { value: 'latest', label: 'Newest' },
    ],
    producers: [
      { value: 'popular', label: 'Most Popular' },
      { value: 'videos', label: 'Most Videos' },
      { value: 'name', label: 'Name A-Z' },
      { value: 'latest', label: 'Newest' },
    ],
  },
  
  contact: {
    subjects: [
      { value: 'general', label: 'General Inquiry' },
      { value: 'support', label: 'Technical Support' },
      { value: 'business', label: 'Business Partnership' },
      { value: 'content', label: 'Content Removal' },
      { value: 'feedback', label: 'Feedback' },
      { value: 'other', label: 'Other' },
    ],
  },
  
  upload: {
    contentTypes: [
      { value: 'video', label: 'Videos' },
      { value: 'pictures', label: 'Photo Sets' },
      { value: 'both', label: 'Videos and Photos' },
    ],
  },
}

// Named exports for direct imports
export const PAGINATION = {
  VIDEOS_PER_PAGE: 24,
  MODELS_PER_PAGE: 24,
  PRODUCERS_PER_PAGE: 20,
  CATEGORIES_PER_PAGE: 30,
  SEARCH_RESULTS_PER_PAGE: 24,
}

export const SORT_OPTIONS = {
  VIDEOS: [
    { value: 'latest', label: 'Latest' },
    { value: 'popular', label: 'Most Popular' },
    { value: 'trending', label: 'Trending' },
    { value: 'views', label: 'Most Viewed' },
    { value: 'duration', label: 'Longest' },
  ],
  MODELS: [
    { value: 'popular', label: 'Most Popular' },
    { value: 'videos', label: 'Most Videos' },
    { value: 'name', label: 'Name A-Z' },
    { value: 'latest', label: 'Newest' },
  ],
  PRODUCERS: [
    { value: 'popular', label: 'Most Popular' },
    { value: 'videos', label: 'Most Videos' },
    { value: 'name', label: 'Name A-Z' },
    { value: 'latest', label: 'Newest' },
  ],
}

export default CONFIG
