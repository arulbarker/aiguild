// Worker Cloudflare "lynkid-router" — versi dengan cabang AI Guild.
// Tempel isi ini ke Worker lynkid-router di dashboard Cloudflare, lalu Deploy.
// Set secret: AIGUILD_APP (nilai SAMA dengan LYNKID_SHARED_SECRET di Coolify AI Guild).
// Blok RuangSaku / StickerPack / default TIDAK diubah.

const APPS_SCRIPT_URL  = 'https://script.google.com/macros/s/AKfycbzPixa15u3SyndcKTcusIpxChqepUsgGfxTm1_nIaD1RHo-3TpLRbkHmesm-p2QkgWjEA/exec';
const STICKERPACK_URL  = 'https://script.google.com/macros/s/AKfycbyptORJH9l8AxlcVEQyobBewKCOUq19GGYHbBKyF4Sjh9ra6gA75I_rxAxw8UlrQlWA/exec';
const RUANGSAKU_URL    = 'https://app.ruangsaku.com/api/webhooks/lynkid';
const AIGUILD_URL      = 'https://aiguild.online/api/webhook/lynkid';

export default {
  async fetch(request, env) {
    if (request.method === 'GET') {
      return new Response(JSON.stringify({
        ok: true,
        service: 'lynkid-router',
        version: '1.2.0',
        routes: {
          ruangsaku:   RUANGSAKU_URL,
          stickerpack: STICKERPACK_URL,
          aiguild:     AIGUILD_URL,
          default:     APPS_SCRIPT_URL
        }
      }), { headers: { 'Content-Type': 'application/json' } });
    }
    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 });
    }

    const bodyText = await request.text();
    let isRuangSaku    = false;
    let isStickerPack  = false;
    let isAiGuild      = false;
    let productTitle   = '';
    let email          = '';
    let customerName   = '';
    let parsed         = null;

    try {
      parsed = JSON.parse(bodyText);
      const items = (parsed && parsed.data && parsed.data.message_data && parsed.data.message_data.items) || [];
      productTitle = (items[0] && items[0].title) || '';
      const customer = parsed && parsed.data && parsed.data.message_data && parsed.data.message_data.customer;
      email = (customer && customer.email) || '';
      customerName = (customer && customer.name) || '';
      const lower = productTitle.toLowerCase();
      const aiguildNorm = lower.trim().replace(/ +/g, ' ');
      isRuangSaku   = lower.indexOf('ruangsaku')    > -1 || lower.indexOf('ruang saku')  > -1;
      isStickerPack = lower.indexOf('sticker pack') > -1 || lower.indexOf('stickerpack') > -1;
      isAiGuild     = aiguildNorm === 'ecourse vibe coding google appscript';
    } catch (e) {
      console.error('Parse error:', e.message);
    }

    if (isRuangSaku) {
      const payload = {
        event: 'lynkid_purchase',
        email: String(email || '').trim().toLowerCase(),
        name: String(customerName || '').trim(),
        product_title: productTitle,
        timestamp: new Date().toISOString(),
        source: 'cloudflare_worker_lynkid_router_v1',
        raw: parsed
      };
      try {
        const r = await fetch(RUANGSAKU_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-shared-secret': env.RUANGSAKU_APP || ''
          },
          body: JSON.stringify(payload)
        });
        const txt = await r.text();
        console.log('Routed RuangSaku ' + r.status + ' email=' + email + ' body=' + txt.slice(0, 200));
      } catch (e) {
        console.error('RuangSaku forward error: ' + e.message);
      }
    } else if (isStickerPack) {
      try {
        const r = await fetch(STICKERPACK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: bodyText
        });
        console.log('Routed StickerPack ' + r.status + ' email=' + email + ' product=' + productTitle.slice(0, 80));
      } catch (e) {
        console.error('StickerPack forward error: ' + e.message);
      }
    } else if (isAiGuild) {
      const payload = {
        event: 'lynkid_purchase',
        email: String(email || '').trim().toLowerCase(),
        name: String(customerName || '').trim(),
        product_title: productTitle,
        timestamp: new Date().toISOString(),
        source: 'cloudflare_worker_lynkid_router_v1',
        raw: parsed
      };
      try {
        const r = await fetch(AIGUILD_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-shared-secret': env.AIGUILD_APP || ''
          },
          body: JSON.stringify(payload)
        });
        const txt = await r.text();
        console.log('Routed AIGuild ' + r.status + ' email=' + email + ' body=' + txt.slice(0, 200));
      } catch (e) {
        console.error('AIGuild forward error: ' + e.message);
      }
    } else {
      try {
        const r = await fetch(APPS_SCRIPT_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: bodyText
        });
        console.log('Routed AppsScript ' + r.status + ' product=' + productTitle.slice(0, 80));
      } catch (e) {
        console.error('Apps Script forward error: ' + e.message);
      }
    }

    return new Response(JSON.stringify({
      ok: true,
      routed_to: isRuangSaku ? 'ruangsaku' : (isStickerPack ? 'stickerpack' : (isAiGuild ? 'aiguild' : 'apps_script')),
      product: productTitle.slice(0, 100)
    }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  }
};
