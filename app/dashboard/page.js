import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { getOwnedCourseIds } from '@/lib/ownership'
import LogoutButton from '@/components/LogoutButton'

function rupiah(n) {
  if (n == null) return ''
  return 'Rp' + Number(n).toLocaleString('id-ID')
}

export default async function DashboardPage() {
  const session = await getSession()
  if (!session) redirect('/login')

  const [allCourses, ownedCourseIds, modules, progress] = await Promise.all([
    prisma.course.findMany({ where: { isPublished: true }, orderBy: { orderIndex: 'asc' } }),
    getOwnedCourseIds(prisma, session.userId),
    prisma.module.findMany({ select: { id: true, courseId: true } }),
    prisma.userProgress.findMany({ where: { userId: session.userId, completed: true }, select: { moduleId: true } }),
  ])

  const completedSet = new Set(progress.map((p) => p.moduleId))
  const totalByCourse = {}
  const doneByCourse = {}
  for (const m of modules) {
    totalByCourse[m.courseId] = (totalByCourse[m.courseId] ?? 0) + 1
    if (completedSet.has(m.id)) doneByCourse[m.courseId] = (doneByCourse[m.courseId] ?? 0) + 1
  }

  const ownedSet = new Set(ownedCourseIds)
  const myCourses = session.isAdmin ? allCourses : allCourses.filter((c) => ownedSet.has(c.id))
  const otherCourses = session.isAdmin ? [] : allCourses.filter((c) => !ownedSet.has(c.id))

  return (
    <div style={{ background: 'var(--bg)', color: 'var(--cream)', minHeight: '100vh' }}>
      <nav className="flex items-center justify-between px-5 sm:px-8 py-5 max-w-4xl mx-auto">
        <a href="/" className="font-extrabold" style={{ fontFamily: 'var(--font-display)', fontSize: 18, letterSpacing: '-0.02em', color: 'var(--cream)' }}>
          AI<span style={{ color: 'var(--amber)' }}>·</span>GUILD
        </a>
        <div className="flex items-center gap-4" style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}>
          {session.isAdmin && <a href="/admin" style={{ color: 'var(--muted)' }}>Admin</a>}
          <a href="/" style={{ color: 'var(--muted)' }}>Beranda</a>
          <LogoutButton />
        </div>
      </nav>

      <main className="px-5 sm:px-8 max-w-4xl mx-auto" style={{ paddingTop: 32, paddingBottom: 100 }}>
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.2em', color: 'var(--amber)', textTransform: 'uppercase', marginBottom: 24 }}>
          Kelasku
        </p>

        {myCourses.length > 0 ? (
          <div className="grid sm:grid-cols-2 gap-4">
            {myCourses.map((c) => {
              const total = totalByCourse[c.id] ?? 0
              const done = doneByCourse[c.id] ?? 0
              const pct = total > 0 ? Math.round((done / total) * 100) : 0
              return (
                <div key={c.id} className="rounded-2xl p-6 flex flex-col" style={{ background: 'var(--surface)', border: '1px solid rgba(232,160,32,0.25)' }}>
                  <h3 className="font-bold" style={{ fontFamily: 'var(--font-display)', fontSize: 17, color: 'var(--cream)', lineHeight: 1.25, marginBottom: 14 }}>{c.title}</h3>
                  <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
                    <div className="h-full rounded-full" style={{ background: 'var(--amber)', width: `${pct}%` }} />
                  </div>
                  <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--muted)', marginTop: 8 }}>{done} / {total} modul selesai</p>
                  <a href={`/belajar/${c.slug}`} className="mt-5"
                    style={{ display: 'inline-block', textAlign: 'center', background: 'var(--amber)', color: '#07070A', padding: '11px 20px', borderRadius: 10, fontWeight: 700, fontFamily: 'var(--font-mono)', fontSize: 12, letterSpacing: '0.04em' }}>
                    Lanjut Belajar →
                  </a>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="rounded-2xl p-8 text-center" style={{ border: '1px dashed var(--border)' }}>
            <p style={{ color: 'var(--muted)', fontSize: 14, marginBottom: 16 }}>Kamu belum punya kursus.</p>
            <a href="/#kursus" style={{ display: 'inline-block', background: 'var(--amber)', color: '#07070A', padding: '11px 22px', borderRadius: 10, fontWeight: 700, fontFamily: 'var(--font-mono)', fontSize: 12 }}>
              Lihat katalog kursus
            </a>
          </div>
        )}

        {/* JELAJAHI KURSUS LAIN */}
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.2em', color: 'var(--amber)', textTransform: 'uppercase', margin: '48px 0 24px' }}>
          Jelajahi kursus lain
        </p>
        {otherCourses.length > 0 ? (
          <div className="grid sm:grid-cols-2 gap-4">
            {otherCourses.map((c) => (
              <a key={c.id} href={`/kursus/${c.slug}`} className="rounded-2xl p-6 flex flex-col" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                <h3 className="font-bold" style={{ fontFamily: 'var(--font-display)', fontSize: 17, color: 'var(--cream)', lineHeight: 1.25, marginBottom: 12 }}>{c.title}</h3>
                <div className="flex items-center justify-between mt-auto">
                  <span className="font-extrabold" style={{ fontFamily: 'var(--font-display)', fontSize: 18, color: 'var(--amber)' }}>{rupiah(c.price)}</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--cream)', border: '1px solid var(--border)', borderRadius: 8, padding: '6px 12px' }}>Beli →</span>
                </div>
              </a>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl p-6 text-center" style={{ border: '1px dashed var(--border)' }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--muted)' }}>Kursus baru segera hadir</span>
          </div>
        )}
      </main>
    </div>
  )
}
