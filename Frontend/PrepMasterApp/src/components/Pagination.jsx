import { ChevronLeft, ChevronRight } from 'lucide-react'
import './Pagination.css'

export default function Pagination({
  page = 0,
  totalPages = 0,
  onChange,
  disabled = false,
  label = 'Pagination',
}) {
  if (!onChange || totalPages <= 1) return null

  const current = Math.min(Math.max(0, page), totalPages - 1)

  return (
    <nav className="pagination" aria-label={label}>
      <button
        type="button"
        className="btn btn-secondary pagination-button"
        onClick={() => onChange(current - 1)}
        disabled={disabled || current === 0}
      >
        <ChevronLeft size={15} aria-hidden="true" />
        Previous
      </button>
      <span className="pagination-status" aria-live="polite">
        Page {current + 1} of {totalPages}
      </span>
      <button
        type="button"
        className="btn btn-secondary pagination-button"
        onClick={() => onChange(current + 1)}
        disabled={disabled || current >= totalPages - 1}
      >
        Next
        <ChevronRight size={15} aria-hidden="true" />
      </button>
    </nav>
  )
}
