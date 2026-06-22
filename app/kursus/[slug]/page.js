import { redirect } from 'next/navigation'
import { prisma } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { getOwnedCourseIds, hasCourseAccess } from '@/lib/ownership'

function rupiah(n) {
  if (n == null) return ''
  return 'Rp' + Number(n).toLocaleString('id-ID')
}

export async function generateMetadata({ params }) {
  const { slug } = await params
  const course = await prisma.course.findUnique({ where: { slug } })
  return { title: course ? `${course.title} — AI Guild` : 'AI Guild' }
}

export default async function KursusPage({ params }) {
  const { slug } = await params
  const course = await prisma.course.findUnique({ where: { slug } })
  if (!course || !course.isPublished) redirect('/')

  const modules = await prisma.module.findMany({
    where: { courseId: course.id },
    orderBy: { orderIndex: 'asc' },
    select: { slug: true, title: true },
  })

  const session = await getSession()
  let owned = false
  if (session) {
    const ownedCourseIds = await getOwnedCourseIds(prisma, session.userId)
    owned = hasCourseAccess({ isAdmin: session.isAdmin, ownedCourseIds }, course.id)
  }

  const payUrl = process.env.MAYAR_PAYMENT_URL || '#'

  return (
    <div style={{ background: 'var(--bg)', color: 'var(--cream)', minHeight: '100vh', overflowX: 'hidden' }}>
      <nav className="flex items-center justify-between px-5 sm:px-8 py-5 max-w-5xl mx-auto">
        <a href="/" className="font-extrabold" style={{ fontFamily: 'var(--font-display)', fontSize: 18, letterSpacing: '-0.02em', color: 'var(--cream)' }}>
          AI<span style={{ color: 'var(--amber)' }}>·</span>GUILD
        </a>
        <a href="/#masuk" style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--muted)' }}>Masuk</a>
      </nav>

      <header className="px-5 sm:px-8 max-w-5xl mx-auto" style={{ paddingTop: 40, paddingBottom: 24 }}>
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.2em', color: 'var(--amber)', textTransform: 'uppercase', marginBottom: 16 }}>
          Kursus
        </p>
        <h1 className="font-extrabold uppercase" style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.9rem, 6vw, 3.6rem)', lineHeight: 1.0, letterSpacing: '-0.03em', maxWidth: 820 }}>
          {course.title}
        </h1>
        {course.description && (
          <p style={{ color: 'var(--muted)', fontSize: 'clamp(0.95rem, 2vw, 1.1rem)', lineHeight: 1.65, maxWidth: 600, marginTop: 24 }}>
            {course.description}
          </p>
        )}

        <div className="flex flex-col sm:flex-row sm:items-center gap-4 mt-10">
          <span className="font-extrabold" style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem, 6vw, 3rem)', color: 'var(--amber)', letterSpacing: '-0.02em' }}>
            {rupiah(course.price)}
          </span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--muted)' }}>sekali bayar · akses selamanya</span>
        </div>

        <div className="mt-6">
          {owned ? (
            <a href={`/belajar/${course.slug}`}
              style={{ display: 'inline-block', background: 'var(--amber)', color: '#07070A', padding: '15px 34px', borderRadius: 12, fontWeight: 700, fontFamily: 'var(--font-mono)', fontSize: 13, letterSpacing: '0.04em' }}>
              Masuk ke Kelas →
            </a>
          ) : (
            <a href={payUrl} target="_blank" rel="noopener noreferrer"
              style={{ display: 'inline-block', background: 'var(--amber)', color: '#07070A', padding: '15px 34px', borderRadius: 12, fontWeight: 700, fontFamily: 'var(--font-mono)', fontSize: 13, letterSpacing: '0.04em' }}>
              Beli Sekarang
            </a>
          )}
        </div>
      </header>

      <section className="px-5 sm:px-8 max-w-5xl mx-auto" style={{ paddingTop: 40, paddingBottom: 100 }}>
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.2em', color: 'var(--amber)', textTransform: 'uppercase', marginBottom: 12 }}>
          Isi Kursus
        </p>
        <h2 className="font-extrabold" style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.5rem, 4vw, 2.2rem)', color: 'var(--cream)', letterSpacing: '-0.02em', marginBottom: 28 }}>
          {modules.length} modul terstruktur
        </h2>
        <div className="grid sm:grid-cols-2 gap-x-8 gap-y-0">
          {modules.map((m, i) => (
            <div key={m.slug} className="flex items-start gap-3 py-3" style={{ borderBottom: '1px solid var(--border)' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--amber)', marginTop: 3, minWidth: 24 }}>
                {String(i + 1).padStart(2, '0')}
              </span>
              <span style={{ fontSize: 14, color: 'var(--cream)', lineHeight: 1.45 }}>{m.title}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
