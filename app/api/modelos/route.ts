import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { getTokenFromHeader } from '@/lib/jwt'

// GET — listar modelos do usuario
export async function GET(req: NextRequest) {
  const payload = getTokenFromHeader(req.headers.get('authorization'))
  if (!payload?.id) return NextResponse.json({ error: 'Nao autenticado' }, { status: 401 })

  const modelos = await query(
    'SELECT id, nome, descricao, campos, prompt_extra, criado_em FROM contratoai.modelos WHERE user_id = $1 ORDER BY criado_em DESC',
    [payload.id]
  )
  return NextResponse.json({ modelos })
}

// POST — criar modelo
export async function POST(req: NextRequest) {
  const payload = getTokenFromHeader(req.headers.get('authorization'))
  if (!payload?.id) return NextResponse.json({ error: 'Nao autenticado' }, { status: 401 })

  const { nome, descricao, campos, prompt_extra } = await req.json()
  if (!nome?.trim()) return NextResponse.json({ error: 'Nome obrigatorio' }, { status: 400 })
  if (!campos?.length || campos.length < 1) return NextResponse.json({ error: 'Adicione pelo menos 1 campo' }, { status: 400 })
  if (campos.length > 20) return NextResponse.json({ error: 'Maximo 20 campos' }, { status: 400 })

  // Limitar a 10 modelos por usuario
  const count = await query('SELECT COUNT(*) as total FROM contratoai.modelos WHERE user_id = $1', [payload.id])
  if (parseInt(count[0].total) >= 10) {
    return NextResponse.json({ error: 'Limite de 10 modelos atingido' }, { status: 400 })
  }

  const rows = await query(
    'INSERT INTO contratoai.modelos (user_id, nome, descricao, campos, prompt_extra) VALUES ($1, $2, $3, $4, $5) RETURNING id, nome, campos',
    [payload.id, nome.trim(), descricao?.trim() || null, campos, prompt_extra?.trim() || null]
  )

  return NextResponse.json({ ok: true, modelo: rows[0] })
}

// PUT — atualizar modelo
export async function PUT(req: NextRequest) {
  const payload = getTokenFromHeader(req.headers.get('authorization'))
  if (!payload?.id) return NextResponse.json({ error: 'Nao autenticado' }, { status: 401 })

  const { id, nome, descricao, campos, prompt_extra } = await req.json()
  if (!id) return NextResponse.json({ error: 'ID obrigatorio' }, { status: 400 })

  await query(
    'UPDATE contratoai.modelos SET nome = $1, descricao = $2, campos = $3, prompt_extra = $4, atualizado_em = NOW() WHERE id = $5 AND user_id = $6',
    [nome?.trim(), descricao?.trim() || null, campos || [], prompt_extra?.trim() || null, id, payload.id]
  )
  return NextResponse.json({ ok: true })
}

// DELETE — deletar modelo
export async function DELETE(req: NextRequest) {
  const payload = getTokenFromHeader(req.headers.get('authorization'))
  if (!payload?.id) return NextResponse.json({ error: 'Nao autenticado' }, { status: 401 })

  const { id } = await req.json()
  if (!id) return NextResponse.json({ error: 'ID obrigatorio' }, { status: 400 })

  await query('DELETE FROM contratoai.modelos WHERE id = $1 AND user_id = $2', [id, payload.id])
  return NextResponse.json({ ok: true })
}
