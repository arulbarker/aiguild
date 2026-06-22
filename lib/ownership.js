export function hasCourseAccess(user, courseId) {
  if (user?.isAdmin) return true
  return Array.isArray(user?.ownedCourseIds) && user.ownedCourseIds.includes(courseId)
}

// Helper query: ambil set courseId yang dimiliki user dari tabel Purchase.
export async function getOwnedCourseIds(prisma, userId) {
  const rows = await prisma.purchase.findMany({
    where: { userId, courseId: { not: null } },
    select: { courseId: true },
  })
  return [...new Set(rows.map((r) => r.courseId))]
}
