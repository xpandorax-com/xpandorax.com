export const metadata = {
  title: '18 U.S.C. 2257 Compliance',
  description: '18 U.S.C. 2257 Record-Keeping Requirements Compliance Statement for XpandoraX.',
}

export default function Compliance2257Page() {
  return (
    <div className="min-h-screen py-8 sm:py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl sm:text-3xl font-bold mb-8">18 U.S.C. 2257 Compliance Statement</h1>
          
          <div className="card p-6 sm:p-8 prose prose-invert prose-surface max-w-none">
            <p className="text-surface-400 mb-6">
              Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </p>
            
            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Record-Keeping Requirements Compliance Statement</h2>
              <p className="text-surface-400 leading-relaxed">
                All content appearing on XpandoraX is in full compliance with the requirements of 18 U.S.C. 2257 and 28 C.F.R. 75.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Content Providers</h2>
              <p className="text-surface-400 leading-relaxed">
                All content appearing on this website is provided by independent third-party content producers, studios, and distributors. These content providers are responsible for maintaining records in compliance with the record-keeping requirements of 18 U.S.C. 2257 and 28 C.F.R. 75.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Age Verification</h2>
              <p className="text-surface-400 leading-relaxed">
                All models, performers, and other individuals appearing in any visual depiction of actual or simulated sexually explicit conduct appearing on, or otherwise contained in, this website were over the age of eighteen (18) years at the time the visual depiction was created.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Records Custodian</h2>
              <p className="text-surface-400 leading-relaxed mb-4">
                Records required to be maintained pursuant to 18 U.S.C. 2257 are kept by the respective content producers, studios, and distributors who provide content to this website.
              </p>
              <p className="text-surface-400 leading-relaxed">
                For specific records requests, please contact the original content producer or studio. A list of content providers and their contact information may be obtained by contacting:
              </p>
              <div className="bg-surface-800 p-4 rounded-lg mt-4">
                <p className="text-surface-300">Custodian of Records</p>
                <p className="text-surface-300">XpandoraX Compliance Department</p>
                <p className="text-surface-300">Email: <a href="mailto:2257@xpandorax.com" className="text-primary-400 hover:text-primary-300">2257@xpandorax.com</a></p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Exemption Statement</h2>
              <p className="text-surface-400 leading-relaxed">
                XpandoraX is not a primary or secondary producer of any visual content. We operate as a platform for the distribution of content created by third-party producers. As such, the record-keeping requirements of 18 U.S.C. 2257 are incumbent upon the original producers of the content.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Compliance Verification</h2>
              <p className="text-surface-400 leading-relaxed">
                Before any content is made available on our platform, we require verification from the content provider that:
              </p>
              <ul className="list-disc list-inside text-surface-400 space-y-2 mt-4">
                <li>All performers are at least 18 years of age</li>
                <li>Proper 2257 records are maintained by the producer</li>
                <li>All necessary consent and releases have been obtained</li>
                <li>The content complies with all applicable laws and regulations</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4">Questions and Concerns</h2>
              <p className="text-surface-400 leading-relaxed">
                If you have any questions or concerns regarding our 2257 compliance, please contact our compliance department at <a href="mailto:2257@xpandorax.com" className="text-primary-400 hover:text-primary-300">2257@xpandorax.com</a>.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}
