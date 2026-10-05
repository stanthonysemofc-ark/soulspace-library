import { useState } from 'react'

const CATEGORIES = [
  'Bible Stories', 'Devotional', 'Worship & Prayer', 'Character Building',
  'Fiction', 'Non-Fiction', 'Reference', 'Activity & Craft', 'Other'
]

const EMPTY = { title: '', author: '', category: '', isbn: '', description: '', cover_url: '' }

export default function BookForm({ initial = {}, onSubmit, onCancel, loading }) {
  const [form, setForm] = useState({ ...EMPTY, ...initial })

  function set(field, value) {
    setForm(f => ({ ...f, [field]: value }))
  }

  function handleSubmit(e) {
    e.preventDefault()
    const cleaned = Object.fromEntries(
      Object.entries(form).map(([k, v]) => [k, v.trim()])
    )
    onSubmit(cleaned)
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-group">
        <label className="form-label">Title *</label>
        <input className="form-input" value={form.title} onChange={e => set('title', e.target.value)} placeholder="Book title" required />
      </div>
      <div className="form-grid">
        <div className="form-group">
          <label className="form-label">Author</label>
          <input className="form-input" value={form.author} onChange={e => set('author', e.target.value)} placeholder="Author name" />
        </div>
        <div className="form-group">
          <label className="form-label">Category</label>
          <select className="form-select" value={form.category} onChange={e => set('category', e.target.value)}>
            <option value="">Select…</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>
      <div className="form-group">
        <label className="form-label">ISBN (optional)</label>
        <input className="form-input" value={form.isbn} onChange={e => set('isbn', e.target.value)} placeholder="978-…" />
      </div>
      <div className="form-group">
        <label className="form-label">Cover Image URL (optional)</label>
        <input className="form-input" value={form.cover_url} onChange={e => set('cover_url', e.target.value)} placeholder="https://…" />
      </div>
      <div className="form-group">
        <label className="form-label">Description (optional)</label>
        <textarea className="form-textarea" value={form.description} onChange={e => set('description', e.target.value)} placeholder="Brief description…" />
      </div>
      <div className="modal-footer">
        {onCancel && <button type="button" className="btn btn-ghost" onClick={onCancel}>Cancel</button>}
        <button type="submit" className="btn btn-primary" disabled={loading || !form.title.trim()}>
          {loading ? 'Saving…' : (initial.id ? 'Save Changes' : 'Add Book')}
        </button>
      </div>
    </form>
  )
}
