import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { query } from '@/lib/db'

export async function POST(req: NextRequest) {
  try {
    const { token, password } = await req.json()
    if (!token || !password) return NextResponse.json({ error: 'Token e senha obrigatorios' }, { status: 400 })
    if (password.length < 6) return NextResponse.json({ error: 'Senha precisa ter ao menos 6 caracteres' }, { status: 400 })

    // Busca user com token valido e nao expirado
    const rows = await query(
      "SELECT id, email, nome FROM contratoai.users WHERE reset_token = $1 AND reset_token_expires > now()",
      [token]
    )
    const user = rows[0]
    if (!user) {
      return NextResponse.json({ error: 'Link invalido ou expirado. Solicite um novo.' }, { status: 400 })
    }

    // Atualiza senha e invalida token
    const hash = await bcrypt.hash(password, 10)
    await query(
      'UPDATE contratoai.users SET password_hash = $1, reset_token = NULL, reset_token_expires = NULL, atualizado_em = now() WHERE id = $2',
      [hash, user.id]
    )

    return NextResponse.json({ ok: true, email: user.email })
  } catch (e: any) {
    console.error('[reset-password] erro:', e.message)
    return NextResponse.json({ error: e.message || 'Erro interno' }, { status: 500 })
  }
}

// GET com token na query valida se o token existe e ainda nao expirou — pra UI mostrar o form ou mensagem de expirado.
export async function GET(req: NextRequest) {
  const token = new URL(req.url).searchParams.get('token')
  if (!token) return NextResponse.json({ valid: false })
  const rows = await query(
    "SELECT email FROM contratoai.users WHERE reset_token = $1 AND reset_token_expires > now()",
    [token]
  )
  return NextResponse.json({ valid: rows.length > 0, email: rows[0]?.email || null })
}
