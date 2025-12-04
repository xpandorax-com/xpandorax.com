'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navigationItems = [
  {
    href: '/',
    label: 'Home',
    exactMatch: true,
    icon: (active) => (
      <svg className={`w-6 h-6 ${active ? 'text-primary-500' : ''}`} fill={active ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={active ? 0 : 2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    href: '/videos',
    label: 'Videos',
    icon: (active) => (
      <svg className={`w-6 h-6 ${active ? 'text-primary-500' : ''}`} fill={active ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={active ? 0 : 2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={active ? 0 : 2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    href: '/models',
    label: 'Models',
    icon: (active) => (
      <svg className={`w-6 h-6 ${active ? 'text-primary-500' : ''}`} fill={active ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={active ? 0 : 2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
  },
  {
    href: '/pictures',
    label: 'Pictures',
    icon: (active) => (
      <svg className={`w-6 h-6 ${active ? 'text-primary-500' : ''}`} fill={active ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={active ? 0 : 2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    href: '/search',
    label: 'Search',
    icon: (active) => (
      <svg className={`w-6 h-6 ${active ? 'text-primary-500' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    ),
  },
]

export default function BottomNav() {
  const pathname = usePathname()

  const isActive = (item) => {
    if (item.exactMatch) {
      return pathname === item.href
    }
    return pathname.startsWith(item.href)
  }

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 bg-surface-950/98 backdrop-blur-md border-t border-surface-800 z-40 md:hidden"
      aria-label="Mobile navigation"
    >
      <div className="flex items-center justify-around py-2 px-1 safe-area-bottom">
        {navigationItems.map((item) => {
          const active = isActive(item)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center py-2 px-3 rounded-lg transition-colors min-w-[64px] ${
                active ? 'text-primary-500' : 'text-surface-400 hover:text-white'
              }`}
              aria-current={active ? 'page' : undefined}
            >
              {item.icon(active)}
              <span className={`text-xs mt-1 ${active ? 'font-medium' : ''}`}>
                {item.label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
