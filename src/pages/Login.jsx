import { useState } from 'react'
import { useNavigate, useLocation, Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const { login, isAdmin, loading } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  if (!loading && isAdmin) {
    return <Navigate to="/admin" replace />
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError(false)
    setSubmitting(true)
    try {
      await login(email, password)
      const dest = location.state?.from?.pathname || '/admin'
      navigate(dest, { replace: true })
    } catch (err) {
      setError(true)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="bg-stone-100 flex items-center justify-center min-h-screen p-4 font-sans">
      <div className="max-w-md w-full bg-white rounded-2xl border border-stone-200 shadow-xl overflow-hidden p-8">
        <div className="text-center mb-8">
          <img
            src="/assets/logo.png"
            alt="Khyathi Weaves Logo"
            className="h-14 mx-auto mb-3 object-contain"
            onError={(e) => { e.currentTarget.style.display = 'none' }}
          />
          <h2 className="text-2xl font-serif font-bold text-stone-900 tracking-wide">Management Gateway</h2>
          <p className="text-xs text-stone-400 uppercase tracking-widest mt-1">Authorized Verification Required</p>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-rose-50 border border-rose-200 text-rose-800 text-sm rounded-lg flex items-center space-x-2">
            <i className="fa-solid fa-circle-exclamation text-base"></i>
            <span>Incorrect email or password. Please try again.</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-1">Email</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-stone-400">
                <i className="fa-solid fa-envelope"></i>
              </span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@email.com"
                className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-rose-800 focus:bg-white text-sm text-stone-900 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-1">Password</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-stone-400">
                <i className="fa-solid fa-lock"></i>
              </span>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-rose-800 focus:bg-white text-sm text-stone-900 transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-rose-800 hover:bg-rose-900 text-white font-medium py-3 rounded-lg text-sm tracking-wider transition-colors shadow-sm cursor-pointer mt-2 uppercase disabled:opacity-60"
          >
            {submitting ? 'Verifying…' : 'Verify Credentials'}
          </button>
        </form>

        <div className="mt-8 text-center">
          <a href="/" className="text-xs text-stone-400 hover:text-rose-800 transition-colors">
            <i className="fa-solid fa-arrow-left mr-1"></i> Return to Public Storefront
          </a>
        </div>
      </div>
    </div>
  )
}
