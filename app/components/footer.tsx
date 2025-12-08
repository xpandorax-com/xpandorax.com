import { Link } from "@remix-run/react";

interface FooterProps {
  appName: string;
}

export function Footer({ appName }: FooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t bg-background">
      <div className="container py-8">
        <div className="grid gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="space-y-4">
            <Link to="/" className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              {appName}
            </Link>
            <p className="text-sm text-muted-foreground">
              Premium video content platform. All content is intended for adults
              18 years of age or older.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="mb-4 text-sm font-semibold">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  to="/videos"
                  className="text-muted-foreground hover:text-primary"
                >
                  Videos
                </Link>
              </li>
              <li>
                <Link
                  to="/categories"
                  className="text-muted-foreground hover:text-primary"
                >
                  Categories
                </Link>
              </li>
              <li>
                <Link
                  to="/models"
                  className="text-muted-foreground hover:text-primary"
                >
                  Models
                </Link>
              </li>
              <li>
                <Link
                  to="/pictures"
                  className="text-muted-foreground hover:text-primary"
                >
                  Pictures
                </Link>
              </li>
              <li>
                <Link
                  to="/producers"
                  className="text-muted-foreground hover:text-primary"
                >
                  Producers
                </Link>
              </li>
              <li>
                <Link
                  to="/premium"
                  className="text-muted-foreground hover:text-primary"
                >
                  Remove Ads
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="mb-4 text-sm font-semibold">Legal</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  to="/terms"
                  className="text-muted-foreground hover:text-primary"
                >
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link
                  to="/privacy"
                  className="text-muted-foreground hover:text-primary"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  to="/dmca"
                  className="text-muted-foreground hover:text-primary"
                >
                  DMCA
                </Link>
              </li>
              <li>
                <Link
                  to="/2257"
                  className="text-muted-foreground hover:text-primary"
                >
                  18 U.S.C. 2257
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="mb-4 text-sm font-semibold">Support</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  to="/about"
                  className="text-muted-foreground hover:text-primary"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="text-muted-foreground hover:text-primary"
                >
                  Contact Us
                </Link>
              </li>
              <li>
                <a
                  href="mailto:support@xpandorax.com"
                  className="text-muted-foreground hover:text-primary"
                >
                  support@xpandorax.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t pt-8 text-center text-sm text-muted-foreground">
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
