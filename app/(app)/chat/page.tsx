'use client'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface Message {
  id?: string
  role: 'user' | 'assistant'
  content: string
  sources?: string[]
  criado_em?: string
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [loadingHistory, setLoadingHistory] = useState(true)
  const [error, setError] = useState('')
  const [userPlano, setUserPlano] = useState('free')
  const [planoExpira, setPlanoExpira] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  const getToken = () => typeof window !== 'undefined' ? localStorage.getItem('cai_token') : null
  const isMensal = userPlano === 'mensal' && !!planoExpira && new Date(planoExpira) > new Date()

  useEffect(() => {
    const token = getToken()
    if (!token) { router.push('/login'); return }

    // Carregar plano
    fetch('/api/auth/me', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => {
        if (d.error) { router.push('/login'); return }
        setUserPlano(d.user.plano || 'free')
        setPlanoExpira(d.user.plano_expira || null)
      })

    // Carregar historico
    fetch('/api/chat', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => setMessages(d.messages || []))
      .finally(() => setLoadingHistory(false))
  }, [router])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async () => {
    if (!input.trim() || loading) return
    const question = input.trim()
    setInput('')
    setError('')
    setMessages(prev => [...prev, { role: 'user', content: question }])
    setLoading(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({ question }),
      })
      const data = await res.json()

      if (data.limit) {
        setError(data.error)
        setMessages(prev => prev.slice(0, -1)) // remove a pergunta
        setLoading(false)
        return
      }

      if (data.error) {
        setError(data.error)
        setLoading(false)
        return
      }

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.answer,
        sources: data.sources,
      }])
    } catch {
      setError('Erro de conexao')
    }
    setLoading(false)
  }

  const clearHistory = async () => {
    if (!confirm('Limpar todo o historico de conversa?')) return
    await fetch('/api/chat', { method: 'DELETE', headers: { Authorization: `Bearer ${getToken()}` } })
    setMessages([])
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>
      <style>{`
        .chat-msg { max-width: 85%; padding: 14px 18px; border-radius: 16px; font-size: 14px; line-height: 1.7; white-space: pre-wrap; word-break: break-word; }
        .chat-user { background: var(--blue); color: #fff; border-bottom-right-radius: 4px; align-self: flex-end; }
        .chat-bot { background: var(--surface); border: 1px solid var(--border); color: var(--text); border-bottom-left-radius: 4px; align-self: flex-start; }
        .chat-sources { display: flex; gap: 6px; flex-wrap: wrap; margin-top: 8px; }
        .chat-sources span { font-size: 11px; padding: 2px 8px; border-radius: 99px; background: rgba(59,130,246,0.1); color: var(--blue-light); }
        @media(max-width:768px) { .chat-msg { max-width: 95%; } }
      `}</style>

      {/* Header */}
      <div style={{ height: 52, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
        <h1 style={{ fontSize: 16, fontFamily: "'Space Grotesk',sans-serif" }}>Consulta Juridica</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {!isMensal && (
            <span style={{ fontSize: 11, color: 'var(--text3)', padding: '3px 8px', borderRadius: 99, background: 'rgba(255,255,255,0.04)' }}>
              3 perguntas/dia
            </span>
          )}
          {messages.length > 0 && (
            <button
              onClick={clearHistory}
              title="Limpar todo o histórico de conversa"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 500, color: '#f87171', padding: '6px 12px', borderRadius: 8, border: '1px solid rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.08)', cursor: 'pointer' }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <polyline points="3 6 5 6 21 6"/>
                <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                <path d="M10 11v6M14 11v6"/>
                <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
              </svg>
              Limpar chat
            </button>
          )}
          </div>
        </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
        <div style={{ maxWidth: 800, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 16 }}>
          {loadingHistory ? (
            <div style={{ textAlign: 'center', padding: 40, color: 'var(--text3)' }}>Carregando...</div>
          ) : messages.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px' }}>
              <div style={{ width: 64, height: 64, borderRadius: 16, background: 'linear-gradient(135deg, rgba(59,130,246,0.12), rgba(6,182,212,0.12))', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--blue-light)" strokeWidth="1.5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              </div>
              <h2 style={{ fontSize: 20, fontFamily: "'Space Grotesk',sans-serif", marginBottom: 8 }}>Consulta Juridica com IA</h2>
              <p style={{ fontSize: 14, color: 'var(--text2)', maxWidth: 400, margin: '0 auto', lineHeight: 1.7 }}>
                Faca perguntas sobre os documentos juridicos disponiveis. A IA vai buscar nos documentos e responder com base no conteudo.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 24, maxWidth: 360, margin: '24px auto 0' }}>
                {['Quais sao os termos do contrato de prestacao de servico?', 'Qual a politica de reembolso?', 'Quais clausulas tratam de rescisao?'].map((q, i) => (
                  <button key={i} onClick={() => { setInput(q); }} style={{ padding: '10px 14px', borderRadius: 10, background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text2)', fontSize: 13, textAlign: 'left', cursor: 'pointer' }}>
                    {q}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((msg, i) => (
              <div key={i} style={{ display: 'flex', flexDirection: 'column' }}>
                <div className={`chat-msg ${msg.role === 'user' ? 'chat-user' : 'chat-bot'}`}>
                  {msg.content}
                  {msg.role === 'assistant' && msg.sources && msg.sources.length > 0 && (
                    <div className="chat-sources">
                      {msg.sources.map((s, j) => <span key={j}>{s}</span>)}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}

          {loading && (
            <div className="chat-msg chat-bot" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--blue)', animation: 'pulse 1s ease-in-out infinite' }} />
              <span style={{ color: 'var(--text3)', fontSize: 13 }}>Pesquisando nos documentos...</span>
              <style>{`@keyframes pulse { 0%,100% { opacity: 0.3 } 50% { opacity: 1 } }`}</style>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Error */}
      {error && (
        <div style={{ maxWidth: 800, margin: '0 auto', padding: '0 24px', width: '100%' }}>
          <div style={{ padding: '10px 14px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 10, color: '#f87171', fontSize: 13, marginBottom: 8 }}>
            {error}
            {error.includes('plano mensal') && (
              <Link href="/painel" style={{ display: 'block', marginTop: 6, color: 'var(--blue-light)', fontWeight: 600, fontSize: 13 }}>
                Assinar plano profissional — R$59,90/mes
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Input */}
      <div style={{ borderTop: '1px solid var(--border)', padding: '16px 24px', background: 'rgba(9,9,15,0.95)', backdropFilter: 'blur(20px)', flexShrink: 0 }}>
        <div style={{ maxWidth: 800, margin: '0 auto', display: 'flex', gap: 10 }}>
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && sendMessage()}
            placeholder="Faca uma pergunta juridica..."
            disabled={loading}
            style={{ flex: 1, padding: '14px 18px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, color: 'var(--text)', fontSize: 14 }}
          />
          <button
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            style={{ padding: '14px 20px', borderRadius: 12, background: 'var(--blue)', color: '#fff', fontSize: 14, fontWeight: 600, opacity: loading || !input.trim() ? 0.5 : 1 }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
          </button>
        </div>
        <p style={{ maxWidth: 800, margin: '8px auto 0', fontSize: 11, color: 'var(--text3)' }}>
          Respostas baseadas nos documentos disponiveis. Nao substitui assessoria juridica profissional.
        </p>
      </div>
    </div>
  )
}
