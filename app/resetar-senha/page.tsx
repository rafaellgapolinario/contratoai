'use client'
import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'

function ResetarSenhaContent() {
  const [token, setToken] = useState('')
  const [email, setEmail] = useState<string | null>(null)
  const [valid, setValid] = useState<'checking' | 'valid' | 'invalid'>('checking')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [ok, setOk] = useState(false)
  const [error, setError] = useState('')
  const searchParams = useSearchParams()
  const router = useRouter()

  useEffect(() => {
    const t = searchParams.get('token') || ''
    setToken(t)
    if (!t) { setValid('invalid'); return }
    fetch('/api/auth/reset-password?token=' + encodeURIComponent(t))
      .then(r => r.json())
      .then(d => {
        if (d.valid) { setValid('valid'); setEmail(d.email) }
        else setValid('invalid')
      })
      .catch(() => setValid('invalid'))
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password.length < 6) { setError('Senha precisa ter ao menos 6 caracteres'); return }
    if (password !== confirmPassword) { setError('As senhas nao coincidem'); return }
    setError(''); setLoading(true)
    try {
      const r = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      })
      const d = await r.json()
      if (!r.ok) setError(d.error || 'Erro ao redefinir senha')
      else {
        setOk(true)
        setTimeout(() => router.push('/login'), 2000)
      }
    } catch { setError('Erro de conexao') }
    setLoading(false)
  }

  if (valid === 'checking') {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 40, height: 40, borderRadius: '50%', border: '3px solid var(--border)', borderTopColor: 'var(--blue)', animation: 'spin 1s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      </div>
    )
  }

  if (valid === 'invalid') {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
        <div style={{ width: '100%', maxWidth: 420, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: 32, textAlign: 'center' }}>
          <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(239,68,68,.12)', margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
          </div>
          <h1 style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 22, marginBottom: 8 }}>Link invalido ou expirado</h1>
          <p style={{ color: 'var(--text2)', fontSize: 14, lineHeight: 1.7, marginBottom: 20 }}>
            Este link de redefinicao nao eh mais valido. Links expiram em 1 hora.
          </p>
          <Link href="/esqueci-senha" style={{ display: 'inline-block', padding: '12px 24px', borderRadius: 10, background: 'linear-gradient(135deg,var(--blue),var(--cyan))', color: '#fff', textDecoration: 'none', fontWeight: 600, fontSize: 14 }}>
            Solicitar novo link
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, background: 'var(--bg)' }}>
      <div style={{ width: '100%', maxWidth: 420, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: '32px 28px', boxShadow: '0 8px 40px rgba(0,0,0,.25)' }}>
        <h1 style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 24, marginBottom: 6 }}>Nova senha</h1>
        <p style={{ color: 'var(--text2)', fontSize: 14, marginBottom: 4, lineHeight: 1.6 }}>Crie uma nova senha para sua conta.</p>
        {email && <p style={{ color: 'var(--text3)', fontSize: 12, marginBottom: 20 }}>Conta: <b>{email}</b></p>}

        {ok ? (
          <div style={{ padding: '16px', background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.25)', borderRadius: 10, color: '#4ade80', fontSize: 14, textAlign: 'center' }}>
            Senha alterada com sucesso! Redirecionando pro login...
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <label style={{ fontSize: 13, color: 'var(--text2)', display: 'block', marginBottom: 6 }}>Nova senha</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Ao menos 6 caracteres"
              required
              minLength={6}
              style={{ width: '100%', padding: '12px 16px', background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 10, color: 'var(--text)', fontSize: 14, marginBottom: 14 }}
            />
            <label style={{ fontSize: 13, color: 'var(--text2)', display: 'block', marginBottom: 6 }}>Confirme a nova senha</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              placeholder="Digite de novo"
              required
              style={{ width: '100%', padding: '12px 16px', background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 10, color: 'var(--text)', fontSize: 14, marginBottom: 14 }}
            />

            {error && (
              <div style={{ padding: '10px 14px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 10, color: '#f87171', fontSize: 13, marginBottom: 12 }}>{error}</div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{ width: '100%', padding: '13px 20px', borderRadius: 10, background: 'linear-gradient(135deg,var(--blue),var(--cyan))', color: '#fff', fontSize: 14, fontWeight: 600, border: 'none', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.6 : 1 }}
            >
              {loading ? 'Salvando...' : 'Salvar nova senha'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

export default function ResetarSenhaPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh' }} />}>
      <ResetarSenhaContent />
    </Suspense>
  )
}
