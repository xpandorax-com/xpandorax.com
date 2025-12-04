'use client'

import { useState } from 'react'

export default function UploadRequestForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    type: '',
    studioName: '',
    website: '',
    contentDescription: '',
    sampleLinks: '',
    hasRights: false,
    has2257: false,
    agreeTerms: false,
  })
  const [status, setStatus] = useState({ type: '', message: '' })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.hasRights || !formData.has2257 || !formData.agreeTerms) {
      setStatus({
        type: 'error',
        message: 'Please confirm all required checkboxes before submitting.',
      })
      return
    }
    
    setIsSubmitting(true)
    setStatus({ type: '', message: '' })
    
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    setStatus({
      type: 'success',
      message: 'Your upload request has been submitted successfully. Our team will review your submission and contact you within 5-7 business days.',
    })
    setFormData({
      name: '',
      email: '',
      type: '',
      studioName: '',
      website: '',
      contentDescription: '',
      sampleLinks: '',
      hasRights: false,
      has2257: false,
      agreeTerms: false,
    })
    setIsSubmitting(false)
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  return (
    <div className="min-h-screen py-8 sm:py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="text-center mb-10">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4">Upload Request</h1>
            <p className="text-surface-400 max-w-xl mx-auto">
              Are you a content creator or studio? Submit your content for review and get featured on our platform.
            </p>
          </div>

          {/* Info Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
            <div className="card p-4 text-center">
              <div className="text-2xl font-bold text-primary-500 mb-1">1</div>
              <div className="text-sm text-surface-400">Submit Request</div>
            </div>
            <div className="card p-4 text-center">
              <div className="text-2xl font-bold text-primary-500 mb-1">2</div>
              <div className="text-sm text-surface-400">Content Review</div>
            </div>
            <div className="card p-4 text-center">
              <div className="text-2xl font-bold text-primary-500 mb-1">3</div>
              <div className="text-sm text-surface-400">Get Featured</div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="card p-6 sm:p-8 space-y-6">
            {status.message && (
              <div className={`p-4 rounded-lg ${status.type === 'success' ? 'bg-green-600/20 text-green-400' : 'bg-red-600/20 text-red-400'}`}>
                {status.message}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium mb-2">
                  Contact Name <span className="text-primary-500">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full bg-surface-800 border border-surface-700 rounded-lg px-4 py-3 text-white placeholder-surface-500 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                  placeholder="Your name"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-2">
                  Email Address <span className="text-primary-500">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full bg-surface-800 border border-surface-700 rounded-lg px-4 py-3 text-white placeholder-surface-500 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                  placeholder="your@email.com"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label htmlFor="type" className="block text-sm font-medium mb-2">
                  Submission Type <span className="text-primary-500">*</span>
                </label>
                <select
                  id="type"
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  required
                  className="w-full bg-surface-800 border border-surface-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                >
                  <option value="">Select type</option>
                  <option value="studio">Studio / Production Company</option>
                  <option value="independent">Independent Creator</option>
                  <option value="model">Model / Performer</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label htmlFor="studioName" className="block text-sm font-medium mb-2">
                  Studio / Brand Name
                </label>
                <input
                  type="text"
                  id="studioName"
                  name="studioName"
                  value={formData.studioName}
                  onChange={handleChange}
                  className="w-full bg-surface-800 border border-surface-700 rounded-lg px-4 py-3 text-white placeholder-surface-500 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                  placeholder="Your studio name"
                />
              </div>
            </div>

            <div>
              <label htmlFor="website" className="block text-sm font-medium mb-2">
                Website / Portfolio
              </label>
              <input
                type="url"
                id="website"
                name="website"
                value={formData.website}
                onChange={handleChange}
                className="w-full bg-surface-800 border border-surface-700 rounded-lg px-4 py-3 text-white placeholder-surface-500 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                placeholder="https://your-website.com"
              />
            </div>

            <div>
              <label htmlFor="contentDescription" className="block text-sm font-medium mb-2">
                Content Description <span className="text-primary-500">*</span>
              </label>
              <textarea
                id="contentDescription"
                name="contentDescription"
                value={formData.contentDescription}
                onChange={handleChange}
                required
                rows={4}
                className="w-full bg-surface-800 border border-surface-700 rounded-lg px-4 py-3 text-white placeholder-surface-500 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 resize-none"
                placeholder="Describe the type of content you produce, your experience, and what makes your content unique..."
              ></textarea>
            </div>

            <div>
              <label htmlFor="sampleLinks" className="block text-sm font-medium mb-2">
                Sample Links
              </label>
              <textarea
                id="sampleLinks"
                name="sampleLinks"
                value={formData.sampleLinks}
                onChange={handleChange}
                rows={3}
                className="w-full bg-surface-800 border border-surface-700 rounded-lg px-4 py-3 text-white placeholder-surface-500 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 resize-none"
                placeholder="Provide links to sample content (one per line)..."
              ></textarea>
              <p className="text-xs text-surface-500 mt-1">Provide links to preview your content quality.</p>
            </div>

            {/* Checkboxes */}
            <div className="space-y-4 pt-4 border-t border-surface-700">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="hasRights"
                  checked={formData.hasRights}
                  onChange={handleChange}
                  className="mt-1 w-5 h-5 rounded border-surface-600 bg-surface-800 text-primary-500 focus:ring-primary-500 focus:ring-offset-surface-900"
                />
                <span className="text-sm text-surface-300">
                  I confirm that I own or have the legal rights to distribute this content. <span className="text-primary-500">*</span>
                </span>
              </label>

              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="has2257"
                  checked={formData.has2257}
                  onChange={handleChange}
                  className="mt-1 w-5 h-5 rounded border-surface-600 bg-surface-800 text-primary-500 focus:ring-primary-500 focus:ring-offset-surface-900"
                />
                <span className="text-sm text-surface-300">
                  I confirm that I maintain proper 18 U.S.C. 2257 records for all performers. <span className="text-primary-500">*</span>
                </span>
              </label>

              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="agreeTerms"
                  checked={formData.agreeTerms}
                  onChange={handleChange}
                  className="mt-1 w-5 h-5 rounded border-surface-600 bg-surface-800 text-primary-500 focus:ring-primary-500 focus:ring-offset-surface-900"
                />
                <span className="text-sm text-surface-300">
                  I agree to the <a href="/terms" className="text-primary-400 hover:text-primary-300">Terms of Service</a> and <a href="/privacy" className="text-primary-400 hover:text-primary-300">Privacy Policy</a>. <span className="text-primary-500">*</span>
                </span>
              </label>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full btn-primary py-3 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Submitting...
                </span>
              ) : (
                'Submit Request'
              )}
            </button>
          </form>

          {/* Additional Info */}
          <div className="mt-8 text-center text-surface-500 text-sm">
            <p>Review process typically takes 5-7 business days.</p>
            <p>For inquiries, contact us at <a href="mailto:submissions@xpandorax.com" className="text-primary-400 hover:text-primary-300">submissions@xpandorax.com</a></p>
          </div>
        </div>
      </div>
    </div>
  )
}
