'use client'
import { useState, useEffect } from 'react'

const empty = { name: '', code: '', discountType: 'percentage', value: '', minimumPurchase: '', totalCoupons: '100', couponType: 'reusable', expiredAt: '' }

export default function VoucherManager() {
  const [vouchers, setVouchers] = useState([])
  const [form, setForm] = useState(empty)
  const [msg, setMsg] = useState('')
  const [saving, setSaving] = useState(false)

  async function load() {
    const res = await fetch('/api/admin/vouchers')
    const data = await res.json()
    setVouchers(data.vouchers ?? [])
  }
  useEffect(() => { load() }, [])

  async function submit(e) {
    e.preventDefault()
    setSaving(true); setMsg('')
    const res = await fetch('/api/admin/vouchers', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    const data = await res.json()
    setSaving(false)
    if (!res.ok) { setMsg(data.error || 'Gagal'); return }
    setForm(empty); setMsg('Voucher dibuat ✓'); load()
  }

  const inp = { background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--cream)', borderRadius: 10, padding: '10px 12px', fontSize: 14, width: '100%' }

  return (
    <div className="grid lg:grid-cols-2 gap-8">
      <form onSubmit={submit} className="rounded-2xl p-6 space-y-3" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
        <input style={inp} placeholder="Nama (mis. Diskon Launch)" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        <input style={inp} placeholder="KODE (mis. LAUNCH50)" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} required />
        <div className="flex gap-3">
          <select style={inp} value={form.discountType} onChange={(e) => setForm({ ...form, discountType: e.target.value })}>
            <option value="percentage">Persen (%)</option>
            <option value="monetary">Rupiah (Rp)</option>
          </select>
          <input style={inp} type="number" placeholder={form.discountType === 'percentage' ? 'Nilai % (mis. 50)' : 'Nilai Rp'} value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} required />
        </div>
        <div className="flex gap-3">
          <input style={inp} type="number" placeholder="Kuota" value={form.totalCoupons} onChange={(e) => setForm({ ...form, totalCoupons: e.target.value })} required />
          <select style={inp} value={form.couponType} onChange={(e) => setForm({ ...form, couponType: e.target.value })}>
            <option value="reusable">Reusable</option>
            <option value="onetime">Sekali pakai</option>
          </select>
        </div>
        <input style={inp} type="number" placeholder="Minimum pembelian (Rp, opsional)" value={form.minimumPurchase} onChange={(e) => setForm({ ...form, minimumPurchase: e.target.value })} />
        <label style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--muted)' }}>Kedaluwarsa</label>
        <input style={inp} type="datetime-local" value={form.expiredAt ? form.expiredAt.slice(0, 16) : ''} onChange={(e) => setForm({ ...form, expiredAt: e.target.value ? new Date(e.target.value).toISOString() : '' })} required />
        <button type="submit" disabled={saving} className="w-full py-3 rounded-xl font-bold" style={{ background: saving ? 'rgba(232,160,32,0.4)' : 'var(--amber)', color: '#07070A', fontFamily: 'var(--font-mono)', fontSize: 12, textTransform: 'uppercase' }}>
          {saving ? 'Menyimpan...' : 'Buat Voucher'}
        </button>
        {msg && <p style={{ fontSize: 13, color: msg.includes('✓') ? 'var(--amber)' : '#f87171' }}>{msg}</p>}
      </form>

      <div className="space-y-2">
        {vouchers.length === 0 && <p style={{ color: 'var(--muted)' }}>Belum ada voucher.</p>}
        {vouchers.map((v) => (
          <div key={v.id} className="rounded-xl p-4" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
            <div className="flex items-center justify-between">
              <span className="font-bold" style={{ fontFamily: 'var(--font-mono)', color: 'var(--amber)' }}>{v.code}</span>
              <span style={{ fontSize: 13 }}>{v.discountType === 'percentage' ? `${v.value}%` : `Rp${v.value.toLocaleString('id-ID')}`}</span>
            </div>
            <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4 }}>{v.name} · kuota {v.totalCoupons} · s/d {new Date(v.expiredAt).toLocaleDateString('id-ID')}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
