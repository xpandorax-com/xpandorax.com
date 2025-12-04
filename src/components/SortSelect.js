'use client'

export default function SortSelect({ value, options, onChange, className = '' }) {
  const handleChange = (event) => {
    const newValue = event.target.value
    if (onChange) {
      onChange(newValue)
    } else {
      // Default behavior: update URL
      const url = new URL(window.location.href)
      url.searchParams.set('sort', newValue)
      url.searchParams.delete('page')
      window.location.href = url.toString()
    }
  }

  return (
    <select
      value={value}
      onChange={handleChange}
      className={`bg-surface-800 border border-surface-700 rounded-lg px-4 py-2 focus:outline-none focus:border-primary-500 transition-colors ${className}`}
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  )
}
