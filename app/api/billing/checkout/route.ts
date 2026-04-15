import { NextRequest, NextResponse } from 'next/server'
import { MercadoPagoConfig, Preference } from 'mercadopago'
import { query } from '@/lib/db'
import { getTokenFromHeader } from '@/lib/jwt'

const MP_TOKEN = process.env.MP_ACCESS_TOKEN || ''
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://contrato.rga-technologies.com'

const mpClient = MP_TOKEN ? new MercadoPagoConfig({ accessToken: MP_TOKEN }) : null
const mpPreference = mpClient ? new Preference(mpClient) : null

const PLANS: Record<string, { title: string; price: number; tipo: 'avulso' | 'mensal' }> = {
  avulso: { title: 'Documento Avulso — ContratoAI', price: 11.90, tipo: 'avulso' },
  mensal: { title: 'Plano Profissional — ContratoAI', price: 59.90, tipo: 'mensal' },
}

export async function POST(req: NextRequest) {
  try {
    const payload = getTokenFromHeader(req.headers.get('authorization'))
    if (!payload?.id) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    if (!mpPreference) return NextResponse.json({ error: 'Pagamento não configurado' }, { status: 500 })

    const { plan, document_id } = await req.json()
    const planData = PLANS[plan]
    if (!planData) return NextResponse.json({ error: 'Plano inválido' }, { status: 400 })

    // Se avulso, precisa de document_id
    if (plan === 'avulso' && !document_id) {
      return NextResponse.json({ error: 'document_id obrigatório para avulso' }, { status: 400 })
    }

    const externalRef = `contratoai:${payload.id}:${plan}:${document_id || 'none'}:${Date.now()}`

    const pref = await mpPreference.create({ body: {
      items: [{
        id: `contratoai-${plan}`,
        title: planData.title,
        quantity: 1,
        unit_price: planData.price,
        currency_id: 'BRL',
      }],
      external_reference: externalRef,
      metadata: {
        user_id: payload.id,
        plan,
        document_id: document_id || null,
        product: 'contratoai',
      },
      back_urls: {
        success: `${APP_URL}/painel?payment=success`,
        failure: `${APP_URL}/painel?payment=failure`,
        pending: `${APP_URL}/painel?payment=pending`,
      },
      auto_return: 'all',
      notification_url: `${APP_URL}/api/billing/webhook`,
      statement_descriptor: 'CONTRATOAI',
    }})

    // Grava payment pending
    try {
      await query(
        `INSERT INTO contratoai.payments (user_id, document_id, tipo, valor, status, mp_preference_id)
         VALUES ($1, $2, $3, $4, 'pending', $5)`,
        [payload.id, document_id || null, planData.tipo, planData.price, pref.id]
      )
    } catch (e: any) { console.error('[checkout] insert pending:', e.message) }

    return NextResponse.json({
      ok: true,
      init_point: pref.init_point,
      preference_id: pref.id,
      plan: planData,
    })
  } catch (e: any) {
    console.error('[checkout] erro:', e.message)
    return NextResponse.json({ error: e.message || 'Erro interno' }, { status: 500 })
  }
}
