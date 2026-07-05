'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence, useScroll, useTransform, useInView, useMotionValue, useSpring, animate } from 'framer-motion'

const ease = [0.16, 1, 0.3, 1]

function rupiah(n) {
  if (n == null) return ''
  return 'Rp' + Number(n).toLocaleString('id-ID')
}

const LANGKAH = [
  { n: '01', t: 'Pilih & bayar kursus', d: 'Checkout aman di Mayar pakai email kamu. Sekali bayar, akses selamanya.' },
  { n: '02', t: 'Cek email', d: 'Akun kamu otomatis aktif. Buka halaman masuk, ketik email yang sama, klik link.' },
  { n: '03', t: 'Mulai belajar', d: 'Langsung masuk ke flowchart modul. Belajar urut, kapan saja, dari mana saja.' },
]

// Bukti pendapatan. Isi `src` dengan path file di /public (mis. '/pendapatan/jan.png').
// Kalau `src` masih '' → tampil placeholder bergaya (tidak ada gambar broken).
// Simpan file screenshot bulanan ke: public/pendapatan/<nama>.png
const PROOF = [
  { src: '/penghasilan-lynkid.png', caption: 'Total Lynk.id', hint: 'Rp712jt+' },
  { src: '/pendapatan/jan.png',     caption: 'Januari',       hint: 'Rp176,5jt' },
  { src: '/pendapatan/feb.png',     caption: 'Februari',      hint: 'Rp45,4jt' },
  { src: '/pendapatan/mar.png',     caption: 'Maret',         hint: 'Rp42,7jt' },
  { src: '/pendapatan/apr.png',     caption: 'April',         hint: 'Rp24,2jt' },
  { src: '/pendapatan/mei.png',     caption: 'Mei',           hint: 'Rp17,8jt' },
  { src: '/pendapatan/jun.png',     caption: 'Juni',          hint: 'Rp18,5jt' },
  { src: '/pendapatan/harian.png',  caption: 'Contoh 1 hari', hint: 'Rp11,1jt' },
]

const STATS = [
  { to: 712, prefix: 'Rp', suffix: 'jt+', small: 'total penjualan' },
  { to: 7473, prefix: '', suffix: '', small: 'order produk digital' },
  { to: 0, prefix: '', suffix: '', small: 'background IT' },
]

const FAQ = [
  { q: 'Harus bisa ngoding dulu?', a: 'Tidak. Kursus di sini dirancang khusus untuk non-IT. Kamu belajar dari mindset paling dasar sampai bisa bikin produk yang menghasilkan — dibantu AI di setiap langkah.' },
  { q: 'Aksesnya berapa lama?', a: 'Selamanya. Sekali beli sebuah kursus, kamu punya akses penuh ke kursus itu tanpa batas waktu — termasuk modul baru yang ditambahkan ke kursus tersebut.' },
  { q: 'Email mana yang dipakai untuk masuk?', a: 'Email yang sama dengan saat kamu bayar di Mayar. Pastikan ketik dengan benar — akun terikat ke email itu.' },
  { q: 'Materinya dalam bentuk apa?', a: 'Video YouTube + materi PDF per modul, tersusun sebagai flowchart (peta belajar) supaya kamu tahu urutan dan tidak tersesat.' },
  { q: 'Bagaimana kalau mau refund?', a: 'Refund dikelola manual oleh admin. Hubungi kami lewat komunitas dan kami bantu sesuai kondisinya.' },
]

export default function LandingClient({ payUrl = '#', courses = [], flagship = null, flagshipModules = [] }) {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState('idle')
  const [errorMsg, setErrorMsg] = useState('')
  const [openFaq, setOpenFaq] = useState(0)

  useEffect(() => {
    const err = new URLSearchParams(window.location.search).get('error')
    if (err) {
      setStatus('error')
      setErrorMsg(err === 'expired' ? 'Link sudah kedaluwarsa. Minta link baru.' : 'Link tidak valid.')
      document.getElementById('masuk')?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    setStatus('loading')
    setErrorMsg('')
    try {
      const res = await fetch('/api/auth/send-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()
      if (!res.ok) {
        setErrorMsg(data.error || 'Terjadi kesalahan.')
        setStatus('error')
        return
      }
      if (data.devUrl) {
        window.location.href = data.devUrl
        return
      }
      setStatus('sent')
    } catch {
      setErrorMsg('Tidak bisa terhubung ke server.')
      setStatus('error')
    }
  }

  const flagshipLink = flagship ? `/kursus/${flagship.slug}` : '#harga'

  // Parallax hero: konten naik & memudar, glow bergerak turun saat scroll
  const heroRef = useRef(null)
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] })
  const heroY = useTransform(scrollYProgress, [0, 1], [0, -90])
  const heroOpacity = useTransform(scrollYProgress, [0, 1], [1, 0])
  const glowY = useTransform(scrollYProgress, [0, 1], [0, 180])
  const glowScale = useTransform(scrollYProgress, [0, 1], [1, 1.35])

  // Progress bar scroll seluruh halaman
  const { scrollYProgress: pageProgress } = useScroll()
  const barScaleX = useSpring(pageProgress, { stiffness: 120, damping: 30, mass: 0.3 })

  return (
    <div style={{ background: 'var(--bg)', color: 'var(--cream)', overflowX: 'hidden' }}>

      {/* ===== PROGRESS BAR SCROLL ===== */}
      <motion.div style={{
        position: 'fixed', top: 0, left: 0, right: 0, height: 3, zIndex: 60,
        background: 'var(--amber)', transformOrigin: '0%', scaleX: barScaleX,
      }} />

      {/* ===== NAV ===== */}
      <nav className="flex items-center justify-between px-5 sm:px-8 py-5 max-w-6xl mx-auto">
        <span className="font-extrabold" style={{ fontFamily: 'var(--font-display)', fontSize: 18, letterSpacing: '-0.02em' }}>
          AI<span style={{ color: 'var(--amber)' }}>·</span>GUILD
        </span>
        <div className="flex items-center gap-5" style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}>
          <a href="#masuk" style={{ color: 'var(--muted)' }} className="hover:opacity-100 transition">Masuk</a>
          <a href="#kursus" style={{ color: '#07070A', background: 'var(--amber)', padding: '7px 16px', borderRadius: 8, fontWeight: 600 }}>
            Lihat Kursus
          </a>
        </div>
      </nav>

      {/* ===== HERO (kursus unggulan) ===== */}
      <header ref={heroRef} className="relative px-5 sm:px-8 max-w-6xl mx-auto text-center flex flex-col justify-center"
        style={{ paddingTop: 40, paddingBottom: 72, minHeight: '90vh' }}>
        <motion.div aria-hidden style={{
          position: 'absolute', top: '6%', left: '50%', x: '-50%', y: glowY, scale: glowScale,
          width: 780, height: 560, maxWidth: '130vw',
          background: 'radial-gradient(circle, var(--amber-glow), transparent 65%)',
          filter: 'blur(50px)', pointerEvents: 'none', zIndex: 0,
        }} />

        <motion.div className="relative" style={{ zIndex: 1, y: heroY, opacity: heroOpacity }}>
          <motion.p
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease }}
            style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.25em', color: 'var(--amber)', textTransform: 'uppercase', marginBottom: 24 }}
          >
            Platform Kelas AI · Untuk Pemula Non-IT
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.08, ease }}
            className="font-extrabold uppercase mx-auto"
            style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2.3rem, 6vw, 4.3rem)', lineHeight: 1.0, letterSpacing: '-0.035em', maxWidth: 1040 }}
          >
            <span className="block" style={{ color: 'var(--cream)' }}>Manfaatkan AI sampai menghasilkan jutaan —</span>
            <span className="block" style={{ color: 'var(--amber)' }}>walau kamu bukan programmer.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.22, ease }}
            style={{ color: 'var(--muted)', fontSize: 'clamp(0.95rem, 2vw, 1.2rem)', lineHeight: 1.65, maxWidth: 600, marginTop: 30, marginLeft: 'auto', marginRight: 'auto' }}
          >
            Belajar langsung dari orang yang benar-benar menghasilkan pakai AI — dari nol, tanpa background IT. Pilih kelasmu di bawah dan mulai hari ini.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.34, ease }}
            className="flex flex-col sm:flex-row gap-3 mt-10 justify-center"
          >
            <MagneticA href={flagshipLink}
              style={{ background: 'var(--amber)', color: '#07070A', padding: '15px 30px', borderRadius: 12, fontWeight: 700, textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: 13, letterSpacing: '0.04em' }}>
              {flagship ? `Mulai · ${rupiah(flagship.price)}` : 'Lihat kursus'} {flagship && <span style={{ opacity: 0.7, fontWeight: 500 }}>· akses selamanya</span>}
            </MagneticA>
            <MagneticA href="#bukti"
              style={{ border: '1px solid var(--border)', color: 'var(--cream)', padding: '15px 30px', borderRadius: 12, fontWeight: 500, textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: 13 }}>
              Lihat bukti ↓
            </MagneticA>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, delay: 0.5 }}
            className="flex flex-wrap gap-x-6 gap-y-2 mt-12 justify-center"
            style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--muted)' }}
          >
            <span><span style={{ color: 'var(--amber)' }}>{flagshipModules.length}</span> modul</span>
            <span><span style={{ color: 'var(--amber)' }}>1×</span> bayar</span>
            <span><span style={{ color: 'var(--amber)' }}>∞</span> akses selamanya</span>
            <span><span style={{ color: 'var(--amber)' }}>∞</span> belajar ulang</span>
          </motion.div>
        </motion.div>

        <motion.a href="#bukti" aria-label="Scroll ke bukti"
          style={{ position: 'absolute', bottom: 24, left: '50%', x: '-50%', zIndex: 1, color: 'var(--muted)' }}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1, duration: 0.8 }}
        >
          <motion.span style={{ display: 'block', fontSize: 22 }}
            animate={{ y: [0, 9, 0] }} transition={{ repeat: Infinity, duration: 1.6, ease: 'easeInOut' }}>
            ↓
          </motion.span>
        </motion.a>
      </header>

      {/* ===== BUKTI PENDAPATAN (wall of proof) ===== */}
      <Section id="bukti" eyebrow="Bukti nyata · bukan janji" title="Uang beneran masuk rekening — dari vibe coding">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {PROOF.map((p, i) => (
            <Reveal key={i} delay={Math.min(i, 6) * 0.06}>
              <Parallax offset={[22, 38, 12][i % 3]}>
                <ProofShot src={p.src} caption={p.caption} hint={p.hint} />
              </Parallax>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.1}>
          <div className="flex flex-wrap gap-x-8 gap-y-3 mt-9" style={{ fontFamily: 'var(--font-mono)' }}>
            {STATS.map((s) => (
              <div key={s.small}>
                <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--amber)', fontFamily: 'var(--font-display)' }}>
                  <CountUp to={s.to} prefix={s.prefix} suffix={s.suffix} />
                </div>
                <div style={{ fontSize: 11, color: 'var(--muted)' }}>{s.small}</div>
              </div>
            ))}
          </div>
        </Reveal>

        <div className="mt-8">
          <a href={flagshipLink} style={{ display: 'inline-block', background: 'var(--amber)', color: '#07070A', padding: '13px 28px', borderRadius: 12, fontWeight: 700, fontFamily: 'var(--font-mono)', fontSize: 13 }}>
            Mulai belajar cara ini →
          </a>
        </div>
      </Section>

      {/* ===== KENAPA BELAJAR DI SINI (cerita) ===== */}
      <Section id="kenapa" eyebrow="Kenapa belajar di sini" title="Belajar dari vibe coder sejati — bukan programmer, bukan anak IT">
        <Reveal>
          <div style={{ maxWidth: 620 }}>
            <p style={{ color: 'var(--muted)', fontSize: 15.5, lineHeight: 1.75, marginBottom: 16 }}>
              Aku <b style={{ color: 'var(--cream)' }}>Arul</b> — bukan lulusan IT, bukan programmer. Tapi dengan{' '}
              <b style={{ color: 'var(--amber)' }}>vibe coding</b> dan bantuan AI, aku sudah membangun puluhan produk
              digital yang menghasilkan <b style={{ color: 'var(--cream)' }}>ratusan juta rupiah</b> — angka di atas itu rekeningku, bukan janji marketing.
            </p>
            <p style={{ color: 'var(--muted)', fontSize: 15.5, lineHeight: 1.75 }}>
              Di sini kamu belajar cara yang persis sama — langkah demi langkah, dari nol, tanpa harus jadi programmer dulu.
            </p>
          </div>
        </Reveal>
      </Section>

      {/* ===== SEMUA KURSUS (grid) ===== */}
      <Section id="kursus" eyebrow="Katalog" title="Semua kursus">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {courses.map((c, i) => (
            <Reveal key={c.slug} delay={Math.min(i, 6) * 0.06}>
              <a href={`/kursus/${c.slug}`} className="block h-full rounded-2xl p-6 transition"
                style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                <h3 className="font-bold" style={{ fontFamily: 'var(--font-display)', fontSize: 18, color: 'var(--cream)', lineHeight: 1.25, marginBottom: 10 }}>{c.title}</h3>
                {c.description && <p style={{ color: 'var(--muted)', fontSize: 13.5, lineHeight: 1.6, marginBottom: 18 }}>{c.description}</p>}
                <div className="flex items-center justify-between" style={{ marginTop: 'auto' }}>
                  <span className="font-extrabold" style={{ fontFamily: 'var(--font-display)', fontSize: 20, color: 'var(--amber)' }}>{rupiah(c.price)}</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--cream)', border: '1px solid var(--border)', borderRadius: 8, padding: '6px 12px' }}>Lihat →</span>
                </div>
              </a>
            </Reveal>
          ))}
          {/* Placeholder pertumbuhan katalog */}
          <Reveal delay={0.12}>
            <div className="h-full rounded-2xl p-6 flex items-center justify-center text-center"
              style={{ border: '1px dashed var(--border)', minHeight: 160 }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--muted)' }}>Kursus baru<br />segera hadir</span>
            </div>
          </Reveal>
        </div>
      </Section>

      {/* ===== CARA KERJA ===== */}
      <Section id="cara-kerja" eyebrow="Cara mulai" title="Tiga langkah, langsung jalan">
        <div className="grid sm:grid-cols-3 gap-4">
          {LANGKAH.map((l, i) => (
            <Reveal key={l.n} delay={i * 0.1}>
              <div className="h-full rounded-2xl p-6" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                <span className="font-extrabold" style={{ fontFamily: 'var(--font-display)', fontSize: 38, color: 'var(--amber)', opacity: 0.9 }}>{l.n}</span>
                <h3 className="font-bold mt-3 mb-2" style={{ fontFamily: 'var(--font-display)', fontSize: 18, color: 'var(--cream)' }}>{l.t}</h3>
                <p style={{ color: 'var(--muted)', fontSize: 14, lineHeight: 1.6 }}>{l.d}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* ===== KURIKULUM (kursus unggulan) ===== */}
      {flagshipModules.length > 0 && (
        <Section id="kurikulum" eyebrow="Isi kursus unggulan" title={`${flagshipModules.length} modul, dari mindset sampai monetisasi`}>
          <p style={{ color: 'var(--muted)', fontSize: 14, lineHeight: 1.6, maxWidth: 560, marginBottom: 28 }}>
            Tersusun sebagai peta belajar (flowchart) — kamu selalu tahu langkah berikutnya, tidak tersesat.
          </p>
          <div className="grid sm:grid-cols-2 gap-x-8 gap-y-0">
            {flagshipModules.map((m, i) => (
              <Reveal key={m.slug} delay={Math.min(i, 6) * 0.04}>
                <div className="flex items-start gap-3 py-3" style={{ borderBottom: '1px solid var(--border)' }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--amber)', marginTop: 3, minWidth: 24 }}>
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span style={{ fontSize: 14, color: 'var(--cream)', lineHeight: 1.45 }}>{m.title}</span>
                </div>
              </Reveal>
            ))}
          </div>
          <div className="mt-8">
            <a href={flagshipLink} style={{ display: 'inline-block', background: 'var(--amber)', color: '#07070A', padding: '13px 28px', borderRadius: 12, fontWeight: 700, fontFamily: 'var(--font-mono)', fontSize: 13 }}>
              Mulai kursus ini →
            </a>
          </div>
        </Section>
      )}

      {/* ===== FAQ ===== */}
      <Section id="faq" eyebrow="Pertanyaan umum" title="Yang sering ditanya">
        <div className="max-w-2xl">
          {FAQ.map((item, i) => (
            <Reveal key={i} delay={i * 0.05}>
              <div style={{ borderBottom: '1px solid var(--border)' }}>
                <button
                  onClick={() => setOpenFaq(openFaq === i ? -1 : i)}
                  className="w-full flex items-center justify-between gap-4 text-left py-5"
                  style={{ background: 'transparent' }}
                >
                  <span className="font-semibold" style={{ fontSize: 15, color: 'var(--cream)' }}>{item.q}</span>
                  <span style={{ color: 'var(--amber)', fontSize: 20, transform: openFaq === i ? 'rotate(45deg)' : 'none', transition: 'transform 0.25s' }}>+</span>
                </button>
                <AnimatePresence initial={false}>
                  {openFaq === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease }} style={{ overflow: 'hidden' }}
                    >
                      <p style={{ color: 'var(--muted)', fontSize: 14, lineHeight: 1.65, paddingBottom: 20 }}>{item.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* ===== MASUK (login) ===== */}
      <section id="masuk" className="px-5 sm:px-8 max-w-6xl mx-auto" style={{ paddingTop: 40, paddingBottom: 100 }}>
        <Reveal>
          <div className="rounded-3xl p-8 sm:p-12 text-center" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.2em', color: 'var(--amber)', textTransform: 'uppercase', marginBottom: 14 }}>
              Sudah punya akses?
            </p>
            <h2 className="font-extrabold" style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.6rem, 5vw, 2.4rem)', color: 'var(--cream)', marginBottom: 10, letterSpacing: '-0.02em' }}>
              Masuk ke AI Guild
            </h2>
            <p style={{ color: 'var(--muted)', fontSize: 14, marginBottom: 28 }}>
              Pakai email yang sama saat kamu membeli kursus.
            </p>

            <div style={{ maxWidth: 380, margin: '0 auto' }}>
              {process.env.NODE_ENV === 'development' && (
                <a href="/api/dev-login" className="block w-full rounded-xl py-2.5 mb-3"
                  style={{ background: 'rgba(232,160,32,0.06)', border: '1px dashed rgba(232,160,32,0.3)', color: '#E8A020', fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                  ⚡ Dev Login (admin)
                </a>
              )}
              <AnimatePresence mode="wait">
                {status === 'sent' ? (
                  <motion.div key="sent" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
                    <div className="text-4xl mb-3">✉️</div>
                    <p className="font-bold mb-1" style={{ color: 'var(--cream)', fontSize: 16 }}>Cek email kamu</p>
                    <p style={{ color: 'var(--muted)', fontSize: 14, lineHeight: 1.6 }}>
                      Link masuk dikirim ke <span style={{ color: 'var(--amber)' }}>{email}</span>. Berlaku 15 menit.
                    </p>
                    <button onClick={() => setStatus('idle')} className="mt-5 text-sm" style={{ color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>← Kirim ulang</button>
                  </motion.div>
                ) : (
                  <motion.form key="form" onSubmit={handleSubmit} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <AnimatePresence>
                      {status === 'error' && (
                        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                          className="mb-4 px-4 py-2.5 rounded-xl text-sm text-left"
                          style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171' }}>
                          {errorMsg}
                        </motion.div>
                      )}
                    </AnimatePresence>
                    <input
                      type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                      placeholder="kamu@email.com" required
                      className="w-full rounded-xl px-4 py-3 text-sm outline-none mb-3"
                      style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--cream)' }}
                      onFocus={(e) => (e.target.style.borderColor = 'rgba(232,160,32,0.4)')}
                      onBlur={(e) => (e.target.style.borderColor = 'var(--border)')}
                    />
                    <button type="submit" disabled={status === 'loading'}
                      className="w-full py-3 rounded-xl font-bold"
                      style={{ background: status === 'loading' ? 'rgba(232,160,32,0.4)' : 'var(--amber)', color: '#07070A', cursor: status === 'loading' ? 'not-allowed' : 'pointer', fontFamily: 'var(--font-mono)', letterSpacing: '0.06em', textTransform: 'uppercase', fontSize: 12 }}>
                      {status === 'loading' ? 'Mengirim...' : 'Kirim Link Masuk'}
                    </button>
                  </motion.form>
                )}
              </AnimatePresence>
              <p className="mt-6" style={{ fontSize: 13, color: 'var(--muted)' }}>
                Belum punya akses?{' '}
                <a href="#kursus" style={{ color: 'var(--amber)' }} className="hover:underline">Lihat kursus</a>
              </p>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="px-5 sm:px-8 py-8 max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3" style={{ borderTop: '1px solid var(--border)', fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--muted)' }}>
        <span>AI<span style={{ color: 'var(--amber)' }}>·</span>GUILD — Platform Kelas AI · Untuk Pemula Non-IT</span>
        <span>© 2026 · arul.cg</span>
      </footer>
    </div>
  )
}

function ProofShot({ src, caption, hint }) {
  const [broken, setBroken] = useState(false)
  return (
    <motion.figure style={{ margin: 0 }}
      whileHover={{ y: -6 }} transition={{ type: 'spring', stiffness: 300, damping: 20 }}>
      {src && !broken ? (
        <img src={src} alt={caption} loading="lazy"
          onError={() => setBroken(true)}
          onLoad={(e) => { if (e.currentTarget.naturalWidth === 0) setBroken(true) }}
          ref={(img) => { if (img && img.complete && img.naturalWidth === 0) setBroken(true) }}
          style={{ width: '100%', borderRadius: 16, border: '1px solid var(--border)', boxShadow: '0 20px 60px rgba(0,0,0,0.45)', display: 'block' }} />
      ) : (
        <div style={{
          width: '100%', aspectRatio: '4 / 3', borderRadius: 16, overflow: 'hidden',
          border: '1px dashed var(--border)', background: 'var(--surface)',
          boxShadow: '0 20px 60px rgba(0,0,0,0.35)', position: 'relative',
          display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: 18,
        }}>
          {/* batang-batang blur ala grafik dashboard */}
          <div aria-hidden style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'flex-end', gap: 10, padding: 18, opacity: 0.35 }}>
            {[42, 68, 55, 82, 60, 95].map((h, i) => (
              <div key={i} style={{ flex: 1, height: `${h}%`, background: 'linear-gradient(to top, var(--amber), transparent)', borderRadius: 4 }} />
            ))}
          </div>
          <div style={{ position: 'relative' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 800, color: 'var(--amber)' }}>Rp•••</div>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10.5, letterSpacing: '0.08em', color: 'var(--muted)', textTransform: 'uppercase' }}>
              screenshot · segera
            </span>
          </div>
        </div>
      )}
      <figcaption style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--muted)', textAlign: 'center', marginTop: 10 }}>
        {caption}{hint ? ` · ${hint}` : ''}
      </figcaption>
    </motion.figure>
  )
}

function Section({ id, eyebrow, title, children }) {
  return (
    <section id={id} className="px-5 sm:px-8 max-w-6xl mx-auto" style={{ paddingTop: 64, paddingBottom: 16 }}>
      <motion.p
        initial={{ opacity: 0, x: -16 }} whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, margin: '-60px' }} transition={{ duration: 0.6, ease }}
        style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.2em', color: 'var(--amber)', textTransform: 'uppercase', marginBottom: 12 }}>
        {eyebrow}
      </motion.p>
      <motion.h2 className="font-extrabold"
        initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }} transition={{ duration: 0.7, delay: 0.1, ease }}
        style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.8rem, 5vw, 2.8rem)', color: 'var(--cream)', letterSpacing: '-0.03em', marginBottom: 32, maxWidth: 640, lineHeight: 1.05 }}>
        {title}
      </motion.h2>
      {children}
    </section>
  )
}

function Reveal({ children, delay = 0, y = 28 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y, scale: 0.97 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.7, delay, ease }}
    >
      {children}
    </motion.div>
  )
}

// Geser vertikal halus mengikuti scroll (efek kedalaman)
function Parallax({ children, offset = 24 }) {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], [offset, -offset])
  return <motion.div ref={ref} style={{ y }}>{children}</motion.div>
}

// Angka menghitung naik saat masuk viewport (0 → target)
function CountUp({ to, prefix = '', suffix = '', duration = 1.8 }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-40px' })
  const [val, setVal] = useState(0)
  useEffect(() => {
    if (!inView) return
    const controls = animate(0, to, { duration, ease: 'easeOut', onUpdate: (v) => setVal(v) })
    return () => controls.stop()
  }, [inView, to, duration])
  return <span ref={ref}>{prefix}{Math.round(val).toLocaleString('id-ID')}{suffix}</span>
}

// Tombol yang sedikit "menempel" ke kursor (magnetic) + hover scale
function MagneticA({ href, style, children }) {
  const ref = useRef(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const sx = useSpring(x, { stiffness: 200, damping: 15 })
  const sy = useSpring(y, { stiffness: 200, damping: 15 })
  function onMove(e) {
    const r = ref.current.getBoundingClientRect()
    x.set((e.clientX - (r.left + r.width / 2)) * 0.3)
    y.set((e.clientY - (r.top + r.height / 2)) * 0.3)
  }
  function reset() { x.set(0); y.set(0) }
  return (
    <motion.a ref={ref} href={href} onMouseMove={onMove} onMouseLeave={reset}
      whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
      style={{ ...style, x: sx, y: sy }}>
      {children}
    </motion.a>
  )
}
