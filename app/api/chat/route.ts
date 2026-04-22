import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { query } from '@/lib/db'
import { getTokenFromHeader } from '@/lib/jwt'
import { getDateContext } from '@/lib/date-context'

const GEMINI_KEY = process.env.GEMINI_API_KEY || ''

// GET — historico de mensagens do usuario
export async function GET(req: NextRequest) {
  const payload = getTokenFromHeader(req.headers.get('authorization'))
  if (!payload?.id) return NextResponse.json({ error: 'Nao autenticado' }, { status: 401 })

  const messages = await query(
    'SELECT id, role, content, sources, criado_em FROM contratoai.rag_chat_messages WHERE user_id = $1 ORDER BY criado_em ASC LIMIT 100',
    [payload.id]
  )
  return NextResponse.json({ messages })
}

// POST — pergunta ao chat juridico
export async function POST(req: NextRequest) {
  const payload = getTokenFromHeader(req.headers.get('authorization'))
  if (!payload?.id) return NextResponse.json({ error: 'Nao autenticado' }, { status: 401 })

  try {
    const { question } = await req.json()
    if (!question?.trim()) return NextResponse.json({ error: 'Pergunta obrigatoria' }, { status: 400 })

    // Rate limit: free = 3/dia, mensal = ilimitado
    const userRows = await query('SELECT plano, plano_expira FROM contratoai.users WHERE id = $1', [payload.id])
    const user = userRows[0]
    const isMensal = user?.plano === 'mensal' && user?.plano_expira && new Date(user.plano_expira) > new Date()

    if (!isMensal) {
      const todayCount = await query(
        "SELECT COUNT(*) as total FROM contratoai.rag_chat_messages WHERE user_id = $1 AND role = 'user' AND criado_em >= CURRENT_DATE",
        [payload.id]
      )
      if (parseInt(todayCount[0].total) >= 3) {
        return NextResponse.json({
          error: 'Limite diario atingido (3 perguntas/dia no plano gratuito). Assine o plano mensal para perguntas ilimitadas.',
          limit: true
        }, { status: 429 })
      }
    }

    // Gerar embedding da pergunta
    const genAI = new GoogleGenerativeAI(GEMINI_KEY)
    const embModel = genAI.getGenerativeModel({ model: 'gemini-embedding-001' })
    const embResult = await embModel.embedContent({
      content: { parts: [{ text: question }], role: 'user' },
      taskType: 'RETRIEVAL_QUERY' as any,
    })
    const queryEmbedding = embResult.embedding.values
    const embStr = `[${queryEmbedding.join(',')}]`

    // Buscar chunks similares
    const chunks = await query(
      "SELECT * FROM contratoai.match_chunks($1::vector, 0.25, 8)",
      [embStr]
    )

    // Buscar nomes dos documentos fonte
    const docIds = [...new Set(chunks.map((c: any) => c.document_id))]
    let docNames: Record<string, string> = {}
    if (docIds.length > 0) {
      const docs = await query(
        `SELECT id, filename FROM contratoai.rag_documents WHERE id = ANY($1)`,
        [docIds]
      )
      docNames = Object.fromEntries(docs.map((d: any) => [d.id, d.filename]))
    }

    // Montar contexto
    const context = chunks.length > 0
      ? chunks.map((c: any, i: number) => `[Trecho ${i + 1} — ${docNames[c.document_id] || 'documento'}]\n${c.content}`).join('\n\n---\n\n')
      : ''

    const sources = chunks.map((c: any) => docNames[c.document_id] || 'documento')
    const uniqueSources = [...new Set(sources)]

    // Buscar historico recente pra contexto de conversa
    const history = await query(
      'SELECT role, content FROM contratoai.rag_chat_messages WHERE user_id = $1 ORDER BY criado_em DESC LIMIT 6',
      [payload.id]
    )
    const historyContext = history.reverse().map((m: any) => `${m.role === 'user' ? 'Usuario' : 'Assistente'}: ${m.content}`).join('\n')

    // Gerar resposta com Gemini
    const chatModel = genAI.getGenerativeModel({ model: 'gemini-3.1-flash-lite-preview' })

    const { bloco: dateCtx } = getDateContext()
    const systemPrompt = `Voce e um assistente juridico especializado em legislacao brasileira. Voce responde perguntas dos usuarios com base EXCLUSIVAMENTE nos documentos fornecidos abaixo.

REGRAS:
- Responda APENAS com base no conteudo dos documentos fornecidos
- Se a informacao nao esta nos documentos, diga claramente: "Nao encontrei essa informacao nos documentos disponiveis."
- Use linguagem clara e acessivel, nao excessivamente juridica
- Cite de qual documento veio a informacao quando possivel
- Seja direto e objetivo
- NAO invente informacoes que nao estao nos documentos
- Se a pergunta nao tem relacao com os documentos, explique que voce so pode ajudar com base nos documentos disponíveis
- IMPORTANTE: Voce NAO e advogado e NAO substitui assessoria juridica profissional. Deixe isso claro quando relevante.

${dateCtx}

${context ? `DOCUMENTOS DISPONIVEIS:\n\n${context}` : 'Nenhum documento encontrado para esta consulta.'}

${historyContext ? `HISTORICO DA CONVERSA:\n${historyContext}` : ''}`

    const result = await chatModel.generateContent({
      contents: [{ role: 'user', parts: [{ text: question }] }],
      systemInstruction: { parts: [{ text: systemPrompt }], role: 'user' },
    })
    const answer = result.response.text()

    // Salvar mensagem do usuario e resposta
    await query(
      "INSERT INTO contratoai.rag_chat_messages (user_id, role, content) VALUES ($1, 'user', $2)",
      [payload.id, question]
    )
    await query(
      "INSERT INTO contratoai.rag_chat_messages (user_id, role, content, sources) VALUES ($1, 'assistant', $2, $3)",
      [payload.id, answer, uniqueSources.length > 0 ? uniqueSources : null]
    )

    return NextResponse.json({
      answer,
      sources: uniqueSources,
      chunks_found: chunks.length,
    })
  } catch (e: any) {
    console.error('[chat] erro:', e.message)
    return NextResponse.json({ error: e.message || 'Erro interno' }, { status: 500 })
  }
}

// DELETE — limpar historico
export async function DELETE(req: NextRequest) {
  const payload = getTokenFromHeader(req.headers.get('authorization'))
  if (!payload?.id) return NextResponse.json({ error: 'Nao autenticado' }, { status: 401 })

  await query('DELETE FROM contratoai.rag_chat_messages WHERE user_id = $1', [payload.id])
  return NextResponse.json({ ok: true })
}
