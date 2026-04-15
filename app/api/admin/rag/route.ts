import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { query } from '@/lib/db'
import { getAdminFromHeader } from '@/lib/admin'
// pdf-parse nao funciona em Next.js server bundles, usa Gemini pra extrair texto de PDFs

const GEMINI_KEY = process.env.GEMINI_API_KEY || ''

// GET — lista documentos
export async function GET(req: NextRequest) {
  const admin = getAdminFromHeader(req.headers.get('authorization'))
  if (!admin) return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })

  const docs = await query(
    'SELECT id, filename, file_type, file_size, chunk_count, criado_em FROM contratoai.rag_documents ORDER BY criado_em DESC'
  )
  return NextResponse.json({ documents: docs })
}

// POST — upload + processar documento
export async function POST(req: NextRequest) {
  const admin = getAdminFromHeader(req.headers.get('authorization'))
  if (!admin) return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })

  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null
    const textContent = formData.get('text') as string | null
    const filename = formData.get('filename') as string || file?.name || 'documento.txt'

    let content = ''

    if (file) {
      const buffer = Buffer.from(await file.arrayBuffer())

      if (file.type === 'application/pdf' || filename.endsWith('.pdf')) {
        content = await extractWithGemini(buffer)
      } else {
        // Texto puro
        content = buffer.toString('utf-8')
      }
    } else if (textContent) {
      content = textContent
    } else {
      return NextResponse.json({ error: 'Envie um arquivo ou texto' }, { status: 400 })
    }

    if (!content.trim() || content.length < 30) {
      return NextResponse.json({ error: 'Conteudo muito curto ou vazio. Minimo 30 caracteres.' }, { status: 400 })
    }

    // Limitar a 500KB de texto
    if (content.length > 500000) content = content.slice(0, 500000)

    // Chunkar o texto
    const chunks = splitIntoChunks(content, 1500)
    if (chunks.length === 0) {
      return NextResponse.json({ error: 'Nao foi possivel extrair texto do documento' }, { status: 400 })
    }

    // Limitar a 150 chunks
    const limitedChunks = chunks.slice(0, 150)

    // Gerar embeddings com Gemini
    const embeddings = await generateEmbeddings(limitedChunks)

    // Salvar documento
    const docRows = await query(
      'INSERT INTO contratoai.rag_documents (filename, file_type, file_size, content, chunk_count) VALUES ($1, $2, $3, $4, $5) RETURNING id',
      [filename, file?.type || 'text/plain', content.length, content.slice(0, 10000), limitedChunks.length]
    )
    const docId = docRows[0].id

    // Salvar chunks com embeddings
    for (let i = 0; i < limitedChunks.length; i++) {
      const embStr = `[${embeddings[i].join(',')}]`
      await query(
        'INSERT INTO contratoai.rag_chunks (document_id, content, chunk_index, embedding) VALUES ($1, $2, $3, $4::vector)',
        [docId, limitedChunks[i], i, embStr]
      )
    }

    console.log(`[rag] doc ${filename} processado: ${limitedChunks.length} chunks`)

    return NextResponse.json({
      ok: true,
      document: { id: docId, filename, chunks: limitedChunks.length },
    })
  } catch (e: any) {
    console.error('[rag] erro upload:', e.message)
    return NextResponse.json({ error: e.message || 'Erro ao processar documento' }, { status: 500 })
  }
}

// DELETE — remover documento
export async function DELETE(req: NextRequest) {
  const admin = getAdminFromHeader(req.headers.get('authorization'))
  if (!admin) return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })

  const { id } = await req.json()
  if (!id) return NextResponse.json({ error: 'ID obrigatorio' }, { status: 400 })

  await query('DELETE FROM contratoai.rag_documents WHERE id = $1', [id])
  return NextResponse.json({ ok: true })
}

// --- Helpers ---

function splitIntoChunks(text: string, maxLen: number): string[] {
  const paragraphs = text.split(/\n\s*\n/)
  const chunks: string[] = []
  let current = ''

  for (const p of paragraphs) {
    const trimmed = p.trim()
    if (!trimmed) continue

    if (current.length + trimmed.length + 2 > maxLen) {
      if (current.length >= 30) chunks.push(current.trim())
      current = trimmed
    } else {
      current += (current ? '\n\n' : '') + trimmed
    }
  }
  if (current.length >= 30) chunks.push(current.trim())

  // Se poucos chunks (texto sem paragrafos), split por sentenca
  if (chunks.length === 0) {
    const sentences = text.split(/(?<=[.!?])\s+/)
    current = ''
    for (const s of sentences) {
      if (current.length + s.length + 1 > maxLen) {
        if (current.length >= 30) chunks.push(current.trim())
        current = s
      } else {
        current += (current ? ' ' : '') + s
      }
    }
    if (current.length >= 30) chunks.push(current.trim())
  }

  return chunks
}

async function generateEmbeddings(chunks: string[]): Promise<number[][]> {
  const genAI = new GoogleGenerativeAI(GEMINI_KEY)
  const model = genAI.getGenerativeModel({ model: 'gemini-embedding-001' })
  const embeddings: number[][] = []

  for (const chunk of chunks) {
    try {
      const result = await model.embedContent({
        content: { parts: [{ text: chunk }], role: 'user' },
        taskType: 'RETRIEVAL_DOCUMENT' as any,
      })
      embeddings.push(result.embedding.values)
    } catch (e: any) {
      console.error('[rag] embedding error:', e.message)
      // Fallback: vetor zero
      embeddings.push(new Array(768).fill(0))
    }
    // Rate limit
    await new Promise(r => setTimeout(r, 100))
  }

  return embeddings
}

async function extractWithGemini(buffer: Buffer): Promise<string> {
  const genAI = new GoogleGenerativeAI(GEMINI_KEY)
  const model = genAI.getGenerativeModel({ model: 'gemini-3.1-flash-lite-preview' })
  const base64 = buffer.toString('base64')
  const result = await model.generateContent([
    { inlineData: { mimeType: 'application/pdf', data: base64 } },
    'Extraia TODO o texto deste PDF. Mantenha a formatacao, tabelas e estrutura. Retorne apenas o texto, sem comentarios.',
  ])
  return result.response.text()
}
