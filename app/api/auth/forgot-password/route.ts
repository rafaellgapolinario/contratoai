import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { query } from '@/lib/db'
import { sendEmail, buildResetEmail } from '@/lib/email'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://contrato.rga-technologies.com'

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json()
    if (!email?.trim()) return NextResponse.json({ error: 'Email obrigatorio' }, { status: 400 })

    const emailClean = email.toLowerCase().trim()
    const rows = await query('SELECT id, nome FROM contratoai.users WHERE email = $1', [emailClean])
    const user = rows[0]

    // Resposta generica pra nao vazar emails cadastrados
    const genericMsg = 'Se esse email estiver cadastrado, voce vai receber um link de redefinicao em instantes.'

    if (!user) {
      return NextResponse.json({ ok: true, message: genericMsg })
    }

    // Gera token aleatorio de 32 bytes (64 chars hex), valido por 1h
    const token = crypto.randomBytes(32).toString('hex')
    const expires = new Date(Date.now() + 60 * 60 * 1000).toISOString()

    await query(
      'UPDATE contratoai.users SET reset_token = $1, reset_token_expires = $2 WHERE id = $3',
      [token, expires, user.id]
    )

    const resetUrl = `${APP_URL}/resetar-senha?token=${token}`
    const html = buildResetEmail(resetUrl, user.nome || '')
    const sent = await sendEmail(emailClean, 'Redefinicao de senha - ContratoAI', html)

    if (!sent) {
      console.error('[forgot-password] falha ao enviar email pra', emailClean)
      return NextResponse.json({ error: 'Erro ao enviar email. Tente novamente em instantes.' }, { status: 500 })
    }

    return NextResponse.json({ ok: true, message: genericMsg })
  } catch (e: any) {
    console.error('[forgot-password] erro:', e.message)
    return NextResponse.json({ error: e.message || 'Erro interno' }, { status: 500 })
  }
}
