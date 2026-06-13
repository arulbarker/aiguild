// Membangun struktur tampilan dari daftar modul ber-parentIds (DAG).
// Output: array segment berurutan untuk trunk utama.
//   { type: 'single',  modules: [mod] }
//   { type: 'diamond', modules: [a, b] }        // pecah lalu menyatu lagi
//   { type: 'tracks',  columns: [[...], [...]] } // pecah jadi jalur sendiri-sendiri
//
// Setiap track column adalah rantai modul (head + turunannya) urut orderIndex.

export function buildSegments(modules) {
  const childrenOf = new Map()
  for (const m of modules) {
    for (const pid of m.parentIds ?? []) {
      if (!childrenOf.has(pid)) childrenOf.set(pid, [])
      childrenOf.get(pid).push(m)
    }
  }
  for (const arr of childrenOf.values()) {
    arr.sort((a, b) => a.orderIndex - b.orderIndex)
  }

  const parentKey = (m) => JSON.stringify([...(m.parentIds ?? [])].sort())
  const sorted = [...modules].sort((a, b) => a.orderIndex - b.orderIndex)

  const segments = []
  const placed = new Set()

  for (const mod of sorted) {
    if (placed.has(mod.id)) continue
    const key = parentKey(mod)

    const siblings =
      key === '[]'
        ? []
        : sorted.filter(
            (m) => !placed.has(m.id) && m.id !== mod.id && parentKey(m) === key
          )

    if (siblings.length === 0) {
      placed.add(mod.id)
      segments.push({ type: 'single', modules: [mod] })
      continue
    }

    const group = [mod, ...siblings]

    // Diamond kalau semua sibling punya anak yang sama (menyatu lagi).
    const childSets = group.map(
      (g) => new Set((childrenOf.get(g.id) ?? []).map((c) => c.id))
    )
    let common = new Set(childSets[0])
    for (let i = 1; i < childSets.length; i++) {
      common = new Set([...common].filter((x) => childSets[i].has(x)))
    }
    const isDiamond = common.size > 0

    if (isDiamond) {
      group.forEach((g) => placed.add(g.id))
      segments.push({ type: 'diamond', modules: group })
    } else {
      // Tracks: tiap kolom = head + seluruh turunannya (rantai jalur itu).
      const columns = group.map((head) => {
        const chain = []
        const seen = new Set()
        const stack = [head]
        while (stack.length) {
          const n = stack.shift()
          if (seen.has(n.id)) continue
          seen.add(n.id)
          chain.push(n)
          for (const c of childrenOf.get(n.id) ?? []) stack.push(c)
        }
        chain.sort((a, b) => a.orderIndex - b.orderIndex)
        chain.forEach((n) => placed.add(n.id))
        return chain
      })
      segments.push({ type: 'tracks', columns })
    }
  }

  return segments
}

export function displayNumber(mod) {
  return String(mod.orderIndex + 1).padStart(2, '0')
}
