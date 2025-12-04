export const metadata = {
  title: 'Terms of Service',
  description: 'Terms of Service for XpandoraX - Read our terms and conditions for using our platform.',
}

export default function TermsPage() {
  return (
    <div className="min-h-screen py-8 sm:py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl sm:text-3xl font-bold mb-8">Terms of Service</h1>
          
          <div className="card p-6 sm:p-8 prose prose-invert prose-surface max-w-none">
            <p className="text-surface-400 mb-6">
              Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </p>
            
            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">1. Acceptance of Terms</h2>
              <p className="text-surface-400 leading-relaxed">
                By accessing or using XpandoraX, you agree to be bound by these Terms of Service. If you do not agree with any part of these terms, you may not access the service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">2. Age Requirement</h2>
              <p className="text-surface-400 leading-relaxed">
                You must be at least 18 years old or the age of majority in your jurisdiction, whichever is higher, to access this website. By using this website, you represent and warrant that you meet this age requirement.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">3. User Conduct</h2>
              <p className="text-surface-400 leading-relaxed mb-4">
                You agree not to:
              </p>
              <ul className="list-disc list-inside text-surface-400 space-y-2">
                <li>Use the service for any illegal purpose</li>
                <li>Distribute, download, or copy content without permission</li>
                <li>Attempt to gain unauthorized access to any portion of the service</li>
                <li>Use automated systems to access the service</li>
                <li>Harass, abuse, or harm other users</li>
                <li>Upload or transmit viruses or malicious code</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">4. Intellectual Property</h2>
              <p className="text-surface-400 leading-relaxed">
                All content on this website, including but not limited to text, graphics, videos, logos, and images, is the property of XpandoraX or its content suppliers and is protected by intellectual property laws. You may not reproduce, distribute, or create derivative works without express written permission.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">5. Content Disclaimer</h2>
              <p className="text-surface-400 leading-relaxed">
                Content on this platform is provided by third-party content creators and studios. While we strive to ensure all content complies with applicable laws, we are not responsible for the accuracy, completeness, or legality of user-submitted content.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">6. Limitation of Liability</h2>
              <p className="text-surface-400 leading-relaxed">
                To the maximum extent permitted by law, XpandoraX shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues, whether incurred directly or indirectly.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">7. Indemnification</h2>
              <p className="text-surface-400 leading-relaxed">
                You agree to indemnify and hold harmless XpandoraX and its officers, directors, employees, and agents from any claims, damages, losses, liabilities, and expenses arising out of your use of the service or violation of these terms.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">8. Termination</h2>
              <p className="text-surface-400 leading-relaxed">
                We may terminate or suspend your access to the service immediately, without prior notice or liability, for any reason, including breach of these Terms of Service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">9. Changes to Terms</h2>
              <p className="text-surface-400 leading-relaxed">
                We reserve the right to modify these terms at any time. We will provide notice of any material changes by updating the "Last updated" date. Continued use of the service after changes constitutes acceptance of the modified terms.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4">10. Contact</h2>
              <p className="text-surface-400 leading-relaxed">
                For questions about these Terms of Service, please contact us at: <a href="mailto:legal@xpandorax.com" className="text-primary-400 hover:text-primary-300">legal@xpandorax.com</a>
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}
