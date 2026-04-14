import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { getAdminFromHeader, isMaster } from '@/lib/admin'

// GET — listar todos os clientes (somente master)
export async function GET(req: NextRequest) {
  const admin = getAdminFromHeader(req.headers.get('authorization'))
  if (!admin) return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
  if (!isMaster(admin.email)) return NextResponse.json({ error: 'Acesso restrito ao master' }, { status: 403 })

  const users = await query(`
    SELECT
      u.id, u.email, u.nome, u.plano, u.plano_expira, u.criado_em,
      (SELECT COUNT(*) FROM contratoai.documents d WHERE d.user_id = u.id) as total_docs,
      (SELECT COUNT(*) FROM contratoai.payments p WHERE p.user_id = u.id AND p.status = 'approved') as total_pagamentos
    FROM contratoai.users u
    ORDER BY u.criado_em DESC
  `)

  const stats = await query(`
    SELECT
      COUNT(*) as total_users,
      COUNT(*) FILTER (WHERE plano = 'mensal' AND plano_expira > NOW()) as ativos_mensal,
      COUNT(*) FILTER (WHERE plano = 'free' OR plano_expira IS NULL OR plano_expira <= NOW()) as free
    FROM contratoai.users
  `)

  return NextResponse.json({ users, stats: stats[0] })
}
