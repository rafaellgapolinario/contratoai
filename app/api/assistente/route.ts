import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { query } from '@/lib/db'
import { getTokenFromHeader } from '@/lib/jwt'
import { getDateContext } from '@/lib/date-context'

const GEMINI_KEY = process.env.GEMINI_API_KEY || ''

// GET — historico do usuario
export async function GET(req: NextRequest) {
  const payload = getTokenFromHeader(req.headers.get('authorization'))
  if (!payload?.id) return NextResponse.json({ error: 'Nao autenticado' }, { status: 401 })

  const messages = await query(
    'SELECT id, role, content, criado_em FROM contratoai.assistente_messages WHERE user_id = $1 ORDER BY criado_em ASC LIMIT 100',
    [payload.id]
  )
  return NextResponse.json({ messages })
}

// POST — pergunta ao assistente geral
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
        "SELECT COUNT(*) as total FROM contratoai.assistente_messages WHERE user_id = $1 AND role = 'user' AND criado_em >= CURRENT_DATE",
        [payload.id]
      )
      if (parseInt(todayCount[0].total) >= 3) {
        return NextResponse.json({
          error: 'Limite diario atingido (3 perguntas/dia no plano gratuito). Assine o plano mensal para perguntas ilimitadas.',
          limit: true,
        }, { status: 429 })
      }
    }

    // Historico recente pra contexto de conversa
    const history = await query(
      'SELECT role, content FROM contratoai.assistente_messages WHERE user_id = $1 ORDER BY criado_em DESC LIMIT 10',
      [payload.id]
    )
    const historyContext = history
      .reverse()
      .map((m: any) => `${m.role === 'user' ? 'Usuario' : 'Assistente'}: ${m.content}`)
      .join('\n')

    const { bloco: dateCtx } = getDateContext()
    const systemPrompt = `Voce e um assistente de IA versatil e prestativo, integrado ao ContratoAI. Ajuda o usuario com duvidas gerais — juridicas, tecnicas, profissionais, pessoais, redacao, traducao, explicacoes, analise, o que for.

REGRAS:
- Seja direto, util e claro. Sem enrolar.
- Use portugues brasileiro natural.
- Se a pergunta for juridica especifica sobre documentos carregados pelo usuario na base do ContratoAI, sugira que ele use a aba "Consulta Juridica" (RAG) em vez desta.
- Se usar informacao da web, mencione que buscou online.
- NAO substitui advogado, medico, contador ou outro profissional — sinalize quando o assunto exigir.
- Se o usuario pedir pra gerar documento, peticao ou contrato, sugira que use a aba "Gerar" do ContratoAI em vez de gerar aqui.

${dateCtx}

${historyContext ? `HISTORICO DA CONVERSA:\n${historyContext}\n` : ''}`

    const genAI = new GoogleGenerativeAI(GEMINI_KEY)
    const model = genAI.getGenerativeModel({
      model: 'gemini-3.1-flash-lite-preview',
      tools: [{ googleSearch: {} }] as any,
    })

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: question }] }],
      systemInstruction: { parts: [{ text: systemPrompt }], role: 'user' },
    })
    const answer = result.response.text()

    await query(
      "INSERT INTO contratoai.assistente_messages (user_id, role, content) VALUES ($1, 'user', $2)",
      [payload.id, question]
    )
    await query(
      "INSERT INTO contratoai.assistente_messages (user_id, role, content) VALUES ($1, 'assistant', $2)",
      [payload.id, answer]
    )

    return NextResponse.json({ answer })
  } catch (e: any) {
    console.error('[assistente] erro:', e.message)
    return NextResponse.json({ error: e.message || 'Erro interno' }, { status: 500 })
  }
}

// DELETE — limpar historico
export async function DELETE(req: NextRequest) {
  const payload = getTokenFromHeader(req.headers.get('authorization'))
  if (!payload?.id) return NextResponse.json({ error: 'Nao autenticado' }, { status: 401 })

  await query('DELETE FROM contratoai.assistente_messages WHERE user_id = $1', [payload.id])
  return NextResponse.json({ ok: true })
}
