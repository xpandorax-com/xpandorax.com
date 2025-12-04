export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-surface-700 border-t-primary-500 rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-surface-400">Loading...</p>
      </div>
    </div>
  )
}
