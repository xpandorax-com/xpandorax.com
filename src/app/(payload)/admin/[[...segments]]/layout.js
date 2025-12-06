/* eslint-disable @next/next/no-page-custom-font */
import { RootLayout } from '@payloadcms/next/layouts'
import config from '@payload-config'
import './custom.scss'

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
    <RootLayout config={config}>
      {children}
    </RootLayout>
  )
}
