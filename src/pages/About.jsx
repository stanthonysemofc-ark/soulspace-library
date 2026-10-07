import { useState } from 'react'
import { useAbout } from '../hooks/useAbout'
import { GraduationCap, Church, Users, HeartHandshake, Mail, MapPin, Clock, Phone, Send, ExternalLink } from 'lucide-react'

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

      {/* ── Contact Us Card ── */}
      <div className="contact-card">
        <div className="contact-card-header">
          <div className="contact-icon-badge">
            <Mail size={24} />
          </div>
          <div>
            <h2 className="contact-card-title">Contact & Visit Us</h2>
            <p className="contact-card-subtitle">
              We welcome all parishioners, Sunday school students, parents, and visitors to St. Anthony's Church, Kadalana. Feel free to reach out to us!
            </p>
          </div>
        </div>

        <div className="contact-info-grid">
          <div className="contact-info-item">
            <div className="contact-info-icon-wrap email">
              <Mail size={20} />
            </div>
            <div className="contact-info-content">
              <span className="contact-info-label">Email Address</span>
              <a href="mailto:stanthonys.em.ofc@gmail.com" className="contact-info-value contact-link">
                stanthonys.em.ofc@gmail.com
              </a>
            </div>
          </div>

          <div className="contact-info-item">
            <div className="contact-info-icon-wrap location">
              <MapPin size={20} />
            </div>
            <div className="contact-info-content">
              <span className="contact-info-label">Location</span>
              <span className="contact-info-value">St. Anthony's Church, Kadalana, Moratuwa</span>
            </div>
          </div>

          <div className="contact-info-item">
            <div className="contact-info-icon-wrap hours">
              <Clock size={20} />
            </div>
            <div className="contact-info-content">
              <span className="contact-info-label">Sunday School Hours</span>
              <span className="contact-info-value">Every Sunday: 8:00 AM – 10:30 AM</span>
            </div>
          </div>

          <div className="contact-info-item">
            <div className="contact-info-icon-wrap phone">
              <Phone size={20} />
            </div>
            <div className="contact-info-content">
              <span className="contact-info-label">Parish Community</span>
              <span className="contact-info-value">St. Anthony's Church, Kadalana</span>
            </div>
          </div>
        </div>

        <div className="contact-actions-row">
          <a
            href="mailto:stanthonys.em.ofc@gmail.com"
            className="btn btn-primary contact-btn"
          >
            <Send size={16} /> Send Email
          </a>
          <a
            href="https://maps.google.com/?q=St.+Anthony's+Church,+Kadalana"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-secondary contact-btn"
          >
            <MapPin size={16} /> Open in Google Maps <ExternalLink size={14} />
          </a>
        </div>
      </div>
    </div>
  )
}
