import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { History as HistoryIcon, Search, Download, CheckCircle, Clock, AlertTriangle, Filter } from 'lucide-react'
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
  const [statusFilter, setStatusFilter] = useState('all')
  const [gradeFilter, setGradeFilter] = useState('All Grades')
  const [returnTarget, setReturnTarget] = useState(null)
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => { loadHistory() }, [refreshKey])

  async function loadHistory() {
    const { data } = await fetchAllCheckoutsHistory()
    setHistory(data)
  }

  const todayStr = new Date().toISOString().split('T')[0]

  const filtered = history.filter(c => {
    const isReturned = !!c.returned_at
    const isOverdue = !isReturned && c.due_date < todayStr
    const isActive = !isReturned
    if (statusFilter === 'active' && !isActive) return false
    if (statusFilter === 'returned' && !isReturned) return false
    if (statusFilter === 'overdue' && !isOverdue) return false
    if (gradeFilter !== 'All Grades' && c.grade !== gradeFilter) return false
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
            <HistoryIcon size={24} color="var(--color-primary)" /> Checkout History
          </h1>
          <p className="page-subtitle">Full log of current &amp; recent checkouts (kept 2 months)</p>
        </div>
        <button
          onClick={() => exportAllHistoryCSV(filtered)}
          className="btn btn-secondary btn-sm"
          disabled={filtered.length === 0}
        >
          <Download size={15} /> Export CSV
        </button>
      </div>

      {/* Stats — tap to filter */}
      <div className="stats-grid" style={{ marginBottom: '1.25rem' }}>
        <div className={`stat-card ${statusFilter === 'all' ? 'active' : ''}`} onClick={() => setStatusFilter('all')}>
          <div className="stat-label">Total Logged</div>
          <div className="stat-value">{totalCount}</div>
        </div>
        <div className={`stat-card ${statusFilter === 'active' ? 'active' : ''}`} onClick={() => setStatusFilter('active')}>
          <div className="stat-label">Active Loans</div>
          <div className="stat-value" style={{ color: 'var(--color-primary)' }}>{activeCount}</div>
        </div>
        <div className={`stat-card ${statusFilter === 'returned' ? 'active' : ''}`} onClick={() => setStatusFilter('returned')}>
          <div className="stat-label">Returned</div>
          <div className="stat-value" style={{ color: 'var(--color-success)' }}>{returnedCount}</div>
        </div>
        <div className={`stat-card ${statusFilter === 'overdue' ? 'active' : ''}`} onClick={() => setStatusFilter('overdue')}>
          <div className="stat-label">Overdue</div>
          <div className="stat-value" style={{ color: 'var(--color-overdue)' }}>{overdueCount}</div>
        </div>
      </div>

      {/* Search */}
      <div className="search-bar" style={{ marginBottom: '0.75rem' }}>
        <Search className="search-icon" size={17} />
        <input
          type="text"
          className="search-input"
          placeholder="Search title, borrower, grade…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* Status Pills + Grade Filter Row */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <div className="category-pills" style={{ flex: '1 1 auto' }}>
          {[['all', 'All'], ['active', `Active (${activeCount})`], ['returned', `Returned (${returnedCount})`], ['overdue', `Overdue (${overdueCount})`]].map(([val, label]) => (
            <button key={val} className={`pill ${statusFilter === val ? 'active' : ''}`} onClick={() => setStatusFilter(val)}>
              {label}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexShrink: 0 }}>
          <Filter size={15} color="var(--color-text-muted)" />
          <select
            value={gradeFilter}
            onChange={e => setGradeFilter(e.target.value)}
            className="form-select"
            style={{ padding: '0.5rem 2.2rem 0.5rem 0.75rem', fontSize: '0.82rem', minWidth: '130px' }}
          >
            {GRADE_OPTIONS.map(g => <option key={g} value={g}>{g}</option>)}
          </select>
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="loading-state">
          <div className="spinner" />
          <p>Loading checkout history…</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📜</div>
          <h3>No records found</h3>
          <p>Try adjusting your search or filters.</p>
        </div>
      ) : (
        <div className="admin-book-list">
          {filtered.map(c => {
            const isReturned = !!c.returned_at
            const isOverdue = !isReturned && c.due_date < todayStr
            return (
              <div key={c.id} className="admin-book-item history-item">

                {/* Top row */}
                <div className="history-item-top">
                  <div className="history-item-left">
                    <Link to={`/book/${c.books?.id || c.book_id}`} className="history-item-book-title">
                      {c.books?.title || 'Unknown Book'}
                    </Link>
                    {c.books?.author && (
                      <span className="history-item-author"> · {c.books.author}</span>
                    )}
                    <div style={{ marginTop: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                      <span className="history-item-borrower">{c.borrower_name}</span>
                      {c.grade && <span className="badge badge-secondary" style={{ fontSize: '0.7rem' }}>{c.grade}</span>}
                    </div>
                  </div>

                  <div className="history-item-right">
                    {isReturned ? (
                      <span className="badge badge-available"><CheckCircle size={12} /> Returned</span>
                    ) : isOverdue ? (
                      <span className="badge badge-overdue"><AlertTriangle size={12} /> Overdue</span>
                    ) : (
                      <span className="badge badge-checked-out"><Clock size={12} /> Active</span>
                    )}
                    {!isReturned && user && (
                      <button
                        onClick={() => setReturnTarget(c)}
                        className="btn btn-sm btn-return"
                      >
                        Return
                      </button>
                    )}
                  </div>
                </div>

                {/* Dates row */}
                <div className="history-item-meta">
                  <span>📅 Out: <strong>{new Date(c.checked_out_at).toLocaleDateString()}</strong></span>
                  <span>⏳ Due: <strong>{c.due_date}</strong></span>
                  {c.returned_at && <span>✅ Back: <strong>{new Date(c.returned_at).toLocaleDateString()}</strong></span>}
                  {c.notes && <span style={{ fontStyle: 'italic' }}>💬 {c.notes}</span>}
                </div>

              </div>
            )
          })}
        </div>
      )}

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
