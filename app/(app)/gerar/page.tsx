'use client'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

const CATEGORIAS = [
  { label: 'Contratos', tipos: [
    { id: 'prestacao-servico', icon: '📋', title: 'Prestação de Serviço' },
    { id: 'parceria', icon: '🤝', title: 'Acordo de Parceria' },
    { id: 'confidencialidade', icon: '🔒', title: 'NDA / Confidencialidade' },
    { id: 'locacao', icon: '🏠', title: 'Contrato de Locação' },
    { id: 'venda', icon: '🛒', title: 'Compra e Venda' },
    { id: 'trabalho-freelancer', icon: '💻', title: 'Contrato Freelancer' },
    { id: 'contrato-social', icon: '🏢', title: 'Contrato Social (Empresa)' },
    { id: 'distrato', icon: '✂️', title: 'Distrato / Rescisão' },
  ]},
  { label: 'Pecas Judiciais', tipos: [
    { id: 'peticao-inicial', icon: '⚖️', title: 'Petição Inicial' },
    { id: 'contestacao', icon: '🛡️', title: 'Contestação' },
    { id: 'recurso-apelacao', icon: '📤', title: 'Recurso de Apelação' },
    { id: 'habeas-corpus', icon: '🔓', title: 'Habeas Corpus' },
  ]},
  { label: 'Documentos', tipos: [
    { id: 'notificacao-extrajudicial', icon: '📨', title: 'Notificação Extrajudicial' },
    { id: 'procuracao', icon: '📝', title: 'Procuração' },
    { id: 'declaracao', icon: '📄', title: 'Declaração' },
    { id: 'termos-uso', icon: '📱', title: 'Termos de Uso + Privacidade' },
    { id: 'recibo', icon: '🧾', title: 'Recibo de Pagamento' },
  ]},
  { label: 'Trabalhista', tipos: [
    { id: 'acordo-trabalhista', icon: '🤲', title: 'Acordo Trabalhista' },
    { id: 'carta-demissao', icon: '✉️', title: 'Carta de Demissão' },
  ]},
]

const TIPOS = CATEGORIAS.flatMap(c => c.tipos)

function GerarContent() {
  const searchParams = useSearchParams()
  const initialTipo = searchParams.get('tipo') || ''
  const initialModelo = searchParams.get('modelo') || ''

  const [step, setStep] = useState<'select' | 'form' | 'loading' | 'result'>(initialTipo || initialModelo ? 'form' : 'select')
  const [tipo, setTipo] = useState(initialTipo)
  const [modeloId, setModeloId] = useState<string | null>(initialModelo || null)
  const [campos, setCampos] = useState<string[]>([])
  const [respostas, setRespostas] = useState<string[]>([])
  const [contrato, setContrato] = useState('')
  const [tipoNome, setTipoNome] = useState('')
  const [error, setError] = useState('')
  const [docId, setDocId] = useState<string | null>(null)
  const [docPago, setDocPago] = useState(false)
  const [userPlano, setUserPlano] = useState<string>('free')
  const [planoExpira, setPlanoExpira] = useState<string | null>(null)
  const [checkingOut, setCheckingOut] = useState(false)
  const resultRef = useRef<HTMLDivElement>(null)

  const isMensal = userPlano === 'mensal' && !!planoExpira && new Date(planoExpira) > new Date()
  const canDownload = isMensal || docPago

  // Carrega plano do usuario
  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('cai_token') : null
    if (!token) return
    fetch('/api/auth/me', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => {
        if (d.user) {
          setUserPlano(d.user.plano || 'free')
          setPlanoExpira(d.user.plano_expira || null)
        }
      })
      .catch(() => {})
  }, [])

  const handleCheckout = async (plan: 'avulso' | 'mensal') => {
    const token = localStorage.getItem('cai_token')
    if (!token) { window.location.href = '/login'; return }
    setCheckingOut(true)
    try {
      const res = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ plan, document_id: plan === 'avulso' ? docId : undefined }),
      })
      const data = await res.json()
      if (data.init_point) {
        window.location.href = data.init_point
      } else {
        setError(data.error || 'Erro ao criar pagamento')
        setCheckingOut(false)
      }
    } catch {
      setError('Erro de conexão')
      setCheckingOut(false)
    }
  }

  useEffect(() => {
    if (modeloId) {
      // Carregar modelo personalizado
      const token = typeof window !== 'undefined' ? localStorage.getItem('cai_token') : null
      if (!token) return
      fetch(`/api/modelos`, { headers: { Authorization: `Bearer ${token}` } })
        .then(r => r.json())
        .then(d => {
          const m = d.modelos?.find((m: any) => m.id === modeloId)
          if (m) {
            setCampos(m.campos)
            setRespostas(new Array(m.campos.length).fill(''))
            setTipoNome(m.nome)
            setStep('form')
          }
        })
      return
    }
    if (!tipo) return
    fetch(`/api/gerar?tipo=${tipo}`)
      .then(r => r.json())
      .then(d => {
        if (d.campos) {
          setCampos(d.campos)
          setRespostas(new Array(d.campos.length).fill(''))
          setTipoNome(d.nome)
          setStep('form')
        }
      })
  }, [tipo, modeloId])

  const selectTipo = (id: string) => {
    setTipo(id)
    setModeloId(null)
    setError('')
  }

  const updateResposta = (i: number, val: string) => {
    setRespostas(prev => { const n = [...prev]; n[i] = val; return n })
  }

  const gerarContrato = async () => {
    if (respostas.some((r, i) => !r.trim() && i < 3)) {
      setError('Preencha pelo menos os 3 primeiros campos.')
      return
    }
    setStep('loading')
    setError('')
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' }
      const token = typeof window !== 'undefined' ? localStorage.getItem('cai_token') : null
      if (token) headers['Authorization'] = `Bearer ${token}`
      const res = await fetch('/api/gerar', {
        method: 'POST',
        headers,
        body: JSON.stringify({ tipo, respostas, modelo_id: modeloId }),
      })
      const data = await res.json()
      if (data.error) { setError(data.error); setStep('form'); return }
      setContrato(data.contrato)
      setTipoNome(data.tipo)
      if (data.docId) setDocId(data.docId)
      setDocPago(isMensal ? true : false)
      setStep('result')
    } catch {
      setError('Erro de conexão. Tente novamente.')
      setStep('form')
    }
  }

  return (
    <div style={{ minHeight: '100vh', padding: '32px 24px 40px' }}>
      <style>{`
        .field-input { width:100%; padding:12px 16px; background:var(--surface); border:1px solid var(--border); border-radius:10px; color:var(--text); font-size:14px; transition:all 0.2s; }
        .field-input:focus { border-color:var(--blue); box-shadow:0 0 0 3px rgba(59,130,246,0.15); outline:none; }
        .field-input::placeholder { color:var(--text3); }
        .tipo-btn { background:var(--surface); border:1px solid var(--border); border-radius:12px; padding:16px; cursor:pointer; transition:all 0.2s; text-align:left; display:flex; align-items:center; gap:12px; width:100%; }
        .tipo-btn:hover { border-color:var(--border-strong); background:var(--surface-hover); }
        @media(max-width:768px) { .tipo-grid{grid-template-columns:1fr!important} }
      `}</style>

      <div style={{ maxWidth: 700, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 24 }}>Gerar documento</h1>
          {tipoNome && step !== 'select' && <p style={{ fontSize: 13, color: 'var(--text2)', marginTop: 4 }}>{tipoNome}</p>}
        </div>

        {/* Step: Select tipo */}
        {step === 'select' && (
          <div>
            <p style={{ fontSize: 15, color: 'var(--text2)', marginBottom: 24 }}>Qual documento voce precisa?</p>
            {CATEGORIAS.map(cat => (
              <div key={cat.label} style={{ marginBottom: 24 }}>
                <h3 style={{ fontSize: 13, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>{cat.label}</h3>
                <div className="tipo-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 10 }}>
                  {cat.tipos.map(t => (
                    <button key={t.id} className="tipo-btn" onClick={() => selectTipo(t.id)}>
                      <span style={{ fontSize: 24 }}>{t.icon}</span>
                      <span style={{ fontWeight: 600, fontSize: 14 }}>{t.title}</span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Step: Form */}
        {step === 'form' && (
          <div>
            <p style={{ fontSize: 15, color: 'var(--text2)', marginBottom: 24 }}>Preencha as informações abaixo. A IA vai gerar seu documento personalizado.</p>
            {error && <div style={{ padding: '10px 16px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 10, color: '#f87171', fontSize: 13, marginBottom: 16 }}>{error}</div>}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {campos.map((campo, i) => (
                <div key={i}>
                  <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--text2)', marginBottom: 6, display: 'block' }}>
                    {campo} {i < 3 && <span style={{ color: '#f87171' }}>*</span>}
                  </label>
                  {campo.toLowerCase().includes('descrição') || campo.toLowerCase().includes('responsabilidades') || campo.toLowerCase().includes('entregáveis') || campo.toLowerCase().includes('dados coletados') ? (
                    <textarea
                      className="field-input"
                      rows={3}
                      value={respostas[i] || ''}
                      onChange={e => updateResposta(i, e.target.value)}
                      placeholder={`Informe: ${campo.toLowerCase()}`}
                      style={{ resize: 'vertical' }}
                    />
                  ) : (
                    <input
                      className="field-input"
                      value={respostas[i] || ''}
                      onChange={e => updateResposta(i, e.target.value)}
                      placeholder={`Informe: ${campo.toLowerCase()}`}
                    />
                  )}
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 12, marginTop: 32 }}>
              <button onClick={() => { setStep('select'); setTipo(''); setCampos([]); setRespostas([]) }} style={{ padding: '12px 24px', borderRadius: 10, background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text2)', fontSize: 14, fontWeight: 500 }}>Voltar</button>
              <button onClick={gerarContrato} style={{ flex: 1, padding: '14px 24px', borderRadius: 10, background: 'var(--blue)', color: '#fff', fontSize: 15, fontWeight: 700, fontFamily: "'Space Grotesk',sans-serif", boxShadow: '0 0 24px var(--glow)' }}>
                Gerar documento com IA
              </button>
            </div>
          </div>
        )}

        {/* Step: Loading */}
        {step === 'loading' && (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <div style={{ width: 64, height: 64, margin: '0 auto 24px', borderRadius: '50%', border: '3px solid var(--border)', borderTopColor: 'var(--blue)', animation: 'spin 1s linear infinite' }} />
            <h3 style={{ fontSize: 20, marginBottom: 8 }}>Gerando seu documento...</h3>
            <p style={{ fontSize: 14, color: 'var(--text2)' }}>A IA está redigindo as cláusulas. Pode levar até 30 segundos.</p>
            <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
          </div>
        )}

        {/* Step: Result */}
        {step === 'result' && (
          <ResultSection
            contrato={contrato}
            setContrato={setContrato}
            tipoNome={tipoNome}
            docId={docId}
            canDownload={canDownload}
            isMensal={isMensal}
            checkingOut={checkingOut}
            handleCheckout={handleCheckout}
            onNewDoc={() => { setStep('select'); setTipo(''); setCampos([]); setRespostas([]); setContrato(''); setDocId(null); setDocPago(false) }}
            error={error}
            setError={setError}
          />
        )}
      </div>
    </div>
  )
}

function SignatureSection({ docId }: { docId: string }) {
  const [open, setOpen] = useState(false)
  const [nome, setNome] = useState('')
  const [cpf, setCpf] = useState('')
  const [signing, setSigning] = useState(false)
  const [signed, setSigned] = useState<any>(null)
  const [sigError, setSigError] = useState('')
  const [assinaturas, setAssinaturas] = useState<any[]>([])
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const drawingRef = useRef(false)

  useEffect(() => {
    // Carregar assinaturas existentes
    fetch(`/api/assinar?document_id=${docId}`).then(r => r.json()).then(d => {
      if (d.assinaturas) setAssinaturas(d.assinaturas)
    }).catch(() => {})
  }, [docId, signed])

  const startDraw = (e: React.MouseEvent | React.TouchEvent) => {
    drawingRef.current = true
    const canvas = canvasRef.current; if (!canvas) return
    const ctx = canvas.getContext('2d'); if (!ctx) return
    const rect = canvas.getBoundingClientRect()
    const x = ('touches' in e ? e.touches[0].clientX : e.clientX) - rect.left
    const y = ('touches' in e ? e.touches[0].clientY : e.clientY) - rect.top
    ctx.beginPath(); ctx.moveTo(x, y)
  }
  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!drawingRef.current) return
    const canvas = canvasRef.current; if (!canvas) return
    const ctx = canvas.getContext('2d'); if (!ctx) return
    const rect = canvas.getBoundingClientRect()
    const x = ('touches' in e ? e.touches[0].clientX : e.clientX) - rect.left
    const y = ('touches' in e ? e.touches[0].clientY : e.clientY) - rect.top
    ctx.strokeStyle = '#60A5FA'; ctx.lineWidth = 2; ctx.lineCap = 'round'
    ctx.lineTo(x, y); ctx.stroke()
  }
  const stopDraw = () => { drawingRef.current = false }
  const clearCanvas = () => {
    const canvas = canvasRef.current; if (!canvas) return
    const ctx = canvas.getContext('2d'); if (!ctx) return
    ctx.clearRect(0, 0, canvas.width, canvas.height)
  }

  const assinar = async () => {
    if (!nome.trim()) { setSigError('Nome obrigatorio'); return }
    const canvas = canvasRef.current
    if (!canvas) return
    const img = canvas.toDataURL('image/png')
    // Verificar se canvas esta vazio
    const ctx = canvas.getContext('2d')
    const pixels = ctx?.getImageData(0, 0, canvas.width, canvas.height).data
    const hasDrawing = pixels ? Array.from(pixels).some((v, i) => i % 4 === 3 && v > 0) : false
    if (!hasDrawing) { setSigError('Desenhe sua assinatura no campo acima'); return }

    setSigning(true); setSigError('')
    const token = localStorage.getItem('cai_token')
    try {
      const res = await fetch('/api/assinar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ document_id: docId, nome_signatario: nome, cpf_signatario: cpf, assinatura_img: img }),
      })
      const data = await res.json()
      if (data.ok) { setSigned(data.assinatura); setOpen(false) }
      else setSigError(data.error || 'Erro ao assinar')
    } catch { setSigError('Erro de conexao') }
    setSigning(false)
  }

  return (
    <div style={{ marginBottom: 20 }}>
      {/* Assinaturas existentes */}
      {assinaturas.length > 0 && (
        <div style={{ marginBottom: 12 }}>
          {assinaturas.map((a, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.15)', borderRadius: 8, marginBottom: 6, fontSize: 12 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
              <span style={{ color: '#22c55e', fontWeight: 600 }}>Assinado por {a.nome_signatario}</span>
              <span style={{ color: 'var(--text3)' }}>{new Date(a.criado_em).toLocaleString('pt-BR')}</span>
              {a.integro ? (
                <span style={{ fontSize: 10, padding: '1px 6px', borderRadius: 99, background: 'rgba(34,197,94,0.12)', color: '#22c55e' }}>Integro</span>
              ) : (
                <span style={{ fontSize: 10, padding: '1px 6px', borderRadius: 99, background: 'rgba(239,68,68,0.12)', color: '#f87171' }}>Modificado</span>
              )}
            </div>
          ))}
        </div>
      )}

      {!open && !signed && (
        <button onClick={() => setOpen(true)} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', borderRadius: 10, background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)', color: '#22c55e', fontSize: 13, fontWeight: 600 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
          Assinar digitalmente
        </button>
      )}

      {signed && (
        <div style={{ padding: '10px 16px', background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: 10, fontSize: 12 }}>
          <span style={{ color: '#22c55e', fontWeight: 600 }}>Documento assinado!</span>
          <span style={{ color: 'var(--text3)', marginLeft: 8 }}>Hash: {signed.hash?.slice(0, 16)}...</span>
        </div>
      )}

      {open && (
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: 20 }}>
          <h3 style={{ fontSize: 15, marginBottom: 12 }}>Assinatura Digital</h3>
          {sigError && <div style={{ padding: '8px 12px', background: 'rgba(239,68,68,0.1)', borderRadius: 8, color: '#f87171', fontSize: 12, marginBottom: 12 }}>{sigError}</div>}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
            <div>
              <label style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 4, display: 'block' }}>Nome completo *</label>
              <input value={nome} onChange={e => setNome(e.target.value)} placeholder="Seu nome" style={{ width: '100%', padding: '10px 12px', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text)', fontSize: 13 }} />
            </div>
            <div>
              <label style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 4, display: 'block' }}>CPF (opcional)</label>
              <input value={cpf} onChange={e => setCpf(e.target.value)} placeholder="000.000.000-00" style={{ width: '100%', padding: '10px 12px', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text)', fontSize: 13 }} />
            </div>
          </div>

          <label style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 6, display: 'block' }}>Desenhe sua assinatura</label>
          <div style={{ position: 'relative', marginBottom: 12 }}>
            <canvas
              ref={canvasRef}
              width={400}
              height={120}
              onMouseDown={startDraw}
              onMouseMove={draw}
              onMouseUp={stopDraw}
              onMouseLeave={stopDraw}
              onTouchStart={startDraw}
              onTouchMove={draw}
              onTouchEnd={stopDraw}
              style={{ width: '100%', height: 120, background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 8, cursor: 'crosshair', touchAction: 'none' }}
            />
            <button onClick={clearCanvas} style={{ position: 'absolute', top: 4, right: 4, fontSize: 11, color: 'var(--text3)', padding: '2px 8px', borderRadius: 4, background: 'var(--surface)', border: '1px solid var(--border)' }}>Limpar</button>
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={() => setOpen(false)} style={{ padding: '10px 16px', borderRadius: 8, background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text2)', fontSize: 13 }}>Cancelar</button>
            <button onClick={assinar} disabled={signing} style={{ flex: 1, padding: '10px 16px', borderRadius: 8, background: '#22c55e', color: '#fff', fontSize: 13, fontWeight: 600, opacity: signing ? 0.6 : 1 }}>
              {signing ? 'Assinando...' : 'Confirmar assinatura'}
            </button>
          </div>
          <p style={{ fontSize: 11, color: 'var(--text3)', marginTop: 8 }}>Ao assinar, sera registrado: nome, IP, data/hora e hash SHA-256 do documento.</p>
        </div>
      )}
    </div>
  )
}

function DiffView({ oldText, newText }: { oldText: string; newText: string }) {
  const oldLines = oldText.split('\n')
  const newLines = newText.split('\n')
  const result: { type: 'same' | 'removed' | 'added'; text: string }[] = []

  // Simple LCS-based diff by lines
  const oldSet = new Set(oldLines.map((l, i) => `${i}:${l}`))
  const newSet = new Set(newLines.map((l, i) => `${i}:${l}`))

  let oi = 0, ni = 0
  while (oi < oldLines.length || ni < newLines.length) {
    if (oi < oldLines.length && ni < newLines.length && oldLines[oi] === newLines[ni]) {
      result.push({ type: 'same', text: oldLines[oi] })
      oi++; ni++
    } else {
      // Check if old line exists ahead in new
      const newAhead = newLines.indexOf(oldLines[oi], ni)
      const oldAhead = oi < oldLines.length ? newLines.indexOf(oldLines[oi], ni) : -1

      if (oldAhead === -1 && oi < oldLines.length) {
        result.push({ type: 'removed', text: oldLines[oi] })
        oi++
      } else if (ni < newLines.length && oldLines.indexOf(newLines[ni], oi) === -1) {
        result.push({ type: 'added', text: newLines[ni] })
        ni++
      } else if (newAhead !== -1 && newAhead - ni <= 3) {
        while (ni < newAhead) { result.push({ type: 'added', text: newLines[ni] }); ni++ }
      } else if (oi < oldLines.length) {
        result.push({ type: 'removed', text: oldLines[oi] }); oi++
      } else {
        result.push({ type: 'added', text: newLines[ni] }); ni++
      }
    }
  }

  return (
    <div style={{ fontSize: 13, lineHeight: 1.7, fontFamily: "'JetBrains Mono', monospace" }}>
      {result.map((line, i) => (
        <div key={i} style={{
          padding: '2px 8px', borderRadius: 4, margin: '1px 0',
          background: line.type === 'removed' ? 'rgba(239,68,68,0.1)' : line.type === 'added' ? 'rgba(34,197,94,0.1)' : 'transparent',
          color: line.type === 'removed' ? '#f87171' : line.type === 'added' ? '#4ade80' : 'var(--text2)',
          textDecoration: line.type === 'removed' ? 'line-through' : 'none',
          borderLeft: line.type !== 'same' ? `3px solid ${line.type === 'removed' ? '#ef4444' : '#22c55e'}` : '3px solid transparent',
        }}>
          <span style={{ opacity: 0.5, marginRight: 8, userSelect: 'none' }}>{line.type === 'removed' ? '-' : line.type === 'added' ? '+' : ' '}</span>
          {line.text || '\u00A0'}
        </div>
      ))}
    </div>
  )
}

function ResultSection({ contrato, setContrato, tipoNome, docId, canDownload, isMensal, checkingOut, handleCheckout, onNewDoc, error, setError }: {
  contrato: string; setContrato: (v: string) => void; tipoNome: string; docId: string | null
  canDownload: boolean; isMensal: boolean; checkingOut: boolean
  handleCheckout: (plan: 'avulso' | 'mensal') => void; onNewDoc: () => void
  error: string; setError: (v: string) => void
}) {
  const [editPrompt, setEditPrompt] = useState('')
  const [editing, setEditing] = useState(false)
  const [copied, setCopied] = useState(false)
  const [prevVersion, setPrevVersion] = useState<string | null>(null)
  const [showDiff, setShowDiff] = useState(false)
  const fileName = tipoNome.replace(/[^a-zA-Z0-9 ]/g, '').trim()

  const previewText = canDownload ? contrato : contrato.slice(0, Math.floor(contrato.length * 0.3))

  const downloadPdf = async () => {
    if (!canDownload) return
    const { jsPDF } = await import('jspdf')
    const doc = new jsPDF({ unit: 'mm', format: 'a4' })
    const pageW = doc.internal.pageSize.getWidth()
    const margin = 20
    const maxW = pageW - margin * 2
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(14)
    doc.text(tipoNome.toUpperCase(), pageW / 2, 25, { align: 'center' })
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)
    doc.setTextColor(120)
    doc.text(`Gerado por ContratoAI em ${new Date().toLocaleDateString('pt-BR')}`, pageW / 2, 32, { align: 'center' })
    doc.setTextColor(30)
    doc.setFontSize(11)
    const lines = doc.splitTextToSize(contrato, maxW)
    let y = 42
    for (const line of lines) {
      if (y > 275) { doc.addPage(); y = 20 }
      doc.text(line, margin, y)
      y += 5.5
    }
    doc.save(`${fileName}.pdf`)
  }

  const downloadWord = () => {
    if (!canDownload) return
    const html = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
<head><meta charset="utf-8"><title>${tipoNome}</title>
<style>body{font-family:Calibri,sans-serif;font-size:12pt;line-height:1.8;margin:2cm}h1{font-size:16pt;text-align:center;margin-bottom:8pt}p.sub{font-size:9pt;color:#888;text-align:center;margin-bottom:24pt}</style></head>
<body><h1>${tipoNome.toUpperCase()}</h1><p class="sub">Gerado por ContratoAI em ${new Date().toLocaleDateString('pt-BR')}</p>
${contrato.split('\n').map(l => `<p>${l || '&nbsp;'}</p>`).join('')}
</body></html>`
    const blob = new Blob([html], { type: 'application/msword;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${fileName}.doc`
    a.click()
    URL.revokeObjectURL(url)
  }

  const copyToClipboard = () => {
    if (!canDownload) return
    navigator.clipboard.writeText(contrato).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000) }).catch(() => {})
  }

  const editWithAI = async () => {
    if (!editPrompt.trim()) return
    setEditing(true)
    setError('')
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('cai_token') : null
      const headers: Record<string, string> = { 'Content-Type': 'application/json' }
      if (token) headers['Authorization'] = `Bearer ${token}`
      const res = await fetch('/api/gerar/editar', {
        method: 'POST',
        headers,
        body: JSON.stringify({ contrato, instrucao: editPrompt, docId }),
      })
      const data = await res.json()
      if (data.contrato) {
        setPrevVersion(contrato)
        setContrato(data.contrato)
        setEditPrompt('')
        setShowDiff(true)
      } else {
        setError(data.error || 'Erro ao editar')
      }
    } catch {
      setError('Erro de conexão')
    } finally {
      setEditing(false)
    }
  }

  return (
    <div>
      {/* Disclaimer IA */}
      <div style={{ padding: '12px 16px', marginBottom: 16, borderRadius: 10, background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', display: 'flex', alignItems: 'flex-start', gap: 10 }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" style={{ flexShrink: 0, marginTop: 1 }}><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
        <p style={{ fontSize: 12, color: 'var(--text2)', lineHeight: 1.6, margin: 0 }}>
          <strong style={{ color: '#f59e0b' }}>Aviso:</strong> Este documento foi gerado por inteligencia artificial e pode conter imprecisoes. <strong>Revise todas as clausulas antes de assinar.</strong> Para situacoes de alta complexidade, consulte um advogado. Ao utilizar este documento, voce concorda com os <a href="/termos" target="_blank" style={{ color: 'var(--blue-light)', textDecoration: 'underline' }}>Termos de Uso</a>.
        </p>
      </div>

      {/* Action buttons */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
        <button onClick={downloadPdf} disabled={!canDownload} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 20px', borderRadius: 10, background: canDownload ? '#ef4444' : 'rgba(239,68,68,0.3)', color: '#fff', fontSize: 14, fontWeight: 600, opacity: canDownload ? 1 : 0.6, cursor: canDownload ? 'pointer' : 'not-allowed' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/><path d="M14 2v6h6"/></svg>
          PDF
        </button>
        <button onClick={downloadWord} disabled={!canDownload} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 20px', borderRadius: 10, background: canDownload ? '#2563EB' : 'rgba(37,99,235,0.3)', color: '#fff', fontSize: 14, fontWeight: 600, opacity: canDownload ? 1 : 0.6, cursor: canDownload ? 'pointer' : 'not-allowed' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/><path d="M14 2v6h6"/></svg>
          Word
        </button>
        <button onClick={copyToClipboard} disabled={!canDownload} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 20px', borderRadius: 10, background: 'var(--surface)', border: '1px solid var(--border)', color: canDownload ? 'var(--text2)' : 'var(--text3)', fontSize: 14, fontWeight: 500, opacity: canDownload ? 1 : 0.6, cursor: canDownload ? 'pointer' : 'not-allowed' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
          {copied ? 'Copiado!' : 'Copiar'}
        </button>
        <button onClick={onNewDoc} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 20px', borderRadius: 10, background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text2)', fontSize: 14, fontWeight: 500 }}>
          + Novo
        </button>
        {prevVersion && (
          <button onClick={() => setShowDiff(!showDiff)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 20px', borderRadius: 10, background: showDiff ? 'rgba(168,85,247,0.15)' : 'var(--surface)', border: `1px solid ${showDiff ? 'rgba(168,85,247,0.3)' : 'var(--border)'}`, color: showDiff ? '#a855f7' : 'var(--text2)', fontSize: 14, fontWeight: 500 }}>
            {showDiff ? 'Ver documento' : 'Ver alteracoes'}
          </button>
        )}
      </div>

      {/* Paywall */}
      {!canDownload && (
        <div style={{ background: 'linear-gradient(135deg, rgba(59,130,246,0.08), rgba(6,182,212,0.08))', border: '1px solid rgba(59,130,246,0.25)', borderRadius: 14, padding: 24, marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            <span style={{ fontWeight: 700, fontSize: 16, color: 'var(--text)' }}>Desbloqueie seu documento completo</span>
          </div>
          <p style={{ fontSize: 14, color: 'var(--text2)', marginBottom: 16 }}>
            Seu contrato foi gerado com sucesso! Para baixar o documento completo em PDF ou Word, escolha uma opcao:
          </p>
          {error && <div style={{ padding: '8px 14px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, color: '#f87171', fontSize: 13, marginBottom: 12 }}>{error}</div>}
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <button onClick={() => handleCheckout('avulso')} disabled={checkingOut} style={{ flex: 1, minWidth: 200, padding: '14px 20px', borderRadius: 12, background: 'var(--surface)', border: '1px solid var(--border-strong)', color: 'var(--text)', fontSize: 14, fontWeight: 600, textAlign: 'left' }}>
              <div style={{ fontWeight: 700, marginBottom: 4 }}>Documento avulso</div>
              <div style={{ fontSize: 24, fontWeight: 800, fontFamily: "'Space Grotesk',sans-serif", color: 'var(--blue-light)' }}>R$11,90</div>
              <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 4 }}>Pagamento unico por este documento</div>
            </button>
            <button onClick={() => handleCheckout('mensal')} disabled={checkingOut} style={{ flex: 1, minWidth: 200, padding: '14px 20px', borderRadius: 12, background: 'linear-gradient(135deg, rgba(59,130,246,0.12), rgba(6,182,212,0.12))', border: '1px solid var(--blue)', color: 'var(--text)', fontSize: 14, fontWeight: 600, textAlign: 'left', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 8, right: 8, fontSize: 10, fontWeight: 700, background: 'var(--blue)', color: '#fff', padding: '2px 8px', borderRadius: 99 }}>MELHOR</div>
              <div style={{ fontWeight: 700, marginBottom: 4 }}>Plano Mensal</div>
              <div style={{ fontSize: 24, fontWeight: 800, fontFamily: "'Space Grotesk',sans-serif", color: 'var(--cyan)' }}>R$34,90<span style={{ fontSize: 13, fontWeight: 400 }}>/mes</span></div>
              <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 4 }}>Documentos ilimitados por 30 dias</div>
            </button>
          </div>
          {checkingOut && <p style={{ fontSize: 13, color: 'var(--text3)', marginTop: 12, textAlign: 'center' }}>Redirecionando para o pagamento...</p>}
        </div>
      )}

      {/* Edit with AI */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            value={editPrompt}
            onChange={e => setEditPrompt(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !editing && editWithAI()}
            placeholder="Peca uma alteracao... Ex: remova a clausula de multa, adicione clausula de sigilo"
            disabled={editing}
            style={{ flex: 1, padding: '12px 16px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, color: 'var(--text)', fontSize: 14 }}
          />
          <button onClick={editWithAI} disabled={editing || !editPrompt.trim()} style={{ padding: '12px 20px', borderRadius: 10, background: editing ? 'var(--surface)' : 'var(--blue)', color: '#fff', fontSize: 14, fontWeight: 600, whiteSpace: 'nowrap', opacity: editing || !editPrompt.trim() ? 0.6 : 1 }}>
            {editing ? 'Editando...' : 'Editar com IA'}
          </button>
        </div>
        <p style={{ fontSize: 12, color: 'var(--text3)', marginTop: 6 }}>Descreva o que quer mudar e a IA vai ajustar o contrato</p>
      </div>

      {/* Assinatura digital */}
      {canDownload && docId && <SignatureSection docId={docId} />}

      {/* Contract preview/full or Diff view */}
      {showDiff && prevVersion ? (
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: '24px', maxHeight: '70vh', overflowY: 'auto' }}>
          <div style={{ display: 'flex', gap: 8, marginBottom: 16, fontSize: 12, color: 'var(--text3)' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ width: 12, height: 12, borderRadius: 3, background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)' }}/> Removido</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ width: 12, height: 12, borderRadius: 3, background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.3)' }}/> Adicionado</span>
          </div>
          <DiffView oldText={prevVersion} newText={contrato} />
        </div>
      ) : (
        <div style={{ position: 'relative' }}>
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: '32px', whiteSpace: 'pre-wrap', fontSize: 14, lineHeight: 1.8, color: 'var(--text)', fontFamily: "'Inter',sans-serif", maxHeight: '70vh', overflowY: 'auto' }}>
            {previewText}
          </div>
          {!canDownload && (
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 200, background: 'linear-gradient(transparent, var(--bg) 80%)', borderRadius: '0 0 14px 14px', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', paddingBottom: 20 }}>
              <span style={{ fontSize: 13, color: 'var(--text3)', fontStyle: 'italic' }}>Mostrando 30% do documento — pague para ver completo</span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function GerarPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Carregando...</div>}>
      <GerarContent />
    </Suspense>
  )
}
