import { GoogleGenerativeAI } from '@google/generative-ai'
import { query } from './db'

const GEMINI_KEY = process.env.GEMINI_API_KEY || ''

export interface RagChunk {
  content: string
  document_id: string
  similarity: number
  document_name: string
}

export interface RagResult {
  chunks: RagChunk[]
  context: string
  sources: string[]
  hasEnoughEvidence: boolean
}

// Busca os chunks mais relevantes na base RAG (contratoai.rag_*).
// Se a base nao tiver evidencia suficiente, retorna hasEnoughEvidence=false.
// Threshold 0.25 + minimo de 2 chunks acima disso = evidencia suficiente.
export async function searchRelevantChunks(
  queryText: string,
  topK = 6,
  threshold = 0.25,
  minEvidence = 2
): Promise<RagResult> {
  const empty: RagResult = { chunks: [], context: '', sources: [], hasEnoughEvidence: false }
  if (!GEMINI_KEY || !queryText?.trim()) return empty

  try {
    const genAI = new GoogleGenerativeAI(GEMINI_KEY)
    const embModel = genAI.getGenerativeModel({ model: 'gemini-embedding-001' })
    const embResult = await embModel.embedContent({
      content: { parts: [{ text: queryText.slice(0, 3000) }], role: 'user' },
      taskType: 'RETRIEVAL_QUERY' as any,
    })
    const embStr = `[${embResult.embedding.values.join(',')}]`

    const rows = await query(
      'SELECT * FROM contratoai.match_chunks($1::vector, $2, $3)',
      [embStr, threshold, topK]
    )
    if (rows.length === 0) return empty

    const docIds = [...new Set(rows.map((r: any) => r.document_id))]
    const docs = await query(
      `SELECT id, filename FROM contratoai.rag_documents WHERE id = ANY($1)`,
      [docIds]
    )
    const docNames: Record<string, string> = Object.fromEntries(
      docs.map((d: any) => [d.id, d.filename])
    )

    const chunks: RagChunk[] = rows.map((r: any) => ({
      content: r.content,
      document_id: r.document_id,
      similarity: r.similarity,
      document_name: docNames[r.document_id] || 'documento',
    }))

    const context = chunks
      .map((c, i) => `[Trecho ${i + 1} — ${c.document_name}]\n${c.content}`)
      .join('\n\n---\n\n')

    const sources = [...new Set(chunks.map((c) => c.document_name))]
    const hasEnoughEvidence = chunks.length >= minEvidence

    return { chunks, context, sources, hasEnoughEvidence }
  } catch (e: any) {
    console.error('[rag] search erro:', e.message)
    return empty
  }
}
