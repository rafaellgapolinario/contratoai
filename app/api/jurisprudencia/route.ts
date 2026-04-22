import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { query } from '@/lib/db'
import { getTokenFromHeader } from '@/lib/jwt'
import { searchRelevantChunks } from '@/lib/rag'
import { getDateContext } from '@/lib/date-context'

const GEMINI_KEY = process.env.GEMINI_API_KEY || ''

export async function POST(req: NextRequest) {
  try {
    const payload = getTokenFromHeader(req.headers.get('authorization'))
    if (!payload?.id) return NextResponse.json({ error: 'Nao autenticado' }, { status: 401 })

    // Rate limit
    const userRows = await query('SELECT plano, plano_expira FROM contratoai.users WHERE id = $1', [payload.id])
    const user = userRows[0]
    const isMensal = user?.plano === 'mensal' && user?.plano_expira && new Date(user.plano_expira) > new Date()

    if (!isMensal) {
      const todayCount = await query(
        "SELECT COUNT(*) as total FROM contratoai.jurisprudencia_buscas WHERE user_id = $1 AND criado_em >= CURRENT_DATE",
        [payload.id]
      )
      if (parseInt(todayCount[0].total) >= 2) {
        return NextResponse.json({ error: 'Limite diario atingido (2 buscas/dia no plano gratuito). Assine o plano mensal para buscas ilimitadas.', limit: true }, { status: 429 })
      }
    }

    const { tema, area } = await req.json()
    if (!tema?.trim()) return NextResponse.json({ error: 'Informe o tema da pesquisa' }, { status: 400 })

    // RAG + googleSearch SEMPRE ligado nessa rota (jurisprudencia muda mes a mes)
    const rag = await searchRelevantChunks(`${tema} ${area || ''}`.trim(), 6)
    const baseContexto = rag.hasEnoughEvidence
      ? `\n\nDECISOES / SUMULAS DA BASE INTERNA (use como referencia prioritaria, complementando com decisoes recentes da web):\n\n${rag.context}\n`
      : ''
    const { bloco: dateCtx } = getDateContext()

    const genAI = new GoogleGenerativeAI(GEMINI_KEY)
    const model = genAI.getGenerativeModel({
      model: 'gemini-3.1-flash-lite-preview',
      tools: [{ googleSearch: {} }] as any,
    })

    const prompt = `Voce e um pesquisador juridico brasileiro especialista em jurisprudencia. Pesquise e retorne decisoes judiciais relevantes sobre o tema abaixo.

TEMA: ${tema}
${area ? `AREA DO DIREITO: ${area}` : ''}${baseContexto}

${dateCtx}

IMPORTANTE: pesquise na web decisoes dos tribunais brasileiros (STF, STJ, TJs, TRFs, TRTs) publicadas no ano corrente. Se nao houver, cai para anos anteriores em ordem decrescente. Se a base interna tiver material relevante acima, use como ponto de partida e complete com decisoes recentes da web.

Retorne um JSON valido com a seguinte estrutura (sem markdown, sem code blocks, apenas JSON puro):

{
  "tema_pesquisado": "${tema}",
  "total_resultados": <numero>,
  "decisoes": [
    {
      "tribunal": "<STF|STJ|TST|TJ-SP|TJ-RJ|etc>",
      "tipo": "<Recurso Especial|Agravo|Apelacao|Habeas Corpus|etc>",
      "numero": "<numero do processo/acordao>",
      "relator": "<nome do relator>",
      "data": "<data do julgamento>",
      "ementa": "<ementa resumida da decisao (3-5 linhas)>",
      "tese": "<tese juridica firmada>",
      "relevancia": "<ALTA|MEDIA|BAIXA>",
      "aplicacao": "<como essa decisao se aplica ao tema pesquisado>"
    }
  ],
  "sumula_relacionada": [
    {"numero": "<numero>", "tribunal": "<tribunal>", "texto": "<texto da sumula>"}
  ],
  "orientacao_geral": "<resumo da orientacao predominante dos tribunais sobre este tema>"
}

REGRAS:
- Retorne entre 5 e 10 decisoes mais relevantes
- Priorize decisoes do STF e STJ (tribunais superiores)
- Inclua sumulas relacionadas se existirem
- Use numeros de processos e relatores realistas baseados no seu conhecimento
- Foque em decisoes recentes e consolidadas
- Retorne APENAS o JSON, sem texto adicional`

    const result = await model.generateContent(prompt)
    let text = result.response.text().trim()
    text = text.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/i, '').trim()

    let dados
    try {
      dados = JSON.parse(text)
    } catch {
      const match = text.match(/\{[\s\S]*\}/)
      if (match) { try { dados = JSON.parse(match[0]) } catch {} }
      if (!dados) return NextResponse.json({ error: 'Erro ao processar pesquisa. Tente novamente.' }, { status: 500 })
    }

    // Salvar busca
    await query(
      'INSERT INTO contratoai.jurisprudencia_buscas (user_id, tema, area, total_resultados) VALUES ($1, $2, $3, $4)',
      [payload.id, tema, area || null, dados.total_resultados || dados.decisoes?.length || 0]
    )

    return NextResponse.json({
      ok: true,
      dados,
      sources: rag.sources,
      mode: rag.hasEnoughEvidence ? 'base+web' : 'web',
    })
  } catch (e: any) {
    console.error('[jurisprudencia] erro:', e.message)
    return NextResponse.json({ error: e.message || 'Erro interno' }, { status: 500 })
  }
}
