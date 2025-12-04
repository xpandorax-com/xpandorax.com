// Site configuration
export const siteConfig = {
  name: 'XpandoraX',
  description: 'Premium adult content platform',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'https://xpandorax.com',
  
  // Logo configuration
  logo: {
    url: process.env.NEXT_PUBLIC_LOGO_URL || '/images/logo.png',
    alt: 'XpandoraX Logo',
    width: 150,
    height: 40,
  },
  
  // Social links
  social: {
    twitter: 'https://twitter.com/xpandorax',
    instagram: 'https://instagram.com/xpandorax',
  },
  
  // Contact info
  contact: {
    email: 'contact@xpandorax.com',
    support: 'support@xpandorax.com',
  },
  
  // SEO defaults
  seo: {
    titleTemplate: '%s | XpandoraX',
    defaultTitle: 'XpandoraX - Premium Adult Content Platform',
    defaultDescription: 'Premium adult content platform featuring high-quality videos, professional models, and exclusive content from top studios.',
  },
}

// Navigation configuration
export const navConfig = {
  mainNav: [
    { href: '/videos', label: 'Videos', icon: '🎥' },
    { href: '/models', label: 'Models', icon: '👤' },
    { href: '/pictures', label: 'Pictures', icon: '🖼️' },
    { href: '/producers', label: 'Studios', icon: '🏢' },
    { href: '/contact', label: 'Contact', icon: '📧' },
  ],
  footerNav: {
    content: [
      { href: '/videos', label: 'Videos' },
      { href: '/models', label: 'Models' },
      { href: '/pictures', label: 'Pictures' },
      { href: '/producers', label: 'Studios' },
    ],
    company: [
      { href: '/about', label: 'About Us' },
      { href: '/contact', label: 'Contact' },
      { href: '/upload-request', label: 'Upload Request' },
    ],
    legal: [
      { href: '/privacy', label: 'Privacy Policy' },
      { href: '/terms', label: 'Terms of Service' },
      { href: '/dmca', label: 'DMCA' },
      { href: '/2257', label: '18 U.S.C. 2257' },
    ],
  },
}

// Pagination defaults
export const paginationConfig = {
  defaultPageSize: 24,
  pageSizeOptions: [12, 24, 48, 96],
}

// Video quality options
export const videoQualityOptions = [
  { value: '4K', label: '4K Ultra HD' },
  { value: '1080p', label: '1080p Full HD' },
  { value: '720p', label: '720p HD' },
  { value: '480p', label: '480p SD' },
]

// Sort options
export const sortOptions = {
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
}
