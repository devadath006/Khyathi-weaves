import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import './admin.css'

const tabs = [
  { to: '/admin', label: 'Inventory', icon: 'fa-shirt', end: true, title: 'Inventory Management' },
  { to: '/admin/gallery', label: 'Gallery', icon: 'fa-images', title: 'Gallery Management' },
  { to: '/admin/invoice', label: 'Invoice', icon: 'fa-file-invoice', title: 'Invoice Generator' },
  { to: '/admin/gst-invoice', label: 'GST Invoice', icon: 'fa-receipt', title: 'GST Invoice Generator' },
]

export default function AdminLayout() {
  const { logout, session } = useAuth()
  const location = useLocation()

  const active = tabs.find((t) => (t.end ? location.pathname === t.to : location.pathname.startsWith(t.to)))
  const title = active?.title || 'Admin Panel'

  return (
    <div className="kw-admin">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <img src="/assets/logo.png" alt="Khyathi Weaves" onError={(e) => (e.currentTarget.style.display = 'none')} />
          <div className="sidebar-brand-text">
            <strong>Khyathi Weaves</strong>
            <p>Admin Panel</p>
          </div>
        </div>

        <nav className="sidebar-nav">
          {tabs.map((t) => (
            <NavLink key={t.to} to={t.to} end={t.end} className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
              <i className={`fa-solid ${t.icon}`}></i>
              <span>{t.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          {session?.user?.email && <p className="sidebar-email">{session.user.email}</p>}
          <a href="/" className="logout-btn" style={{ marginBottom: 4 }}>
            <i className="fa-solid fa-arrow-left"></i> <span>Storefront</span>
          </a>
          <button onClick={logout} className="logout-btn">
            <i className="fa-solid fa-power-off"></i> <span>Logout</span>
          </button>
        </div>
      </aside>

      <div className="main">
        <div className="topbar">
          <h1>{title}</h1>
          <span className="topbar-meta" id="topbar-meta"></span>
        </div>
        <div className="content">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
