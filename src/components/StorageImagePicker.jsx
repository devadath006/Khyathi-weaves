import { useEffect, useState } from 'react'
import { supabase, BUCKET } from '../lib/supabaseClient'

// Modal for picking one or more images already uploaded to Supabase Storage.
// Styling ported 1:1 from the original admin panel's "picker-modal" design.
export default function StorageImagePicker({ open, mode = 'single', title = 'Choose Image from Storage', onClose, onSelect }) {
  const [images, setImages] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState([])
  const [activeMode, setActiveMode] = useState(mode)

  useEffect(() => {
    if (!open) return
    setSelected([])
    setQuery('')
    setActiveMode(mode)
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  async function load() {
    setLoading(true)
    setError('')
    const { data, error: err } = await supabase.storage.from(BUCKET).list('', {
      limit: 500,
      sortBy: { column: 'name', order: 'asc' },
    })
    if (err) {
      setError(err.message)
      setLoading(false)
      return
    }
    const files = (data || [])
      .filter((f) => f.name && /\.(jpe?g|png|webp|gif)$/i.test(f.name))
      .map((f) => ({
        name: f.name,
        url: supabase.storage.from(BUCKET).getPublicUrl(f.name).data.publicUrl,
        thumbnail: supabase.storage.from(BUCKET).getPublicUrl(f.name, {
          transform: { width: 150, height: 150, resize: 'cover' },
        }).data.publicUrl,
      }))
    setImages(files)
    setLoading(false)
  }

  function toggle(url) {
    if (activeMode === 'single') {
      setSelected([url])
      return
    }
    setSelected((prev) => (prev.includes(url) ? prev.filter((u) => u !== url) : [...prev, url]))
  }

  function confirmSelection() {
    if (!selected.length) return
    onSelect(activeMode === 'single' ? [selected[0]] : [...selected])
    onClose()
  }

  const filtered = images.filter((img) => img.name.toLowerCase().includes(query.toLowerCase()))

  if (!open) return null

  return (
    <div className="modal-backdrop open" onClick={onClose}>
      <div className="modal picker-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{title}</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
          <div className="picker-mode-tabs">
            <button
              className={`picker-mode-tab${activeMode === 'single' ? ' active' : ''}`}
              onClick={() => {
                setActiveMode('single')
                setSelected((prev) => (prev.length ? [prev[0]] : prev))
              }}
            >
              Single (Primary Image)
            </button>
            <button
              className={`picker-mode-tab${activeMode === 'multi' ? ' active' : ''}`}
              onClick={() => setActiveMode('multi')}
            >
              Multi-select (Gallery)
            </button>
          </div>

          <input
            type="text"
            className="picker-search"
            placeholder="Search by filename..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />

          <div className="picker-grid">
            {loading && (
              <div className="empty-state" style={{ gridColumn: '1/-1' }}>
                <i className="fa-solid fa-spinner fa-spin"></i>
                <p>Loading images...</p>
              </div>
            )}
            {!loading && error && (
              <div className="empty-state" style={{ gridColumn: '1/-1' }}>
                <i className="fa-solid fa-triangle-exclamation" style={{ color: 'var(--red)' }}></i>
                <p style={{ color: 'var(--red)' }}>Failed to load images: {error}</p>
                <button className="btn btn-ghost btn-sm" style={{ marginTop: 8 }} onClick={load}>
                  <i className="fa-solid fa-rotate-right"></i> Retry
                </button>
              </div>
            )}
            {!loading && !error && filtered.length === 0 && (
              <div className="empty-state" style={{ gridColumn: '1/-1' }}>
                <i className="fa-solid fa-image"></i>
                <p>No images found</p>
              </div>
            )}
            {!loading &&
              !error &&
              filtered.map((img) => (
                <div
                  key={img.name}
                  className={`picker-item${selected.includes(img.url) ? ' selected' : ''}`}
                  onClick={() => toggle(img.url)}
                  title={img.name}
                >
                  <img src={img.thumbnail} alt={img.name} loading="lazy" />
                  <div className="picker-name">{img.name}</div>
                  <div className="picker-check">✓</div>
                </div>
              ))}
          </div>
        </div>
        <div className="modal-footer">
          <span style={{ fontSize: 12, color: 'var(--muted)', marginRight: 'auto' }}>
            {selected.length ? `${selected.length} image${selected.length > 1 ? 's' : ''} selected` : ''}
          </span>
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={confirmSelection}>
            <i className="fa-solid fa-check"></i> Use Selected
          </button>
        </div>
      </div>
    </div>
  )
}
