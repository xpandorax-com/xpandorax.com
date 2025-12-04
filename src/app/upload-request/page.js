export const metadata = {
  title: 'Upload Request',
  description: 'Request to have your content featured on our platform.',
}

export default function UploadRequestPage() {
  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            <span className="text-red-500">📤</span> Upload Request
          </h1>
          <p className="text-gray-400">
            Are you a content creator? Submit your content for review.
          </p>
        </div>

        {/* Info Box */}
        <div className="bg-blue-900/20 border border-blue-800 rounded-lg p-4 mb-8">
          <h3 className="font-semibold text-blue-400 mb-2">📋 Before You Submit</h3>
          <ul className="text-sm text-gray-400 space-y-1 list-disc list-inside">
            <li>All content must feature consenting adults (18+)</li>
            <li>You must own or have rights to the content</li>
            <li>Content must comply with our Terms of Service</li>
            <li>High-quality videos (720p minimum) preferred</li>
          </ul>
        </div>

        {/* Form */}
        <div className="card p-6 md:p-8">
          <form className="space-y-6">
            {/* Contact Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium mb-2">
                  Your Name / Studio Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-red-500 transition-colors"
                />
              </div>
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
                />
              </div>
            </div>

            {/* Content Type */}
            <div>
              <label htmlFor="contentType" className="block text-sm font-medium mb-2">
                Type of Content
              </label>
              <select
                id="contentType"
                name="contentType"
                required
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-red-500 transition-colors"
              >
                <option value="">Select content type</option>
                <option value="video">Videos</option>
                <option value="pictures">Photo Sets</option>
                <option value="both">Videos & Photos</option>
              </select>
            </div>

            {/* Content Details */}
            <div>
              <label htmlFor="details" className="block text-sm font-medium mb-2">
                Content Description
              </label>
              <textarea
                id="details"
                name="details"
                rows={4}
                required
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-red-500 transition-colors resize-none"
                placeholder="Describe your content, quantity, quality, categories..."
              />
            </div>

            {/* Portfolio Link */}
            <div>
              <label htmlFor="portfolio" className="block text-sm font-medium mb-2">
                Portfolio / Sample Link (optional)
              </label>
              <input
                type="url"
                id="portfolio"
                name="portfolio"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-red-500 transition-colors"
                placeholder="https://..."
              />
            </div>

            {/* Consent Checkbox */}
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="consent"
                name="consent"
                required
                className="mt-1 w-4 h-4 bg-gray-800 border-gray-700 rounded focus:ring-red-500"
              />
              <label htmlFor="consent" className="text-sm text-gray-400">
                I confirm that I own or have the rights to all content I&apos;m submitting, 
                and all individuals featured are consenting adults (18+). I agree to the 
                Terms of Service.
              </label>
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="btn-primary w-full py-3 text-lg"
            >
              Submit Request
            </button>
          </form>
        </div>

        {/* Additional Info */}
        <div className="mt-8 text-center text-gray-500 text-sm">
          <p>
            We review all submissions within 3-5 business days.
          </p>
          <p className="mt-2">
            Approved creators will be contacted via email with next steps.
          </p>
        </div>
      </div>
    </div>
  )
}
