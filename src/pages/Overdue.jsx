import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCheckouts } from '../hooks/useCheckouts'

export default function Overdue() {
  const [overdue, setOverdue] = useState([])
  const [loading, setLoading] = useState(true)
  const { fetchOverdueCheckouts } = useCheckouts()
  const navigate = useNavigate()

  useEffect(() => {
    fetchOverdueCheckouts().then(({ data }) => {
      setOverdue(data)
      setLoading(false)
    })
  }, [])

  if (loading) return <div className="loading-wrap"><div className="spinner" /></div>

  return (
    <div className="page main-content">
      <div className="page-header">
        <h1 className="page-title">Overdue Books</h1>
        <p className="page-subtitle">{overdue.length} book{overdue.length !== 1 ? 's' : ''} past due</p>
      </div>

      {overdue.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🎊</div>
          <div className="empty-state-title">Nothing overdue!</div>
          <div className="empty-state-text">All borrowed books are within their return window.</div>
        </div>
      ) : (
        <div>
          {overdue.map(c => {
            const today = new Date()
            const due = new Date(c.due_date)
            const daysLate = Math.floor((today - due) / 86400000)
            return (
              <div
                key={c.id}
                className="overdue-item"
                style={{ cursor: 'pointer' }}
                onClick={() => navigate(`/book/${c.book_id}`)}
              >
                <div className="overdue-book-title">{c.books?.title}</div>
                <div className="overdue-meta">
                  by {c.books?.author && <em>{c.books.author}</em>}<br />
                  Borrowed by <strong>{c.borrower_name}</strong><br />
                  Due: {new Date(c.due_date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} — <span className="overdue-days">{daysLate} day{daysLate !== 1 ? 's' : ''} late</span>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
