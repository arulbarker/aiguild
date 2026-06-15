export const metadata = { title: 'Pembayaran Berhasil — AI Guild' }

export default function SuksesPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'var(--bg)' }}>
      <div className="max-w-md w-full text-center" style={{ fontFamily: 'var(--font-mono)' }}>
        <h1 className="font-extrabold" style={{ fontSize: '2rem', color: 'var(--cream)', marginBottom: 16, fontFamily: 'var(--font-display)' }}>
          Pembayaran Berhasil 🎉
        </h1>
        <p style={{ color: 'var(--muted)', fontSize: 14, marginBottom: 28, lineHeight: 1.6 }}>
          Cek email kamu untuk link masuk ke AI Guild. Klik tombol di email itu untuk mulai belajar.
        </p>
        <a href="/login" style={{ display: 'inline-block', background: 'var(--amber)', color: '#07070a', padding: '14px 32px', borderRadius: 10, textDecoration: 'none', fontWeight: 700 }}>
          Masuk
        </a>
      </div>
    </div>
  )
}
