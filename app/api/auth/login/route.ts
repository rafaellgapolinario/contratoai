import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { signJwt } from '@/lib/jwt'
import bcrypt from 'bcryptjs'

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json()
    if (!email || !password) return NextResponse.json({ error: 'Email e senha obrigatórios' }, { status: 400 })

    const rows = await query(
      'SELECT id, email, nome, password_hash, plano, plano_expira FROM contratoai.users WHERE email = $1',
      [email.toLowerCase().trim()]
    )
    if (rows.length === 0) return NextResponse.json({ error: 'Email ou senha incorretos' }, { status: 401 })

    const user = rows[0]
    const valid = await bcrypt.compare(password, user.password_hash)
    if (!valid) return NextResponse.json({ error: 'Email ou senha incorretos' }, { status: 401 })

    // Checar se plano mensal expirou
    let plano = user.plano
    if (plano === 'mensal' && user.plano_expira && new Date(user.plano_expira) < new Date()) {
      await query("UPDATE contratoai.users SET plano = 'free' WHERE id = $1", [user.id])
      plano = 'free'
    }

    const token = signJwt({ id: user.id, email: user.email })
    return NextResponse.json({ token, user: { id: user.id, email: user.email, nome: user.nome, plano } })
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Erro interno' }, { status: 500 })
  }
}
