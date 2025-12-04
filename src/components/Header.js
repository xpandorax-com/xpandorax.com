'use client'

import Link from 'next/link'
import { useState, useEffect, useCallback } from 'react'
import { useTheme } from './ThemeProvider'
import SearchForm from './SearchForm'

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const { theme, toggleTheme } = useTheme()

  const navLinks = [
    { href: '/videos', label: 'Videos', icon: '🎥' },
    { href: '/models', label: 'Models', icon: '👤' },
    { href: '/pictures', label: 'Pictures', icon: '🖼️' },
    { href: '/producers', label: 'Studios', icon: '🏢' },
    { href: '/contact', label: 'Contact', icon: '📧' },
  ]

  // Handle scroll effect for sticky header
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Close mobile menu on route change or escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') setMobileMenuOpen(false)
    }
    
    if (mobileMenuOpen) {
      document.addEventListener('keydown', handleEscape)
      // Prevent body scroll when menu is open
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = ''
    }
  }, [mobileMenuOpen])

  // Close menu when clicking outside
  const handleOverlayClick = useCallback(() => {
    setMobileMenuOpen(false)
  }, [])

  return (
    <>
      <header 
        className={`sticky top-0 z-50 transition-all duration-300 safe-area-top ${
          isScrolled 
            ? 'bg-gray-950/98 backdrop-blur-md shadow-lg shadow-black/20' 
            : 'bg-gray-950/95 backdrop-blur-sm'
        } border-b border-gray-800`}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16 md:h-18">
            {/* Logo */}
            <Link 
              href="/" 
              className="flex items-center gap-2 shrink-0 touch-target"
              aria-label="XpandoraX Home"
            >
              <span className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-red-500 to-red-600 bg-clip-text text-transparent">
                XpandoraX
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1" role="navigation" aria-label="Main navigation">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="px-4 py-2 rounded-lg text-gray-300 hover:text-white hover:bg-gray-800/50 transition-colors whitespace-nowrap"
                >
                  <span className="mr-1.5" aria-hidden="true">{link.icon}</span>
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Right Side Actions */}
            <div className="flex items-center gap-1 sm:gap-2">
              {/* Search - Desktop/Tablet */}
              <div className="hidden md:block w-48 lg:w-64">
                <SearchForm placeholder="Search..." compact />
              </div>

              {/* Search Icon - Mobile */}
              <Link
                href="/search"
                className="md:hidden p-2.5 rounded-lg hover:bg-gray-800 transition-colors touch-target"
                aria-label="Search"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </Link>

              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="p-2.5 rounded-lg hover:bg-gray-800 transition-colors touch-target"
                aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
              >
                {theme === 'dark' ? '🌙' : '☀️'}
              </button>

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2.5 rounded-lg hover:bg-gray-800 transition-colors touch-target"
                aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
                aria-expanded={mobileMenuOpen}
                aria-controls="mobile-menu"
              >
                <svg 
                  className="w-6 h-6 transition-transform duration-200" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                  style={{ transform: mobileMenuOpen ? 'rotate(90deg)' : 'rotate(0deg)' }}
                >
                  {mobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div 
          className="mobile-menu-overlay lg:hidden"
          onClick={handleOverlayClick}
          aria-hidden="true"
        />
      )}

      {/* Mobile Slide-in Menu */}
      {mobileMenuOpen && (
        <div 
          id="mobile-menu"
          className="mobile-menu lg:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Navigation menu"
        >
          {/* Mobile Menu Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-800">
            <span className="text-lg font-bold bg-gradient-to-r from-red-500 to-red-600 bg-clip-text text-transparent">
              Menu
            </span>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 rounded-lg hover:bg-gray-800 transition-colors touch-target"
              aria-label="Close menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Mobile Search */}
          <div className="p-4 border-b border-gray-800">
            <SearchForm placeholder="Search videos, models..." />
          </div>

          {/* Mobile Navigation Links */}
          <nav className="py-2" role="navigation" aria-label="Mobile navigation">
            {navLinks.map((link, index) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="mobile-nav-link"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <span className="text-xl" aria-hidden="true">{link.icon}</span>
                <span className="font-medium">{link.label}</span>
                <svg className="w-5 h-5 ml-auto text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            ))}
          </nav>

          {/* Mobile Menu Footer */}
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-800 bg-gray-950 safe-area-bottom">
            <div className="flex items-center justify-between text-sm text-gray-400">
              <span>Theme</span>
              <button
                onClick={toggleTheme}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors"
              >
                {theme === 'dark' ? '🌙 Dark' : '☀️ Light'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
