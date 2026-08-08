export default function About() {
  return (
    <>
      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="flex flex-col md:flex-row items-center gap-16">
          <div className="w-full md:w-1/3">
            <div className="relative">
              <div className="absolute -top-4 -left-4 w-full h-full border-2 border-rose-800 rounded-2xl z-0"></div>
              <img
                src="/assets/me.jpg"
                alt="Devadath K Nair, founder of Khyathi Weaves"
                className="relative z-10 w-full rounded-2xl shadow-2xl object-cover aspect-[4/5]"
              />
              <div className="absolute -bottom-6 -right-6 bg-stone-900 text-amber-200 px-6 py-4 rounded-lg z-20 shadow-xl">
                <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-stone-400">Founder</p>
                <p className="font-serif text-lg">Devadath K Nair</p>
              </div>
            </div>
          </div>

          <div className="w-full md:w-2/3">
            <span className="text-rose-800 font-bold tracking-widest uppercase text-xs mb-4 block">
              The Rhythm of Technology & Tradition
            </span>
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-stone-900 mb-8 leading-tight">
              Artistry, Tradition, & Authenticity
            </h2>
            <div className="space-y-6 text-stone-600 leading-relaxed text-lg">
              <p>
                The rhythm of the Mridangam taught me discipline and a deep connection to tradition, while my
                journey as a 3rd-year BCA student introduced me to innovation and technology. Connecting these
                two worlds, Khyathi Weaves was born from watching my mother’s love for sarees and realizing the
                emotional and cultural value they carry. Her admiration for authentic handloom inspired me to
                create a platform that blends tradition with technology, preserving the elegance and heritage of
                genuine weaves for the modern generation.
              </p>
              <p>
                I visited the heartlands of our heritage—the narrow lanes of Kanchipuram, the rhythmic looms of
                Kuthampully, and the vibrant clusters of Chettinad. I sat with the master weavers, understood
                their struggles, and witnessed the honest labor behind every thread.
              </p>
              <p>
                By combining my technical background with a deep-rooted respect for craftsmanship, I personally
                oversee the sourcing of every thread. We source directly from weavers and use Khyathi Weaves to
                ensure that the authenticity of Indian handlooms reaches our customers without any compromise.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 bg-stone-100 border-t border-stone-200 text-center relative">
        <div className="max-w-4xl mx-auto px-6 relative z-10">
          <div className="inline-block mb-10">
            <div className="w-16 h-16 bg-rose-800 rounded-full flex items-center justify-center text-white animate-pulse">
              <i className="fa-solid fa-heart text-2xl"></i>
            </div>
          </div>
          <h3 className="text-3xl md:text-5xl font-serif font-bold text-stone-900 mb-8 italic">
            "Dedicated to all Saree Lovers"
          </h3>
          <p className="text-stone-600 text-lg md:text-2xl font-light mb-12">
            To those who understand that a saree is a heritage wrapped in grace. For the seekers of purity,
            Khyathi Weaves is the place for you.
          </p>
          <div className="h-12 w-12 rounded-full overflow-hidden border border-stone-300 mx-auto grayscale opacity-60">
            <img src="/assets/logo.png" alt="Khyathi Weaves" className="w-full h-full object-cover" />
          </div>
        </div>
      </section>
    </>
  )
}
