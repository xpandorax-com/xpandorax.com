// Mock data for development and fallback
// This data is used when database is not available

export const mockCategories = [
  { slug: 'amateur', name: 'Amateur', icon: '📹', description: 'Amateur content', videoCount: 245 },
  { slug: 'professional', name: 'Professional', icon: '🎬', description: 'Professional studio content', videoCount: 189 },
  { slug: 'milf', name: 'MILF', icon: '👩', description: 'Mature content', videoCount: 156 },
  { slug: 'teen', name: 'Teen (18+)', icon: '🔞', description: 'Young adult content (18+)', videoCount: 312 },
  { slug: 'asian', name: 'Asian', icon: '🌸', description: 'Asian content', videoCount: 198 },
  { slug: 'ebony', name: 'Ebony', icon: '✨', description: 'Ebony content', videoCount: 145 },
  { slug: 'latina', name: 'Latina', icon: '🌶️', description: 'Latina content', videoCount: 167 },
  { slug: 'blonde', name: 'Blonde', icon: '💛', description: 'Blonde content', videoCount: 234 },
  { slug: 'brunette', name: 'Brunette', icon: '🤎', description: 'Brunette content', videoCount: 256 },
  { slug: 'redhead', name: 'Redhead', icon: '🧡', description: 'Redhead content', videoCount: 98 },
  { slug: 'big-tits', name: 'Big Tits', icon: '🍈', description: 'Big tits content', videoCount: 289 },
  { slug: 'anal', name: 'Anal', icon: '🍑', description: 'Anal content', videoCount: 178 },
]

export const mockModels = [
  { slug: 'emma-stone', name: 'Emma Stone', avatar: null, bio: 'Popular content creator', verified: true, country: 'USA', videoCount: 45, views: 2500000, subscribers: 15000 },
  { slug: 'sophia-lee', name: 'Sophia Lee', avatar: null, bio: 'Asian beauty', verified: true, country: 'South Korea', videoCount: 38, views: 1800000, subscribers: 12000 },
  { slug: 'maria-garcia', name: 'Maria Garcia', avatar: null, bio: 'Latina sensation', verified: true, country: 'Colombia', videoCount: 52, views: 3200000, subscribers: 18000 },
  { slug: 'ashley-jones', name: 'Ashley Jones', avatar: null, bio: 'Blonde bombshell', verified: false, country: 'USA', videoCount: 28, views: 950000, subscribers: 8000 },
  { slug: 'jasmine-black', name: 'Jasmine Black', avatar: null, bio: 'Ebony goddess', verified: true, country: 'UK', videoCount: 41, views: 2100000, subscribers: 14000 },
  { slug: 'maya-red', name: 'Maya Red', avatar: null, bio: 'Fiery redhead', verified: false, country: 'Ireland', videoCount: 22, views: 680000, subscribers: 5500 },
  { slug: 'anna-white', name: 'Anna White', avatar: null, bio: 'European beauty', verified: true, country: 'Germany', videoCount: 35, views: 1500000, subscribers: 11000 },
  { slug: 'lily-chen', name: 'Lily Chen', avatar: null, bio: 'Petite Asian', verified: true, country: 'China', videoCount: 48, views: 2800000, subscribers: 16000 },
]

export const mockProducers = [
  { slug: 'studio-x', name: 'Studio X', logo: null, banner: null, description: 'Premium content producer', website: 'https://example.com', videoCount: 156, views: 12000000, subscribers: 45000, verified: true },
  { slug: 'passion-films', name: 'Passion Films', logo: null, banner: null, description: 'Artistic adult entertainment', website: 'https://example.com', videoCount: 89, views: 8500000, subscribers: 32000, verified: true },
  { slug: 'reality-kings', name: 'Reality Kings', logo: null, banner: null, description: 'Reality-based content', website: 'https://example.com', videoCount: 234, views: 25000000, subscribers: 78000, verified: true },
  { slug: 'vixen-media', name: 'Vixen Media', logo: null, banner: null, description: 'High-end production', website: 'https://example.com', videoCount: 112, views: 15000000, subscribers: 55000, verified: true },
]

export const mockVideos = Array.from({ length: 50 }, (_, i) => ({
  id: `video-${i + 1}`,
  slug: `video-${i + 1}`,
  title: `Sample Video ${i + 1} - Professional Quality Content`,
  description: 'This is a sample video description. Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
  thumbnail: null,
  videoUrl: '',
  duration: Math.floor(Math.random() * 1800) + 300, // 5-35 minutes
  quality: ['4K', '1080p', '720p'][Math.floor(Math.random() * 3)],
  views: Math.floor(Math.random() * 500000) + 10000,
  likes: Math.floor(Math.random() * 10000) + 100,
  status: 'published',
  categories: [mockCategories[Math.floor(Math.random() * mockCategories.length)]],
  models: [mockModels[Math.floor(Math.random() * mockModels.length)]],
  producer: mockProducers[Math.floor(Math.random() * mockProducers.length)],
  tags: ['sample', 'video', 'content'],
  createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
}))
