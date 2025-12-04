import Link from 'next/link'

export const metadata = {
  title: 'About Us',
  description: 'Learn more about XpandoraX, our mission, and our commitment to quality adult entertainment.',
}

export default function AboutPage() {
  return (
    <div className="min-h-screen py-8 sm:py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4">About XpandoraX</h1>
            <p className="text-surface-400 text-lg max-w-2xl mx-auto">
              Premium adult entertainment platform dedicated to quality content and professional creators.
            </p>
          </div>

          {/* Mission Section */}
          <div className="card p-6 sm:p-8 mb-8">
            <h2 className="text-xl font-bold mb-4">Our Mission</h2>
            <p className="text-surface-400 leading-relaxed">
              XpandoraX is committed to providing a premium adult entertainment experience. We work exclusively with professional studios and verified creators to ensure the highest quality content. Our platform prioritizes user experience, content quality, and creator rights.
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            <div className="card p-6">
              <div className="w-12 h-12 rounded-lg bg-primary-600/20 flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
              </div>
              <h3 className="font-semibold mb-2">Quality Content</h3>
              <p className="text-surface-400 text-sm">
                All content is reviewed for quality standards before being published on our platform.
              </p>
            </div>

            <div className="card p-6">
              <div className="w-12 h-12 rounded-lg bg-primary-600/20 flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="font-semibold mb-2">Privacy First</h3>
              <p className="text-surface-400 text-sm">
                We take privacy seriously with secure browsing and minimal data collection.
              </p>
            </div>

            <div className="card p-6">
              <div className="w-12 h-12 rounded-lg bg-primary-600/20 flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="font-semibold mb-2">Creator Support</h3>
              <p className="text-surface-400 text-sm">
                We partner with creators and studios to showcase their work professionally.
              </p>
            </div>

            <div className="card p-6">
              <div className="w-12 h-12 rounded-lg bg-primary-600/20 flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="font-semibold mb-2">Fast Performance</h3>
              <p className="text-surface-400 text-sm">
                Optimized streaming and fast loading times for the best viewing experience.
              </p>
            </div>
          </div>

          {/* Compliance Section */}
          <div className="card p-6 sm:p-8 mb-8">
            <h2 className="text-xl font-bold mb-4">Legal Compliance</h2>
            <p className="text-surface-400 leading-relaxed mb-4">
              XpandoraX operates in full compliance with all applicable laws and regulations. We maintain strict age verification and require all content providers to maintain proper documentation in accordance with 18 U.S.C. 2257 requirements.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/2257" className="text-primary-400 hover:text-primary-300 text-sm">
                18 U.S.C. 2257 Compliance
              </Link>
              <Link href="/dmca" className="text-primary-400 hover:text-primary-300 text-sm">
                DMCA Policy
              </Link>
              <Link href="/terms" className="text-primary-400 hover:text-primary-300 text-sm">
                Terms of Service
              </Link>
              <Link href="/privacy" className="text-primary-400 hover:text-primary-300 text-sm">
                Privacy Policy
              </Link>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center">
            <h2 className="text-xl font-bold mb-4">Want to Join Us?</h2>
            <p className="text-surface-400 mb-6">
              If you are a content creator or studio interested in partnering with us, we would love to hear from you.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/upload-request" className="btn-primary px-6 py-3">
                Submit Content
              </Link>
              <Link href="/contact" className="btn-secondary px-6 py-3">
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
