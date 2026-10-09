import { Link, useLocation } from 'react-router-dom'
import { BookOpen, LayoutDashboard, Settings, History, Users, AlertTriangle, FileText } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { user } = useAuth()
  const location = useLocation()

  const navLinks = [
    { to: '/catalog', icon: <BookOpen size={14} />, label: 'Catalog' },
    { to: '/past-papers', icon: <FileText size={14} />, label: 'Past Papers' },
    { to: '/history', icon: <History size={14} />, label: 'History' },
    { to: '/overdue', icon: <AlertTriangle size={14} />, label: 'Overdue' },
    { to: '/about', icon: <Users size={14} />, label: 'About Us' },
    ...(user
      ? [{ to: '/admin', icon: <Settings size={14} />, label: 'Admin' }]
      : [{ to: '/login', icon: null, label: 'Sign In' }]
    ),
  ]

  return (
    <nav className="navbar">
      {/* Row 1: Brand */}
      <div className="navbar-row-brand">
        <Link to="/" className="navbar-brand">
          <div className="navbar-logo-wrap">
            <img src="/logo.png" alt="SoulSpace Logo" className="navbar-logo-img" />
          </div>
          <div>
            <span className="navbar-title">SoulSpace</span>
            <span className="navbar-subtitle">St. Anthony's Church, Kadalana</span>
          </div>
        </Link>
      </div>

      {/* Row 2: Nav links (below brand on mobile & desktop) */}
      <div className="navbar-row-links">
        {navLinks.map(link => (
          <Link
            key={link.to}
            to={link.to}
            className={`navbar-btn${location.pathname === link.to ? ' navbar-btn-active' : ''}`}
          >
            {link.icon}
            {link.label}
          </Link>
        ))}
      </div>
    </nav>
  )
}

export function BottomNav() {
  const location = useLocation()
  const { user } = useAuth()

  const items = [
    { to: '/', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
    { to: '/catalog', icon: <BookOpen size={20} />, label: 'Catalog' },
    { to: '/past-papers', icon: <FileText size={20} />, label: 'Papers' },
    { to: '/about', icon: <Users size={20} />, label: 'About' },
    ...(user ? [{ to: '/admin', icon: <Settings size={20} />, label: 'Admin' }] : []),
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
