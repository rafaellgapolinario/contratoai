import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { getTokenFromHeader } from '@/lib/jwt'
import crypto from 'crypto'

// POST — assinar documento
export async function POST(req: NextRequest) {
  try {
    const payload = getTokenFromHeader(req.headers.get('authorization'))
    if (!payload?.id) return NextResponse.json({ error: 'Nao autenticado' }, { status: 401 })

    const { document_id, nome_signatario, cpf_signatario, assinatura_img } = await req.json()
    if (!document_id || !nome_signatario) return NextResponse.json({ error: 'Campos obrigatorios' }, { status: 400 })
    if (!assinatura_img) return NextResponse.json({ error: 'Desenhe sua assinatura' }, { status: 400 })

    // Buscar documento
    const docs = await query('SELECT id, conteudo, user_id FROM contratoai.documents WHERE id = $1', [document_id])
    if (!docs.length) return NextResponse.json({ error: 'Documento nao encontrado' }, { status: 404 })

    const doc = docs[0]
    // Verificar se o usuario eh dono ou se o doc eh publico
    if (doc.user_id && doc.user_id !== payload.id) {
      return NextResponse.json({ error: 'Sem permissao' }, { status: 403 })
    }

    // Gerar hash SHA-256 do conteudo do documento
    const hashDocumento = crypto.createHash('sha256').update(doc.conteudo).digest('hex')

    // IP do signatario
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
               req.headers.get('x-real-ip') || 'unknown'

    // Verificar se ja assinou
    const existing = await query(
      'SELECT id FROM contratoai.assinaturas WHERE document_id = $1 AND user_id = $2 LIMIT 1',
      [document_id, payload.id]
    )
    if (existing.length) {
      return NextResponse.json({ error: 'Voce ja assinou este documento' }, { status: 400 })
    }

    // Salvar assinatura
    const rows = await query(
      `INSERT INTO contratoai.assinaturas (document_id, user_id, nome_signatario, cpf_signatario, ip_address, hash_documento, assinatura_img)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id, criado_em`,
      [document_id, payload.id, nome_signatario, cpf_signatario || null, ip, hashDocumento, assinatura_img]
    )

    const assinatura = rows[0]

    return NextResponse.json({
      ok: true,
      assinatura: {
        id: assinatura.id,
        hash: hashDocumento,
        timestamp: assinatura.criado_em,
        ip,
      }
    })
  } catch (e: any) {
    console.error('[assinar] erro:', e.message)
    return NextResponse.json({ error: e.message || 'Erro interno' }, { status: 500 })
  }
}

// GET — verificar assinaturas de um documento
export async function GET(req: NextRequest) {
  const docId = req.nextUrl.searchParams.get('document_id')
  if (!docId) return NextResponse.json({ error: 'document_id obrigatorio' }, { status: 400 })

  const assinaturas = await query(
    `SELECT a.id, a.nome_signatario, a.cpf_signatario, a.hash_documento, a.criado_em, a.ip_address
     FROM contratoai.assinaturas a WHERE a.document_id = $1 ORDER BY a.criado_em`,
    [docId]
  )

  // Buscar hash atual do documento pra verificar integridade
  const docs = await query('SELECT conteudo FROM contratoai.documents WHERE id = $1', [docId])
  const hashAtual = docs.length ? crypto.createHash('sha256').update(docs[0].conteudo).digest('hex') : null

  return NextResponse.json({
    assinaturas: assinaturas.map(a => ({
      ...a,
      integro: a.hash_documento === hashAtual,
    })),
    hash_atual: hashAtual,
  })
}
