import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export default function Gallery() {
  const [gallery, setGallery] = useState([])
  const [lightbox, setLightbox] = useState(false)
  const [currentItem, setCurrentItem] = useState(null)

  useEffect(() => {
    async function load() {
      const { data, error } = await supabase
        .from('gallery_items')
        .select('*')
        .order('id', { ascending: false })
      if (!error) setGallery(data || [])
    }
    load()
  }, [])

  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') setLightbox(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <section className="max-w-7xl mx-auto px-6 py-12">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-serif font-bold text-stone-900 uppercase tracking-widest">Gallery</h2>
        <p className="text-stone-500 italic mt-2 text-sm">A technical showcase of Khyathi Weaves Story.</p>
        <div className="w-16 h-1 bg-rose-800 mx-auto mt-4"></div>
      </div>

      <div className="columns-1 sm:columns-2 md:columns-3 gap-8 space-y-8">
        {gallery.map((item) => (
          <div
            key={item.id}
            onClick={() => {
              setCurrentItem(item)
              setLightbox(true)
            }}
            className="break-inside-avoid bg-white border border-stone-100 rounded-2xl overflow-hidden shadow-sm cursor-pointer hover:shadow-lg transition-all group mb-8"
          >
            <div className="bg-stone-50 overflow-hidden relative">
              <img
                src={item.media_url}
                alt={item.title}
                loading="lazy"
                className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-stone-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-6">
                <span className="text-white text-xs font-bold tracking-widest uppercase bg-rose-800/90 px-3 py-1.5 rounded">
                  View Full Image
                </span>
              </div>
            </div>

            <div className="p-5 border-t border-stone-50">
              <span className="text-[10px] font-mono tracking-widest uppercase bg-stone-100 text-stone-600 px-2 py-0.5 rounded">
                {item.category}
              </span>
              <h3 className="font-serif font-bold text-lg text-stone-900 mt-2">{item.title}</h3>
              <p className="text-stone-500 text-xs mt-1 line-clamp-2">{item.description}</p>
            </div>
          </div>
        ))}
      </div>

      {lightbox && (
        <div
          className="fixed inset-0 bg-black/90 z-[70] flex flex-col items-center justify-center p-4"
          onClick={() => setLightbox(false)}
        >
          <div className="relative max-w-4xl max-h-[80vh] z-10 flex flex-col items-center" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setLightbox(false)}
              className="absolute -top-12 right-0 text-white hover:text-stone-300 font-mono text-sm tracking-widest uppercase flex items-center gap-2 cursor-pointer bg-stone-900/80 px-4 py-2 rounded-xl border border-stone-700"
            >
              Close <i className="fa-solid fa-xmark"></i>
            </button>

            <img
              src={currentItem?.media_url}
              alt={currentItem?.title}
              className="rounded-xl max-w-full max-h-[80vh] object-contain shadow-2xl border border-stone-800"
            />

            <div className="text-center mt-4 text-stone-300 max-w-xl">
              <h4 className="font-serif font-bold text-lg text-white">{currentItem?.title}</h4>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
