import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, BookOpen, AlertTriangle, CheckCircle, Lock } from 'lucide-react'
import { useBooks } from '../hooks/useBooks'
import { useAuth } from '../context/AuthContext'
import CheckoutModal from '../components/CheckoutModal'
import ReturnModal from '../components/ReturnModal'

function getStatusInfo(book) {
  const activeCheckout = book.checkouts?.find(c => !c.returned_at)
  if (!activeCheckout) return { status: 'available', checkout: null }
  const today = new Date()
  const due = new Date(activeCheckout.due_date)
  const isOverdue = due < today
  return { status: isOverdue ? 'overdue' : 'checked-out', checkout: activeCheckout }
}

export default function BookDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { fetchBookById } = useBooks()
  const { user } = useAuth()
  const [book, setBook] = useState(null)
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(null) // 'checkout' | 'return'

  async function loadBook() {
    const { data } = await fetchBookById(id)
    setBook(data)
    setLoading(false)
  }

  useEffect(() => { loadBook() }, [id])

  if (loading) return <div className="loading-wrap"><div className="spinner" /></div>
  if (!book) return <div className="page"><p>Book not found.</p></div>

  const { status, checkout } = getStatusInfo(book)
  const history = book.checkouts?.filter(c => c.returned_at)?.sort(
    (a, b) => new Date(b.checked_out_at) - new Date(a.checked_out_at)
  ) || []

  const statusIcon = status === 'available' ? <CheckCircle size={20} color="var(--color-available)" /> : <AlertTriangle size={20} color={status === 'overdue' ? 'var(--color-overdue)' : 'var(--color-checked-out)'} />
  const statusLabel = status === 'available' ? 'Available' : status === 'overdue' ? 'Overdue' : 'Checked Out'

  return (
    <div className="page main-content">
      <button
        style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--color-primary)', fontWeight: 600, marginBottom: '1.25rem', fontSize: '0.9rem' }}
        onClick={() => navigate(-1)}
      >
        <ArrowLeft size={16} /> Back
      </button>

      <div className="book-detail-hero">
        <div className="book-detail-cover">
          {book.cover_url ? <img src={book.cover_url} alt={book.title} /> : '📖'}
        </div>
        <div className="book-detail-meta">
          <h1 className="book-detail-title">{book.title}</h1>
          {book.author && <div className="book-detail-author">by {book.author}</div>}
          {book.category && (
            <div className="book-detail-category">
              <span className="category-pill">{book.category}</span>
            </div>
          )}
          {book.isbn && <div className="book-detail-isbn">ISBN: {book.isbn}</div>}
        </div>
      </div>

      {book.description && (
        <p className="book-detail-desc">{book.description}</p>
      )}

      <div className="divider" />

      <div className={`status-box ${status}`}>
        <div className="status-box-header">
          {statusIcon}
          <span className="status-box-label">{statusLabel}</span>
        </div>
        {status !== 'available' && checkout && (
          <div className="status-box-detail">
            Borrowed by <strong>{checkout.borrower_name}</strong>
            {checkout.grade && <> &middot; {checkout.grade}</>}<br />
            Due: {new Date(checkout.due_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            {checkout.notes && <><br />Note: {checkout.notes}</>}
          </div>
        )}
      </div>

      {status === 'available' ? (
        <button className="btn btn-checkout btn-block" onClick={() => setModal('checkout')}>
          <BookOpen size={18} /> Check Out This Book
        </button>
      ) : user ? (
        <button className="btn btn-return btn-block" onClick={() => setModal('return')}>
          📥 Mark as Returned
        </button>
      ) : (
        <div style={{
          display: 'flex', alignItems: 'center', gap: '0.5rem',
          background: 'var(--color-surface-2)', borderRadius: 'var(--radius-md)',
          padding: '0.9rem 1.1rem', color: 'var(--color-text-secondary)',
          fontSize: '0.88rem', border: '1px solid var(--color-border)'
        }}>
          <Lock size={15} style={{ flexShrink: 0 }} />
          Only an admin can mark this book as returned.
        </div>
      )}

      {history.length > 0 && (
        <div className="history-section">
          <div className="history-title">Checkout History</div>
          {history.map(c => (
            <div key={c.id} className="history-item">
              <div>
                <div className="history-item-name">{c.borrower_name}</div>
                {(c.grade || c.notes) && (
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                    {[c.grade, c.notes].filter(Boolean).join(' · ')}
                  </div>
                )}
              </div>
              <div className="history-item-dates">
                Out: {new Date(c.checked_out_at).toLocaleDateString()}<br />
                In: {new Date(c.returned_at).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      )}

      {modal === 'checkout' && (
        <CheckoutModal book={book} onClose={() => setModal(null)} onSuccess={loadBook} />
      )}
      {modal === 'return' && checkout && (
        <ReturnModal book={book} checkout={checkout} onClose={() => setModal(null)} onSuccess={loadBook} />
      )}
    </div>
  )
}
