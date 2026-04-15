import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { query } from '@/lib/db'
import { getTokenFromHeader } from '@/lib/jwt'
import { getAdminFromHeader } from '@/lib/admin'

const GEMINI_KEY = process.env.GEMINI_API_KEY || ''

// GET — listar teses (filtro por area, busca por texto)
export async function GET(req: NextRequest) {
  const area = req.nextUrl.searchParams.get('area') || ''
  const busca = req.nextUrl.searchParams.get('q') || ''

  let sql = 'SELECT id, area, titulo, fundamentacao, legislacao, jurisprudencia, tags, criado_em FROM contratoai.teses'
  const params: any[] = []
  const conditions: string[] = []

  if (area) { conditions.push(`area = $${params.length + 1}`); params.push(area) }
  if (busca) { conditions.push(`(titulo ILIKE $${params.length + 1} OR fundamentacao ILIKE $${params.length + 1})`); params.push(`%${busca}%`) }

  if (conditions.length) sql += ' WHERE ' + conditions.join(' AND ')
  sql += ' ORDER BY criado_em DESC LIMIT 100'

  const teses = await query(sql, params)

  // Listar areas disponiveis
  const areas = await query('SELECT DISTINCT area FROM contratoai.teses ORDER BY area')

  return NextResponse.json({ teses, areas: areas.map((a: any) => a.area) })
}

// POST — gerar teses via IA (admin) ou gerar tese avulsa sobre um tema (usuario)
export async function POST(req: NextRequest) {
  const payload = getTokenFromHeader(req.headers.get('authorization'))
  if (!payload?.id) return NextResponse.json({ error: 'Nao autenticado' }, { status: 401 })

  const { area, tema, modo } = await req.json()

  // Modo admin: gerar lote de teses pra popular a base
  const admin = getAdminFromHeader(req.headers.get('authorization'))
  if (modo === 'lote' && !admin) return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })

  if (!tema?.trim() && !area?.trim()) return NextResponse.json({ error: 'Informe area ou tema' }, { status: 400 })

  const genAI = new GoogleGenerativeAI(GEMINI_KEY)
  const model = genAI.getGenerativeModel({ model: 'gemini-3.1-flash-lite-preview' })

  const qtd = modo === 'lote' ? 10 : 1
  const prompt = `Voce e um advogado brasileiro. ${modo === 'lote' ? `Gere ${qtd} teses juridicas` : 'Gere 1 tese juridica'} sobre ${tema ? `o tema "${tema}"` : `a area de ${area}`}.

Retorne JSON puro (sem markdown):
{
  "teses": [
    {
      "area": "<area do direito: Civil, Trabalhista, Consumidor, Penal, Empresarial, Tributario, Familia, Constitucional>",
      "titulo": "<titulo da tese (1 linha)>",
      "fundamentacao": "<fundamentacao juridica detalhada (3-6 paragrafos com argumentacao)>",
      "legislacao": ["<artigos de lei relevantes>"],
      "jurisprudencia": ["<decisoes relevantes (tribunal, numero, ementa resumida)>"],
      "tags": ["<tags para busca>"]
    }
  ]
}

REGRAS:
- Fundamentacao robusta com artigos de lei e jurisprudencia
- Teses praticas e aplicaveis
- Retorne APENAS JSON`

  const result = await model.generateContent(prompt)
  let text = result.response.text().trim()
  text = text.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/i, '').trim()

  let dados
  try { dados = JSON.parse(text) } catch {
    const match = text.match(/\{[\s\S]*\}/)
    if (match) { try { dados = JSON.parse(match[0]) } catch {} }
    if (!dados) return NextResponse.json({ error: 'Erro ao gerar teses' }, { status: 500 })
  }

  // Salvar no banco
  const saved = []
  for (const t of (dados.teses || [])) {
    try {
      const rows = await query(
        'INSERT INTO contratoai.teses (area, titulo, fundamentacao, legislacao, jurisprudencia, tags) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
        [t.area, t.titulo, t.fundamentacao, t.legislacao || [], t.jurisprudencia || [], t.tags || []]
      )
      saved.push({ ...t, id: rows[0].id })
    } catch (e: any) { console.error('[teses] insert:', e.message) }
  }

  return NextResponse.json({ ok: true, teses: saved })
}

// DELETE — admin remove tese
export async function DELETE(req: NextRequest) {
  const admin = getAdminFromHeader(req.headers.get('authorization'))
  if (!admin) return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
  const { id } = await req.json()
  await query('DELETE FROM contratoai.teses WHERE id = $1', [id])
  return NextResponse.json({ ok: true })
}
