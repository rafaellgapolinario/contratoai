import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { query } from '@/lib/db'
import { getAdminFromHeader } from '@/lib/admin'

const GEMINI_KEY = process.env.GEMINI_API_KEY || ''

// GET — listar artigos publicados (publico)
export async function GET(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get('slug')

  if (slug) {
    const rows = await query('SELECT * FROM contratoai.artigos WHERE slug = $1 AND publicado = true', [slug])
    if (!rows.length) return NextResponse.json({ error: 'Artigo nao encontrado' }, { status: 404 })
    return NextResponse.json({ artigo: rows[0] })
  }

  const artigos = await query(
    'SELECT id, slug, titulo, meta_description, tags, criado_em FROM contratoai.artigos WHERE publicado = true ORDER BY criado_em DESC LIMIT 50'
  )
  return NextResponse.json({ artigos })
}

// POST — criar artigo (admin) ou gerar com IA
export async function POST(req: NextRequest) {
  const admin = getAdminFromHeader(req.headers.get('authorization'))
  if (!admin) return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })

  const { titulo, conteudo, meta_description, tags, gerar_ia, tema } = await req.json()

  if (gerar_ia && tema) {
    // Gerar artigo SEO com IA
    const genAI = new GoogleGenerativeAI(GEMINI_KEY)
    const model = genAI.getGenerativeModel({ model: 'gemini-3.1-flash-lite-preview' })
    const prompt = `Escreva um artigo completo para blog sobre o tema "${tema}" voltado para empreendedores e pequenas empresas brasileiras.

REGRAS:
- Titulo SEO atrativo (max 60 caracteres)
- Meta description (max 155 caracteres)
- Artigo com 800-1500 palavras
- Use headings (## e ###) para estruturar
- Linguagem acessivel (nao juridiquês)
- Inclua dicas praticas e exemplos
- Mencione legislacao brasileira relevante
- Conclua com CTA pra usar o ContratoAI
- Gere 3-5 tags relevantes
- Retorne JSON: {"titulo":"...","slug":"...","conteudo":"...","meta_description":"...","tags":["..."]}`

    const result = await model.generateContent(prompt)
    let text = result.response.text().trim()
    text = text.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/i, '').trim()

    let artigo
    try { artigo = JSON.parse(text) } catch {
      const match = text.match(/\{[\s\S]*\}/)
      if (match) { try { artigo = JSON.parse(match[0]) } catch {} }
      if (!artigo) return NextResponse.json({ error: 'Erro ao gerar artigo' }, { status: 500 })
    }

    const slug = artigo.slug || artigo.titulo.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
    const rows = await query(
      'INSERT INTO contratoai.artigos (slug, titulo, conteudo, meta_description, tags) VALUES ($1, $2, $3, $4, $5) RETURNING id, slug',
      [slug, artigo.titulo, artigo.conteudo, artigo.meta_description, artigo.tags || []]
    )
    return NextResponse.json({ ok: true, artigo: { ...artigo, id: rows[0].id, slug: rows[0].slug } })
  }

  // Criar artigo manual
  if (!titulo || !conteudo) return NextResponse.json({ error: 'Titulo e conteudo obrigatorios' }, { status: 400 })
  const slug = titulo.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
  const rows = await query(
    'INSERT INTO contratoai.artigos (slug, titulo, conteudo, meta_description, tags) VALUES ($1, $2, $3, $4, $5) RETURNING id, slug',
    [slug, titulo, conteudo, meta_description || '', tags || []]
  )
  return NextResponse.json({ ok: true, id: rows[0].id, slug: rows[0].slug })
}

// DELETE — admin remove artigo
export async function DELETE(req: NextRequest) {
  const admin = getAdminFromHeader(req.headers.get('authorization'))
  if (!admin) return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
  const { id } = await req.json()
  await query('DELETE FROM contratoai.artigos WHERE id = $1', [id])
  return NextResponse.json({ ok: true })
}
