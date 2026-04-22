'use client'
import { useState } from 'react'
import Link from 'next/link'

export default function EsqueciSenhaPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [ok, setOk] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) { setError('Informe seu email'); return }
    setError(''); setOk(''); setLoading(true)
    try {
      const r = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const d = await r.json()
      if (!r.ok) setError(d.error || 'Erro ao enviar email')
      else setOk(d.message || 'Se o email estiver cadastrado, voce vai receber um link em instantes.')
    } catch {
      setError('Erro de conexao')
    }
    setLoading(false)
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, background: 'var(--bg)' }}>
      <div style={{ width: '100%', maxWidth: 420, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: '32px 28px', boxShadow: '0 8px 40px rgba(0,0,0,.25)' }}>
        <Link href="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--text3)', marginBottom: 16 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          Voltar
        </Link>
        <h1 style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 24, marginBottom: 6 }}>Esqueceu a senha?</h1>
        <p style={{ color: 'var(--text2)', fontSize: 14, marginBottom: 20, lineHeight: 1.6 }}>
          Informe seu email. Se estiver cadastrado, a gente manda um link pra voce criar uma nova senha.
        </p>

        <form onSubmit={handleSubmit}>
          <label style={{ fontSize: 13, color: 'var(--text2)', display: 'block', marginBottom: 6 }}>Email</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="voce@email.com"
            required
            disabled={loading || !!ok}
            style={{ width: '100%', padding: '12px 16px', background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 10, color: 'var(--text)', fontSize: 14, marginBottom: 14 }}
          />

          {error && (
            <div style={{ padding: '10px 14px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 10, color: '#f87171', fontSize: 13, marginBottom: 12 }}>{error}</div>
          )}
          {ok && (
            <div style={{ padding: '10px 14px', background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.25)', borderRadius: 10, color: '#4ade80', fontSize: 13, marginBottom: 12 }}>{ok}</div>
          )}

          <button
            type="submit"
            disabled={loading || !!ok}
            style={{ width: '100%', padding: '13px 20px', borderRadius: 10, background: 'linear-gradient(135deg,var(--blue),var(--cyan))', color: '#fff', fontSize: 14, fontWeight: 600, border: 'none', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading || ok ? 0.6 : 1 }}
          >
            {loading ? 'Enviando...' : ok ? 'Email enviado' : 'Enviar link de redefinicao'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 18, fontSize: 13, color: 'var(--text3)' }}>
          Lembrou a senha? <Link href="/login" style={{ color: 'var(--blue-light)', fontWeight: 600 }}>Fazer login</Link>
        </p>
      </div>
    </div>
  )
}
