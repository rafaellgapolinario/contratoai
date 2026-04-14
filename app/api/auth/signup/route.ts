import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { signJwt } from '@/lib/jwt'
import bcrypt from 'bcryptjs'

export async function POST(req: NextRequest) {
  try {
    const { email, password, nome } = await req.json()
    if (!email || !password) return NextResponse.json({ error: 'Email e senha obrigatórios' }, { status: 400 })
    if (password.length < 6) return NextResponse.json({ error: 'Senha deve ter pelo menos 6 caracteres' }, { status: 400 })

    const existing = await query('SELECT id FROM contratoai.users WHERE email = $1', [email.toLowerCase().trim()])
    if (existing.length > 0) return NextResponse.json({ error: 'Email já cadastrado' }, { status: 409 })

    const hash = await bcrypt.hash(password, 10)
    const rows = await query(
      'INSERT INTO contratoai.users (email, password_hash, nome) VALUES ($1, $2, $3) RETURNING id, email, nome, plano',
      [email.toLowerCase().trim(), hash, nome || '']
    )
    const user = rows[0]
    const token = signJwt({ id: user.id, email: user.email })

    return NextResponse.json({ token, user: { id: user.id, email: user.email, nome: user.nome, plano: user.plano } })
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Erro interno' }, { status: 500 })
  }
}
