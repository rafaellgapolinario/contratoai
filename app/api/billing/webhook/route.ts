import { NextRequest, NextResponse } from 'next/server'
import { MercadoPagoConfig, Payment } from 'mercadopago'
import { query } from '@/lib/db'

const MP_TOKEN = process.env.MP_ACCESS_TOKEN || ''
const mpClient = MP_TOKEN ? new MercadoPagoConfig({ accessToken: MP_TOKEN }) : null
const mpPayment = mpClient ? new Payment(mpClient) : null

export async function POST(req: NextRequest) {
  // Responde 200 rapido pro MP
  try {
    const body = await req.json()
    const type = body.type || body.action?.split('.')[0]
    const paymentId = body.data?.id || body.id

    console.log('[webhook] recebido:', JSON.stringify({ type, paymentId }).slice(0, 200))

    if (type !== 'payment' || !paymentId || !mpPayment) {
      return NextResponse.json({ ok: true })
    }

    // Busca pagamento na API do MP
    const payment = await mpPayment.get({ id: paymentId })
    if (!payment) return NextResponse.json({ ok: true })

    const externalRef = payment.external_reference || ''
    const status = payment.status // approved | pending | rejected
    const meta = payment.metadata || {} as any

    // Filtra: so processa ContratoAI
    const isContratoAI = externalRef.startsWith('contratoai:') || meta.product === 'contratoai'
    if (!isContratoAI) {
      console.log('[webhook] ignorando (nao eh contratoai):', externalRef)
      return NextResponse.json({ ok: true })
    }

    // Extrai dados do external_reference: contratoai:userId:plan:docId:ts
    let userId = meta.user_id || null
    let plan = meta.plan || null
    let documentId = meta.document_id || null
    if (!userId && externalRef.startsWith('contratoai:')) {
      const parts = externalRef.split(':')
      userId = parts[1]
      plan = parts[2]
      documentId = parts[3] !== 'none' ? parts[3] : null
    }

    if (!userId) {
      console.log('[webhook] sem user_id, ignorando')
      return NextResponse.json({ ok: true })
    }

    // Upsert payment
    try {
      const existing = await query(
        'SELECT id FROM contratoai.payments WHERE mp_payment_id = $1 LIMIT 1',
        [String(paymentId)]
      )
      if (existing.length) {
        await query(
          'UPDATE contratoai.payments SET status = $1, atualizado_em = NOW() WHERE mp_payment_id = $2',
          [status, String(paymentId)]
        )
      } else {
        await query(
          `INSERT INTO contratoai.payments (user_id, document_id, tipo, valor, status, mp_payment_id)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [userId, documentId, plan === 'mensal' ? 'mensal' : 'avulso', payment.transaction_amount, status, String(paymentId)]
        )
      }
    } catch (e: any) { console.error('[webhook] payment upsert:', e.message) }

    // Se aprovado
    if (status === 'approved') {
      // Checa duplicata
      const dup = await query(
        "SELECT id FROM contratoai.payments WHERE mp_payment_id = $1 AND status = 'approved' AND atualizado_em < NOW() - interval '5 seconds' LIMIT 1",
        [String(paymentId)]
      )
      if (dup.length) {
        console.log('[webhook] duplicata, ignorando')
        return NextResponse.json({ ok: true })
      }

      if (plan === 'mensal') {
        // Ativa plano mensal: 30 dias a partir de agora (ou soma se ja tem)
        const users = await query('SELECT plano_expira FROM contratoai.users WHERE id = $1', [userId])
        const user = users[0]
        const now = new Date()
        const currentExpira = user?.plano_expira ? new Date(user.plano_expira) : null
        const base = currentExpira && currentExpira > now ? currentExpira : now
        const newExpira = new Date(base.getTime() + 30 * 86400000)

        await query(
          "UPDATE contratoai.users SET plano = 'mensal', plano_expira = $1, atualizado_em = NOW() WHERE id = $2",
          [newExpira.toISOString().split('T')[0], userId]
        )
        console.log(`[webhook] user ${userId} plano mensal ate ${newExpira.toISOString().split('T')[0]}`)
      }

      if (plan === 'avulso' && documentId) {
        // Marca documento como pago
        await query(
          "UPDATE contratoai.documents SET pago = true, payment_id = $1 WHERE id = $2 AND user_id = $3",
          [String(paymentId), documentId, userId]
        )
        console.log(`[webhook] doc ${documentId} marcado como pago`)
      }

      // Atualiza mp_payment_id no payment pending (que foi criado com mp_preference_id)
      try {
        await query(
          'UPDATE contratoai.payments SET mp_payment_id = $1, status = $2, atualizado_em = NOW() WHERE user_id = $3 AND status = $4 AND mp_payment_id IS NULL ORDER BY criado_em DESC LIMIT 1',
          [String(paymentId), status, userId, 'pending']
        )
      } catch {}
    }

    return NextResponse.json({ ok: true })
  } catch (e: any) {
    console.error('[webhook] erro:', e.message)
    return NextResponse.json({ ok: true })
  }
}
