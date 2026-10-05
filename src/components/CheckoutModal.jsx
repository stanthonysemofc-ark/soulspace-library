import { useState } from 'react'
import { useCheckouts } from '../hooks/useCheckouts'

const GRADES = [
  'Pre-K', 'Kindergarten',
  'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6',
  'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10', 'Grade 11', 'Grade 12',
  'Adult / Teacher',
]

export default function CheckoutModal({ book, onClose, onSuccess }) {
  const [borrowerName, setBorrowerName] = useState('')
  const [grade, setGrade] = useState('')
  const [notes, setNotes] = useState('')
  const { checkoutBook, loading } = useCheckouts()

  async function handleSubmit(e) {
    e.preventDefault()
    if (!borrowerName.trim() || !grade) return
    const { error } = await checkoutBook({
      bookId: book.id,
      borrowerName: borrowerName.trim(),
      grade,
      notes,
    })
    if (!error) {
      onSuccess?.()
      onClose()
    }
  }

  const dueDate = new Date()
  dueDate.setDate(dueDate.getDate() + 14)

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-sheet">
        <div className="modal-handle" />
        <div className="modal-title">📤 Check Out Book</div>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
          <strong>{book.title}</strong> — due back by{' '}
          <strong>{dueDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}</strong>
        </p>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Borrower's Name *</label>
            <input
              className="form-input"
              placeholder="Enter full name"
              value={borrowerName}
              onChange={e => setBorrowerName(e.target.value)}
              autoFocus
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Grade *</label>
            <select
              className="form-select"
              value={grade}
              onChange={e => setGrade(e.target.value)}
              required
            >
              <option value="">Select grade…</option>
              {GRADES.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Notes <span style={{ fontWeight: 400, color: 'var(--color-text-muted)' }}>(optional)</span></label>
            <input
              className="form-input"
              placeholder="e.g. Lost bookmark, needs care"
              value={notes}
              onChange={e => setNotes(e.target.value)}
            />
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button
              type="submit"
              className="btn btn-checkout"
              disabled={loading || !borrowerName.trim() || !grade}
            >
              {loading ? 'Checking out…' : 'Confirm Checkout'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
