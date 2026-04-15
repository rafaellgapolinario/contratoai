'use client'
import { useState, useEffect } from 'react'

interface Tese { id: string; area: string; titulo: string; fundamentacao: string; legislacao: string[]; jurisprudencia: string[]; tags: string[] }

const AREAS_DEFAULT = ['Civil', 'Trabalhista', 'Consumidor', 'Penal', 'Empresarial', 'Tributario', 'Familia', 'Constitucional']

export default function TesesPage() {
  const [teses, setTeses] = useState<Tese[]>([])
  const [areas, setAreas] = useState<string[]>(AREAS_DEFAULT)
  const [areaFilter, setAreaFilter] = useState('')
  const [busca, setBusca] = useState('')
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [gerando, setGerando] = useState(false)
  const [gerarTema, setGerarTema] = useState('')

  const getToken = () => typeof window !== 'undefined' ? localStorage.getItem('cai_token') : null

  const fetchTeses = async (area?: string, q?: string) => {
    setLoading(true)
    const params = new URLSearchParams()
    if (area) params.set('area', area)
    if (q) params.set('q', q)
    try {
      const res = await fetch(`/api/teses?${params}`)
      const data = await res.json()
      setTeses(data.teses || [])
      if (data.areas?.length) setAreas([...new Set([...AREAS_DEFAULT, ...data.areas])])
    } catch {}
    setLoading(false)
  }

  useEffect(() => { fetchTeses() }, [])

  const handleFilter = (area: string) => { setAreaFilter(area); fetchTeses(area, busca) }
  const handleSearch = () => { fetchTeses(areaFilter, busca) }

  const gerarTese = async () => {
    if (!gerarTema.trim()) return
    setGerando(true)
    try {
      const res = await fetch('/api/teses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({ tema: gerarTema, area: areaFilter }),
      })
      const data = await res.json()
      if (data.ok) { setGerarTema(''); fetchTeses(areaFilter, busca) }
    } catch {}
    setGerando(false)
  }

  return (
    <div style={{ padding: '32px 24px', maxWidth: 900, margin: '0 auto' }}>
      <h1 style={{ fontSize: 24, fontFamily: "'Space Grotesk',sans-serif", marginBottom: 8 }}>Base de Teses Juridicas</h1>
      <p style={{ fontSize: 14, color: 'var(--text2)', marginBottom: 24 }}>Catalogo de teses juridicas com fundamentacao, legislacao e jurisprudencia. Use como base para seus documentos.</p>

      {/* Search + filter */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
        <input value={busca} onChange={e => setBusca(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSearch()} placeholder="Buscar teses..." style={{ flex: 1, minWidth: 200, padding: '10px 14px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text)', fontSize: 14 }} />
        <button onClick={handleSearch} style={{ padding: '10px 20px', borderRadius: 8, background: 'var(--blue)', color: '#fff', fontSize: 13, fontWeight: 600 }}>Buscar</button>
      </div>

      {/* Area pills */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 24 }}>
        <button onClick={() => handleFilter('')} style={{ padding: '6px 14px', borderRadius: 99, fontSize: 12, fontWeight: 600, background: !areaFilter ? 'var(--blue)' : 'var(--surface)', color: !areaFilter ? '#fff' : 'var(--text2)', border: '1px solid var(--border)' }}>Todas</button>
        {areas.map(a => (
          <button key={a} onClick={() => handleFilter(a)} style={{ padding: '6px 14px', borderRadius: 99, fontSize: 12, fontWeight: 600, background: areaFilter === a ? 'var(--blue)' : 'var(--surface)', color: areaFilter === a ? '#fff' : 'var(--text2)', border: '1px solid var(--border)' }}>{a}</button>
        ))}
      </div>

      {/* Gerar tese */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        <input value={gerarTema} onChange={e => setGerarTema(e.target.value)} onKeyDown={e => e.key === 'Enter' && gerarTese()} placeholder="Gerar nova tese sobre... (ex: rescisao por inadimplencia)" style={{ flex: 1, padding: '10px 14px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text)', fontSize: 13 }} />
        <button onClick={gerarTese} disabled={gerando || !gerarTema.trim()} style={{ padding: '10px 16px', borderRadius: 8, background: 'var(--cyan)', color: '#fff', fontSize: 13, fontWeight: 600, opacity: gerando ? 0.5 : 1, whiteSpace: 'nowrap' }}>
          {gerando ? 'Gerando...' : 'Gerar com IA'}
        </button>
      </div>

      {/* Teses list */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 40, color: 'var(--text3)' }}>Carregando...</div>
      ) : teses.length === 0 ? (
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: 48, textAlign: 'center' }}>
          <p style={{ color: 'var(--text2)', fontSize: 15 }}>Nenhuma tese encontrada</p>
          <p style={{ color: 'var(--text3)', fontSize: 13, marginTop: 8 }}>Use o campo acima para gerar teses com IA ou ajuste os filtros</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <p style={{ fontSize: 13, color: 'var(--text3)' }}>{teses.length} tese{teses.length !== 1 ? 's' : ''} encontrada{teses.length !== 1 ? 's' : ''}</p>
          {teses.map(t => (
            <div key={t.id} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
              <button onClick={() => setExpanded(expanded === t.id ? null : t.id)} style={{ width: '100%', padding: '16px 20px', textAlign: 'left', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 10px', borderRadius: 99, background: 'rgba(59,130,246,0.12)', color: 'var(--blue-light)' }}>{t.area}</span>
                  </div>
                  <span style={{ fontWeight: 600, fontSize: 14, color: 'var(--text)' }}>{t.titulo}</span>
                  {t.tags?.length > 0 && (
                    <div style={{ display: 'flex', gap: 4, marginTop: 6, flexWrap: 'wrap' }}>
                      {t.tags.slice(0, 4).map((tag, i) => <span key={i} style={{ fontSize: 10, padding: '1px 6px', borderRadius: 99, background: 'rgba(255,255,255,0.04)', color: 'var(--text3)' }}>{tag}</span>)}
                    </div>
                  )}
                </div>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text3)" strokeWidth="2" style={{ flexShrink: 0, marginTop: 4, transform: expanded === t.id ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}><polyline points="6 9 12 15 18 9"/></svg>
              </button>

              {expanded === t.id && (
                <div style={{ padding: '0 20px 20px', borderTop: '1px solid var(--border)' }}>
                  <div style={{ padding: '16px 0' }}>
                    <h4 style={{ fontSize: 13, color: 'var(--text3)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>Fundamentacao</h4>
                    <p style={{ fontSize: 14, color: 'var(--text2)', lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>{t.fundamentacao}</p>
                  </div>
                  {t.legislacao?.length > 0 && (
                    <div style={{ marginBottom: 12 }}>
                      <h4 style={{ fontSize: 13, color: 'var(--text3)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>Legislacao</h4>
                      <ul style={{ margin: 0, paddingLeft: 18 }}>
                        {t.legislacao.map((l, i) => <li key={i} style={{ fontSize: 13, color: 'var(--blue-light)', marginBottom: 4 }}>{l}</li>)}
                      </ul>
                    </div>
                  )}
                  {t.jurisprudencia?.length > 0 && (
                    <div>
                      <h4 style={{ fontSize: 13, color: 'var(--text3)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>Jurisprudencia</h4>
                      <ul style={{ margin: 0, paddingLeft: 18 }}>
                        {t.jurisprudencia.map((j, i) => <li key={i} style={{ fontSize: 13, color: 'var(--cyan)', marginBottom: 4 }}>{j}</li>)}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
