import { NavLink } from 'react-router-dom'

const links = [
  { to: '/', label: 'Home', end: true },
  { to: '/about', label: 'About' },
  { to: '/gallery', label: 'Gallery' },
  { to: '/shop', label: 'Shop' },
  { to: '/contact', label: 'Contact' },
]

export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-md shadow-sm z-50 border-b border-stone-100 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        <a href="/" className="flex items-center space-x-3 group">
          <div className="h-10 w-10 rounded-full overflow-hidden border border-stone-200 bg-white shadow-sm transition-transform group-hover:scale-110">
            <img
              src="/assets/logo.png"
              alt="Logo"
              className="w-full h-full object-cover"
              onError={(e) => { e.currentTarget.parentElement.style.display = 'none' }}
            />
          </div>
          <span className="text-xl font-serif font-bold text-rose-800 tracking-tighter">KHYATHI WEAVES</span>
        </a>

        <div className="flex space-x-8 font-medium tracking-wide text-stone-600">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              className={({ isActive }) =>
                `hover:text-rose-800 transition-colors relative after:absolute after:bottom-[-4px] after:left-0 after:h-0.5 after:bg-rose-800 after:transition-all ${
                  isActive ? 'text-rose-800 after:w-full' : 'after:w-0 hover:after:w-full'
                }`
              }
            >
              {l.label}
            </NavLink>
          ))}
        </div>
      </div>
    </nav>
  )
}
