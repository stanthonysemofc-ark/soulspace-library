import { useState } from 'react'
import { usePastPapers } from '../hooks/usePastPapers'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import {
  FileText,
  Download,
  Eye,
  Search,
  Filter,
  Plus,
  Trash2,
  X,
  ExternalLink,
  GraduationCap,
  Sparkles,
  Upload,
  BookOpen
} from 'lucide-react'

export default function PastPapers() {
  const { papers, loading, error, incrementDownload, addPaper, deletePaper } = usePastPapers()
  const { user } = useAuth()

  const [selectedGrade, setSelectedGrade] = useState('all')
  const [selectedTerm, setSelectedTerm] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [previewPaper, setPreviewPaper] = useState(null)
  
  // Upload modal state
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [formError, setFormError] = useState('')
  const [newPaper, setNewPaper] = useState({
    title: '',
    grade: 6,
    term: 1,
    year: new Date().getFullYear(),
    subject: 'Christianity',
    file_url: '',
    file_name: '',
    file_size: ''
  })
  const [selectedFile, setSelectedFile] = useState(null)

  const grades = [6, 7, 8, 9, 10, 11]

  const filteredPapers = papers.filter(paper => {
    const matchesGrade = selectedGrade === 'all' || paper.grade === Number(selectedGrade)
    const matchesTerm = selectedTerm === 'all' || paper.term === Number(selectedTerm)
    const matchesSearch = searchQuery.trim() === '' || 
      paper.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      String(paper.year).includes(searchQuery) ||
      paper.subject?.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesGrade && matchesTerm && matchesSearch
  })

  const handleDownload = (paper) => {
    incrementDownload(paper.id)
    window.open(paper.file_url, '_blank')
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (file.type !== 'application/pdf' && !file.name.endsWith('.pdf')) {
        setFormError('Please select a valid PDF file.')
        return
      }
      setSelectedFile(file)
      setFormError('')
      if (!newPaper.title) {
        setNewPaper(prev => ({
          ...prev,
          title: file.name.replace('.pdf', '').replace(/_/g, ' '),
          file_name: file.name,
          file_size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`
        }))
      }
    }
  }

  const handleUploadSubmit = async (e) => {
    e.preventDefault()
    setFormError('')
    setIsUploading(true)

    try {
      let finalFileUrl = newPaper.file_url

      if (selectedFile) {
        const fileExt = selectedFile.name.split('.').pop()
        const fileName = `gr${newPaper.grade}_term${newPaper.term}_${Date.now()}.${fileExt}`
        const filePath = `${newPaper.grade}/${fileName}`

        const { error: uploadErr } = await supabase.storage
          .from('past-papers')
          .upload(filePath, selectedFile, { upsert: true })

        if (uploadErr) {
          throw new Error(`Upload failed: ${uploadErr.message}`)
        }

        const { data: publicUrlData } = supabase.storage
          .from('past-papers')
          .getPublicUrl(filePath)

        finalFileUrl = publicUrlData.publicUrl
      }

      if (!finalFileUrl) {
        throw new Error('Please select a PDF file to upload or provide a file URL.')
      }

      const res = await addPaper({
        ...newPaper,
        grade: Number(newPaper.grade),
        term: Number(newPaper.term),
        year: Number(newPaper.year),
        file_url: finalFileUrl,
        file_name: newPaper.file_name || selectedFile?.name || 'past_paper.pdf',
        file_size: newPaper.file_size || '1.0 MB'
      })

      if (!res.success) throw new Error(res.error)

      setShowUploadModal(false)
      setSelectedFile(null)
      setNewPaper({
        title: '',
        grade: 6,
        term: 1,
        year: new Date().getFullYear(),
        subject: 'Christianity',
        file_url: '',
        file_name: '',
        file_size: ''
      })
    } catch (err) {
      setFormError(err.message)
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="page main-content past-papers-page">
      {/* Hero Header */}
      <div className="papers-hero">
        <div className="papers-hero-badge">
          <GraduationCap size={16} />
          <span>Sunday School Exam Repository</span>
        </div>
        <h1 className="papers-hero-title">Past Examination Papers</h1>
        <p className="papers-hero-subtitle">
          Access past examination papers for Grades 6 through 11 for St. Anthony's Church Sunday School. Download or preview papers online for term evaluation and final exam prep.
        </p>

        {/* Search & Action bar */}
        <div className="papers-hero-controls">
          <div className="papers-search-box">
            <Search size={18} className="search-icon" />
            <input
              type="text"
              placeholder="Search by title, year (e.g. 2024)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="papers-search-input"
            />
            {searchQuery && (
              <button className="clear-search-btn" onClick={() => setSearchQuery('')}>
                <X size={14} />
              </button>
            )}
          </div>

          <button
            className="btn btn-primary add-paper-btn"
            onClick={() => setShowUploadModal(true)}
          >
            <Plus size={16} /> Upload Paper
          </button>
        </div>
      </div>

      {/* Grade Selector Tabs */}
      <div className="grade-selector-container">
        <div className="grade-label-row">
          <Filter size={15} /> Select Grade:
        </div>
        <div className="grade-tabs">
          <button
            className={`grade-tab ${selectedGrade === 'all' ? 'active' : ''}`}
            onClick={() => setSelectedGrade('all')}
          >
            All Grades ({papers.length})
          </button>
          {grades.map(g => {
            const count = papers.filter(p => p.grade === g).length
            return (
              <button
                key={g}
                className={`grade-tab ${selectedGrade === String(g) ? 'active' : ''}`}
                onClick={() => setSelectedGrade(String(g))}
              >
                Grade {g} <span className="grade-count">{count}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Term Sub-filter */}
      <div className="term-filter-row">
        <span className="term-label">Term:</span>
        <button
          className={`term-btn ${selectedTerm === 'all' ? 'active' : ''}`}
          onClick={() => setSelectedTerm('all')}
        >
          All Terms
        </button>
        <button
          className={`term-btn ${selectedTerm === '1' ? 'active' : ''}`}
          onClick={() => setSelectedTerm('1')}
        >
          1st Term
        </button>
        <button
          className={`term-btn ${selectedTerm === '2' ? 'active' : ''}`}
          onClick={() => setSelectedTerm('2')}
        >
          2nd Term
        </button>
        <button
          className={`term-btn ${selectedTerm === '3' ? 'active' : ''}`}
          onClick={() => setSelectedTerm('3')}
        >
          3rd Term / Year End
        </button>
      </div>

      {/* Content Area */}
      {loading ? (
        <div className="loading-wrap"><div className="spinner" /></div>
      ) : error ? (
        <div className="empty-state">
          <div className="empty-state-title" style={{ color: 'var(--accent-red)' }}>Unable to load papers</div>
          <div className="empty-state-text">{error}</div>
        </div>
      ) : filteredPapers.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon"><FileText size={48} /></div>
          <div className="empty-state-title">No past papers found</div>
          <div className="empty-state-text">Try adjusting your grade/term filter or search query.</div>
        </div>
      ) : (
        <div className="papers-grid">
          {filteredPapers.map(paper => (
            <div key={paper.id} className="paper-card">
              <div className="paper-card-header">
                <div className="paper-grade-pill">
                  Grade {paper.grade}
                </div>
                <span className="paper-term-tag">
                  {paper.term === 1 ? '1st Term' : paper.term === 2 ? '2nd Term' : '3rd Term'}
                </span>
                <span className="paper-year-tag">{paper.year}</span>
              </div>

              <div className="paper-card-body">
                <div className="paper-icon-wrap">
                  <FileText size={24} />
                </div>
                <div className="paper-details">
                  <h3 className="paper-title">{paper.title}</h3>
                  <div className="paper-meta-row">
                    <span className="paper-meta-item">{paper.subject || 'Christianity'}</span>
                    <span className="paper-meta-dot">•</span>
                    <span className="paper-meta-item">{paper.file_size || '1.2 MB'}</span>
                    {paper.download_count > 0 && (
                      <>
                        <span className="paper-meta-dot">•</span>
                        <span className="paper-meta-item count">{paper.download_count} downloads</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="paper-card-footer">
                <button
                  className="paper-action-btn btn-view"
                  onClick={() => setPreviewPaper(paper)}
                  title="Preview PDF"
                >
                  <Eye size={15} /> Preview
                </button>
                <button
                  className="paper-action-btn btn-download"
                  onClick={() => handleDownload(paper)}
                  title="Download PDF"
                >
                  <Download size={15} /> Download
                </button>

                {user && (
                  <button
                    className="paper-action-btn btn-delete"
                    onClick={() => {
                      if (window.confirm(`Delete "${paper.title}"?`)) {
                        deletePaper(paper.id)
                      }
                    }}
                    title="Delete Paper"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* PDF Preview Modal */}
      {previewPaper && (
        <div className="modal-backdrop" onClick={() => setPreviewPaper(null)}>
          <div className="modal-sheet pdf-preview-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="pdf-preview-header">
              <div>
                <h3 className="modal-title" style={{ marginBottom: '0.2rem' }}>{previewPaper.title}</h3>
                <span className="pdf-preview-meta">Grade {previewPaper.grade} • Term {previewPaper.term} • {previewPaper.year}</span>
              </div>
              <button className="modal-close-btn" onClick={() => setPreviewPaper(null)}>
                <X size={20} />
              </button>
            </div>

            <div className="pdf-iframe-wrapper">
              <iframe
                src={previewPaper.file_url}
                title={previewPaper.title}
                className="pdf-iframe"
              />
            </div>

            <div className="modal-footer" style={{ marginTop: '1rem' }}>
              <a
                href={previewPaper.file_url}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-secondary"
                style={{ flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}
              >
                <ExternalLink size={15} /> Open External
              </a>
              <button
                className="btn btn-primary"
                onClick={() => handleDownload(previewPaper)}
                style={{ flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}
              >
                <Download size={15} /> Download File
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upload Paper Modal */}
      {showUploadModal && (
        <div className="modal-backdrop" onClick={() => setShowUploadModal(false)}>
          <div className="modal-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="modal-handle" />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 className="modal-title" style={{ margin: 0 }}>Upload Past Paper</h3>
              <button className="modal-close-btn" onClick={() => setShowUploadModal(false)}><X size={18} /></button>
            </div>

            {formError && (
              <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b', padding: '0.75rem', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '1rem' }}>
                {formError}
              </div>
            )}

            <form onSubmit={handleUploadSubmit}>
              <div className="form-group">
                <label className="form-label">Paper Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Grade 10 Christianity 1st Term Paper 2025"
                  value={newPaper.title}
                  onChange={(e) => setNewPaper(prev => ({ ...prev, title: e.target.value }))}
                  className="form-input"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div className="form-group">
                  <label className="form-label">Grade *</label>
                  <select
                    value={newPaper.grade}
                    onChange={(e) => setNewPaper(prev => ({ ...prev, grade: e.target.value }))}
                    className="form-input"
                  >
                    {grades.map(g => (
                      <option key={g} value={g}>Grade {g}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Term *</label>
                  <select
                    value={newPaper.term}
                    onChange={(e) => setNewPaper(prev => ({ ...prev, term: e.target.value }))}
                    className="form-input"
                  >
                    <option value={1}>1st Term</option>
                    <option value={2}>2nd Term</option>
                    <option value={3}>3rd Term / Final</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div className="form-group">
                  <label className="form-label">Year *</label>
                  <input
                    type="number"
                    required
                    min={2015}
                    max={2030}
                    value={newPaper.year}
                    onChange={(e) => setNewPaper(prev => ({ ...prev, year: e.target.value }))}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Subject</label>
                  <input
                    type="text"
                    value={newPaper.subject}
                    onChange={(e) => setNewPaper(prev => ({ ...prev, subject: e.target.value }))}
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Upload PDF File</label>
                <input
                  type="file"
                  accept=".pdf,application/pdf"
                  onChange={handleFileChange}
                  className="form-input"
                  style={{ padding: '0.5rem' }}
                />
                {selectedFile && (
                  <div style={{ fontSize: '0.8rem', color: 'var(--color-primary)', marginTop: '0.3rem', fontWeight: 600 }}>
                    Selected: {selectedFile.name} ({(selectedFile.size / (1024 * 1024)).toFixed(1)} MB)
                  </div>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">Or Direct File / Drive URL</label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={newPaper.file_url}
                  onChange={(e) => setNewPaper(prev => ({ ...prev, file_url: e.target.value }))}
                  className="form-input"
                />
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowUploadModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUploading}
                  className="btn btn-primary"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
                >
                  {isUploading ? 'Uploading...' : <><Upload size={16} /> Save Paper</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
