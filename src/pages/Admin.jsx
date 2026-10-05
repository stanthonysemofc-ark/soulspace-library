import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Pencil, Trash2, Plus } from 'lucide-react'
import { useBooks } from '../hooks/useBooks'
import { useAuth } from '../context/AuthContext'
import BookForm from '../components/BookForm'

export default function Admin() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const { books, loading, fetchBooks, addBook, updateBook, deleteBook } = useBooks()
  const [view, setView] = useState('list') // 'list' | 'add' | 'edit'
  const [editBook, setEditBook] = useState(null)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState(null)
  const [search, setSearch] = useState('')

  useEffect(() => {
    if (!user) navigate('/login')
  }, [user])

  function showToast(msg, type = 'success') {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  async function handleAdd(data) {
    setSaving(true)
    const { error } = await addBook(data)
    setSaving(false)
    if (error) showToast('Failed to add book: ' + error, 'error')
    else { showToast('Book added!'); setView('list'); fetchBooks() }
  }

  async function handleEdit(data) {
    setSaving(true)
    const { error } = await updateBook(editBook.id, data)
    setSaving(false)
    if (error) showToast('Failed to save: ' + error, 'error')
    else { showToast('Book updated!'); setView('list'); setEditBook(null); fetchBooks() }
  }

  async function handleDelete(book) {
    if (!window.confirm(`Delete "${book.title}"? This cannot be undone.`)) return
    const { error } = await deleteBook(book.id)
    if (error) showToast('Failed to delete: ' + error, 'error')
    else { showToast('Book deleted.'); fetchBooks() }
  }

  const filtered = books.filter(b =>
    b.title.toLowerCase().includes(search.toLowerCase()) ||
    (b.author || '').toLowerCase().includes(search.toLowerCase())
  )

  if (!user) return null

  return (
    <div className="page main-content">
      <div className="page-header" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <h1 className="page-title">Admin Panel</h1>
          <p className="page-subtitle">Manage the library catalog</p>
        </div>
        <button
          className="btn btn-ghost btn-sm"
          onClick={signOut}
          style={{ marginTop: '0.25rem' }}
        >Sign Out</button>
      </div>

      {view === 'list' && (
        <>
          <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem' }}>
            <input
              className="search-input"
              style={{ flex: 1 }}
              placeholder="Search books…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <button className="btn btn-primary btn-sm" onClick={() => setView('add')}>
              <Plus size={16} /> Add Book
            </button>
          </div>

          {loading ? (
            <div className="loading-wrap"><div className="spinner" /></div>
          ) : (
            <div className="admin-book-list">
              {filtered.map(book => (
                <div key={book.id} className="admin-book-item">
                  <div className="admin-book-thumb">
                    {book.cover_url ? <img src={book.cover_url} alt={book.title} /> : '📖'}
                  </div>
                  <div className="admin-book-info">
                    <div className="admin-book-title">{book.title}</div>
                    <div className="admin-book-sub">{[book.author, book.category].filter(Boolean).join(' · ')}</div>
                  </div>
                  <div className="admin-book-actions">
                    <button
                      className="btn btn-icon btn-ghost"
                      onClick={() => { setEditBook(book); setView('edit') }}
                      title="Edit"
                    ><Pencil size={16} /></button>
                    <button
                      className="btn btn-icon btn-danger"
                      onClick={() => handleDelete(book)}
                      title="Delete"
                    ><Trash2 size={16} /></button>
                  </div>
                </div>
              ))}
              {filtered.length === 0 && (
                <div className="empty-state">
                  <div className="empty-state-icon">📭</div>
                  <div className="empty-state-title">No books found</div>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {view === 'add' && (
        <>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
            <button className="btn btn-ghost btn-sm" onClick={() => setView('list')}>← Back</button>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem' }}>Add New Book</h2>
          </div>
          <BookForm onSubmit={handleAdd} onCancel={() => setView('list')} loading={saving} />
        </>
      )}

      {view === 'edit' && editBook && (
        <>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
            <button className="btn btn-ghost btn-sm" onClick={() => { setView('list'); setEditBook(null) }}>← Back</button>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem' }}>Edit Book</h2>
          </div>
          <BookForm initial={editBook} onSubmit={handleEdit} onCancel={() => { setView('list'); setEditBook(null) }} loading={saving} />
        </>
      )}

      {toast && <div className={`toast ${toast.type}`}>{toast.msg}</div>}
    </div>
  )
}
