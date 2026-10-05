import { Link, useLocation } from 'react-router-dom'
import { BookOpen, LayoutDashboard, AlertTriangle, Settings, History } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { user } = useAuth()
  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">
        <span className="navbar-logo">✨</span>
        <div>
          <span className="navbar-title">SoulSpace</span>
          <span className="navbar-subtitle">St. Anthony's Church, Kadalana</span>
        </div>
      </Link>
      <div className="navbar-actions" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <Link to="/catalog" className="navbar-btn" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <BookOpen size={15} /> Catalog
        </Link>
        <Link to="/history" className="navbar-btn" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <History size={15} /> History
        </Link>
        {user ? (
          <Link to="/admin" className="navbar-btn">
            <Settings size={15} /> Admin
          </Link>
        ) : (
          <Link to="/login" className="navbar-btn">Sign In</Link>
        )}
      </div>
    </nav>
  )
}

export function BottomNav() {
  const location = useLocation()
  const { user } = useAuth()

  const items = [
    { to: '/', icon: <LayoutDashboard />, label: 'Dashboard' },
    { to: '/catalog', icon: <BookOpen />, label: 'Catalog' },
    { to: '/history', icon: <History />, label: 'History' },
    { to: '/overdue', icon: <AlertTriangle />, label: 'Overdue' },
    ...(user ? [{ to: '/admin', icon: <Settings />, label: 'Admin' }] : []),
  ]

  return (
    <nav className="bottom-nav">
      {items.map(item => (
        <Link
          key={item.to}
          to={item.to}
          className={`bottom-nav-item ${location.pathname === item.to ? 'active' : ''}`}
        >
          {item.icon}
          <span>{item.label}</span>
        </Link>
      ))}
    </nav>
  )
}
