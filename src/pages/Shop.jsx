import { useEffect, useMemo, useState } from 'react'
import { supabase, getOptimizedUrl } from '../lib/supabaseClient'

const CATEGORIES = ['All', 'Kanchi Cotton', 'Chettinad Cotton', 'Onam Collection', 'Kuthambully Cotton']

export default function Shop() {
  const [products, setProducts] = useState([])
  const [activeCategory, setActiveCategory] = useState('All')
  const [modalOpen, setModalOpen] = useState(false)
  const [activeItem, setActiveItem] = useState(null)
  const [images, setImages] = useState([])
  const [activeImg, setActiveImg] = useState('')

  useEffect(() => {
    async function load() {
      const { data, error } = await supabase.from('sarees').select('*').order('id')
      if (error) {
        console.error(error)
        return
      }
      // Coerce boolean -> integer (1/0) to mirror the original API contract
      setProducts((data || []).map((s) => ({ ...s, is_sold: s.is_sold ? 1 : 0 })))
    }
    load()
  }, [])

  const filteredProducts = useMemo(
    () => (activeCategory === 'All' ? products : products.filter((p) => p.category === activeCategory)),
    [products, activeCategory]
  )

  async function openProduct(p) {
    setActiveItem(p)
    const { data, error } = await supabase
      .from('saree_images')
      .select('id, image_url')
      .eq('saree_id', p.id)
    const urls = error ? [] : (data || []).map((r) => r.image_url)
    setImages(urls)
    setActiveImg(urls[0] || p.primary_image || '')
    setModalOpen(true)
  }

  return (
    <section className="max-w-7xl mx-auto px-6 py-12">
      <div className="text-center mb-10">
        <h2 className="text-4xl font-serif font-bold text-stone-900 uppercase tracking-widest">Our Collection</h2>
        <div className="w-16 h-1 bg-rose-800 mx-auto mt-4"></div>
      </div>

      <div className="flex flex-wrap justify-center gap-3 mb-14">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-5 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all border ${
              activeCategory === cat
                ? 'bg-rose-800 text-white border-rose-800 shadow-sm'
                : 'bg-white text-stone-500 border-stone-200 hover:border-rose-300 hover:text-rose-800'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <p className="text-center text-stone-400 italic py-16">No sarees in this collection yet.</p>
      )}

      <div className="grid md:grid-cols-3 gap-10">
        {filteredProducts.map((p) => (
          <div
            key={p.id}
            onClick={() => openProduct(p)}
            className="bg-white border border-stone-100 rounded-3xl overflow-hidden shadow-sm cursor-pointer hover:shadow-lg transition-all group relative"
          >
            <div className="aspect-[3/4] overflow-hidden bg-stone-50 relative flex items-center justify-center">
              <img
                src={p.primary_image}
                alt={p.name}
                loading="lazy"
                className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-700"
              />
              <span className="absolute top-3 left-3 bg-white/90 backdrop-blur text-stone-600 text-[9px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full z-10">
                {p.category}
              </span>

              {p.is_sold === 1 && (
                <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none select-none bg-white/40 backdrop-blur-[2px]">
                  <div className="border-[6px] border-rose-700/30 text-rose-700/40 px-6 py-2 font-serif font-black text-5xl uppercase transform -rotate-45 whitespace-nowrap">
                    SOLD OUT
                  </div>
                </div>
              )}
            </div>

            <div className="p-8">
              <div className="flex justify-between items-start">
                <h3 className="font-serif text-xl font-bold text-stone-900">{p.name}</h3>
                {p.is_sold === 1 && (
                  <span className="text-[9px] font-mono bg-stone-100 text-stone-500 px-2 py-1 rounded">ARCHIVED</span>
                )}
              </div>

              <div className="mt-4">
                <div className="flex items-center gap-2">
                  <span className="text-stone-400 line-through font-bold text-sm">{p.mrp}</span>
                  <span className="bg-rose-100 text-rose-800 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-tighter">
                    OUR PRICE
                  </span>
                </div>
                <p className="text-rose-900 font-black text-2xl mt-1">{p.price}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {modalOpen && (
        <div
          className="fixed inset-0 bg-black/90 z-[60] flex items-center justify-center p-4"
          onClick={() => setModalOpen(false)}
        >
          <div
            className="bg-white max-w-5xl w-full rounded-2xl overflow-hidden flex flex-col md:flex-row h-[85vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-stone-50 p-6 flex gap-4 overflow-hidden w-full md:w-3/5">
              <div className="flex flex-col gap-2 overflow-y-auto pr-2 custom-scrollbar">
                {images.map((img) => (
                  <img
                    key={img}
                    src={getOptimizedUrl(img, 100)}
                    onClick={() => setActiveImg(img)}
                    loading="lazy"
                    alt=""
                    className={`w-20 h-24 object-cover cursor-pointer border-2 rounded-md transition-all ${
                      activeImg === img ? 'border-rose-800 scale-95' : 'border-transparent hover:border-stone-200'
                    }`}
                  />
                ))}
              </div>
              <div className="flex-1 bg-white rounded-xl border flex items-center justify-center relative overflow-hidden shadow-inner p-4">
                <img src={activeImg} alt={activeItem?.name} className="max-h-full max-w-full object-contain" />
                {activeItem?.is_sold === 1 && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <span className="text-stone-900/5 font-serif font-black text-9xl uppercase transform -rotate-12">
                      SOLD OUT
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="md:w-2/5 p-10 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-rose-700">
                  {activeItem?.category}
                </span>
                <h2 className="text-3xl font-serif font-bold text-stone-900 mt-1">{activeItem?.name}</h2>

                <div className="mt-6 p-4 bg-stone-50 rounded-xl border border-stone-100">
                  <p className="text-stone-400 line-through font-bold text-lg mb-1">{activeItem?.mrp}</p>
                  <div className="flex items-center gap-3">
                    <p className="text-4xl text-rose-900 font-black font-mono">{activeItem?.price}</p>
                    <span className="bg-rose-800 text-white text-[10px] px-3 py-1 rounded-full font-bold uppercase">
                      Launch Price
                    </span>
                  </div>
                </div>

                <p className="mt-6 text-stone-500 text-sm leading-relaxed italic">
                  This authentic handloom masterpiece is currently offered at a special{' '}
                  <strong className="text-stone-800">Price</strong>
                </p>
              </div>

              <div className="space-y-4">
                {activeItem?.is_sold === 0 ? (
                  <a
                    href={`https://wa.me/919446994852?text=Namaskaram! I am interested in: ${activeItem?.name}`}
                    target="_blank"
                    rel="noreferrer"
                    className="block w-full bg-emerald-600 hover:bg-emerald-700 text-white text-center py-4 rounded-xl font-bold uppercase tracking-widest text-xs transition-colors"
                  >
                    Book via WhatsApp
                  </a>
                ) : (
                  <div className="block w-full bg-stone-100 text-stone-400 text-center py-4 rounded-xl font-bold uppercase tracking-widest text-xs border border-stone-200 cursor-not-allowed">
                    Currently Unavailable
                  </div>
                )}
                <button
                  onClick={() => setModalOpen(false)}
                  className="block w-full text-stone-400 hover:text-stone-800 text-xs font-bold uppercase tracking-widest transition-colors"
                >
                  Back to Collection
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
