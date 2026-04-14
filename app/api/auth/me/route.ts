import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { getTokenFromHeader } from '@/lib/jwt'

export async function GET(req: NextRequest) {
  const payload = getTokenFromHeader(req.headers.get('authorization'))
  if (!payload) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  const rows = await query(
    'SELECT id, email, nome, plano, plano_expira, criado_em FROM contratoai.users WHERE id = $1',
    [payload.id]
  )
  if (rows.length === 0) return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })

  const user = rows[0]
  // Checar expiração
  if (user.plano === 'mensal' && user.plano_expira && new Date(user.plano_expira) < new Date()) {
    await query("UPDATE contratoai.users SET plano = 'free' WHERE id = $1", [user.id])
    user.plano = 'free'
  }

  // Contar documentos do mês
  const docs = await query(
    "SELECT COUNT(*) as total FROM contratoai.documents WHERE user_id = $1 AND criado_em >= date_trunc('month', now())",
    [payload.id]
  )

  return NextResponse.json({ user, docs_mes: parseInt(docs[0].total) })
}
