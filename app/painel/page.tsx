'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

interface User { id: string; email: string; nome: string; plano: string; plano_expira?: string }
interface Doc { id: string; tipo: string; tipo_nome: string; pago: boolean; criado_em: string }

function PainelContent() {
  const [user, setUser] = useState<User | null>(null)
  const [docs, setDocs] = useState<Doc[]>([])
  const [docsMes, setDocsMes] = useState(0)
  const [loading, setLoading] = useState(true)
  const [paymentMsg, setPaymentMsg] = useState('')
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const payment = searchParams.get('payment')
    if (payment === 'success') setPaymentMsg('Pagamento aprovado! Seu plano foi ativado.')
    else if (payment === 'pending') setPaymentMsg('Pagamento pendente. Sera ativado assim que confirmado.')
    else if (payment === 'failure') setPaymentMsg('Pagamento nao foi concluido. Tente novamente.')
    if (payment) {
      const timer = setTimeout(() => setPaymentMsg(''), 8000)
      return () => clearTimeout(timer)
    }
  }, [searchParams])

  useEffect(() => {
    const token = localStorage.getItem('cai_token')
    if (!token) { router.push('/login'); return }

    fetch('/api/auth/me', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => {
        if (d.error) { localStorage.removeItem('cai_token'); router.push('/login'); return }
        setUser(d.user)
        setDocsMes(d.docs_mes)
      })
      .catch(() => router.push('/login'))

    fetch('/api/documentos', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => setDocs(d.documents || []))
      .finally(() => setLoading(false))
  }, [router])

  const logout = () => {
    localStorage.removeItem('cai_token')
    localStorage.removeItem('cai_user')
    router.push('/')
  }

  if (loading || !user) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
      <div style={{ width: 40, height: 40, borderRadius: '50%', border: '3px solid var(--border)', borderTopColor: 'var(--blue)', animation: 'spin 1s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )

  const isMensal = user.plano === 'mensal' && user.plano_expira && new Date(user.plano_expira) > new Date()

  const assinarMensal = async () => {
    const token = localStorage.getItem('cai_token')
    if (!token) return
    try {
      const res = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ plan: 'mensal' }),
      })
      const data = await res.json()
      if (data.init_point) window.location.href = data.init_point
    } catch {}
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      {/* Nav */}
      <nav style={{ height: 64, display: 'flex', alignItems: 'center', justifyContent: 'center', borderBottom: '1px solid var(--border)', background: 'rgba(9,9,15,0.95)', backdropFilter: 'blur(20px)' }}>
        <div style={{ maxWidth: 1000, width: '100%', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href="/" style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 18, display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 28, height: 28, borderRadius: 7, background: 'linear-gradient(135deg,var(--blue),var(--cyan))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, color: '#fff' }}>C</div>
            ContratoAI
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <span style={{ fontSize: 13, color: 'var(--text2)' }}>{user.email}</span>
            <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 99, background: isMensal ? 'rgba(59,130,246,0.15)' : 'rgba(255,255,255,0.06)', color: isMensal ? 'var(--blue-light)' : 'var(--text3)' }}>
              {isMensal ? 'Mensal' : 'Free'}
            </span>
            {user.email === 'gardaszconsultoria@gmail.com' && (
              <Link href="/admin" style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 99, background: 'rgba(239,68,68,0.15)', color: '#f87171' }}>ADMIN</Link>
            )}
            <button onClick={logout} style={{ fontSize: 13, color: 'var(--text3)', padding: '6px 12px', borderRadius: 8, border: '1px solid var(--border)' }}>Sair</button>
          </div>
        </div>
      </nav>

      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '32px 24px' }}>
        {/* Payment feedback */}
        {paymentMsg && (
          <div style={{ padding: '12px 20px', marginBottom: 20, borderRadius: 12, background: paymentMsg.includes('aprovado') ? 'rgba(34,197,94,0.1)' : paymentMsg.includes('pendente') ? 'rgba(245,158,11,0.1)' : 'rgba(239,68,68,0.1)', border: `1px solid ${paymentMsg.includes('aprovado') ? 'rgba(34,197,94,0.25)' : paymentMsg.includes('pendente') ? 'rgba(245,158,11,0.25)' : 'rgba(239,68,68,0.25)'}`, color: paymentMsg.includes('aprovado') ? '#22c55e' : paymentMsg.includes('pendente') ? '#f59e0b' : '#f87171', fontSize: 14, fontWeight: 500 }}>
            {paymentMsg}
          </div>
        )}
        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 32 }}>
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: 24 }}>
            <div style={{ fontSize: 13, color: 'var(--text3)', marginBottom: 4 }}>Documentos este mês</div>
            <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 32, fontWeight: 700 }}>{docsMes}</div>
          </div>
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: 24 }}>
            <div style={{ fontSize: 13, color: 'var(--text3)', marginBottom: 4 }}>Total de documentos</div>
            <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 32, fontWeight: 700 }}>{docs.length}</div>
          </div>
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: 24 }}>
            <div style={{ fontSize: 13, color: 'var(--text3)', marginBottom: 4 }}>Seu plano</div>
            <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 24, fontWeight: 700, color: isMensal ? 'var(--blue-light)' : 'var(--text2)' }}>
              {isMensal ? 'Mensal' : 'Free'}
            </div>
            {!isMensal && (
              <div style={{ marginTop: 8 }}>
                <span style={{ fontSize: 12, color: 'var(--text3)' }}>R$11,90/doc avulso</span>
                <span style={{ fontSize: 12, color: 'var(--text3)', margin: '0 6px' }}>ou</span>
                <span style={{ fontSize: 12, color: 'var(--blue-light)', fontWeight: 600 }}>R$34,90/mês ilimitado</span>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 32, flexWrap: 'wrap' }}>
          <Link href="/gerar" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 24px', borderRadius: 10, background: 'var(--blue)', color: '#fff', fontSize: 14, fontWeight: 600, boxShadow: '0 0 20px var(--glow)' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14"/></svg>
            Novo documento
          </Link>
          <Link href="/chat" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 24px', borderRadius: 10, background: 'rgba(6,182,212,0.1)', border: '1px solid rgba(6,182,212,0.3)', color: 'var(--cyan)', fontSize: 14, fontWeight: 600 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            Consulta Juridica
          </Link>
          {!isMensal && (
            <button onClick={assinarMensal} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 24px', borderRadius: 10, background: 'rgba(59,130,246,0.1)', border: '1px solid var(--border-strong)', color: 'var(--blue-light)', fontSize: 14, fontWeight: 600 }}>
              Assinar Mensal — R$34,90/mes
            </button>
          )}
        </div>

        {/* Documents list */}
        <h2 style={{ fontSize: 20, marginBottom: 16 }}>Seus documentos</h2>
        {docs.length === 0 ? (
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: 48, textAlign: 'center' }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>📄</div>
            <p style={{ color: 'var(--text2)', fontSize: 15, marginBottom: 16 }}>Nenhum documento gerado ainda</p>
            <Link href="/gerar" style={{ fontSize: 14, color: 'var(--blue-light)', fontWeight: 600 }}>Criar primeiro documento</Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {docs.map(doc => (
              <div key={doc.id} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{doc.tipo_nome}</div>
                  <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 2 }}>
                    {new Date(doc.criado_em).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 8px', borderRadius: 99, background: doc.pago ? 'rgba(34,197,94,0.12)' : 'rgba(245,158,11,0.12)', color: doc.pago ? 'var(--green)' : '#f59e0b' }}>
                    {doc.pago ? 'Pago' : 'Preview'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default function PainelPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div style={{ width: 40, height: 40, borderRadius: '50%', border: '3px solid var(--border)', borderTopColor: 'var(--blue)', animation: 'spin 1s linear infinite' }} /><style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style></div>}>
      <PainelContent />
    </Suspense>
  )
}
