// Notifikasi Telegram ke grup admin AI Guild.
// Token & chat id hidup di env (TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID) — tidak di kode.
// Aman gagal: kalau env belum diset atau API error, hanya log, tidak melempar.

export async function sendTelegram(text) {
  const token = process.env.TELEGRAM_BOT_TOKEN
  const chatId = process.env.TELEGRAM_CHAT_ID

  if (!token || !chatId) {
    console.warn('[telegram] TELEGRAM_BOT_TOKEN / TELEGRAM_CHAT_ID belum diset — notif dilewati')
    return { ok: false, skipped: true }
  }

  const threadId = process.env.TELEGRAM_INFO_THREAD_ID

  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        ...(threadId ? { message_thread_id: Number(threadId) } : {}),
        text,
        parse_mode: 'HTML',
        disable_web_page_preview: true,
      }),
    })
    const data = await res.json()
    if (!data.ok) console.error('[telegram] gagal kirim:', data.description)
    return data
  } catch (e) {
    console.error('[telegram] error:', e.message)
    return { ok: false, error: e.message }
  }
}

function escapeHtml(s) {
  return String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

// Kirim notif modul baru / diperbarui.
export async function notifyModule({ title, slug, kind }) {
  const base = process.env.NEXT_PUBLIC_APP_URL || 'https://aiguild.online'
  const link = slug ? `${base}/modul/${slug}` : base
  const head = kind === 'update' ? '✏️ <b>Modul diperbarui</b>' : '📚 <b>Modul baru</b>'

  const text = `${head}\n\n${escapeHtml(title)}\n\n🔗 <a href="${encodeURI(link)}">Buka modul →</a>`
  return sendTelegram(text)
}
