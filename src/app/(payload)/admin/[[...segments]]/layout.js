/* eslint-disable @next/next/no-page-custom-font */
import '@/app/globals.css'

export const metadata = {
  title: {
    default: 'Admin | XpandoraX',
    template: '%s | Admin | XpandoraX',
  },
  description: 'XpandoraX Admin Dashboard',
  robots: {
    index: false,
    follow: false,
  },
}

export default function AdminLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body>
        {children}
      </body>
    </html>
  )
}
