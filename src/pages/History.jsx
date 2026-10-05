import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { History as HistoryIcon, Search, Download, CheckCircle, Clock, AlertTriangle, Filter, BookOpen } from 'lucide-react'
import { useCheckouts } from '../hooks/useCheckouts'
import { useAuth } from '../context/AuthContext'
import ReturnModal from '../components/ReturnModal'

const GRADE_OPTIONS = [
  'All Grades',
  'Preschool / Nursery',
  'Kindergarten',
  '1st Grade',
  '2nd Grade',
  '3rd Grade',
  '4th Grade',
  '5th Grade',
  '6th Grade',
  'Middle School (7th-8th)',
  'High School (9th-12th)',
  'Adult',
  'Teacher / Leader'
]

export default function History() {
  const { fetchAllCheckoutsHistory, exportAllHistoryCSV, returnBook, loading } = useCheckouts()
  const { user } = useAuth()
  const [history, setHistory] = useState([])
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all') // all, active, returned, overdue
  const [gradeFilter, setGradeFilter] = useState('All Grades')
  const [returnTarget, setReturnTarget] = useState(null)
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    loadHistory()
  }, [refreshKey])

  async function loadHistory() {
    const { data } = await fetchAllCheckoutsHistory()
    setHistory(data)
  }

  const todayStr = new Date().toISOString().split('T')[0]

  // Filter logic
  const filtered = history.filter(c => {
    const isReturned = !!c.returned_at
    const isOverdue = !isReturned && c.due_date < todayStr
    const isActive = !isReturned

    // Status filter
    if (statusFilter === 'active' && !isActive) return false
    if (statusFilter === 'returned' && !isReturned) return false
    if (statusFilter === 'overdue' && !isOverdue) return false

    // Grade filter
    if (gradeFilter !== 'All Grades' && c.grade !== gradeFilter) return false

    // Search filter
    if (search.trim()) {
      const q = search.toLowerCase()
      const title = c.books?.title?.toLowerCase() || ''
      const author = c.books?.author?.toLowerCase() || ''
      const borrower = c.borrower_name?.toLowerCase() || ''
      const grade = c.grade?.toLowerCase() || ''
      const notes = c.notes?.toLowerCase() || ''
      return title.includes(q) || author.includes(q) || borrower.includes(q) || grade.includes(q) || notes.includes(q)
    }

    return true
  })

  // Counters
  const totalCount = history.length
  const activeCount = history.filter(c => !c.returned_at).length
  const returnedCount = history.filter(c => c.returned_at).length
  const overdueCount = history.filter(c => !c.returned_at && c.due_date < todayStr).length

  async function handleReturnConfirm() {
    if (!returnTarget) return
    await returnBook(returnTarget.id)
    setReturnTarget(null)
    setRefreshKey(k => k + 1)
  }

  return (
    <div className="page-container">
      {/* Header */}
      <div className="admin-header">
        <div>
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <HistoryIcon size={26} color="var(--primary)" /> Checkout History
          </h1>
          <p className="page-subtitle">Full log of current and recent checkouts (kept for 2 months)</p>
        </div>
        <button
          onClick={() => exportAllHistoryCSV(filtered)}
          className="btn btn-secondary"
          style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          disabled={filtered.length === 0}
        >
          <Download size={16} /> Export History CSV
        </button>
      </div>

      {/* Stats Quick Overview */}
      <div className="stats-grid" style={{ marginBottom: '1.5rem' }}>
        <div className={`stat-card ${statusFilter === 'all' ? 'active' : ''}`} onClick={() => setStatusFilter('all')} style={{ cursor: 'pointer' }}>
          <div className="stat-label">Total Logged</div>
          <div className="stat-value">{totalCount}</div>
        </div>
        <div className={`stat-card ${statusFilter === 'active' ? 'active' : ''}`} onClick={() => setStatusFilter('active')} style={{ cursor: 'pointer' }}>
          <div className="stat-label">Active Loans</div>
          <div className="stat-value" style={{ color: 'var(--primary)' }}>{activeCount}</div>
        </div>
        <div className={`stat-card ${statusFilter === 'returned' ? 'active' : ''}`} onClick={() => setStatusFilter('returned')} style={{ cursor: 'pointer' }}>
          <div className="stat-label">Returned</div>
          <div className="stat-value" style={{ color: 'var(--success)' }}>{returnedCount}</div>
        </div>
        <div className={`stat-card ${statusFilter === 'overdue' ? 'active' : ''}`} onClick={() => setStatusFilter('overdue')} style={{ cursor: 'pointer' }}>
          <div className="stat-label">Overdue</div>
          <div className="stat-value" style={{ color: 'var(--danger)' }}>{overdueCount}</div>
        </div>
      </div>

      {/* Controls & Search */}
      <div className="catalog-toolbar" style={{ flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1.5rem' }}>
        {/* Search */}
        <div className="search-bar" style={{ flex: '1 1 250px' }}>
          <Search className="search-icon" size={18} />
          <input
            type="text"
            className="search-input"
            placeholder="Search title, borrower, grade, or notes..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {/* Status Filter Buttons */}
        <div className="category-pills">
          <button
            className={`pill ${statusFilter === 'all' ? 'active' : ''}`}
            onClick={() => setStatusFilter('all')}
          >
            All
          </button>
          <button
            className={`pill ${statusFilter === 'active' ? 'active' : ''}`}
            onClick={() => setStatusFilter('active')}
          >
            Active ({activeCount})
          </button>
          <button
            className={`pill ${statusFilter === 'returned' ? 'active' : ''}`}
            onClick={() => setStatusFilter('returned')}
          >
            Returned ({returnedCount})
          </button>
          <button
            className={`pill ${statusFilter === 'overdue' ? 'active' : ''}`}
            onClick={() => setStatusFilter('overdue')}
          >
            Overdue ({overdueCount})
          </button>
        </div>

        {/* Grade Filter Dropdown */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Filter size={16} color="var(--text-muted)" />
          <select
            value={gradeFilter}
            onChange={e => setGradeFilter(e.target.value)}
            className="form-select"
            style={{ padding: '0.5rem 0.75rem', fontSize: '0.875rem' }}
          >
            {GRADE_OPTIONS.map(g => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>
        </div>
      </div>

      {/* History List / Table */}
      {loading ? (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading checkout history...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📜</div>
          <h3>No records found</h3>
          <p>Try adjusting your search query or filters.</p>
        </div>
      ) : (
        <div className="admin-book-list">
          {filtered.map(c => {
            const isReturned = !!c.returned_at
            const isOverdue = !isReturned && c.due_date < todayStr

            return (
              <div key={c.id} className="admin-book-item" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '0.5rem' }}>
                <div style={{ display: 'flex', width: '100%', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', flexWrap: 'wrap' }}>
                  
                  {/* Left: Book & Borrower Info */}
                  <div style={{ flex: '1 1 300px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                      <Link to={`/book/${c.books?.id || c.book_id}`} style={{ fontWeight: '600', fontSize: '1rem', color: 'var(--primary)', textDecoration: 'none' }}>
                        {c.books?.title || 'Unknown Book'}
                      </Link>
                      {c.books?.author && (
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>by {c.books.author}</span>
                      )}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', fontSize: '0.875rem' }}>
                      <span style={{ fontWeight: '600', color: 'var(--text-main)' }}>
                        Borrower: {c.borrower_name}
                      </span>
                      {c.grade && (
                        <span className="badge badge-secondary" style={{ fontSize: '0.75rem' }}>
                          {c.grade}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Right: Status Badge & Dates */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                    {isReturned ? (
                      <span className="badge badge-available" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <CheckCircle size={13} /> Returned
                      </span>
                    ) : isOverdue ? (
                      <span className="badge badge-overdue" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <AlertTriangle size={13} /> Overdue
                      </span>
                    ) : (
                      <span className="badge badge-checked-out" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <Clock size={13} /> Active Loan
                      </span>
                    )}

                    {/* Admin Return Button */}
                    {!isReturned && user && (
                      <button
                        onClick={() => setReturnTarget(c)}
                        className="btn btn-sm btn-outline-success"
                        style={{ fontSize: '0.8rem', padding: '0.25rem 0.6rem' }}
                      >
                        Return
                      </button>
                    )}
                  </div>
                </div>

                {/* Sub details: Dates & Notes */}
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', gap: '1.25rem', flexWrap: 'wrap', marginTop: '0.25rem', paddingTop: '0.25rem', borderTop: '1px dashed var(--border-color)', width: '100%' }}>
                  <span>📅 Checked out: <strong>{new Date(c.checked_out_at).toLocaleDateString()}</strong></span>
                  <span>⏳ Due date: <strong>{c.due_date}</strong></span>
                  {c.returned_at && (
                    <span>✅ Returned: <strong>{new Date(c.returned_at).toLocaleDateString()}</strong></span>
                  )}
                  {c.notes && (
                    <span style={{ fontStyle: 'italic' }}>💬 Notes: {c.notes}</span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Return Modal for Admin returning directly from history */}
      {returnTarget && (
        <ReturnModal
          bookTitle={returnTarget.books?.title || 'Book'}
          borrowerName={returnTarget.borrower_name}
          onConfirm={handleReturnConfirm}
          onClose={() => setReturnTarget(null)}
        />
      )}
    </div>
  )
}
