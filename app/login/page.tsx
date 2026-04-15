'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [nome, setNome] = useState('')
  const [aceitaTermos, setAceitaTermos] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (mode === 'signup' && !aceitaTermos) {
      setError('Voce precisa aceitar os Termos de Uso e a Politica de Privacidade para criar sua conta.')
      return
    }
    setError('')
    setLoading(true)
    try {
      const endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/signup'
      const body = mode === 'login' ? { email, password } : { email, password, nome }
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (data.error) { setError(data.error); setLoading(false); return }
      localStorage.setItem('cai_token', data.token)
      localStorage.setItem('cai_user', JSON.stringify(data.user))
      window.location.href = '/painel'
      return
    } catch {
      setError('Erro de conexao. Verifique sua internet e tente novamente.')
    }
    setLoading(false)
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, background: 'var(--bg)' }}>
      <div style={{ width: '100%', maxWidth: 400 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, marginBottom: 32 }}>
          <Link href="/" style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--surface)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text2)', flexShrink: 0 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          </Link>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg,var(--blue),var(--cyan))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 700, color: '#fff' }}>C</div>
            <span style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 22 }}>ContratoAI</span>
          </Link>
        </div>

        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: 32 }}>
          <div style={{ display: 'flex', marginBottom: 24, borderRadius: 10, overflow: 'hidden', border: '1px solid var(--border)' }}>
            {(['login', 'signup'] as const).map(m => (
              <button key={m} onClick={() => { setMode(m); setError('') }} style={{
                flex: 1, padding: '10px 0', fontSize: 14, fontWeight: 600,
                background: mode === m ? 'var(--blue)' : 'transparent',
                color: mode === m ? '#fff' : 'var(--text2)',
                transition: 'all 0.2s',
              }}>
                {m === 'login' ? 'Entrar' : 'Criar conta'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {mode === 'signup' && (
              <div>
                <label style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 4, display: 'block' }}>Nome</label>
                <input value={nome} onChange={e => setNome(e.target.value)} placeholder="Seu nome" style={{ width: '100%', padding: '12px 14px', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 10, color: 'var(--text)', fontSize: 14 }} />
              </div>
            )}
            <div>
              <label style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 4, display: 'block' }}>E-mail <span style={{ color: '#f87171' }}>*</span></label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="seu@email.com" style={{ width: '100%', padding: '12px 14px', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 10, color: 'var(--text)', fontSize: 14 }} />
            </div>
            <div>
              <label style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 4, display: 'block' }}>Senha <span style={{ color: '#f87171' }}>*</span></label>
              <div style={{ position: 'relative' }}>
                <input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} required minLength={6} placeholder="Minimo 6 caracteres" style={{ width: '100%', padding: '12px 14px', paddingRight: 44, background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 10, color: 'var(--text)', fontSize: 14 }} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', padding: '4px 8px', color: 'var(--text3)', fontSize: 12 }}>
                  {showPassword ? 'Ocultar' : 'Ver'}
                </button>
              </div>
            </div>

            {mode === 'signup' && (
              <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer', marginTop: 4 }}>
                <input
                  type="checkbox"
                  checked={aceitaTermos}
                  onChange={e => setAceitaTermos(e.target.checked)}
                  style={{ marginTop: 3, accentColor: 'var(--blue)', width: 16, height: 16, flexShrink: 0 }}
                />
                <span style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.5 }}>
                  Li e aceito os{' '}
                  <a href="/termos" target="_blank" style={{ color: 'var(--blue-light)', textDecoration: 'underline' }}>Termos de Uso</a>
                  {' '}e a{' '}
                  <a href="/privacidade" target="_blank" style={{ color: 'var(--blue-light)', textDecoration: 'underline' }}>Politica de Privacidade</a>.
                  <span style={{ display: 'block', marginTop: 4, fontSize: 12, color: 'var(--text3)' }}>
                    Documentos gerados por IA podem conter erros e devem ser revisados antes do uso.
                  </span>
                </span>
              </label>
            )}

            {error && <div style={{ padding: '10px 14px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, color: '#f87171', fontSize: 13 }}>{error}</div>}

            <button type="submit" disabled={loading || (mode === 'signup' && !aceitaTermos)} style={{
              padding: '14px', borderRadius: 10, background: 'var(--blue)', color: '#fff',
              fontSize: 15, fontWeight: 700, fontFamily: "'Space Grotesk',sans-serif",
              boxShadow: '0 0 24px var(--glow)', opacity: loading ? 0.6 : 1, marginTop: 4,
            }}>
              {loading ? 'Aguarde...' : mode === 'login' ? 'Entrar' : 'Criar conta'}
            </button>
          </form>
        </div>

        <p style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: 'var(--text3)' }}>
          {mode === 'login' ? 'Não tem conta? ' : 'Já tem conta? '}
          <button onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError('') }} style={{ color: 'var(--blue-light)', fontWeight: 600, fontSize: 13 }}>
            {mode === 'login' ? 'Criar conta grátis' : 'Fazer login'}
          </button>
        </p>
      </div>
    </div>
  )
}
