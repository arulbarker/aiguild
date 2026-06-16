# Skill — Tes Webhook Pembayaran di Lokal (Mayar/Lynk)

Cara menguji webhook pembayaran (`payment.received`) di localhost. Webhook dari Mayar hanya bisa memanggil URL publik — `localhost` tidak publik. Ada 2 cara.

## Prasyarat
- Dev server jalan (`npm run dev`) di **port 3001**, Docker postgres lokal hidup.
- `.env.local` mode sandbox: `MAYAR_PAYMENT_URL` = link sandbox, `MAYAR_PRODUCT_NAME` = nama produk sandbox (exact match!), `MAYAR_WEBHOOK_TOKEN` terisi (mis. `dev-sandbox-token`), `MAYAR_API_BASE=https://api.mayar.club/hl/v1` (club = sandbox; prod = `api.mayar.id`).

## Cara A — Tunnel (callback Mayar asli, end-to-end)
Pakai kalau mau menguji pengiriman Mayar yang sebenarnya.
```bash
npm install -g cloudflared          # sekali saja
cloudflared tunnel --url http://localhost:3001
```
- Ambil URL `https://xxx.trycloudflare.com` dari output (jalankan di background, baca log).
- Daftarkan di **Mayar dashboard → Webhook**: URL = `<tunnel>/api/webhook/mayar`, **Token = sama dgn `MAYAR_WEBHOOK_TOKEN`** (Mayar kirim `Authorization: Bearer <token>`).
- Tes tembus: `POST <tunnel>/api/webhook/mayar` tanpa token → harus **401**; dengan token → **200**.
- ⚠️ URL quick-tunnel **berubah tiap cloudflared restart** → daftar ulang di Mayar. Dev server WAJIB hidup (kalau mati → 502).

## Cara B — Simulasi payload (cepat, tanpa tunnel)
Pakai kalau cuma mau menguji LOGIKA app (paling sering ini cukup).
```powershell
$body = '{"event":"payment.received","data":{"id":"test-001","customerEmail":"tes@contoh.test","productName":"<NAMA PRODUK PERSIS>","amount":1497000,"status":"SUCCESS"}}'
$h = @{ Authorization = "Bearer dev-sandbox-token" }
Invoke-WebRequest -Uri "http://localhost:3001/api/webhook/mayar" -Method POST -Headers $h -Body $body -ContentType "application/json"
```
- `{"message":"OK"}` → produk cocok, membership aktif. Verifikasi DB:
```powershell
docker exec aiguild-postgres-dev psql -U aiguild -d aiguild -x -c "SELECT email, membership_expired_at FROM users WHERE email='tes@contoh.test';"
```

## Gotcha penting (dari pengalaman)
- **Token fail-closed**: route nolak tanpa token cocok. Di PROD, **gateway Cloudflare** menyuntik `x-gateway-token`; panggilan langsung ke tunnel tidak punya itu → "failed" di tes Mayar adalah WAJAR (bukan bug). Untuk lolos langsung, token di Mayar harus = `MAYAR_WEBHOOK_TOKEN`.
- **`productName` exact match** (`===`, tanpa normalisasi) di `lib/mayar-webhook.js`. Salah ejaan/kapital → "Produk lain diabaikan" → membership tak aktif (gagal senyap). Pastikan persis nama produk.
- **Cek registrasi user tanpa DB**: `POST /api/auth/send-link` dgn email → 200 "dikirim" = terdaftar, 403 = belum.
- Worker tidak bisa jangkau localhost; tunnel adalah satu-satunya cara callback nyata sampai laptop.
