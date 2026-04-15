import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { query } from '@/lib/db'
import { getTokenFromHeader } from '@/lib/jwt'
import { execSync } from 'child_process'
import { writeFileSync, readFileSync, unlinkSync } from 'fs'

const GEMINI_KEY = process.env.GEMINI_API_KEY || ''

export async function POST(req: NextRequest) {
  try {
    const payload = getTokenFromHeader(req.headers.get('authorization'))
    if (!payload?.id) return NextResponse.json({ error: 'Nao autenticado' }, { status: 401 })

    // Rate limit: free 1/dia, mensal ilimitado
    const userRows = await query('SELECT plano, plano_expira FROM contratoai.users WHERE id = $1', [payload.id])
    const user = userRows[0]
    const isMensal = user?.plano === 'mensal' && user?.plano_expira && new Date(user.plano_expira) > new Date()

    if (!isMensal) {
      const todayCount = await query(
        "SELECT COUNT(*) as total FROM contratoai.analises WHERE user_id = $1 AND criado_em >= CURRENT_DATE",
        [payload.id]
      )
      if (parseInt(todayCount[0].total) >= 1) {
        return NextResponse.json({ error: 'Limite diario atingido (1 analise/dia no plano gratuito). Assine o plano mensal para analises ilimitadas.', limit: true }, { status: 429 })
      }
    }

    // Extrair contrato do body
    const formData = await req.formData()
    const file = formData.get('file') as File | null
    const textContent = formData.get('text') as string | null
    let contrato = ''

    if (file) {
      const buffer = Buffer.from(await file.arrayBuffer())
      if (file.type === 'application/pdf' || file.name?.endsWith('.pdf')) {
        // pdf-parse via script externo (rapido)
        try {
          const tmpIn = `/tmp/anl-${Date.now()}.pdf`
          const tmpOut = `/tmp/anl-${Date.now()}.txt`
          writeFileSync(tmpIn, buffer)
          execSync(`node /root/contratoai/scripts/extract-pdf.mjs "${tmpIn}" "${tmpOut}"`, { timeout: 60000 })
          contrato = readFileSync(tmpOut, 'utf-8')
          try { unlinkSync(tmpIn) } catch {}
          try { unlinkSync(tmpOut) } catch {}
        } catch {
          // Fallback Gemini
          const genAI = new GoogleGenerativeAI(GEMINI_KEY)
          const model = genAI.getGenerativeModel({ model: 'gemini-3.1-flash-lite-preview' })
          const base64 = buffer.toString('base64')
          const result = await model.generateContent([
            { inlineData: { mimeType: 'application/pdf', data: base64 } },
            'Extraia TODO o texto deste PDF. Retorne apenas o texto.',
          ])
          contrato = result.response.text()
        }
      } else {
        contrato = buffer.toString('utf-8')
      }
    } else if (textContent) {
      contrato = textContent
    }

    if (!contrato.trim() || contrato.length < 100) {
      return NextResponse.json({ error: 'Contrato muito curto ou vazio. Minimo 100 caracteres.' }, { status: 400 })
    }
    if (contrato.length > 100000) contrato = contrato.slice(0, 100000)

    const genAI = new GoogleGenerativeAI(GEMINI_KEY)
    const model = genAI.getGenerativeModel({ model: 'gemini-3.1-flash-lite-preview' })

    const prompt = `Voce e um advogado brasileiro especialista em analise de contratos. Analise o contrato abaixo e retorne um JSON valido com a seguinte estrutura EXATA (sem markdown, sem code blocks, apenas JSON puro):

{
  "score": <numero de 0 a 100 representando a seguranca do contrato, onde 100 = muito seguro>,
  "nivel": "<BAIXO|MEDIO|ALTO|CRITICO>",
  "resumo": "<resumo de 2-3 linhas sobre o contrato>",
  "clausulas_ok": [
    {"titulo": "<nome da clausula>", "descricao": "<por que esta ok>"}
  ],
  "problemas": [
    {"titulo": "<problema identificado>", "severidade": "<BAIXA|MEDIA|ALTA|CRITICA>", "descricao": "<explicacao detalhada>", "sugestao": "<como corrigir>"}
  ],
  "ausentes": [
    {"titulo": "<clausula que deveria existir>", "importancia": "<BAIXA|MEDIA|ALTA>", "descricao": "<por que e importante>"}
  ],
  "sugestoes_gerais": ["<sugestao 1>", "<sugestao 2>"]
}

REGRAS:
- Analise com base na legislacao brasileira (Codigo Civil, CDC, CLT, CPC conforme aplicavel)
- Identifique clausulas abusivas (Art. 51 CDC), prazos fora do padrao legal, multas excessivas
- Verifique se tem: objeto, obrigacoes, prazo, pagamento, rescisao, foro, penalidades
- Score 90-100: contrato muito seguro. 70-89: bom com ajustes. 50-69: problemas relevantes. 0-49: riscos graves
- Retorne APENAS o JSON, sem texto adicional

CONTRATO:
${contrato}`

    const result = await model.generateContent(prompt)
    let text = result.response.text().trim()

    // Limpar possivel markdown
    text = text.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/i, '').trim()

    let analise
    try {
      analise = JSON.parse(text)
    } catch {
      // Tentar extrair JSON do texto
      const match = text.match(/\{[\s\S]*\}/)
      if (match) {
        try { analise = JSON.parse(match[0]) } catch {}
      }
      if (!analise) {
        return NextResponse.json({ error: 'Erro ao processar analise. Tente novamente.' }, { status: 500 })
      }
    }

    // Salvar analise no banco
    await query(
      'INSERT INTO contratoai.analises (user_id, contrato_preview, score, nivel, resultado) VALUES ($1, $2, $3, $4, $5)',
      [payload.id, contrato.slice(0, 500), analise.score, analise.nivel, JSON.stringify(analise)]
    )

    return NextResponse.json({ ok: true, analise })
  } catch (e: any) {
    console.error('[analisar] erro:', e.message)
    return NextResponse.json({ error: e.message || 'Erro interno' }, { status: 500 })
  }
}
