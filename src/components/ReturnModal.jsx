import { useCheckouts } from '../hooks/useCheckouts'

export default function ReturnModal({ book, checkout, onClose, onSuccess }) {
  const { returnBook, loading } = useCheckouts()

  async function handleReturn() {
    const { error } = await returnBook(checkout.id)
    if (!error) {
      onSuccess?.()
      onClose()
    }
  }

  const daysOut = checkout
    ? Math.floor((new Date() - new Date(checkout.checked_out_at)) / 86400000)
    : 0

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-sheet">
        <div className="modal-handle" />
        <div className="modal-title">📥 Return Book</div>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', marginBottom: '1rem' }}>
          Confirm that <strong>{checkout?.borrower_name}</strong> is returning:
        </p>
        <div className="status-box checked-out" style={{ marginBottom: '1.25rem' }}>
          <div className="status-box-header">
            <span style={{ fontSize: '1.25rem' }}>📖</span>
            <span className="status-box-label">{book.title}</span>
          </div>
          <div className="status-box-detail">
            Checked out {daysOut} day{daysOut !== 1 ? 's' : ''} ago<br />
            Due: {new Date(checkout?.due_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
          </div>
        </div>
        <div className="modal-footer">
          <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-return" onClick={handleReturn} disabled={loading}>
            {loading ? 'Returning…' : 'Mark as Returned'}
          </button>
        </div>
      </div>
    </div>
  )
}
