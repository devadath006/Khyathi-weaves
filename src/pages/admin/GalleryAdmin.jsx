import { useEffect, useState } from 'react'
import { supabase, uploadToStorage, deleteFromStorage, getOptimizedUrl } from '../../lib/supabaseClient'
import Toast from '../../components/Toast'

const emptyForm = { title: '', description: '', category: '' }

export default function GalleryAdmin() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState(null)

  const [addOpen, setAddOpen] = useState(false)
  const [addForm, setAddForm] = useState(emptyForm)
  const [addFile, setAddFile] = useState(null)
  const [saving, setSaving] = useState(false)

  const [editItem, setEditItem] = useState(null)
  const [editForm, setEditForm] = useState(emptyForm)

  function notify(msg, type = 'success') {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  async function loadGallery() {
    setLoading(true)
    const { data, error } = await supabase.from('gallery_items').select('*').order('id', { ascending: false })
    if (error) notify(error.message, 'error')
    else setItems(data || [])
    setLoading(false)
  }

  useEffect(() => {
    loadGallery()
  }, [])

  function openAddModal() {
    setAddForm(emptyForm)
    setAddFile(null)
    setAddOpen(true)
  }

  async function saveGalleryItem() {
    if (!addForm.title) return notify('Title is required', 'error')
    setSaving(true)
    try {
      let mediaUrl = null
      if (addFile) mediaUrl = await uploadToStorage(addFile)
      const { error } = await supabase.from('gallery_items').insert({ ...addForm, media_url: mediaUrl })
      if (error) throw error
      notify('Gallery item added!')
      setAddOpen(false)
      loadGallery()
    } catch (err) {
      notify('Error: ' + err.message, 'error')
    } finally {
      setSaving(false)
    }
  }

  function openEdit(item) {
    setEditItem(item)
    setEditForm({ title: item.title || '', description: item.description || '', category: item.category || '' })
  }

  async function updateGalleryItem() {
    const { error } = await supabase.from('gallery_items').update(editForm).eq('id', editItem.id)
    if (error) return notify('Error: ' + error.message, 'error')
    notify('Gallery item updated!')
    setEditItem(null)
    loadGallery()
  }

  async function deleteGalleryItem(item) {
    if (!window.confirm('Delete this gallery item?')) return
    await deleteFromStorage(item.media_url)
    const { error } = await supabase.from('gallery_items').delete().eq('id', item.id)
    if (error) return notify('Error: ' + error.message, 'error')
    notify('Gallery item deleted.')
    setItems((prev) => prev.filter((i) => i.id !== item.id))
  }

  return (
    <div>
      <div className="panel">
        <div className="panel-header">
          <h2>
            <i className="fa-solid fa-photo-film" style={{ color: 'var(--gold)', marginRight: 8 }}></i> Gallery Items
          </h2>
          <button className="btn btn-primary" onClick={openAddModal}>
            <i className="fa-solid fa-plus"></i> Add Item
          </button>
        </div>
        <div className="panel-body">
          {loading ? (
            <div className="empty-state">
              <i className="fa-solid fa-spinner fa-spin"></i>
              <p>Loading...</p>
            </div>
          ) : items.length === 0 ? (
            <div className="empty-state">
              <i className="fa-solid fa-images"></i>
              <p>No gallery items yet.</p>
            </div>
          ) : (
            <div className="gallery-grid">
              {items.map((item) => (
                <div className="gallery-card" key={item.id}>
                  <img
                    src={getOptimizedUrl(item.media_url, 400) || ''}
                    alt={item.title}
                    onError={(e) => {
                      e.currentTarget.src =
                        'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="180" height="160"%3E%3Crect width="180" height="160" fill="%23e8dfc8"/%3E%3C/svg%3E'
                    }}
                  />
                  <div className="gallery-card-body">
                    <div className="gallery-card-title">{item.title || 'Untitled'}</div>
                    <div className="gallery-card-cat">{item.category || ''}</div>
                    <div className="gallery-card-actions">
                      <button className="btn btn-ghost btn-sm" onClick={() => openEdit(item)}>
                        <i className="fa-solid fa-pen"></i> Edit
                      </button>
                      <button className="btn btn-danger btn-sm" onClick={() => deleteGalleryItem(item)}>
                        <i className="fa-solid fa-trash"></i>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add Gallery Modal */}
      {addOpen && (
        <div className="modal-backdrop open" onClick={() => !saving && setAddOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Add Gallery Item</h3>
              <button className="modal-close" onClick={() => setAddOpen(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Title</label>
                <input className="form-control" placeholder="e.g. Store Opening" value={addForm.title} onChange={(e) => setAddForm({ ...addForm, title: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Description</label>
                <input className="form-control" placeholder="Short description" value={addForm.description} onChange={(e) => setAddForm({ ...addForm, description: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Category</label>
                <input className="form-control" placeholder="e.g. inauguration" value={addForm.category} onChange={(e) => setAddForm({ ...addForm, category: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Image</label>
                <label className="file-label">
                  <i className="fa-solid fa-image"></i> Choose image
                  <input type="file" accept="image/*" onChange={(e) => setAddFile(e.target.files?.[0] || null)} />
                </label>
                <div className="preview-strip">{addFile && <img src={URL.createObjectURL(addFile)} alt="" />}</div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setAddOpen(false)}>Cancel</button>
              <button className="btn btn-primary" disabled={saving} onClick={saveGalleryItem}>
                {saving ? (
                  <>
                    <span className="spinner"></span> Saving...
                  </>
                ) : (
                  <>
                    <i className="fa-solid fa-check"></i> Save Item
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Gallery Modal */}
      {editItem && (
        <div className="modal-backdrop open" onClick={() => setEditItem(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Edit Gallery Item</h3>
              <button className="modal-close" onClick={() => setEditItem(null)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Title</label>
                <input className="form-control" value={editForm.title} onChange={(e) => setEditForm({ ...editForm, title: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Description</label>
                <input className="form-control" value={editForm.description} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Category</label>
                <input className="form-control" value={editForm.category} onChange={(e) => setEditForm({ ...editForm, category: e.target.value })} />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setEditItem(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={updateGalleryItem}>
                <i className="fa-solid fa-save"></i> Update
              </button>
            </div>
          </div>
        </div>
      )}

      <Toast toast={toast} />
    </div>
  )
}
