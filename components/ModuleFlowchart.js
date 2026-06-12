'use client'

import { useMemo } from 'react'

const NODE_W = 200
const NODE_H = 64
const H_GAP = 40
const V_GAP = 80

function computeLayout(modules) {
  const idToMod = Object.fromEntries(modules.map((m) => [m.id, m]))

  // BFS dari root nodes untuk menentukan level tiap node
  const levels = {}
  const roots = modules.filter((m) => m.parentIds.length === 0)

  const queue = roots.map((r) => ({ id: r.id, level: 0 }))
  while (queue.length) {
    const { id, level } = queue.shift()
    if (levels[id] === undefined || levels[id] < level) {
      levels[id] = level
    }
    const children = modules.filter((m) => m.parentIds.includes(id))
    children.forEach((c) => queue.push({ id: c.id, level: level + 1 }))
  }

  // Kelompokkan per level
  const byLevel = {}
  modules.forEach((m) => {
    const l = levels[m.id] ?? 0
    if (!byLevel[l]) byLevel[l] = []
    byLevel[l].push(m)
  })

  // Hitung posisi X dan Y tiap node
  const positions = {}
  Object.entries(byLevel).forEach(([level, mods]) => {
    const totalW = mods.length * NODE_W + (mods.length - 1) * H_GAP
    const startX = -totalW / 2 + NODE_W / 2
    mods.forEach((m, i) => {
      positions[m.id] = {
        x: startX + i * (NODE_W + H_GAP),
        y: Number(level) * (NODE_H + V_GAP),
      }
    })
  })

  const maxLevel = Math.max(...Object.keys(byLevel).map(Number))
  const maxPerLevel = Math.max(...Object.values(byLevel).map((a) => a.length))
  const svgWidth = maxPerLevel * NODE_W + (maxPerLevel - 1) * H_GAP + 80
  const svgHeight = (maxLevel + 1) * (NODE_H + V_GAP) + 40

  return { positions, svgWidth, svgHeight, idToMod }
}

export default function ModuleFlowchart({ modules, completedIds = [], onSelect, activeId }) {
  const { positions, svgWidth, svgHeight } = useMemo(
    () => computeLayout(modules),
    [modules]
  )

  const edges = useMemo(() => {
    const result = []
    modules.forEach((mod) => {
      mod.parentIds.forEach((parentId) => {
        if (positions[parentId] && positions[mod.id]) {
          result.push({ from: parentId, to: mod.id })
        }
      })
    })
    return result
  }, [modules, positions])

  const offsetX = svgWidth / 2

  return (
    <div className="overflow-x-auto">
      <svg
        width={svgWidth}
        height={svgHeight}
        className="block mx-auto"
        style={{ minWidth: svgWidth }}
      >
        {/* Edges */}
        {edges.map(({ from, to }) => {
          const fp = positions[from]
          const tp = positions[to]
          const x1 = fp.x + offsetX
          const y1 = fp.y + NODE_H
          const x2 = tp.x + offsetX
          const y2 = tp.y
          const cy = (y1 + y2) / 2
          return (
            <path
              key={`${from}-${to}`}
              d={`M ${x1} ${y1} C ${x1} ${cy}, ${x2} ${cy}, ${x2} ${y2}`}
              stroke="#4b5563"
              strokeWidth={2}
              fill="none"
            />
          )
        })}

        {/* Nodes */}
        {modules.map((mod) => {
          const pos = positions[mod.id]
          if (!pos) return null
          const cx = pos.x + offsetX
          const isCompleted = completedIds.includes(mod.id)
          const isActive = activeId === mod.id

          return (
            <g
              key={mod.id}
              transform={`translate(${cx - NODE_W / 2}, ${pos.y})`}
              onClick={() => onSelect?.(mod)}
              style={{ cursor: 'pointer' }}
            >
              <rect
                width={NODE_W}
                height={NODE_H}
                rx={10}
                ry={10}
                fill={isActive ? '#7c3aed' : isCompleted ? '#166534' : '#1f2937'}
                stroke={isActive ? '#a855f7' : isCompleted ? '#4ade80' : '#374151'}
                strokeWidth={isActive ? 2 : 1}
              />
              <text
                x={NODE_W / 2}
                y={NODE_H / 2 - 2}
                textAnchor="middle"
                dominantBaseline="middle"
                fill="white"
                fontSize={12}
                fontWeight={isActive ? 600 : 400}
                style={{ userSelect: 'none', pointerEvents: 'none' }}
              >
                {mod.title.length > 28 ? mod.title.slice(0, 26) + '…' : mod.title}
              </text>
              {isCompleted && (
                <text
                  x={NODE_W - 10}
                  y={12}
                  textAnchor="end"
                  fontSize={11}
                  fill="#4ade80"
                  style={{ pointerEvents: 'none' }}
                >
                  ✓
                </text>
              )}
            </g>
          )
        })}
      </svg>
    </div>
  )
}
