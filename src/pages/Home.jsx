import { useState, useEffect, useCallback } from 'react'
import { Search } from 'lucide-react'
import BookCard from '../components/BookCard'
import { useBooks } from '../hooks/useBooks'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'

export default function Home() {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [categories, setCategories] = useState([])
  const { books, loading, fetchBooks, fetchCategories } = useBooks()
  const { user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    fetchCategories().then(setCategories)
  }, [])

  const doSearch = useCallback(() => {
    fetchBooks(search, category)
  }, [search, category])

  useEffect(() => {
    const id = setTimeout(doSearch, 300)
    return () => clearTimeout(id)
  }, [search, category])

  return (
    <div className="page main-content">
      <div className="page-header" style={{ marginBottom: '2rem' }}>
        <h1 className="page-title" style={{ fontSize: '2.1rem' }}>Book Catalog</h1>
        <p className="page-subtitle">English Medium Section · Sunday School of St. Anthony's Church, Kadalana ({books.length} book{books.length !== 1 ? 's' : ''} available)</p>
      </div>

      <div className="search-filter-row">
        <div className="search-wrap">
          <Search />
          <input
            className="search-input"
            placeholder="Search by title, author…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <select
          className="filter-select"
          value={category}
          onChange={e => setCategory(e.target.value)}
        >
          <option value="">All</option>
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="loading-wrap"><div className="spinner" /></div>
      ) : books.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📚</div>
          <div className="empty-state-title">
            {search || category ? 'No books found' : 'Library is empty'}
          </div>
          <div className="empty-state-text">
            {search || category
              ? 'Try a different search or category.'
              : 'Ask an admin to add books to get started.'}
          </div>
        </div>
      ) : (
        <div className="books-grid">
          {books.map(book => <BookCard key={book.id} book={book} />)}
        </div>
      )}

      {user && (
        <button className="fab" onClick={() => navigate('/admin/add')} title="Add book">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </button>
      )}
    </div>
  )
}
