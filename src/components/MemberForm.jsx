import { useState } from 'react'

export default function MemberForm({ initial, onSubmit, onCancel, loading }) {
  const [name, setName] = useState(initial?.name || '')
  const [role, setRole] = useState(initial?.role || '')
  const [type, setType] = useState(initial?.type || 'priest')
  const [bio, setBio] = useState(initial?.bio || '')
  const [photoUrl, setPhotoUrl] = useState(initial?.photo_url || '')
  const [sortOrder, setSortOrder] = useState(initial?.sort_order ?? 0)

  function handleSubmit(e) {
    e.preventDefault()
    if (!name.trim() || !role.trim()) return
    onSubmit({
      name: name.trim(),
      role: role.trim(),
      type,
      bio: bio.trim() || null,
      photo_url: photoUrl.trim() || null,
      sort_order: Number(sortOrder) || 0
    })
  }

  return (
    <form className="admin-form" onSubmit={handleSubmit} style={{ maxWidth: '600px', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div className="form-group">
        <label className="form-label">Full Name *</label>
        <input
          className="search-input"
          style={{ width: '100%' }}
          required
          placeholder="e.g. Fr. Thomas Varghese or Mary Alexander"
          value={name}
          onChange={e => setName(e.target.value)}
        />
      </div>

      <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <div className="form-group">
          <label className="form-label">Category / Member Type *</label>
          <select
            className="filter-select"
            style={{ width: '100%' }}
            value={type}
            onChange={e => setType(e.target.value)}
          >
            <option value="priest">Parish Priest</option>
            <option value="teacher">Sunday School Teacher</option>
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Role Title *</label>
          <input
            className="search-input"
            style={{ width: '100%' }}
            required
            placeholder="e.g. Vicar, Grade 5 Teacher, Headmaster"
            value={role}
            onChange={e => setRole(e.target.value)}
          />
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">Biography / Description</label>
        <textarea
          className="search-input"
          style={{ width: '100%', minHeight: '90px', padding: '0.75rem', fontFamily: 'inherit' }}
          placeholder="Short description of their role, service, or background..."
          value={bio}
          onChange={e => setBio(e.target.value)}
        />
      </div>

      <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
        <div className="form-group">
          <label className="form-label">Photo URL (Optional)</label>
          <input
            className="search-input"
            style={{ width: '100%' }}
            placeholder="https://example.com/photo.jpg"
            value={photoUrl}
            onChange={e => setPhotoUrl(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Display Order</label>
          <input
            type="number"
            className="search-input"
            style={{ width: '100%' }}
            placeholder="0"
            value={sortOrder}
            onChange={e => setSortOrder(e.target.value)}
          />
        </div>
      </div>

      <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem', justifyContent: 'flex-end' }}>
        <button type="button" className="btn btn-ghost" onClick={onCancel} disabled={loading}>
          Cancel
        </button>
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Saving...' : initial ? 'Save Changes' : 'Add Member'}
        </button>
      </div>
    </form>
  )
}
