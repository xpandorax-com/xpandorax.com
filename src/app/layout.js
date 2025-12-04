import './globals.css'
import { ThemeProvider } from '@/components/ThemeProvider'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import BottomNav from '@/components/BottomNav'

export const metadata = {
  title: {
    default: 'XpandoraX - Premium Adult Content Platform',
    template: '%s | XpandoraX',
  },
  description: 'Premium adult content platform featuring high-quality videos, professional models, and exclusive content from top studios.',
  keywords: ['adult content', 'premium videos', 'models', 'entertainment'],
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://xpandorax.com'),
  openGraph: {
    title: 'XpandoraX - Premium Adult Content Platform',
    description: 'Premium adult content platform featuring high-quality videos, professional models, and exclusive content.',
    url: '/',
    siteName: 'XpandoraX',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'XpandoraX',
    description: 'Premium adult content platform',
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: '/favicon.ico',
  },
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: '#dc2626',
  viewportFit: 'cover',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-surface-950 text-white min-h-screen flex flex-col antialiased">
        <ThemeProvider>
          <Header />
          <main className="flex-1 pb-16 md:pb-0">
            {children}
          </main>
          <Footer />
          <BottomNav />
        </ThemeProvider>
      </body>
    </html>
  )
}
