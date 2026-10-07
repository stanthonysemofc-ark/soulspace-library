import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Pencil, Trash2, Plus, BookOpen, Users, Church, GraduationCap } from 'lucide-react'
import { useBooks } from '../hooks/useBooks'
import { useAbout } from '../hooks/useAbout'
import { useAuth } from '../context/AuthContext'
import BookForm from '../components/BookForm'
import MemberForm from '../components/MemberForm'

export default function Admin() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  // Determine initial view based on route URL
  const isAddRoute = location.pathname.includes('/add')

  // State
  const [activeTab, setActiveTab] = useState('books') // 'books' | 'about'
  const [view, setView] = useState(isAddRoute ? 'add' : 'list') // 'list' | 'add' | 'edit'

  // Books
  const { books, loading: booksLoading, fetchBooks, addBook, updateBook, deleteBook } = useBooks()
  const [editBook, setEditBook] = useState(null)

  // About Members
  const { members, loading: membersLoading, fetchMembers, addMember, updateMember, deleteMember } = useAbout()
  const [editMember, setEditMember] = useState(null)

  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState(null)
  const [search, setSearch] = useState('')

  useEffect(() => {
    if (!user) navigate('/login')
  }, [user])

  useEffect(() => {
    if (location.pathname.includes('/add')) {
      setActiveTab('books')
      setView('add')
    }
  }, [location.pathname])

  function showToast(msg, type = 'success') {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  // --- Book Actions ---
  async function handleAddBook(data) {
    setSaving(true)
    const { error } = await addBook(data)
    setSaving(false)
    if (error) showToast('Failed to add book: ' + error, 'error')
    else { showToast('Book added!'); setView('list'); navigate('/admin'); fetchBooks() }
  }

  async function handleEditBook(data) {
    setSaving(true)
    const { error } = await updateBook(editBook.id, data)
    setSaving(false)
    if (error) showToast('Failed to save: ' + error, 'error')
    else { showToast('Book updated!'); setView('list'); setEditBook(null); navigate('/admin'); fetchBooks() }
  }

  async function handleDeleteBook(book) {
    if (!window.confirm(`Delete "${book.title}"? This cannot be undone.`)) return
    const { error } = await deleteBook(book.id)
    if (error) showToast('Failed to delete: ' + error, 'error')
    else { showToast('Book deleted.'); fetchBooks() }
  }

  // --- Member Actions ---
  async function handleAddMember(data) {
    setSaving(true)
    const { error } = await addMember(data)
    setSaving(false)
    if (error) showToast('Failed to add member: ' + error, 'error')
    else { showToast('Member added!'); setView('list'); navigate('/admin'); fetchMembers() }
  }

  async function handleEditMember(data) {
    setSaving(true)
    const { error } = await updateMember(editMember.id, data)
    setSaving(false)
    if (error) showToast('Failed to update: ' + error, 'error')
    else { showToast('Member updated!'); setView('list'); setEditMember(null); navigate('/admin'); fetchMembers() }
  }

  async function handleDeleteMember(member) {
    if (!window.confirm(`Delete "${member.name}"? This cannot be undone.`)) return
    const { error } = await deleteMember(member.id)
    if (error) showToast('Failed to delete: ' + error, 'error')
    else { showToast('Member removed.'); fetchMembers() }
  }

  const filteredBooks = books.filter(b =>
    b.title.toLowerCase().includes(search.toLowerCase()) ||
    (b.author || '').toLowerCase().includes(search.toLowerCase())
  )

  const filteredMembers = members.filter(m =>
    m.name.toLowerCase().includes(search.toLowerCase()) ||
    m.role.toLowerCase().includes(search.toLowerCase())
  )

  if (!user) return null

  return (
    <div className="page main-content">
      <div className="page-header" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <h1 className="page-title">Admin Panel</h1>
          <p className="page-subtitle">Manage library catalog and parish team</p>
        </div>
        <button
          className="btn btn-ghost btn-sm"
          onClick={signOut}
          style={{ marginTop: '0.25rem' }}
        >Sign Out</button>
      </div>

      {/* Main Admin Section Navigation Tabs */}
      <div className="admin-nav-tabs" style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
        <button
          className={`btn ${activeTab === 'books' ? 'btn-primary' : 'btn-ghost'} btn-sm`}
          onClick={() => { setActiveTab('books'); setView('list'); setSearch(''); navigate('/admin') }}
        >
          <BookOpen size={16} /> Library Catalog ({books.length})
        </button>
        <button
          className={`btn ${activeTab === 'about' ? 'btn-primary' : 'btn-ghost'} btn-sm`}
          onClick={() => { setActiveTab('about'); setView('list'); setSearch(''); navigate('/admin') }}
        >
          <Users size={16} /> About Us Members ({members.length})
        </button>
      </div>

      {/* BOOKS TAB */}
      {activeTab === 'books' && (
        <>
          {view === 'list' && (
            <>
              <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem' }}>
                <input
                  className="search-input"
                  style={{ flex: 1 }}
                  placeholder="Search books..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
                <button className="btn btn-primary btn-sm" onClick={() => setView('add')}>
                  <Plus size={16} /> Add Book
                </button>
              </div>

              {booksLoading ? (
                <div className="loading-wrap"><div className="spinner" /></div>
              ) : (
                <div className="admin-book-list">
                  {filteredBooks.map(book => (
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
                          onClick={() => handleDeleteBook(book)}
                          title="Delete"
                        ><Trash2 size={16} /></button>
                      </div>
                    </div>
                  ))}
                  {filteredBooks.length === 0 && (
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
                <button className="btn btn-ghost btn-sm" onClick={() => { setView('list'); navigate('/admin') }}>← Back</button>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem' }}>Add New Book</h2>
              </div>
              <BookForm onSubmit={handleAddBook} onCancel={() => { setView('list'); navigate('/admin') }} loading={saving} />
            </>
          )}

          {view === 'edit' && editBook && (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
                <button className="btn btn-ghost btn-sm" onClick={() => { setView('list'); setEditBook(null); navigate('/admin') }}>← Back</button>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem' }}>Edit Book</h2>
              </div>
              <BookForm initial={editBook} onSubmit={handleEditBook} onCancel={() => { setView('list'); setEditBook(null); navigate('/admin') }} loading={saving} />
            </>
          )}
        </>
      )}

      {/* ABOUT MEMBERS TAB */}
      {activeTab === 'about' && (
        <>
          {view === 'list' && (
            <>
              <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem' }}>
                <input
                  className="search-input"
                  style={{ flex: 1 }}
                  placeholder="Search members by name or role..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
                <button className="btn btn-primary btn-sm" onClick={() => setView('add')}>
                  <Plus size={16} /> Add Member
                </button>
              </div>

              {membersLoading ? (
                <div className="loading-wrap"><div className="spinner" /></div>
              ) : (
                <div className="admin-book-list">
                  {filteredMembers.map(member => (
                    <div key={member.id} className="admin-book-item">
                      <div className="admin-book-thumb" style={{ borderRadius: '50%', background: 'var(--color-primary-light)' }}>
                        {member.photo_url ? (
                          <img src={member.photo_url} alt={member.name} style={{ borderRadius: '50%' }} />
                        ) : (
                          member.type === 'priest' ? <Church size={18} /> : <GraduationCap size={18} />
                        )}
                      </div>
                      <div className="admin-book-info">
                        <div className="admin-book-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          {member.name}
                          <span className={`member-type-badge badge-${member.type}`} style={{ fontSize: '0.65rem', padding: '0.1rem 0.4rem', position: 'static', transform: 'none' }}>
                            {member.type === 'priest' ? 'Priest' : 'Teacher'}
                          </span>
                        </div>
                        <div className="admin-book-sub">{member.role} {member.bio ? `· ${member.bio.substring(0, 50)}...` : ''}</div>
                      </div>
                      <div className="admin-book-actions">
                        <button
                          className="btn btn-icon btn-ghost"
                          onClick={() => { setEditMember(member); setView('edit') }}
                          title="Edit"
                        ><Pencil size={16} /></button>
                        <button
                          className="btn btn-icon btn-danger"
                          onClick={() => handleDeleteMember(member)}
                          title="Delete"
                        ><Trash2 size={16} /></button>
                      </div>
                    </div>
                  ))}
                  {filteredMembers.length === 0 && (
                    <div className="empty-state">
                      <div className="empty-state-icon">👥</div>
                      <div className="empty-state-title">No team members found</div>
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
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem' }}>Add New Team Member</h2>
              </div>
              <MemberForm onSubmit={handleAddMember} onCancel={() => setView('list')} loading={saving} />
            </>
          )}

          {view === 'edit' && editMember && (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
                <button className="btn btn-ghost btn-sm" onClick={() => { setView('list'); setEditMember(null) }}>← Back</button>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem' }}>Edit Team Member</h2>
              </div>
              <MemberForm initial={editMember} onSubmit={handleEditMember} onCancel={() => { setView('list'); setEditMember(null) }} loading={saving} />
            </>
          )}
        </>
      )}

      {toast && <div className={`toast ${toast.type}`}>{toast.msg}</div>}
    </div>
  )
}
