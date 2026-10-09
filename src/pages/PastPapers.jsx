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
  Upload,
  CheckCircle2,
  BookOpen,
  Award
} from 'lucide-react'

export default function PastPapers() {
  const { papers, loading, error, incrementDownload, addPaper, deletePaper } = usePastPapers()
  const { user } = useAuth()

  const [selectedGrade, setSelectedGrade] = useState('all')
  const [selectedTerm, setSelectedTerm] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [previewPaper, setPreviewPaper] = useState(null)
  const [previewType, setPreviewType] = useState('paper') // 'paper' or 'marking'
  
  // Upload modal state
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [formError, setFormError] = useState('')
  const [newPaper, setNewPaper] = useState({
    title: '',
    grade: 1,
    term: 1,
    year: new Date().getFullYear(),
    subject: 'Christianity',
    file_url: '',
    file_name: '',
    file_size: '',
    marking_scheme_url: '',
    marking_scheme_name: ''
  })
  const [selectedPaperFile, setSelectedPaperFile] = useState(null)
  const [selectedMarkingFile, setSelectedMarkingFile] = useState(null)

  const grades = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]

  const filteredPapers = papers.filter(paper => {
    const matchesGrade = selectedGrade === 'all' || paper.grade === Number(selectedGrade)
    const matchesTerm = selectedTerm === 'all' || paper.term === Number(selectedTerm)
    const matchesSearch = searchQuery.trim() === '' || 
      paper.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      String(paper.year).includes(searchQuery) ||
      paper.subject?.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesGrade && matchesTerm && matchesSearch
  })

  const handleDownload = (paper, type = 'paper') => {
    if (type === 'paper') {
      incrementDownload(paper.id)
      window.open(paper.file_url, '_blank')
    } else if (paper.marking_scheme_url) {
      window.open(paper.marking_scheme_url, '_blank')
    }
  }

  const handlePaperFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (file.type !== 'application/pdf' && !file.name.endsWith('.pdf')) {
        setFormError('Please select a valid PDF file for the Question Paper.')
        return
      }
      setSelectedPaperFile(file)
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

  const handleMarkingFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (file.type !== 'application/pdf' && !file.name.endsWith('.pdf')) {
        setFormError('Please select a valid PDF file for the Marking Scheme.')
        return
      }
      setSelectedMarkingFile(file)
      setFormError('')
      setNewPaper(prev => ({
        ...prev,
        marking_scheme_name: file.name
      }))
    }
  }

  const handleUploadSubmit = async (e) => {
    e.preventDefault()
    setFormError('')
    setIsUploading(true)

    try {
      let finalFileUrl = newPaper.file_url
      let finalMarkingUrl = newPaper.marking_scheme_url

      // Upload paper PDF if file selected
      if (selectedPaperFile) {
        const fileExt = selectedPaperFile.name.split('.').pop()
        const fileName = `gr${newPaper.grade}_term${newPaper.term}_paper_${Date.now()}.${fileExt}`
        const filePath = `grade_${newPaper.grade}/${fileName}`

        const { error: uploadErr } = await supabase.storage
          .from('past-papers')
          .upload(filePath, selectedPaperFile, { upsert: true })

        if (uploadErr) throw new Error(`Paper upload failed: ${uploadErr.message}`)

        const { data: publicUrlData } = supabase.storage
          .from('past-papers')
          .getPublicUrl(filePath)

        finalFileUrl = publicUrlData.publicUrl
      }

      // Upload marking scheme PDF if file selected
      if (selectedMarkingFile) {
        const fileExt = selectedMarkingFile.name.split('.').pop()
        const fileName = `gr${newPaper.grade}_term${newPaper.term}_marking_${Date.now()}.${fileExt}`
        const filePath = `grade_${newPaper.grade}/${fileName}`

        const { error: markUploadErr } = await supabase.storage
          .from('past-papers')
          .upload(filePath, selectedMarkingFile, { upsert: true })

        if (markUploadErr) throw new Error(`Marking scheme upload failed: ${markUploadErr.message}`)

        const { data: markingPublicUrlData } = supabase.storage
          .from('past-papers')
          .getPublicUrl(filePath)

        finalMarkingUrl = markingPublicUrlData.publicUrl
      }

      if (!finalFileUrl) {
        throw new Error('Please select a Question Paper PDF file to upload or provide a file URL.')
      }

      const res = await addPaper({
        ...newPaper,
        grade: Number(newPaper.grade),
        term: Number(newPaper.term),
        year: Number(newPaper.year),
        file_url: finalFileUrl,
        file_name: newPaper.file_name || selectedPaperFile?.name || 'past_paper.pdf',
        file_size: newPaper.file_size || '1.0 MB',
        marking_scheme_url: finalMarkingUrl || null,
        marking_scheme_name: finalMarkingUrl ? (newPaper.marking_scheme_name || selectedMarkingFile?.name || 'marking_scheme.pdf') : null
      })

      if (!res.success) throw new Error(res.error)

      setShowUploadModal(false)
      setSelectedPaperFile(null)
      setSelectedMarkingFile(null)
      setNewPaper({
        title: '',
        grade: 1,
        term: 1,
        year: new Date().getFullYear(),
        subject: 'Christianity',
        file_url: '',
        file_name: '',
        file_size: '',
        marking_scheme_url: '',
        marking_scheme_name: ''
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
          <span>Sunday School Exam & Marking Scheme Repository</span>
        </div>
        <h1 className="papers-hero-title">Past Papers & Marking Schemes</h1>
        <p className="papers-hero-subtitle">
          Access past examination papers and official marking schemes for Grades 1 through 11 for St. Anthony's Church Sunday School. Preview online or download for revision and study.
        </p>

        {/* Search & Action bar */}
        <div className="papers-hero-controls">
          <div className="papers-search-box">
            <Search size={18} className="search-icon" />
            <input
              type="text"
              placeholder="Search by title, grade, year (e.g. 2024)..."
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
            <Plus size={16} /> Upload Paper / Scheme
          </button>
        </div>
      </div>

      {/* Grade Selector Tabs (Grades 1 to 11) */}
      <div className="grade-selector-container">
        <div className="grade-label-row">
          <Filter size={15} /> Select Grade (Grades 1 – 11):
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

                  {/* Marking Scheme Badge Indicator */}
                  {paper.marking_scheme_url ? (
                    <div className="marking-scheme-badge available">
                      <Award size={13} /> Marking Scheme Available
                    </div>
                  ) : (
                    <div className="marking-scheme-badge unavailable">
                      <Award size={13} /> Paper Only
                    </div>
                  )}
                </div>
              </div>

              <div className="paper-card-footer-stacked">
                <div className="paper-action-group">
                  <button
                    className="paper-action-btn btn-view"
                    onClick={() => {
                      setPreviewPaper(paper)
                      setPreviewType('paper')
                    }}
                    title="Preview Question Paper"
                  >
                    <Eye size={14} /> Paper
                  </button>
                  <button
                    className="paper-action-btn btn-download"
                    onClick={() => handleDownload(paper, 'paper')}
                    title="Download Question Paper"
                  >
                    <Download size={14} /> Paper PDF
                  </button>
                </div>

                {paper.marking_scheme_url && (
                  <div className="paper-action-group marking-group">
                    <button
                      className="paper-action-btn btn-marking-view"
                      onClick={() => {
                        setPreviewPaper(paper)
                        setPreviewType('marking')
                      }}
                      title="Preview Marking Scheme"
                    >
                      <Award size={14} /> View Scheme
                    </button>
                    <button
                      className="paper-action-btn btn-marking-download"
                      onClick={() => handleDownload(paper, 'marking')}
                      title="Download Marking Scheme"
                    >
                      <Download size={14} /> Scheme PDF
                    </button>
                  </div>
                )}

                {user && (
                  <div className="admin-delete-row">
                    <button
                      className="btn-delete-full"
                      onClick={() => {
                        if (window.confirm(`Delete "${paper.title}"?`)) {
                          deletePaper(paper.id)
                        }
                      }}
                    >
                      <Trash2 size={13} /> Delete Paper Record
                    </button>
                  </div>
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
                <h3 className="modal-title" style={{ marginBottom: '0.25rem' }}>
                  {previewType === 'marking' ? `Marking Scheme: ${previewPaper.title}` : previewPaper.title}
                </h3>
                <span className="pdf-preview-meta">
                  Grade {previewPaper.grade} • Term {previewPaper.term} • {previewPaper.year} • {previewType === 'marking' ? 'Marking Scheme / Answer Key' : 'Question Paper'}
                </span>
              </div>
              <button className="modal-close-btn" onClick={() => setPreviewPaper(null)}>
                <X size={20} />
              </button>
            </div>

            {/* Toggle between Paper & Marking Scheme in preview */}
            {previewPaper.marking_scheme_url && (
              <div className="preview-toggle-tabs">
                <button
                  className={`preview-toggle-btn ${previewType === 'paper' ? 'active' : ''}`}
                  onClick={() => setPreviewType('paper')}
                >
                  <FileText size={15} /> Question Paper
                </button>
                <button
                  className={`preview-toggle-btn ${previewType === 'marking' ? 'active' : ''}`}
                  onClick={() => setPreviewType('marking')}
                >
                  <Award size={15} /> Marking Scheme / Answer Key
                </button>
              </div>
            )}

            <div className="pdf-iframe-wrapper">
              <iframe
                src={previewType === 'marking' ? previewPaper.marking_scheme_url : previewPaper.file_url}
                title={previewPaper.title}
                className="pdf-iframe"
              />
            </div>

            <div className="modal-footer" style={{ marginTop: '1rem' }}>
              <a
                href={previewType === 'marking' ? previewPaper.marking_scheme_url : previewPaper.file_url}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-secondary"
                style={{ flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}
              >
                <ExternalLink size={15} /> Open External
              </a>
              <button
                className="btn btn-primary"
                onClick={() => handleDownload(previewPaper, previewType)}
                style={{ flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}
              >
                <Download size={15} /> Download {previewType === 'marking' ? 'Scheme PDF' : 'Paper PDF'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upload Paper & Marking Scheme Modal */}
      {showUploadModal && (
        <div className="modal-backdrop" onClick={() => setShowUploadModal(false)}>
          <div className="modal-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="modal-handle" />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 className="modal-title" style={{ margin: 0 }}>Upload Past Paper & Marking Scheme</h3>
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
                  placeholder="e.g. Grade 5 Sunday School 1st Term Evaluation 2025"
                  value={newPaper.title}
                  onChange={(e) => setNewPaper(prev => ({ ...prev, title: e.target.value }))}
                  className="form-input"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div className="form-group">
                  <label className="form-label">Grade (1 – 11) *</label>
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

              {/* SECTION 1: QUESTION PAPER */}
              <div style={{ background: 'var(--color-surface-2)', padding: '1rem', borderRadius: '12px', marginBottom: '1rem', border: '1px solid var(--color-border)' }}>
                <h4 style={{ fontSize: '0.88rem', fontWeight: 800, margin: '0 0 0.75rem 0', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <FileText size={16} /> 1. Question Paper PDF *
                </h4>

                <div className="form-group" style={{ marginBottom: '0.5rem' }}>
                  <label className="form-label" style={{ fontSize: '0.78rem' }}>Upload Question Paper PDF File</label>
                  <input
                    type="file"
                    accept=".pdf,application/pdf"
                    onChange={handlePaperFileChange}
                    className="form-input"
                    style={{ padding: '0.4rem' }}
                  />
                  {selectedPaperFile && (
                    <div style={{ fontSize: '0.8rem', color: '#16a34a', marginTop: '0.3rem', fontWeight: 600 }}>
                      Selected: {selectedPaperFile.name} ({(selectedPaperFile.size / (1024 * 1024)).toFixed(1)} MB)
                    </div>
                  )}
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ fontSize: '0.78rem' }}>Or Direct Question Paper URL</label>
                  <input
                    type="url"
                    placeholder="https://..."
                    value={newPaper.file_url}
                    onChange={(e) => setNewPaper(prev => ({ ...prev, file_url: e.target.value }))}
                    className="form-input"
                  />
                </div>
              </div>

              {/* SECTION 2: MARKING SCHEME */}
              <div style={{ background: '#f0fdf4', padding: '1rem', borderRadius: '12px', marginBottom: '1rem', border: '1px solid #bbf7d0' }}>
                <h4 style={{ fontSize: '0.88rem', fontWeight: 800, margin: '0 0 0.75rem 0', color: '#15803d', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Award size={16} /> 2. Marking Scheme / Answer Key PDF (Optional)
                </h4>

                <div className="form-group" style={{ marginBottom: '0.5rem' }}>
                  <label className="form-label" style={{ fontSize: '0.78rem' }}>Upload Marking Scheme PDF File</label>
                  <input
                    type="file"
                    accept=".pdf,application/pdf"
                    onChange={handleMarkingFileChange}
                    className="form-input"
                    style={{ padding: '0.4rem' }}
                  />
                  {selectedMarkingFile && (
                    <div style={{ fontSize: '0.8rem', color: '#16a34a', marginTop: '0.3rem', fontWeight: 600 }}>
                      Selected: {selectedMarkingFile.name} ({(selectedMarkingFile.size / (1024 * 1024)).toFixed(1)} MB)
                    </div>
                  )}
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ fontSize: '0.78rem' }}>Or Direct Marking Scheme URL</label>
                  <input
                    type="url"
                    placeholder="https://..."
                    value={newPaper.marking_scheme_url}
                    onChange={(e) => setNewPaper(prev => ({ ...prev, marking_scheme_url: e.target.value }))}
                    className="form-input"
                  />
                </div>
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
                  {isUploading ? 'Uploading...' : <><Upload size={16} /> Save Paper & Marking Scheme</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
