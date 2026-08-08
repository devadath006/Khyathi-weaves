const weaves = [
  {
    img: '/assets/kck.jpg',
    alt: 'Kanchi Cotton Saree',
    title: 'Kanchi Cotton',
    desc: 'Combining the majestic temple borders of traditional Kanchi weaves with the breathable grace of pure cotton. These sarees offer a regal aesthetic for the daytime, making heritage luxury comfortable for every occasion.',
  },
  {
    img: '/assets/kp.jpg',
    alt: 'Traditional Kuthampully Kerala Kasavu Saree',
    title: 'Kuthampully Weaves',
    desc: 'Kuthampully Sarees are Kerala’s timeless handloom treasures, woven by skilled artisans with soft cotton fabric that reflect elegance, tradition, and cultural pride.',
  },
  {
    img: '/assets/cck.jpg',
    alt: 'Chettinad Cotton Saree',
    title: 'Chettinad Cotton',
    desc: 'Known as "Kandaangi" sarees, these vibrant cotton fabrics are famous for their bold checks and stripes. Durable yet breathable, they are perfect for the modern woman who values tradition in her daily wear.',
  },
]

export default function Home() {
  return (
    <>
      <section className="relative bg-stone-900 text-white h-[65vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-black/50 z-10"></div>

        <img
          src="https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1920&q=80"
          alt="Handloom Weave Texture"
          className="absolute inset-0 w-full h-full object-cover"
        />

        <div className="relative z-20 text-center px-6 max-w-4xl flex flex-col items-center">
          <div className="relative mb-8 group">
            <div className="absolute -inset-1 bg-amber-400/30 rounded-full blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
            <div className="relative h-32 w-32 md:h-40 md:w-40 rounded-full overflow-hidden border-2 border-amber-200 bg-white p-1 shadow-2xl">
              <img
                src="/assets/logo.png"
                alt="Khyathi Weaves Logo"
                className="w-full h-full rounded-full object-cover bg-white"
                onError={(e) => { e.currentTarget.parentElement.style.display = 'none' }}
              />
            </div>
          </div>

          <h1 className="text-4xl md:text-6xl font-serif font-bold mb-4 tracking-[0.2em] uppercase">KHYATHI WEAVES</h1>
          <div className="w-24 h-1 bg-amber-400 my-2"></div>
          <p className="text-lg md:text-2xl font-light italic text-amber-50 tracking-wide mt-4 max-w-2xl">
            Interweaving tradition, elegance, and timeless grace into every thread.
          </p>

          <a
            href="/shop"
            className="mt-10 inline-block bg-rose-800 hover:bg-rose-900 text-white font-bold tracking-widest text-xs px-10 py-4 rounded-sm shadow-2xl transition-all transform hover:scale-105 uppercase border border-rose-700"
          >
            Explore Our Collection
          </a>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 py-24">
        <div className="text-center max-w-2xl mx-auto mb-20">
          <span className="text-xs font-bold text-rose-800 tracking-widest uppercase block mb-3 font-mono">
            The Handloom Legacy
          </span>
          <h2 className="text-4xl font-serif font-bold text-stone-900">Our Signature Regional Weaves</h2>
          <div className="w-16 h-1 bg-rose-800 mx-auto mt-6"></div>
        </div>

        <div className="grid lg:grid-cols-3 gap-12">
          {weaves.map((w) => (
            <div
              key={w.title}
              className="bg-white rounded-3xl shadow-sm border border-stone-100 overflow-hidden group hover:shadow-xl transition-all duration-500"
            >
              <div className="h-80 overflow-hidden relative bg-stone-200">
                <img
                  src={w.img}
                  alt={w.alt}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
              </div>
              <div className="p-10">
                <h3 className="text-2xl font-serif font-bold text-rose-800 mb-4">{w.title}</h3>
                <p className="text-stone-600 text-sm leading-relaxed">{w.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  )
}
