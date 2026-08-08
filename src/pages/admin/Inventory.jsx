import { useEffect, useState } from 'react'
import { supabase, uploadToStorage, deleteFromStorage, getOptimizedUrl } from '../../lib/supabaseClient'
import StorageImagePicker from '../../components/StorageImagePicker'
import Toast from '../../components/Toast'

const CATEGORIES = ['Kanchi Cotton', 'Chettinad Cotton', 'Onam Collection', 'Kuthambully Cotton']

const emptyForm = { name: '', mrp: '', price: '', category: CATEGORIES[0] }

export default function Inventory() {
  const [sarees, setSarees] = useState([])
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState(null)

  const [addOpen, setAddOpen] = useState(false)
  const [addForm, setAddForm] = useState(emptyForm)
  const [addPrimaryFile, setAddPrimaryFile] = useState(null)
  const [addPrimaryStorageUrl, setAddPrimaryStorageUrl] = useState('')
  const [addGalleryFiles, setAddGalleryFiles] = useState([])
  const [addGalleryStorageUrls, setAddGalleryStorageUrls] = useState([])
  const [saving, setSaving] = useState(false)

  const [editItem, setEditItem] = useState(null)
  const [editForm, setEditForm] = useState(emptyForm)
  const [editImages, setEditImages] = useState([])

  const [picker, setPicker] = useState({ open: false, mode: 'single', target: null })

  function notify(msg, type = 'success') {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  async function loadInventory() {
    setLoading(true)
    const { data, error } = await supabase.from('sarees').select('*').order('id')
    if (error) {
      notify(error.message, 'error')
    } else {
      setSarees((data || []).map((s) => ({ ...s, is_sold: s.is_sold ? 1 : 0 })))
    }
    setLoading(false)
  }

  useEffect(() => {
    loadInventory()
  }, [])

  // ── Add saree ─────────────────────────────────────────────
  function openAddModal() {
    setAddForm(emptyForm)
    setAddPrimaryFile(null)
    setAddPrimaryStorageUrl('')
    setAddGalleryFiles([])
    setAddGalleryStorageUrls([])
    setAddOpen(true)
  }

  async function saveSaree() {
    if (!addForm.name) return notify('Name is required', 'error')
    setSaving(true)
    try {
      let primaryImageUrl = null
      if (addPrimaryFile) {
        primaryImageUrl = await uploadToStorage(addPrimaryFile)
      } else if (addPrimaryStorageUrl) {
        primaryImageUrl = addPrimaryStorageUrl
      }

      const { data: saree, error: insertErr } = await supabase
        .from('sarees')
        .insert({ ...addForm, is_sold: false, primary_image: primaryImageUrl })
        .select('id')
        .single()
      if (insertErr) throw insertErr

      for (const file of addGalleryFiles) {
        const url = await uploadToStorage(file)
        await supabase.from('saree_images').insert({ saree_id: saree.id, image_url: url })
      }
      for (const url of addGalleryStorageUrls) {
        await supabase.from('saree_images').insert({ saree_id: saree.id, image_url: url })
      }
      if (primaryImageUrl && addGalleryFiles.length === 0 && addGalleryStorageUrls.length === 0) {
        await supabase.from('saree_images').insert({ saree_id: saree.id, image_url: primaryImageUrl })
      }

      notify('Saree added successfully!')
      setAddOpen(false)
      loadInventory()
    } catch (err) {
      notify('Error: ' + err.message, 'error')
    } finally {
      setSaving(false)
    }
  }

  function pickAddPrimary() {
    setAddPrimaryFile(null)
    setPicker({ open: true, mode: 'single', target: 'add-primary' })
  }

  function pickAddGallery() {
    setAddGalleryFiles([])
    setPicker({ open: true, mode: 'multi', target: 'add-gallery' })
  }

  // ── Toggle sold ───────────────────────────────────────────
  async function toggleSold(saree) {
    const newStatus = !saree.is_sold
    const { error } = await supabase.from('sarees').update({ is_sold: newStatus }).eq('id', saree.id)
    if (error) return notify(error.message, 'error')
    setSarees((prev) => prev.map((s) => (s.id === saree.id ? { ...s, is_sold: newStatus ? 1 : 0 } : s)))
    notify('Status updated!')
  }

  // ── Edit saree ────────────────────────────────────────────
  async function openEdit(saree) {
    setEditItem(saree)
    setEditForm({ name: saree.name || '', mrp: saree.mrp || '', price: saree.price || '', category: saree.category || CATEGORIES[0] })
    const { data } = await supabase.from('saree_images').select('id, image_url').eq('saree_id', saree.id)
    setEditImages(data || [])
  }

  async function updateSaree() {
    if (!editItem) return
    const { error } = await supabase.from('sarees').update(editForm).eq('id', editItem.id)
    if (error) return notify('Error: ' + error.message, 'error')
    notify('Saree updated!')
    setEditItem(null)
    loadInventory()
  }

  async function uploadSareeImage(file) {
    if (!editItem) return
    try {
      const url = await uploadToStorage(file)
      const { data, error } = await supabase
        .from('saree_images')
        .insert({ saree_id: editItem.id, image_url: url })
        .select('id, image_url')
        .single()
      if (error) throw error
      setEditImages((prev) => [...prev, data])
      notify('Image uploaded!')
    } catch (err) {
      notify('Upload failed: ' + err.message, 'error')
    }
  }

  async function linkStorageImages(urls) {
    if (!editItem) return
    let added = 0
    for (const url of urls) {
      const { data, error } = await supabase
        .from('saree_images')
        .insert({ saree_id: editItem.id, image_url: url })
        .select('id, image_url')
        .single()
      if (!error) {
        setEditImages((prev) => [...prev, data])
        added++
      }
    }
    notify(`${added} image${added > 1 ? 's' : ''} added!`)
  }

  async function deleteSareeImage(img) {
    if (!window.confirm('Delete this image?')) return
    await deleteFromStorage(img.image_url)
    const { error } = await supabase.from('saree_images').delete().eq('id', img.id)
    if (error) return notify('Delete failed: ' + error.message, 'error')
    setEditImages((prev) => prev.filter((i) => i.id !== img.id))
    notify('Image deleted.')
  }

  // ── Delete saree ──────────────────────────────────────────
  async function deleteSaree(saree) {
    if (!window.confirm(`Delete "${saree.name}"? This cannot be undone.`)) return
    const { data: images } = await supabase.from('saree_images').select('image_url').eq('saree_id', saree.id)
    const urls = new Set([...(images || []).map((i) => i.image_url), saree.primary_image].filter(Boolean))
    for (const url of urls) await deleteFromStorage(url)
    const { error } = await supabase.from('sarees').delete().eq('id', saree.id)
    if (error) return notify('Error: ' + error.message, 'error')
    notify('Saree deleted.')
    setSarees((prev) => prev.filter((s) => s.id !== saree.id))
  }

  return (
    <div>
      <div className="panel">
        <div className="panel-header">
          <h2>
            <i className="fa-solid fa-list" style={{ color: 'var(--gold)', marginRight: 8 }}></i> All Sarees
          </h2>
          <button className="btn btn-primary" onClick={openAddModal}>
            <i className="fa-solid fa-plus"></i> Add Saree
          </button>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Image</th>
                <th>Name</th>
                <th>Category</th>
                <th>MRP</th>
                <th>Price</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7}>
                    <div className="empty-state">
                      <i className="fa-solid fa-spinner fa-spin"></i>
                      <p>Loading...</p>
                    </div>
                  </td>
                </tr>
              ) : sarees.length === 0 ? (
                <tr>
                  <td colSpan={7}>
                    <div className="empty-state">
                      <i className="fa-solid fa-box-open"></i>
                      <p>No sarees found. Add one!</p>
                    </div>
                  </td>
                </tr>
              ) : (
                sarees.map((s) => (
                  <tr key={s.id}>
                    <td>
                      <img
                        className="product-thumb"
                        src={getOptimizedUrl(s.primary_image, 80) || ''}
                        alt={s.name}
                        onError={(e) => {
                          e.currentTarget.src =
                            'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="52" height="52"%3E%3Crect width="52" height="52" fill="%23e8dfc8"/%3E%3C/svg%3E'
                        }}
                      />
                    </td>
                    <td style={{ fontWeight: 600 }}>{s.name}</td>
                    <td>
                      <span className="badge badge-cat">{s.category || '—'}</span>
                    </td>
                    <td>{s.mrp || '—'}</td>
                    <td>{s.price || '—'}</td>
                    <td>
                      <span className={`badge ${s.is_sold ? 'badge-sold' : 'badge-avail'}`}>
                        {s.is_sold ? 'Sold' : 'Available'}
                      </span>
                    </td>
                    <td>
                      <div className="action-group">
                        <button className="btn btn-ghost btn-sm" onClick={() => toggleSold(s)}>
                          <i className="fa-solid fa-toggle-on"></i> Toggle
                        </button>
                        <button className="btn btn-ghost btn-sm" onClick={() => openEdit(s)}>
                          <i className="fa-solid fa-pen"></i> Edit
                        </button>
                        <button className="btn btn-danger btn-sm" onClick={() => deleteSaree(s)}>
                          <i className="fa-solid fa-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Saree Modal */}
      {addOpen && (
        <div className="modal-backdrop open" onClick={() => !saving && setAddOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Add New Saree</h3>
              <button className="modal-close" onClick={() => setAddOpen(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Saree Name</label>
                <input
                  className="form-control"
                  value={addForm.name}
                  placeholder="e.g. Chettinad Cotton Saree (CC14)"
                  onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Category</label>
                <select className="form-control" value={addForm.category} onChange={(e) => setAddForm({ ...addForm, category: e.target.value })}>
                  {CATEGORIES.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>MRP</label>
                  <input className="form-control" value={addForm.mrp} placeholder="₹1385" onChange={(e) => setAddForm({ ...addForm, mrp: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Selling Price</label>
                  <input className="form-control" value={addForm.price} placeholder="₹1185" onChange={(e) => setAddForm({ ...addForm, price: e.target.value })} />
                </div>
              </div>

              <div className="form-group">
                <label>Primary Image</label>
                <label className="file-label">
                  <i className="fa-solid fa-upload"></i> Upload new image
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      setAddPrimaryFile(e.target.files?.[0] || null)
                      setAddPrimaryStorageUrl('')
                    }}
                  />
                </label>
                <button type="button" className="btn btn-ghost btn-sm" style={{ marginTop: 8 }} onClick={pickAddPrimary}>
                  <i className="fa-solid fa-photo-film"></i> Choose from Storage
                </button>
                <div className="preview-strip">
                  {addPrimaryFile && <img src={URL.createObjectURL(addPrimaryFile)} alt="" />}
                  {!addPrimaryFile && addPrimaryStorageUrl && <img src={addPrimaryStorageUrl} alt="" />}
                </div>
              </div>

              <div className="form-group">
                <label>
                  Gallery Images <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(optional, multiple)</span>
                </label>
                <label className="file-label">
                  <i className="fa-solid fa-upload"></i> Upload new images
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => {
                      setAddGalleryFiles(Array.from(e.target.files || []))
                      setAddGalleryStorageUrls([])
                    }}
                  />
                </label>
                <button type="button" className="btn btn-ghost btn-sm" style={{ marginTop: 8 }} onClick={pickAddGallery}>
                  <i className="fa-solid fa-photo-film"></i> Choose from Storage (multi)
                </button>
                <div className="preview-strip">
                  {addGalleryFiles.map((f, i) => (
                    <img key={i} src={URL.createObjectURL(f)} alt="" />
                  ))}
                  {addGalleryFiles.length === 0 &&
                    addGalleryStorageUrls.map((u) => <img key={u} src={u} alt="" />)}
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setAddOpen(false)}>Cancel</button>
              <button className="btn btn-primary" disabled={saving} onClick={saveSaree}>
                {saving ? (
                  <>
                    <span className="spinner"></span> Saving...
                  </>
                ) : (
                  <>
                    <i className="fa-solid fa-check"></i> Save Saree
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Saree Modal */}
      {editItem && (
        <div className="modal-backdrop open" onClick={() => setEditItem(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Edit Saree</h3>
              <button className="modal-close" onClick={() => setEditItem(null)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Saree Name</label>
                <input className="form-control" value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Category</label>
                <select className="form-control" value={editForm.category} onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}>
                  {CATEGORIES.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>MRP</label>
                  <input className="form-control" value={editForm.mrp} onChange={(e) => setEditForm({ ...editForm, mrp: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Selling Price</label>
                  <input className="form-control" value={editForm.price} onChange={(e) => setEditForm({ ...editForm, price: e.target.value })} />
                </div>
              </div>

              <div className="form-group">
                <label>Gallery Images</label>
                <div className="img-manage-strip">
                  {editImages.map((img) => (
                    <div className="img-thumb-wrap" key={img.id}>
                      <img src={getOptimizedUrl(img.image_url, 100)} alt="" />
                      <button className="img-del-btn" onClick={() => deleteSareeImage(img)}>✕</button>
                    </div>
                  ))}
                </div>
                <label className="file-label" style={{ marginTop: 10 }}>
                  <i className="fa-solid fa-upload"></i> Upload new image
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const f = e.target.files?.[0]
                      if (f) uploadSareeImage(f)
                      e.target.value = ''
                    }}
                  />
                </label>
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  style={{ marginTop: 8 }}
                  onClick={() => setPicker({ open: true, mode: 'multi', target: 'edit-gallery' })}
                >
                  <i className="fa-solid fa-photo-film"></i> Choose from Storage
                </button>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setEditItem(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={updateSaree}>
                <i className="fa-solid fa-save"></i> Update
              </button>
            </div>
          </div>
        </div>
      )}

      <StorageImagePicker
        open={picker.open}
        mode={picker.mode}
        onClose={() => setPicker({ open: false, mode: 'single', target: null })}
        onSelect={(urls) => {
          if (picker.target === 'add-primary') setAddPrimaryStorageUrl(urls[0])
          if (picker.target === 'add-gallery') setAddGalleryStorageUrls(urls)
          if (picker.target === 'edit-gallery') linkStorageImages(urls)
        }}
      />

      <Toast toast={toast} />
    </div>
  )
}
