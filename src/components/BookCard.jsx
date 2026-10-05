import { useNavigate } from 'react-router-dom'

function getStatusInfo(book) {
  const activeCheckout = book.checkouts?.find(c => !c.returned_at)
  if (!activeCheckout) return { status: 'available', label: 'Available' }
  const today = new Date()
  const due = new Date(activeCheckout.due_date)
  if (due < today) return { status: 'overdue', label: 'Overdue' }
  return { status: 'checked-out', label: 'Checked Out' }
}

export default function BookCard({ book }) {
  const navigate = useNavigate()
  const { status, label } = getStatusInfo(book)

  return (
    <div className="book-card" onClick={() => navigate(`/book/${book.id}`)}>
      <div className="book-cover-placeholder">
        {book.cover_url
          ? <img src={book.cover_url} alt={book.title} loading="lazy" />
          : '📖'}
      </div>
      <div className="book-info">
        <div className="book-title">{book.title}</div>
        {book.author && <div className="book-author">{book.author}</div>}
        <div className="book-status-badge">
          <span className={`badge ${status}`}>{label}</span>
        </div>
      </div>
    </div>
  )
}
