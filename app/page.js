import Link from 'next/link'

export const metadata = {
  title: 'AI Guild — Platform Vibe Coding',
  description: 'Belajar membangun produk digital dengan AI. Tanpa background IT.',
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Nav */}
      <nav className="border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <span className="font-bold text-lg text-purple-400">AI Guild</span>
        <Link
          href="/login"
          className="bg-purple-700 hover:bg-purple-600 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          Masuk
        </Link>
      </nav>

      {/* Hero */}
      <main className="max-w-3xl mx-auto px-6 py-20 text-center">
        <div className="inline-block bg-purple-900/40 text-purple-300 text-xs font-medium px-3 py-1 rounded-full border border-purple-800 mb-6">
          Platform Vibe Coding
        </div>

        <h1 className="text-4xl sm:text-5xl font-bold leading-tight mb-6">
          Bangun produk digital<br />
          <span className="text-purple-400">dengan AI</span>, tanpa background IT
        </h1>

        <p className="text-gray-400 text-lg mb-10 max-w-xl mx-auto">
          Modul bergaya flowchart. Video + materi langsung di satu layar.
          Beli sekali, akses seumur hidup.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="https://lynk.id"
            className="bg-purple-700 hover:bg-purple-600 px-8 py-3.5 rounded-xl font-semibold text-base transition-colors"
          >
            Beli Akses
          </a>
          <Link
            href="/login"
            className="bg-gray-800 hover:bg-gray-700 px-8 py-3.5 rounded-xl font-semibold text-base transition-colors"
          >
            Sudah punya akses? Masuk
          </Link>
        </div>
      </main>

      {/* Features */}
      <section className="max-w-4xl mx-auto px-6 py-16 grid grid-cols-1 sm:grid-cols-3 gap-6">
        {[
          { emoji: '🗺️', title: 'Flowchart Modul', desc: 'Lihat alur belajar secara visual. Pilih jalurmu sendiri.' },
          { emoji: '▶️', title: 'Video + Materi', desc: 'Tonton video dan baca materi tanpa buka tab baru.' },
          { emoji: '🔐', title: 'Akses via Email', desc: 'Tidak perlu password. Link masuk dikirim ke email.' },
        ].map((f) => (
          <div key={f.title} className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <div className="text-3xl mb-3">{f.emoji}</div>
            <h3 className="font-semibold text-white mb-1">{f.title}</h3>
            <p className="text-gray-400 text-sm">{f.desc}</p>
          </div>
        ))}
      </section>

      <footer className="text-center text-gray-600 text-xs py-8 border-t border-gray-800">
        © 2026 AI Guild · Dibuat oleh Arul
      </footer>
    </div>
  )
}
