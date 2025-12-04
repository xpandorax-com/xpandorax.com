'use client'

import { useState } from 'react'

const languages = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'pt', name: 'Português', flag: '🇧🇷' },
  { code: 'ja', name: '日本語', flag: '🇯🇵' },
]

export default function LanguageSelector() {
  const [isOpen, setIsOpen] = useState(false)
  const [currentLang, setCurrentLang] = useState(languages[0])

  const handleSelect = (lang) => {
    setCurrentLang(lang)
    setIsOpen(false)
    // In a real implementation, this would trigger i18n locale change
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-800 transition-colors"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <span>{currentLang.flag}</span>
        <span className="hidden sm:inline text-sm">{currentLang.code.toUpperCase()}</span>
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown */}
          <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-lg shadow-xl border border-gray-700 overflow-hidden z-20">
            <ul role="listbox">
              {languages.map((lang) => (
                <li key={lang.code}>
                  <button
                    onClick={() => handleSelect(lang)}
                    className={`w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-700 transition-colors ${
                      currentLang.code === lang.code ? 'bg-gray-700' : ''
                    }`}
                    role="option"
                    aria-selected={currentLang.code === lang.code}
                  >
                    <span>{lang.flag}</span>
                    <span className="text-sm">{lang.name}</span>
                    {currentLang.code === lang.code && (
                      <svg className="w-4 h-4 ml-auto text-red-500" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                      </svg>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </>
      )}
    </div>
  )
}
