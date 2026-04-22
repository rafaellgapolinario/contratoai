import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

export async function sendEmail(to: string, subject: string, html: string): Promise<boolean> {
  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM || 'ContratoAI <noreply@rga-technologies.com>',
      to,
      subject,
      html,
    })
    return true
  } catch (e: any) {
    console.error('[email] erro:', e.message)
    return false
  }
}

export function buildResetEmail(resetUrl: string, nome?: string): string {
  const greeting = nome ? `Olá ${nome},` : 'Olá,'
  return `
<!DOCTYPE html>
<html><body style="font-family:system-ui,Arial,sans-serif;background:#f5f7fa;padding:20px;margin:0">
<table role="presentation" style="max-width:560px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,.06)">
<tr><td style="padding:32px 28px 8px">
<h1 style="font-family:'Space Grotesk',sans-serif;font-size:22px;color:#1a1a1f;margin:0 0 4px">ContratoAI</h1>
<p style="color:#666;font-size:14px;margin:0">Redefinição de senha</p>
</td></tr>
<tr><td style="padding:12px 28px 4px;color:#1a1a1f;font-size:15px;line-height:1.7">
<p>${greeting}</p>
<p>Recebemos uma solicitação para redefinir a senha da sua conta. Clique no botão abaixo para criar uma senha nova:</p>
</td></tr>
<tr><td style="padding:14px 28px 20px;text-align:center">
<a href="${resetUrl}" style="display:inline-block;padding:13px 28px;background:linear-gradient(135deg,#3b82f6,#06b6d4);color:#fff;text-decoration:none;border-radius:10px;font-weight:600;font-size:15px">Redefinir minha senha</a>
</td></tr>
<tr><td style="padding:0 28px 20px;color:#666;font-size:13px;line-height:1.7">
<p>Se o botão não funcionar, copie e cole o link no navegador:<br>
<span style="color:#3b82f6;word-break:break-all">${resetUrl}</span></p>
<p>Este link expira em <b>1 hora</b>. Se você não solicitou, pode ignorar este email — sua senha continua a mesma.</p>
</td></tr>
<tr><td style="padding:16px 28px;background:#fafafa;color:#999;font-size:12px;text-align:center;border-top:1px solid #eee">
ContratoAI · Desenvolvido por RGA Technologies
</td></tr>
</table></body></html>`
}
