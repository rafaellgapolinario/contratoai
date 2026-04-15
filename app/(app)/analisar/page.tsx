'use client'
import { useState, useRef } from 'react'
import Link from 'next/link'

interface Problema { titulo: string; severidade: string; descricao: string; sugestao: string }
interface ClausulaOk { titulo: string; descricao: string }
interface Ausente { titulo: string; importancia: string; descricao: string }
interface Analise {
  score: number; nivel: string; resumo: string
  clausulas_ok: ClausulaOk[]; problemas: Problema[]; ausentes: Ausente[]
  sugestoes_gerais: string[]
}

const sevColor: Record<string, string> = {
  CRITICA: '#ef4444', ALTA: '#f97316', MEDIA: '#f59e0b', BAIXA: '#22c55e',
  CRITICO: '#ef4444', ALTO: '#f97316', MEDIO: '#f59e0b', BAIXO: '#22c55e',
}

function ScoreRing({ score, nivel }: { score: number; nivel: string }) {
  const r = 54, c = 2 * Math.PI * r, offset = c - (score / 100) * c
  const color = score >= 80 ? '#22c55e' : score >= 60 ? '#f59e0b' : score >= 40 ? '#f97316' : '#ef4444'
  return (
    <div style={{ position: 'relative', width: 140, height: 140, margin: '0 auto' }}>
      <svg width="140" height="140" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r={r} fill="none" stroke="var(--border)" strokeWidth="8" />
        <circle cx="60" cy="60" r={r} fill="none" stroke={color} strokeWidth="8" strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={offset} transform="rotate(-90 60 60)" style={{ transition: 'stroke-dashoffset 1s ease' }} />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontSize: 36, fontWeight: 800, fontFamily: "'Space Grotesk',sans-serif", color }}>{score}</span>
        <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text3)', textTransform: 'uppercase' }}>{nivel}</span>
      </div>
    </div>
  )
}

export default function AnalisarPage() {
  const [step, setStep] = useState<'upload' | 'loading' | 'result'>('upload')
  const [analise, setAnalise] = useState<Analise | null>(null)
  const [error, setError] = useState('')
  const [textMode, setTextMode] = useState(false)
  const [textInput, setTextInput] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  const getToken = () => typeof window !== 'undefined' ? localStorage.getItem('cai_token') : null

  const analisar = async (form: FormData) => {
    setStep('loading')
    setError('')
    try {
      const res = await fetch('/api/analisar', {
        method: 'POST',
        headers: { Authorization: `Bearer ${getToken()}` },
        body: form,
      })
      const data = await res.json()
      if (data.limit) { setError(data.error); setStep('upload'); return }
      if (data.error) { setError(data.error); setStep('upload'); return }
      setAnalise(data.analise)
      setStep('result')
    } catch {
      setError('Erro de conexao')
      setStep('upload')
    }
  }

  const handleFile = (file: File) => {
    const form = new FormData()
    form.append('file', file)
    analisar(form)
  }

  const handleText = () => {
    if (!textInput.trim()) { setError('Cole o contrato'); return }
    const form = new FormData()
    form.append('text', textInput)
    analisar(form)
  }

  return (
    <div style={{ padding: '32px 24px', maxWidth: 900, margin: '0 auto' }}>
      <h1 style={{ fontSize: 24, fontFamily: "'Space Grotesk',sans-serif", marginBottom: 8 }}>Analise de Risco</h1>
      <p style={{ fontSize: 14, color: 'var(--text2)', marginBottom: 32 }}>Suba um contrato e a IA identifica clausulas abusivas, riscos e o que esta faltando.</p>

      {/* Upload */}
      {step === 'upload' && (
        <div>
          {error && (
            <div style={{ padding: '12px 16px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 10, color: '#f87171', fontSize: 13, marginBottom: 16 }}>
              {error}
              {error.includes('plano mensal') && <Link href="/painel" style={{ display: 'block', marginTop: 6, color: 'var(--blue-light)', fontWeight: 600 }}>Assinar plano mensal</Link>}
            </div>
          )}

          <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
            <button onClick={() => setTextMode(false)} style={{ padding: '8px 16px', borderRadius: 8, background: !textMode ? 'var(--blue)' : 'var(--surface)', color: !textMode ? '#fff' : 'var(--text2)', border: '1px solid var(--border)', fontSize: 13, fontWeight: 600 }}>Upload PDF</button>
            <button onClick={() => setTextMode(true)} style={{ padding: '8px 16px', borderRadius: 8, background: textMode ? 'var(--blue)' : 'var(--surface)', color: textMode ? '#fff' : 'var(--text2)', border: '1px solid var(--border)', fontSize: 13, fontWeight: 600 }}>Colar texto</button>
          </div>

          {!textMode ? (
            <div>
              <input ref={fileRef} type="file" accept=".pdf,.txt,.doc" style={{ display: 'none' }} onChange={e => { if (e.target.files?.[0]) handleFile(e.target.files[0]) }} />
              <button onClick={() => fileRef.current?.click()} style={{ width: '100%', padding: '60px 20px', borderRadius: 14, border: '2px dashed var(--border)', background: 'transparent', color: 'var(--text2)', fontSize: 15, cursor: 'pointer' }}>
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ margin: '0 auto 16px', display: 'block', opacity: 0.4 }}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                Arraste ou clique para enviar seu contrato (PDF ou TXT)
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <textarea value={textInput} onChange={e => setTextInput(e.target.value)} placeholder="Cole o texto do contrato aqui..." rows={12} style={{ padding: '14px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, color: 'var(--text)', fontSize: 14, resize: 'vertical' }} />
              <button onClick={handleText} disabled={!textInput.trim()} style={{ padding: '14px', borderRadius: 10, background: 'var(--blue)', color: '#fff', fontSize: 15, fontWeight: 700, fontFamily: "'Space Grotesk',sans-serif", opacity: textInput.trim() ? 1 : 0.5 }}>
                Analisar contrato
              </button>
            </div>
          )}
        </div>
      )}

      {/* Loading */}
      {step === 'loading' && (
        <div style={{ textAlign: 'center', padding: '80px 0' }}>
          <div style={{ width: 64, height: 64, margin: '0 auto 24px', borderRadius: '50%', border: '3px solid var(--border)', borderTopColor: 'var(--blue)', animation: 'spin 1s linear infinite' }} />
          <h3 style={{ fontSize: 20, marginBottom: 8 }}>Analisando seu contrato...</h3>
          <p style={{ fontSize: 14, color: 'var(--text2)' }}>A IA esta verificando clausulas, riscos e conformidade legal.</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
        </div>
      )}

      {/* Result */}
      {step === 'result' && analise && (
        <div>
          <button onClick={() => { setStep('upload'); setAnalise(null); setTextInput(''); setError('') }} style={{ fontSize: 13, color: 'var(--blue-light)', fontWeight: 600, marginBottom: 24 }}>
            ← Nova analise
          </button>

          {/* Score */}
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: 32, marginBottom: 24, textAlign: 'center' }}>
            <ScoreRing score={analise.score} nivel={analise.nivel} />
            <p style={{ fontSize: 15, color: 'var(--text2)', marginTop: 16, maxWidth: 500, margin: '16px auto 0', lineHeight: 1.7 }}>{analise.resumo}</p>
          </div>

          {/* Problemas */}
          {analise.problemas?.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <h2 style={{ fontSize: 18, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                Problemas encontrados ({analise.problemas.length})
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {analise.problemas.map((p, i) => (
                  <div key={i} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: '16px 20px', borderLeft: `3px solid ${sevColor[p.severidade] || '#f59e0b'}` }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                      <span style={{ fontWeight: 700, fontSize: 14 }}>{p.titulo}</span>
                      <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 99, background: `${sevColor[p.severidade] || '#f59e0b'}20`, color: sevColor[p.severidade] || '#f59e0b' }}>{p.severidade}</span>
                    </div>
                    <p style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.6, marginBottom: 8 }}>{p.descricao}</p>
                    <div style={{ fontSize: 13, color: 'var(--cyan)', background: 'rgba(6,182,212,0.06)', padding: '8px 12px', borderRadius: 8 }}>
                      <strong>Sugestao:</strong> {p.sugestao}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Ausentes */}
          {analise.ausentes?.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <h2 style={{ fontSize: 18, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                Clausulas ausentes ({analise.ausentes.length})
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {analise.ausentes.map((a, i) => (
                  <div key={i} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: '14px 20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <span style={{ fontWeight: 700, fontSize: 14 }}>{a.titulo}</span>
                      <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 99, background: `${sevColor[a.importancia] || '#f59e0b'}20`, color: sevColor[a.importancia] || '#f59e0b' }}>{a.importancia}</span>
                    </div>
                    <p style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.6 }}>{a.descricao}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Clausulas OK */}
          {analise.clausulas_ok?.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <h2 style={{ fontSize: 18, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                Clausulas em conformidade ({analise.clausulas_ok.length})
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {analise.clausulas_ok.map((c, i) => (
                  <div key={i} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, padding: '12px 16px', borderLeft: '3px solid #22c55e' }}>
                    <span style={{ fontWeight: 600, fontSize: 13 }}>{c.titulo}</span>
                    <span style={{ fontSize: 12, color: 'var(--text3)', marginLeft: 8 }}>{c.descricao}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Sugestoes gerais */}
          {analise.sugestoes_gerais?.length > 0 && (
            <div style={{ background: 'rgba(59,130,246,0.06)', border: '1px solid var(--border)', borderRadius: 14, padding: 20 }}>
              <h3 style={{ fontSize: 15, marginBottom: 12 }}>Sugestoes gerais</h3>
              <ul style={{ margin: 0, paddingLeft: 20 }}>
                {analise.sugestoes_gerais.map((s, i) => (
                  <li key={i} style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 6, lineHeight: 1.6 }}>{s}</li>
                ))}
              </ul>
            </div>
          )}

          <p style={{ fontSize: 11, color: 'var(--text3)', marginTop: 24, fontStyle: 'italic' }}>
            Esta analise foi gerada por inteligencia artificial e nao substitui a consulta a um advogado.
          </p>
        </div>
      )}
    </div>
  )
}
