export const metadata = {
  title: 'Contact Us',
  description: 'Get in touch with our team.',
}

export default function ContactPage() {
  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            <span className="text-red-500">📧</span> Contact Us
          </h1>
          <p className="text-gray-400">
            Have a question or feedback? We&apos;d love to hear from you.
          </p>
        </div>

        {/* Contact Form */}
        <div className="card p-6 md:p-8">
          <form className="space-y-6">
            {/* Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-2">
                Your Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                required
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-red-500 transition-colors"
                placeholder="John Doe"
              />
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                required
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-red-500 transition-colors"
                placeholder="you@example.com"
              />
            </div>

            {/* Subject */}
            <div>
              <label htmlFor="subject" className="block text-sm font-medium mb-2">
                Subject
              </label>
              <select
                id="subject"
                name="subject"
                required
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-red-500 transition-colors"
              >
                <option value="">Select a subject</option>
                <option value="general">General Inquiry</option>
                <option value="support">Technical Support</option>
                <option value="business">Business Partnership</option>
                <option value="content">Content Removal</option>
                <option value="feedback">Feedback</option>
                <option value="other">Other</option>
              </select>
            </div>

            {/* Message */}
            <div>
              <label htmlFor="message" className="block text-sm font-medium mb-2">
                Message
              </label>
              <textarea
                id="message"
                name="message"
                rows={6}
                required
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-red-500 transition-colors resize-none"
                placeholder="How can we help you?"
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="btn-primary w-full py-3 text-lg"
            >
              Send Message
            </button>
          </form>
        </div>

        {/* Additional Info */}
        <div className="mt-8 text-center text-gray-500 text-sm">
          <p>
            We typically respond within 24-48 hours.
          </p>
          <p className="mt-2">
            For urgent matters, please include &quot;URGENT&quot; in your subject.
          </p>
        </div>
      </div>
    </div>
  )
}
