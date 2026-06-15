'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MODULES_SEED } from '@/lib/modules-seed'

const HARGA = 'Rp1.497.000'
const PER_BULAN = 'Rp124.750'

const ease = [0.16, 1, 0.3, 1]

const LANGKAH = [
  { n: '01', t: 'Bayar di Mayar', d: 'Checkout aman pakai email kamu. Sekali bayar, akses 1 tahun penuh.' },
  { n: '02', t: 'Cek email', d: 'Akun kamu otomatis aktif. Buka halaman masuk, ketik email yang sama, klik link.' },
  { n: '03', t: 'Mulai belajar', d: 'Langsung masuk ke flowchart 21 modul. Belajar urut, kapan saja, dari mana saja.' },
]

const FAQ = [
  { q: 'Harus bisa ngoding dulu?', a: 'Tidak. AI Guild dirancang khusus untuk non-IT. Kamu belajar dari mindset paling dasar sampai bisa bikin produk yang menghasilkan — dibantu AI di setiap langkah.' },
  { q: 'Aksesnya berapa lama?', a: 'Satu tahun penuh sejak pembayaran. Mendekati masa habis, kamu kami ingatkan lewat email dan tinggal perpanjang. Perpanjang lebih awal? Sisa harimu tidak hangus — masa aktif numpuk.' },
  { q: 'Email mana yang dipakai untuk masuk?', a: 'Email yang sama dengan saat kamu bayar di Mayar. Pastikan ketik dengan benar — akun terikat ke email itu.' },
  { q: 'Materinya dalam bentuk apa?', a: 'Video YouTube + materi PDF per modul, tersusun sebagai flowchart (peta belajar) supaya kamu tahu urutan dan tidak tersesat. Modul baru ditambah dari waktu ke waktu — kamu otomatis dapat.' },
  { q: 'Bagaimana kalau mau refund?', a: 'Refund dikelola manual oleh admin. Hubungi kami lewat komunitas dan kami bantu sesuai kondisinya.' },
]

export default function LandingClient({ payUrl = '#' }) {
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

  return (
    <div style={{ background: 'var(--bg)', color: 'var(--cream)', overflowX: 'hidden' }}>

      {/* ===== NAV ===== */}
      <nav className="flex items-center justify-between px-5 sm:px-8 py-5 max-w-6xl mx-auto">
        <span className="font-extrabold" style={{ fontFamily: 'var(--font-display)', fontSize: 18, letterSpacing: '-0.02em' }}>
          AI<span style={{ color: 'var(--amber)' }}>·</span>GUILD
        </span>
        <div className="flex items-center gap-5" style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}>
          <a href="#masuk" style={{ color: 'var(--muted)' }} className="hover:opacity-100 transition">Masuk</a>
          <a href="#harga" style={{ color: '#07070A', background: 'var(--amber)', padding: '7px 16px', borderRadius: 8, fontWeight: 600 }}>
            Gabung
          </a>
        </div>
      </nav>

      {/* ===== HERO ===== */}
      <header className="relative px-5 sm:px-8 max-w-6xl mx-auto" style={{ paddingTop: 56, paddingBottom: 80 }}>
        <div aria-hidden style={{
          position: 'absolute', top: -120, left: '50%', transform: 'translateX(-50%)',
          width: 700, height: 500, maxWidth: '120vw',
          background: 'radial-gradient(circle, var(--amber-glow), transparent 65%)',
          filter: 'blur(40px)', pointerEvents: 'none', zIndex: 0,
        }} />

        <div className="relative" style={{ zIndex: 1 }}>
          <motion.p
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease }}
            style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.25em', color: 'var(--amber)', textTransform: 'uppercase', marginBottom: 22 }}
          >
            Platform Vibe Coding · Untuk Non-IT
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.08, ease }}
            className="font-extrabold uppercase"
            style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2.4rem, 9vw, 5.5rem)', lineHeight: 0.95, letterSpacing: '-0.04em', maxWidth: 900 }}
          >
            <span className="block" style={{ color: 'var(--cream)' }}>Ngoding pakai AI.</span>
            <span className="block" style={{ color: 'var(--amber)' }}>Dari nol sampai</span>
            <span className="block" style={{ color: 'var(--cream)' }}>menghasilkan.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.22, ease }}
            style={{ color: 'var(--muted)', fontSize: 'clamp(0.95rem, 2vw, 1.15rem)', lineHeight: 1.65, maxWidth: 540, marginTop: 28 }}
          >
            Tanpa harus jadi programmer dulu. Belajar bikin web app, aplikasi desktop, APK Android,
            dan otomasi — dibimbing langkah demi langkah lewat 21 modul terstruktur.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.34, ease }}
            className="flex flex-col sm:flex-row gap-3 mt-10"
          >
            <a href={payUrl} target="_blank" rel="noopener noreferrer"
              style={{ background: 'var(--amber)', color: '#07070A', padding: '15px 30px', borderRadius: 12, fontWeight: 700, textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: 13, letterSpacing: '0.04em' }}>
              Gabung · {HARGA}/tahun
            </a>
            <a href="#kurikulum"
              style={{ border: '1px solid var(--border)', color: 'var(--cream)', padding: '15px 30px', borderRadius: 12, fontWeight: 500, textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: 13 }}>
              Lihat kurikulum ↓
            </a>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, delay: 0.5 }}
            className="flex flex-wrap gap-x-6 gap-y-2 mt-12"
            style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--muted)' }}
          >
            <span><span style={{ color: 'var(--amber)' }}>21</span> modul</span>
            <span><span style={{ color: 'var(--amber)' }}>4</span> jalur praktik</span>
            <span><span style={{ color: 'var(--amber)' }}>1</span> tahun akses</span>
            <span><span style={{ color: 'var(--amber)' }}>∞</span> belajar ulang</span>
          </motion.div>
        </div>
      </header>

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

      {/* ===== KURIKULUM ===== */}
      <Section id="kurikulum" eyebrow="Isi materi" title="21 modul, dari mindset sampai monetisasi">
        <p style={{ color: 'var(--muted)', fontSize: 14, lineHeight: 1.6, maxWidth: 560, marginBottom: 28 }}>
          Tersusun sebagai peta belajar (flowchart) — kamu selalu tahu langkah berikutnya, tidak tersesat.
        </p>
        <div className="grid sm:grid-cols-2 gap-x-8 gap-y-0">
          {MODULES_SEED.map((m, i) => (
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
      </Section>

      {/* ===== HARGA ===== */}
      <Section id="harga" eyebrow="Investasi" title="Satu harga, akses penuh">
        <Reveal>
          <div className="rounded-3xl p-8 sm:p-10" style={{ background: 'var(--surface)', border: '1px solid rgba(232,160,32,0.25)', boxShadow: '0 20px 80px rgba(232,160,32,0.06)' }}>
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
              <div>
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.2em', color: 'var(--amber)', textTransform: 'uppercase', marginBottom: 12 }}>
                  Keanggotaan Tahunan
                </p>
                <div className="flex items-baseline gap-2">
                  <span className="font-extrabold" style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2.6rem, 8vw, 4rem)', color: 'var(--cream)', letterSpacing: '-0.03em' }}>
                    {HARGA}
                  </span>
                  <span style={{ color: 'var(--muted)', fontSize: 15 }}>/tahun</span>
                </div>
                <p style={{ color: 'var(--muted)', fontSize: 13, marginTop: 8, fontFamily: 'var(--font-mono)' }}>
                  setara ± {PER_BULAN}/bulan
                </p>
              </div>
              <a href={payUrl} target="_blank" rel="noopener noreferrer"
                style={{ background: 'var(--amber)', color: '#07070A', padding: '15px 32px', borderRadius: 12, fontWeight: 700, textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: 13, whiteSpace: 'nowrap' }}>
                Gabung sekarang
              </a>
            </div>

            <div className="grid sm:grid-cols-2 gap-x-8 gap-y-3 mt-8 pt-8" style={{ borderTop: '1px solid var(--border)' }}>
              {[
                'Akses semua 21 modul + yang baru ditambahkan',
                'Video + materi PDF, belajar kapan saja',
                'Peta belajar flowchart anti-tersesat',
                'Komunitas Telegram untuk tanya-jawab',
                'Akses penuh 1 tahun, bisa diperpanjang',
                'Cocok untuk pemula total / non-IT',
              ].map((f) => (
                <div key={f} className="flex items-start gap-2.5">
                  <span style={{ color: 'var(--amber)', marginTop: 1 }}>✓</span>
                  <span style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.5 }}>{f}</span>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </Section>

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
              Pakai email yang sama saat kamu membeli akses.
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
                <a href={payUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--amber)' }} className="hover:underline">Gabung di sini</a>
              </p>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="px-5 sm:px-8 py-8 max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3" style={{ borderTop: '1px solid var(--border)', fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--muted)' }}>
        <span>AI<span style={{ color: 'var(--amber)' }}>·</span>GUILD — Platform Vibe Coding</span>
        <span>© 2026 · arul.cg</span>
      </footer>
    </div>
  )
}

function Section({ id, eyebrow, title, children }) {
  return (
    <section id={id} className="px-5 sm:px-8 max-w-6xl mx-auto" style={{ paddingTop: 64, paddingBottom: 16 }}>
      <Reveal>
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.2em', color: 'var(--amber)', textTransform: 'uppercase', marginBottom: 12 }}>
          {eyebrow}
        </p>
        <h2 className="font-extrabold" style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.8rem, 5vw, 2.8rem)', color: 'var(--cream)', letterSpacing: '-0.03em', marginBottom: 32, maxWidth: 640, lineHeight: 1.05 }}>
          {title}
        </h2>
      </Reveal>
      {children}
    </section>
  )
}

function Reveal({ children, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.6, delay, ease }}
    >
      {children}
    </motion.div>
  )
}
