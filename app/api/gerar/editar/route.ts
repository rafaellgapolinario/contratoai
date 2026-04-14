import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { query } from '@/lib/db'
import { getTokenFromHeader } from '@/lib/jwt'

const GEMINI_KEY = process.env.GEMINI_API_KEY || ''

export async function POST(req: NextRequest) {
  try {
    const { contrato, instrucao, docId } = await req.json()
    if (!contrato || !instrucao) return NextResponse.json({ error: 'Contrato e instrução são obrigatórios' }, { status: 400 })
    if (!GEMINI_KEY) return NextResponse.json({ error: 'API key não configurada' }, { status: 500 })

    const prompt = `Você é um advogado brasileiro especialista em contratos. Recebeu o contrato abaixo e o cliente pediu a seguinte alteração:

INSTRUÇÃO DO CLIENTE:
${instrucao}

CONTRATO ATUAL:
${contrato}

REGRAS:
- Aplique APENAS a alteração solicitada pelo cliente
- Mantenha todo o resto do contrato intacto (estrutura, cláusulas, formatação)
- Se o cliente pedir para REMOVER algo, remova e renumere as cláusulas se necessário
- Se o cliente pedir para ADICIONAR algo, insira na posição mais lógica
- Se o cliente pedir para MODIFICAR algo, altere apenas o trecho relevante
- Mantenha a linguagem jurídica formal
- NÃO inclua comentários ou explicações, apenas o contrato editado
- Retorne o contrato COMPLETO (não apenas a parte alterada)`

    const genAI = new GoogleGenerativeAI(GEMINI_KEY)
    const model = genAI.getGenerativeModel({ model: 'gemini-3.1-flash-lite-preview' })
    const result = await model.generateContent(prompt)
    const text = result.response.text()

    // Atualiza no banco se logado e tem docId
    const payload = getTokenFromHeader(req.headers.get('authorization'))
    if (payload?.id && docId) {
      try {
        await query(
          'UPDATE contratoai.documents SET conteudo = $1 WHERE id = $2 AND user_id = $3',
          [text, docId, payload.id]
        )
      } catch {}
    }

    return NextResponse.json({ contrato: text })
  } catch (e: any) {
    console.error('Erro ao editar contrato:', e)
    return NextResponse.json({ error: e.message || 'Erro interno' }, { status: 500 })
  }
}
