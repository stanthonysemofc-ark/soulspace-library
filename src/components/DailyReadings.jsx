import { useState } from 'react'
import { useDailyReadings } from '../hooks/useDailyReadings'
import { BookOpen, Sparkles, RefreshCw, ChevronDown, ChevronUp, Quote, Calendar } from 'lucide-react'

export default function DailyReadings() {
  const { readings, loading, refetch } = useDailyReadings()
  const [activeTab, setActiveTab] = useState('gospel') // 'gospel' | 'first' | 'psalm'
  const [expanded, setExpanded] = useState(false)

  if (loading) {
    return (
      <div className="daily-readings-card loading">
        <div className="spinner" style={{ width: '28px', height: '28px' }} />
        <span style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>Loading Today's Gospel...</span>
      </div>
    )
  }

  if (!readings) return null

  const { dateFormatted, season, gospel, firstReading, psalm } = readings

  return (
    <div className="daily-readings-card">
      <div className="daily-readings-header">
        <div className="daily-readings-badge-group">
          <span className="daily-readings-tag">
            <Sparkles size={14} /> Gospel & Readings of the Day
          </span>
          <span className="daily-season-badge">
            {season}
          </span>
        </div>
        <button
          className="btn btn-ghost btn-sm btn-icon"
          onClick={refetch}
          title="Refresh Today's Readings"
          style={{ color: 'var(--color-text-muted)' }}
        >
          <RefreshCw size={15} />
        </button>
      </div>

      <div className="daily-date-row">
        <Calendar size={15} />
        <span>{dateFormatted}</span>
      </div>

      {/* Tabs */}
      <div className="daily-tabs-row">
        <button
          className={`daily-tab ${activeTab === 'gospel' ? 'active' : ''}`}
          onClick={() => setActiveTab('gospel')}
        >
          <BookOpen size={14} /> Holy Gospel ({gospel.citation})
        </button>
        <button
          className={`daily-tab ${activeTab === 'first' ? 'active' : ''}`}
          onClick={() => setActiveTab('first')}
        >
          First Reading ({firstReading.citation})
        </button>
        <button
          className={`daily-tab ${activeTab === 'psalm' ? 'active' : ''}`}
          onClick={() => setActiveTab('psalm')}
        >
          Responsorial Psalm
        </button>
      </div>

      {/* Content Area */}
      <div className="daily-content-area">
        {activeTab === 'gospel' && (
          <div className="gospel-box">
            <div className="gospel-box-header">
              <Quote className="quote-icon" size={24} />
              <div>
                <h3 className="gospel-title">{gospel.title}</h3>
                <span className="gospel-citation">{gospel.citation}</span>
              </div>
            </div>
            <p className={`gospel-text ${expanded ? 'expanded' : 'collapsed'}`}>
              {gospel.text}
            </p>
            {gospel.text.length > 180 && (
              <button
                className="btn btn-ghost btn-sm expand-btn"
                onClick={() => setExpanded(!expanded)}
              >
                {expanded ? <><ChevronUp size={14} /> Show Less</> : <><ChevronDown size={14} /> Read Full Gospel</>}
              </button>
            )}
          </div>
        )}

        {activeTab === 'first' && (
          <div className="reading-box">
            <div className="reading-citation">{firstReading.citation}</div>
            <p className="reading-text">{firstReading.text}</p>
          </div>
        )}

        {activeTab === 'psalm' && (
          <div className="psalm-box">
            <div className="psalm-citation">{psalm.citation}</div>
            <div className="psalm-response-badge">
              <strong>R/</strong> {psalm.response}
            </div>
            <p className="psalm-text">{psalm.text}</p>
          </div>
        )}
      </div>
    </div>
  )
}
