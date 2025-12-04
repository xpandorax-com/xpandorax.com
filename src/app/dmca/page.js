export const metadata = {
  title: 'DMCA Policy',
  description: 'DMCA and copyright policy for XpandoraX - Learn how to submit takedown requests.',
}

export default function DMCAPage() {
  return (
    <div className="min-h-screen py-8 sm:py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl sm:text-3xl font-bold mb-8">DMCA Policy</h1>
          
          <div className="card p-6 sm:p-8 prose prose-invert prose-surface max-w-none">
            <p className="text-surface-400 mb-6">
              Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </p>
            
            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Digital Millennium Copyright Act Notice</h2>
              <p className="text-surface-400 leading-relaxed">
                XpandoraX respects the intellectual property rights of others and expects users of our service to do the same. In accordance with the Digital Millennium Copyright Act of 1998 ("DMCA"), we will respond expeditiously to claims of copyright infringement that are reported to our designated copyright agent.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Filing a DMCA Notice</h2>
              <p className="text-surface-400 leading-relaxed mb-4">
                If you believe that your copyrighted work has been copied in a way that constitutes copyright infringement, please provide our copyright agent with the following information:
              </p>
              <ol className="list-decimal list-inside text-surface-400 space-y-3">
                <li>A physical or electronic signature of the copyright owner or a person authorized to act on their behalf</li>
                <li>Identification of the copyrighted work claimed to have been infringed</li>
                <li>Identification of the material that is claimed to be infringing, including the URL or other specific location on our site</li>
                <li>Your contact information, including your address, telephone number, and email address</li>
                <li>A statement that you have a good faith belief that use of the material is not authorized by the copyright owner, its agent, or the law</li>
                <li>A statement, under penalty of perjury, that the above information is accurate and that you are authorized to act on behalf of the copyright owner</li>
              </ol>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Designated Copyright Agent</h2>
              <p className="text-surface-400 leading-relaxed mb-4">
                DMCA notices should be sent to our designated copyright agent:
              </p>
              <div className="bg-surface-800 p-4 rounded-lg">
                <p className="text-surface-300">DMCA Agent</p>
                <p className="text-surface-300">XpandoraX Legal Department</p>
                <p className="text-surface-300">Email: <a href="mailto:dmca@xpandorax.com" className="text-primary-400 hover:text-primary-300">dmca@xpandorax.com</a></p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Counter-Notification</h2>
              <p className="text-surface-400 leading-relaxed mb-4">
                If you believe your content was removed in error, you may file a counter-notification containing:
              </p>
              <ol className="list-decimal list-inside text-surface-400 space-y-3">
                <li>Your physical or electronic signature</li>
                <li>Identification of the material that was removed and the location where it appeared before removal</li>
                <li>A statement under penalty of perjury that you have a good faith belief the material was removed by mistake or misidentification</li>
                <li>Your name, address, and telephone number</li>
                <li>A statement that you consent to the jurisdiction of the federal district court for your address, or if outside the US, any judicial district in which XpandoraX may be found</li>
                <li>A statement that you will accept service of process from the person who provided the original notification</li>
              </ol>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Repeat Infringers</h2>
              <p className="text-surface-400 leading-relaxed">
                In accordance with the DMCA and other applicable law, we have adopted a policy of terminating, in appropriate circumstances, users who are deemed to be repeat infringers. We may also, at our sole discretion, limit access to the site or terminate the accounts of users who infringe any intellectual property rights of others.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4">Response Time</h2>
              <p className="text-surface-400 leading-relaxed">
                We aim to process all valid DMCA requests within 24-48 business hours. For urgent requests, please indicate "URGENT" in the subject line of your email.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}
