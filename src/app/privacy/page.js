export const metadata = {
  title: 'Privacy Policy',
  description: 'Privacy policy for XpandoraX - Learn how we collect, use, and protect your personal information.',
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen py-8 sm:py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl sm:text-3xl font-bold mb-8">Privacy Policy</h1>
          
          <div className="card p-6 sm:p-8 prose prose-invert prose-surface max-w-none">
            <p className="text-surface-400 mb-6">
              Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </p>
            
            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">1. Introduction</h2>
              <p className="text-surface-400 leading-relaxed">
                XpandoraX ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">2. Information We Collect</h2>
              <p className="text-surface-400 leading-relaxed mb-4">
                We may collect information about you in various ways:
              </p>
              <ul className="list-disc list-inside text-surface-400 space-y-2">
                <li>Personal data you voluntarily provide (name, email, etc.)</li>
                <li>Usage data and browsing information</li>
                <li>Device and browser information</li>
                <li>Cookies and tracking technologies</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">3. How We Use Your Information</h2>
              <p className="text-surface-400 leading-relaxed mb-4">
                We use the information we collect to:
              </p>
              <ul className="list-disc list-inside text-surface-400 space-y-2">
                <li>Provide and maintain our services</li>
                <li>Improve user experience</li>
                <li>Send administrative information</li>
                <li>Respond to inquiries and support requests</li>
                <li>Enforce our terms and policies</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">4. Cookies</h2>
              <p className="text-surface-400 leading-relaxed">
                We use cookies and similar tracking technologies to track activity on our website. Cookies are files with a small amount of data which may include an anonymous unique identifier. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">5. Data Security</h2>
              <p className="text-surface-400 leading-relaxed">
                We implement appropriate technical and organizational security measures to protect your personal information. However, no method of transmission over the Internet or electronic storage is 100% secure, and we cannot guarantee absolute security.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">6. Third-Party Services</h2>
              <p className="text-surface-400 leading-relaxed">
                We may employ third-party companies and individuals to facilitate our service, provide service-related services, or assist us in analyzing how our service is used. These third parties have access to your personal data only to perform these tasks on our behalf.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">7. Your Rights</h2>
              <p className="text-surface-400 leading-relaxed mb-4">
                Depending on your location, you may have certain rights regarding your personal information, including:
              </p>
              <ul className="list-disc list-inside text-surface-400 space-y-2">
                <li>The right to access your data</li>
                <li>The right to rectification</li>
                <li>The right to erasure</li>
                <li>The right to restrict processing</li>
                <li>The right to data portability</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">8. Changes to This Policy</h2>
              <p className="text-surface-400 leading-relaxed">
                We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4">9. Contact Us</h2>
              <p className="text-surface-400 leading-relaxed">
                If you have any questions about this Privacy Policy, please contact us at: <a href="mailto:privacy@xpandorax.com" className="text-primary-400 hover:text-primary-300">privacy@xpandorax.com</a>
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}
