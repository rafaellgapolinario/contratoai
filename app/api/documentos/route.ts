import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { getTokenFromHeader } from '@/lib/jwt'

export async function GET(req: NextRequest) {
  const payload = getTokenFromHeader(req.headers.get('authorization'))
  if (!payload) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  const docs = await query(
    'SELECT id, tipo, tipo_nome, pago, criado_em FROM contratoai.documents WHERE user_id = $1 ORDER BY criado_em DESC LIMIT 50',
    [payload.id]
  )
  return NextResponse.json({ documents: docs })
}
