import Link from 'next/link'

const footerLinks = {
  content: [
    { href: '/videos', label: 'Videos' },
    { href: '/models', label: 'Models' },
    { href: '/pictures', label: 'Pictures' },
    { href: '/producers', label: 'Studios' },
    { href: '/categories', label: 'Categories' },
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
}

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-surface-900 border-t border-surface-800 mt-auto">
      <div className="container mx-auto px-4 py-8 sm:py-10 lg:py-12">
        {/* Footer Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand */}
          <div className="col-span-2 sm:col-span-2 md:col-span-1 text-center sm:text-left">
            <Link href="/" className="inline-block mb-4">
              <span className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-primary-500 to-primary-600 bg-clip-text text-transparent">
                XpandoraX
              </span>
            </Link>
            <p className="text-surface-400 text-sm mb-4 max-w-xs mx-auto sm:mx-0">
              Premium adult content platform featuring high-quality videos from professional studios and verified models.
            </p>
            <p className="text-surface-500 text-xs">
              All models appearing on this website are 18 years or older.
            </p>
          </div>

          {/* Content Links */}
          <div className="text-center sm:text-left">
            <h3 className="text-white font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Content</h3>
            <ul className="space-y-2 sm:space-y-3">
              {footerLinks.content.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-surface-400 hover:text-white transition-colors text-sm inline-block py-1"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div className="text-center sm:text-left">
            <h3 className="text-white font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Company</h3>
            <ul className="space-y-2 sm:space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-surface-400 hover:text-white transition-colors text-sm inline-block py-1"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div className="text-center sm:text-left">
            <h3 className="text-white font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Legal</h3>
            <ul className="space-y-2 sm:space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-surface-400 hover:text-white transition-colors text-sm inline-block py-1"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-surface-800 mt-8 pt-6 sm:pt-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-surface-500 text-xs sm:text-sm text-center sm:text-left">
              {currentYear} XpandoraX. All rights reserved.
            </p>

            <div className="flex items-center gap-4">
              <Link
                href="/contact"
                className="text-surface-500 hover:text-white transition-colors text-xs sm:text-sm"
              >
                Support
              </Link>
              <span className="text-surface-700">|</span>
              <Link
                href="/terms"
                className="text-surface-500 hover:text-white transition-colors text-xs sm:text-sm"
              >
                Terms
              </Link>
              <span className="text-surface-700">|</span>
              <Link
                href="/privacy"
                className="text-surface-500 hover:text-white transition-colors text-xs sm:text-sm"
              >
                Privacy
              </Link>
            </div>
          </div>

          <p className="text-surface-600 text-xs mt-4 text-center">
            This website contains adult content. By entering, you confirm you are 18 years or older.
          </p>
        </div>
      </div>
    </footer>
  )
}
