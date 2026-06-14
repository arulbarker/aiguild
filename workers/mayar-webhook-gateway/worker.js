// Mayar Webhook Gateway — fan-out 1 webhook URL ke beberapa app.
// Tambah app baru di TARGETS. Meneruskan header x-mayar-signature.

const TARGETS = [
  'https://app.ruangsaku.com/api/webhooks/mayar',
  'https://aiguild.online/api/webhook/mayar',
]

export default {
  async fetch(request) {
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
    const signature = request.headers.get('x-mayar-signature') ?? ''

    const results = await Promise.allSettled(
      TARGETS.map((url) =>
        fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-mayar-signature': signature },
          body,
        }).then((r) => ({ url, status: r.status, ok: r.ok }))
      )
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
