import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import Navbar, { BottomNav } from './components/Navbar'
import Home from './pages/Home'
import BookDetail from './pages/BookDetail'
import Dashboard from './pages/Dashboard'
import History from './pages/History'
import Overdue from './pages/Overdue'
import Admin from './pages/Admin'
import Login from './pages/Login'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Login page has its own full-screen layout */}
          <Route path="/login" element={<Login />} />

          {/* Main app layout */}
          <Route path="*" element={
            <>
              <Navbar />
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/catalog" element={<Home />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/book/:id" element={<BookDetail />} />
                <Route path="/history" element={<History />} />
                <Route path="/overdue" element={<Overdue />} />
                <Route path="/admin" element={<Admin />} />
              </Routes>
              <BottomNav />
            </>
          } />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
