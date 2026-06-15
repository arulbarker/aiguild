// Mayar Webhook Gateway — fan-out 1 webhook URL ke beberapa app.
// Tambah app baru di TARGETS. Mayar dashboard tidak perlu di-update.
//
// Token: target dengan `secret:true` mendapat header x-gateway-token = env.AIGUILD_WEBHOOK_TOKEN
// (rahasia bersama gateway↔aiguild). Set via: wrangler secret put AIGUILD_WEBHOOK_TOKEN
// atau Cloudflare dashboard → Worker → Settings → Variables. ruangsaku TIDAK diubah.

const TARGETS = [
  { url: 'https://app.ruangsaku.com/api/webhooks/mayar', secret: false },
  { url: 'https://aiguild.online/api/webhook/mayar', secret: true },
]

export default {
  async fetch(request, env) {
    if (request.method === 'GET') {
      return new Response(
        JSON.stringify({ ok: true, service: 'mayar-webhook-gateway', targets: TARGETS.length }),
        { headers: { 'Content-Type': 'application/json' } }
      )
    }
    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 })
    }

    const body = await request.text()

    const results = await Promise.allSettled(
      TARGETS.map((t) => {
        const headers = { 'Content-Type': 'application/json' }
        if (t.secret && env && env.AIGUILD_WEBHOOK_TOKEN) {
          headers['x-gateway-token'] = env.AIGUILD_WEBHOOK_TOKEN
        }
        return fetch(t.url, { method: 'POST', headers, body }).then((r) => ({ url: t.url, status: r.status, ok: r.ok }))
      })
    )

    console.log('Mayar webhook fan-out:', JSON.stringify(
      results.map((r) => ({ ok: r.status === 'fulfilled', data: r.status === 'fulfilled' ? r.value : r.reason?.message }))
    ))

    return new Response(
      JSON.stringify({ ok: true, forwarded_to: TARGETS.length }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )
  },
}
