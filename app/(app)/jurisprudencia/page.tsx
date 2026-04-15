'use client'
import { useState } from 'react'
import Link from 'next/link'

const AREAS = ['', 'Civil', 'Trabalhista', 'Consumidor', 'Penal', 'Empresarial', 'Tributario', 'Administrativo', 'Constitucional', 'Familia']

const relColor: Record<string, string> = { ALTA: '#22c55e', MEDIA: '#f59e0b', BAIXA: '#6b7280' }

export default function JurisprudenciaPage() {
  const [tema, setTema] = useState('')
  const [area, setArea] = useState('')
  const [loading, setLoading] = useState(false)
  const [dados, setDados] = useState<any>(null)
  const [error, setError] = useState('')

  const getToken = () => typeof window !== 'undefined' ? localStorage.getItem('cai_token') : null

  const pesquisar = async () => {
    if (!tema.trim()) { setError('Informe o tema'); return }
    setLoading(true); setError(''); setDados(null)
    try {
      const res = await fetch('/api/jurisprudencia', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({ tema, area }),
      })
      const data = await res.json()
      if (data.limit) { setError(data.error); setLoading(false); return }
      if (data.error) { setError(data.error); setLoading(false); return }
      setDados(data.dados)
    } catch { setError('Erro de conexao') }
    setLoading(false)
  }

  return (
    <div style={{ padding: '32px 24px', maxWidth: 900, margin: '0 auto' }}>
      <h1 style={{ fontSize: 24, fontFamily: "'Space Grotesk',sans-serif", marginBottom: 8 }}>Pesquisa de Jurisprudencia</h1>
      <p style={{ fontSize: 14, color: 'var(--text2)', marginBottom: 32 }}>Pesquise decisoes dos tribunais brasileiros por tema. A IA encontra jurisprudencia relevante do STF, STJ e tribunais estaduais.</p>

      {/* Search */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: 24, marginBottom: 32 }}>
        {error && <div style={{ padding: '10px 14px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, color: '#f87171', fontSize: 13, marginBottom: 16 }}>
          {error}
          {error.includes('plano mensal') && <Link href="/painel" style={{ display: 'block', marginTop: 6, color: 'var(--blue-light)', fontWeight: 600 }}>Assinar plano mensal</Link>}
        </div>}

        <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
          <input value={tema} onChange={e => setTema(e.target.value)} onKeyDown={e => e.key === 'Enter' && pesquisar()} placeholder="Ex: rescisao contratual por inadimplencia, dano moral no trabalho, clausula abusiva CDC..." style={{ flex: 1, padding: '14px 16px', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 10, color: 'var(--text)', fontSize: 14 }} />
          <select value={area} onChange={e => setArea(e.target.value)} style={{ padding: '14px 16px', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 10, color: 'var(--text)', fontSize: 14, minWidth: 150 }}>
            <option value="">Todas as areas</option>
            {AREAS.filter(Boolean).map(a => <option key={a} value={a}>{a}</option>)}
          </select>
        </div>
        <button onClick={pesquisar} disabled={loading || !tema.trim()} style={{ width: '100%', padding: '14px', borderRadius: 10, background: 'var(--blue)', color: '#fff', fontSize: 15, fontWeight: 700, fontFamily: "'Space Grotesk',sans-serif", opacity: loading || !tema.trim() ? 0.5 : 1 }}>
          {loading ? 'Pesquisando...' : 'Pesquisar jurisprudencia'}
        </button>
      </div>

      {/* Loading */}
      {loading && (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <div style={{ width: 48, height: 48, margin: '0 auto 20px', borderRadius: '50%', border: '3px solid var(--border)', borderTopColor: 'var(--blue)', animation: 'spin 1s linear infinite' }} />
          <p style={{ color: 'var(--text2)', fontSize: 14 }}>Pesquisando nos tribunais brasileiros...</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
        </div>
      )}

      {/* Results */}
      {dados && !loading && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <h2 style={{ fontSize: 18 }}>{dados.total_resultados || dados.decisoes?.length || 0} decisoes encontradas</h2>
            <button onClick={() => { setDados(null); setTema('') }} style={{ fontSize: 13, color: 'var(--blue-light)', fontWeight: 600 }}>Nova pesquisa</button>
          </div>

          {/* Orientacao geral */}
          {dados.orientacao_geral && (
            <div style={{ padding: '16px 20px', background: 'rgba(59,130,246,0.06)', border: '1px solid var(--border)', borderRadius: 12, marginBottom: 24 }}>
              <h3 style={{ fontSize: 14, marginBottom: 6, color: 'var(--blue-light)' }}>Orientacao predominante</h3>
              <p style={{ fontSize: 14, color: 'var(--text2)', lineHeight: 1.7 }}>{dados.orientacao_geral}</p>
            </div>
          )}

          {/* Sumulas */}
          {dados.sumula_relacionada?.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <h3 style={{ fontSize: 15, marginBottom: 10 }}>Sumulas relacionadas</h3>
              {dados.sumula_relacionada.map((s: any, i: number) => (
                <div key={i} style={{ padding: '12px 16px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, marginBottom: 8, borderLeft: '3px solid var(--blue)' }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--blue-light)' }}>Sumula {s.numero} — {s.tribunal}</span>
                  <p style={{ fontSize: 13, color: 'var(--text2)', marginTop: 4, lineHeight: 1.6 }}>{s.texto}</p>
                </div>
              ))}
            </div>
          )}

          {/* Decisoes */}
          <h3 style={{ fontSize: 15, marginBottom: 10 }}>Decisoes</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {dados.decisoes?.map((d: any, i: number) => (
              <div key={i} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: '18px 20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 12, fontWeight: 700, padding: '2px 10px', borderRadius: 99, background: 'rgba(59,130,246,0.12)', color: 'var(--blue-light)' }}>{d.tribunal}</span>
                  <span style={{ fontSize: 12, color: 'var(--text3)' }}>{d.tipo}</span>
                  <span style={{ fontSize: 12, color: 'var(--text3)' }}>{d.numero}</span>
                  <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 99, background: `${relColor[d.relevancia] || '#6b7280'}15`, color: relColor[d.relevancia] || '#6b7280', marginLeft: 'auto' }}>{d.relevancia}</span>
                </div>
                <p style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 8 }}>Rel. {d.relator} — {d.data}</p>
                <p style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.7, marginBottom: 10 }}><strong>Ementa:</strong> {d.ementa}</p>
                {d.tese && <p style={{ fontSize: 13, color: 'var(--cyan)', lineHeight: 1.6, padding: '8px 12px', background: 'rgba(6,182,212,0.06)', borderRadius: 8 }}><strong>Tese:</strong> {d.tese}</p>}
                {d.aplicacao && <p style={{ fontSize: 12, color: 'var(--text3)', marginTop: 8, fontStyle: 'italic' }}>{d.aplicacao}</p>}
              </div>
            ))}
          </div>

          <p style={{ fontSize: 11, color: 'var(--text3)', marginTop: 24, fontStyle: 'italic' }}>
            Resultados gerados por IA com base no conhecimento juridico disponivel. Sempre verifique nos sites oficiais dos tribunais.
          </p>
        </div>
      )}
    </div>
  )
}
