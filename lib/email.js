import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendMagicLink(email, token) {
  const url = `${process.env.NEXT_PUBLIC_APP_URL}/auth/verify?token=${token}`

  await resend.emails.send({
    from: 'AI Guild <noreply@aiguild.online>',
    to: email,
    subject: 'Link masuk ke AI Guild',
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px;">
        <h2 style="color:#7c3aed;">AI Guild</h2>
        <p>Klik tombol di bawah untuk masuk. Link berlaku <strong>15 menit</strong>.</p>
        <a href="${url}"
           style="display:inline-block;background:#7c3aed;color:white;
                  padding:12px 28px;border-radius:8px;text-decoration:none;
                  font-weight:600;margin:16px 0;">
          Masuk ke AI Guild
        </a>
        <p style="color:#6b7280;font-size:0.85rem;">
          Jika tombol tidak bisa diklik:<br/>
          <a href="${url}" style="color:#7c3aed;">${url}</a>
        </p>
      </div>
    `,
  })
}

export async function sendRenewalReminder(email) {
  const payUrl = process.env.MAYAR_PAYMENT_URL

  await resend.emails.send({
    from: 'AI Guild <noreply@aiguild.online>',
    to: email,
    subject: 'Langgananmu di AI Guild habis 3 hari lagi',
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px;">
        <h2 style="color:#7c3aed;">AI Guild</h2>
        <p>Langgananmu akan <strong>habis dalam 3 hari</strong>. Perpanjang sekarang supaya akses materi & grup tidak terputus.</p>
        <a href="${payUrl}"
           style="display:inline-block;background:#7c3aed;color:white;
                  padding:12px 28px;border-radius:8px;text-decoration:none;
                  font-weight:600;margin:16px 0;">
          Perpanjang Rp1.497.000 / tahun
        </a>
        <p style="color:#6b7280;font-size:0.85rem;">
          Atau buka link ini:<br/>
          <a href="${payUrl}" style="color:#7c3aed;">${payUrl}</a>
        </p>
      </div>
    `,
  })
}
