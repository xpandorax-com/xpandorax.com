import { Link } from "@remix-run/react";

interface FooterProps {
  appName: string;
}

export function Footer({ appName }: FooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t bg-background safe-area-bottom">
      <div className="container py-6 sm:py-8 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <div className="grid gap-8 grid-cols-2 md:grid-cols-4 lg:gap-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1 space-y-3 sm:space-y-4">
            <Link to="/" className="inline-block text-lg sm:text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              {appName}
            </Link>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Video content platform. All content is intended for adults
              18 years of age or older.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="mb-3 sm:mb-4 text-xs sm:text-sm font-semibold">Quick Links</h3>
            <ul className="space-y-2 text-xs sm:text-sm">
              <li>
                <Link
                  to="/videos"
                  className="text-muted-foreground hover:text-primary transition-colors py-1 inline-block touch-target"
                >
                  Videos
                </Link>
              </li>
              <li>
                <Link
                  to="/categories"
                  className="text-muted-foreground hover:text-primary transition-colors py-1 inline-block touch-target"
                >
                  Categories
                </Link>
              </li>
              <li>
                <Link
                  to="/models"
                  className="text-muted-foreground hover:text-primary transition-colors py-1 inline-block touch-target"
                >
                  Models
                </Link>
              </li>
              <li>
                <Link
                  to="/pictures"
                  className="text-muted-foreground hover:text-primary transition-colors py-1 inline-block touch-target"
                >
                  Pictures
                </Link>
              </li>
              <li>
                <Link
                  to="/producers"
                  className="text-muted-foreground hover:text-primary transition-colors py-1 inline-block touch-target"
                >
                  Producers
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="mb-3 sm:mb-4 text-xs sm:text-sm font-semibold">Legal</h3>
            <ul className="space-y-2 text-xs sm:text-sm">
              <li>
                <Link
                  to="/terms"
                  className="text-muted-foreground hover:text-primary transition-colors py-1 inline-block touch-target"
                >
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link
                  to="/privacy"
                  className="text-muted-foreground hover:text-primary transition-colors py-1 inline-block touch-target"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  to="/dmca"
                  className="text-muted-foreground hover:text-primary transition-colors py-1 inline-block touch-target"
                >
                  DMCA
                </Link>
              </li>
              <li>
                <Link
                  to="/2257"
                  className="text-muted-foreground hover:text-primary transition-colors py-1 inline-block touch-target"
                >
                  18 U.S.C. 2257
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="mb-3 sm:mb-4 text-xs sm:text-sm font-semibold">Support</h3>
            <ul className="space-y-2 text-xs sm:text-sm">
              <li>
                <Link
                  to="/about"
                  className="text-muted-foreground hover:text-primary transition-colors py-1 inline-block touch-target"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="text-muted-foreground hover:text-primary transition-colors py-1 inline-block touch-target"
                >
                  Contact Us
                </Link>
              </li>
              <li>
                <a
                  href="mailto:support@xpandorax.com"
                  className="text-muted-foreground hover:text-primary transition-colors py-1 inline-block touch-target break-all"
                >
                  support@xpandorax.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-6 sm:mt-8 border-t pt-6 sm:pt-8 text-center text-xs sm:text-sm text-muted-foreground">
          <p>
            © {currentYear} {appName}. All rights reserved.
          </p>
          <p className="mt-2">
            All models appearing on this site are 18 years of age or older.
          </p>
        </div>
      </div>
    </footer>
  );
}
