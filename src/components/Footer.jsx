export default function Footer() {
  return (
    <>
      <section className="bg-stone-900 text-white py-20 mt-10">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-3 gap-12 text-center">
          <div>
            <h4 className="text-amber-200 font-serif text-2xl mb-4">Direct Sourcing</h4>
            <p className="text-stone-400 text-sm">
              Every piece is handpicked from the weaver's loom in Kanchipuram, Kuthampully, and Chettinad.
            </p>
          </div>
          <div>
            <h4 className="text-amber-200 font-serif text-2xl mb-4">Unmatched Purity</h4>
            <p className="text-stone-400 text-sm">
              We verify every silk and cotton thread to ensure it meets our rigorous standards of 100% purity.
            </p>
          </div>
          <div>
            <h4 className="text-amber-200 font-serif text-2xl mb-4">Artisan Support</h4>
            <p className="text-stone-400 text-sm">
              By buying from us, you directly support the livelihood of traditional handloom weaver families.
            </p>
          </div>
        </div>
      </section>
      <footer className="bg-stone-900 text-stone-400 py-12 flex flex-col items-center gap-2 text-sm">
        <span>Email: khyathiweaves@gmail.com</span>
        <span>WhatsApp: +91 94469 94852</span>
      </footer>
    </>
  )
}
