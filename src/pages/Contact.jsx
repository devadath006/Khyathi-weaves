export default function Contact() {
  return (
    <section className="max-w-4xl mx-auto px-6 py-16">
      <div className="text-center max-w-2xl mx-auto mb-16">
        <span className="text-xs font-bold text-rose-800 tracking-widest uppercase block mb-2">Get In Touch</span>
        <h2 className="text-3xl font-serif font-bold text-stone-900">Connect With Khyathi Weaves</h2>
        <div className="w-12 h-1 bg-rose-800 mx-auto mt-4"></div>
      </div>

      <div className="grid md:grid-cols-2 gap-8 max-w-2xl mx-auto mb-8">
        <div className="bg-white border border-stone-100 rounded-2xl shadow-sm p-8 text-center hover:shadow-md transition-all">
          <div className="w-14 h-14 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-5 text-rose-800">
            <i className="fa-solid fa-phone text-xl"></i>
          </div>
          <h4 className="text-stone-400 text-xs font-bold uppercase tracking-widest mb-1 font-mono">Phone Enquiries</h4>
          <a
            href="tel:+919446994852"
            className="text-xl font-medium text-stone-900 hover:text-rose-800 transition-colors block mt-2 font-mono tracking-tight"
          >
            +91 94469 94852
          </a>
        </div>

        <div className="bg-white border border-stone-100 rounded-2xl shadow-sm p-8 text-center hover:shadow-md transition-all">
          <div className="w-14 h-14 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-5 text-rose-800">
            <i className="fa-solid fa-envelope text-xl"></i>
          </div>
          <h4 className="text-stone-400 text-xs font-bold uppercase tracking-widest mb-1 font-mono">Email Support</h4>
          <a
            href="mailto:khyathiweaves@gmail.com"
            className="text-xl font-medium text-stone-900 hover:text-rose-800 transition-colors block mt-2 font-mono tracking-tight"
          >
            khyathiweaves@gmail.com
          </a>
        </div>
      </div>

      <div className="bg-white border border-stone-100 rounded-2xl shadow-sm p-8 text-center hover:shadow-md transition-all max-w-2xl mx-auto">
        <div className="w-14 h-14 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-5 text-rose-800">
          <i className="fa-brands fa-instagram text-xl"></i>
        </div>
        <h4 className="text-stone-400 text-xs font-bold uppercase tracking-widest mb-1 font-mono">Instagram</h4>
        <a
          href="https://www.instagram.com/khyathiweaves"
          target="_blank"
          rel="noreferrer"
          className="text-xl font-medium text-stone-900 hover:text-rose-800 transition-colors block mt-2 font-mono tracking-tight"
        >
          khyathiweaves
        </a>
      </div>
    </section>
  )
}
