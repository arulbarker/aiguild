export const metadata = { title: 'Pembayaran Berhasil — AI Guild' }

export default function SuksesPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'var(--bg)' }}>
      <div className="max-w-md w-full text-center" style={{ fontFamily: 'var(--font-mono)' }}>
        <h1 className="font-extrabold" style={{ fontSize: '2rem', color: 'var(--cream)', marginBottom: 16, fontFamily: 'var(--font-display)' }}>
          Pembayaran Berhasil 🎉
        </h1>
        <p style={{ color: 'var(--muted)', fontSize: 14, marginBottom: 28, lineHeight: 1.6 }}>
          Klik tombol Masuk di bawah, lalu masukkan email yang kamu pakai saat bayar. Link untuk masuk akan dikirim ke email itu.
        </p>
        <a href="/login" style={{ display: 'inline-block', background: 'var(--amber)', color: '#07070a', padding: '14px 32px', borderRadius: 10, textDecoration: 'none', fontWeight: 700 }}>
          Masuk
        </a>
      </div>
    </div>
  )
}
