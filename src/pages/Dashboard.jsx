import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { BookOpen, History, AlertTriangle, Download, ArrowRight, Church, PlusCircle, CheckCircle, Clock } from 'lucide-react'
import { useCheckouts } from '../hooks/useCheckouts'
import { useBooks } from '../hooks/useBooks'
import { useAuth } from '../context/AuthContext'

export default function Dashboard() {
  const [stats, setStats] = useState({ total: 0, out: 0, overdue: 0 })
  const [active, setActive] = useState([])
  const [loading, setLoading] = useState(true)
  const { fetchStats, fetchActiveCheckouts, exportBorrowedCSV } = useCheckouts()
  const { books, fetchBooks } = useBooks()
  const { user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    async function load() {
      const [s, { data }] = await Promise.all([fetchStats(), fetchActiveCheckouts()])
      setStats(s)
      setActive(data)
      fetchBooks('', '', 6) // preview top books
      setLoading(false)
    }
    load()
  }, [])

  if (loading) return <div className="loading-wrap"><div className="spinner" /></div>

  return (
    <div className="page-container main-content">
      {/* Main Hero Header for St. Anthony's Church, Kadalana */}
      <div
        style={{
          background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 40%, #4338ca 100%)',
          borderRadius: 'var(--radius-xl)',
          padding: '2rem 1.75rem',
          color: '#ffffff',
          marginBottom: '2rem',
          boxShadow: 'var(--shadow-lg)',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <div style={{ position: 'relative', zIndex: 2 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)', padding: '0.35rem 0.8rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-accent-light)', marginBottom: '0.85rem' }}>
            <Church size={14} /> St. Anthony's Church, Kadalana
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
            <img src="/logo.png" alt="SoulSpace Logo" style={{ width: '64px', height: '64px', borderRadius: '16px', background: '#ffffff', padding: '4px', boxShadow: '0 8px 24px rgba(0,0,0,0.25)', objectFit: 'contain' }} />
            <div>
              <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.2rem', fontWeight: 800, lineHeight: 1.1, letterSpacing: '-0.02em', margin: 0 }}>
                SoulSpace Library
              </h1>
              <p style={{ color: '#e0e7ff', fontSize: '0.95rem', fontWeight: 500, margin: '0.2rem 0 0 0' }}>
                English Medium Section — Sunday School Resource & Book Management System
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <Link to="/catalog" className="btn btn-primary" style={{ background: '#ffffff', color: '#4338ca', boxShadow: '0 4px 14px rgba(0,0,0,0.2)' }}>
              <BookOpen size={17} /> Browse Catalog ({stats.total})
            </Link>
            <Link to="/history" className="btn btn-secondary" style={{ background: 'rgba(255,255,255,0.12)', color: '#ffffff', borderColor: 'rgba(255,255,255,0.25)' }}>
              <History size={17} /> Checkout History
            </Link>
            {user && (
              <Link to="/admin/add" className="btn btn-secondary" style={{ background: 'var(--color-accent-gradient)', color: '#ffffff', border: 'none' }}>
                <PlusCircle size={17} /> Add Book
              </Link>
            )}
          </div>
        </div>

        {/* Decorative background glow */}
        <div style={{ position: 'absolute', right: '-40px', bottom: '-40px', width: '220px', height: '220px', borderRadius: '50%', background: 'rgba(245, 158, 11, 0.15)', filter: 'blur(40px)', pointerEvents: 'none' }} />
      </div>

      {/* Stats Counter Grid */}
      <div className="stats-grid" style={{ marginBottom: '2rem' }}>
        <div className="stat-card" onClick={() => navigate('/catalog')} style={{ cursor: 'pointer' }}>
          <div className="stat-value">{stats.total}</div>
          <div className="stat-label">Total Inventory</div>
        </div>
        <div className="stat-card" onClick={() => navigate('/history')} style={{ cursor: 'pointer' }}>
          <div className="stat-value" style={{ color: 'var(--color-primary)' }}>{stats.out}</div>
          <div className="stat-label">Active Loans</div>
        </div>
        <div className="stat-card" onClick={() => navigate('/overdue')} style={{ cursor: 'pointer' }}>
          <div className="stat-value" style={{ color: stats.overdue > 0 ? 'var(--color-overdue)' : 'var(--color-available)' }}>
            {stats.overdue}
          </div>
          <div className="stat-label">Overdue Items</div>
        </div>
      </div>

      {/* Active Borrowers Section */}
      <div style={{ marginBottom: '2.5rem' }}>
        <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <div>
            <h2 className="section-title" style={{ fontSize: '1.25rem', fontFamily: 'var(--font-display)', fontWeight: 700 }}>
              Currently Borrowed Books ({active.length})
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
              Active checkouts in the English Medium Section
            </p>
          </div>
          {active.length > 0 && (
            <button className="btn btn-secondary btn-sm" onClick={exportBorrowedCSV}>
              <Download size={14} /> Export Active CSV
            </button>
          )}
        </div>

        {active.length === 0 ? (
          <div className="empty-state" style={{ padding: '2.5rem 1.5rem' }}>
            <div className="empty-icon">🎉</div>
            <h3>All books are in stock!</h3>
            <p>No books are currently checked out. Visit the catalog to lend a book.</p>
            <Link to="/catalog" className="btn btn-primary btn-sm" style={{ marginTop: '1rem' }}>
              Open Catalog
            </Link>
          </div>
        ) : (
          <div className="admin-book-list">
            {active.map(c => {
              const today = new Date()
              const due = new Date(c.due_date)
              const isOverdue = due < today
              const daysLeft = Math.ceil((due - today) / 86400000)

              return (
                <div
                  key={c.id}
                  className="admin-book-item"
                  style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}
                  onClick={() => navigate(`/book/${c.book_id}`)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                    <div className="admin-book-thumb" style={{ background: 'var(--color-primary-light)', color: 'var(--color-primary)', fontWeight: 700 }}>
                      📖
                    </div>
                    <div>
                      <div className="admin-book-title" style={{ fontSize: '1rem', color: 'var(--color-text)' }}>
                        {c.books?.title}
                      </div>
                      <div className="admin-book-sub" style={{ fontSize: '0.85rem' }}>
                        Borrower: <strong>{c.borrower_name}</strong> {c.grade ? ` · ${c.grade}` : ''}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    {isOverdue ? (
                      <span className="badge badge-overdue">
                        <AlertTriangle size={12} /> Overdue by {Math.abs(daysLeft)}d
                      </span>
                    ) : (
                      <span className="badge badge-checked-out">
                        <Clock size={12} /> Due in {daysLeft}d ({c.due_date})
                      </span>
                    )}
                    <ArrowRight size={16} color="var(--color-text-muted)" />
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Quick Catalog Spotlight */}
      {books.length > 0 && (
        <div>
          <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2 className="section-title" style={{ fontSize: '1.25rem', fontFamily: 'var(--font-display)', fontWeight: 700 }}>
              Featured Library Catalog
            </h2>
            <Link to="/catalog" style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--color-primary)', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
              View All ({stats.total}) <ArrowRight size={14} />
            </Link>
          </div>

          <div className="books-grid">
            {books.slice(0, 4).map(book => (
              <div key={book.id} className="book-card" onClick={() => navigate(`/book/${book.id}`)}>
                {book.cover_url ? (
                  <div className="book-cover"><img src={book.cover_url} alt={book.title} /></div>
                ) : (
                  <div className="book-cover-placeholder">📘</div>
                )}
                <div className="book-info">
                  <div className="book-title">{book.title}</div>
                  <div className="book-author">{book.author}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
