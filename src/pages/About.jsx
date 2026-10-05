import { useState } from 'react'
import { useAbout } from '../hooks/useAbout'
import { GraduationCap, Church, Users, HeartHandshake } from 'lucide-react'

export default function About() {
  const { members, loading, error } = useAbout()
  const [activeTab, setActiveTab] = useState('all')

  const priests = members.filter(m => m.type === 'priest')
  const teachers = members.filter(m => m.type === 'teacher')

  const filteredMembers = activeTab === 'priests'
    ? priests
    : activeTab === 'teachers'
    ? teachers
    : members

  // Helper for rendering initial avatar when photo is absent/fails
  const getInitials = (name) => {
    if (!name) return '?'
    const parts = name.replace(/^(Fr\.|Sr\.|Dr\.|Mr\.|Mrs\.|Ms\.)\s+/, '').trim().split(' ')
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
    }
    return name.substring(0, 2).toUpperCase()
  }

  return (
    <div className="page main-content about-page">
      <div className="about-hero">
        <div className="about-hero-badge">
          <Church size={16} />
          <span>Our Spiritual & Educational Family</span>
        </div>
        <h1 className="about-hero-title">About Our Parish & School</h1>
        <p className="about-hero-subtitle">
          Meet our revered parish priests and dedicated Sunday school teachers who guide our children in faith, wisdom, and Christian values at St. Anthony's Church.
        </p>

        <div className="about-stats-row">
          <div className="about-stat-card">
            <Church className="stat-icon priest-icon" />
            <div className="stat-num">{priests.length}</div>
            <div className="stat-label">Parish Priests</div>
          </div>
          <div className="about-stat-card">
            <GraduationCap className="stat-icon teacher-icon" />
            <div className="stat-num">{teachers.length}</div>
            <div className="stat-label">Sunday School Teachers</div>
          </div>
          <div className="about-stat-card">
            <HeartHandshake className="stat-icon faith-icon" />
            <div className="stat-num">100%</div>
            <div className="stat-label">Dedicated Service</div>
          </div>
        </div>
      </div>

      <div className="about-filter-row">
        <button
          className={`about-tab-btn ${activeTab === 'all' ? 'active' : ''}`}
          onClick={() => setActiveTab('all')}
        >
          <Users size={16} /> All Members ({members.length})
        </button>
        <button
          className={`about-tab-btn ${activeTab === 'priests' ? 'active' : ''}`}
          onClick={() => setActiveTab('priests')}
        >
          <Church size={16} /> Parish Priests ({priests.length})
        </button>
        <button
          className={`about-tab-btn ${activeTab === 'teachers' ? 'active' : ''}`}
          onClick={() => setActiveTab('teachers')}
        >
          <GraduationCap size={16} /> Sunday School Teachers ({teachers.length})
        </button>
      </div>

      {loading ? (
        <div className="loading-wrap"><div className="spinner" /></div>
      ) : error ? (
        <div className="empty-state">
          <div className="empty-state-title" style={{ color: 'var(--accent-red)' }}>Unable to load members</div>
          <div className="empty-state-text">{error}</div>
        </div>
      ) : filteredMembers.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">👥</div>
          <div className="empty-state-title">No members found</div>
          <div className="empty-state-text">Check back later or ask an admin to add team members.</div>
        </div>
      ) : (
        <div className="members-grid">
          {filteredMembers.map(member => (
            <div key={member.id} className={`member-card member-${member.type}`}>
              <div className="member-avatar-container">
                {member.photo_url ? (
                  <img
                    src={member.photo_url}
                    alt={member.name}
                    className="member-avatar-img"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                ) : null}
                <div
                  className="member-avatar-fallback"
                  style={{ display: member.photo_url ? 'none' : 'flex' }}
                >
                  {getInitials(member.name)}
                </div>
                <span className={`member-type-badge badge-${member.type}`}>
                  {member.type === 'priest' ? (
                    <><Church size={12} /> Priest</>
                  ) : (
                    <><GraduationCap size={12} /> Teacher</>
                  )}
                </span>
              </div>

              <div className="member-info">
                <h3 className="member-name">{member.name}</h3>
                <div className="member-role">{member.role}</div>
                {member.bio && <p className="member-bio">{member.bio}</p>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
