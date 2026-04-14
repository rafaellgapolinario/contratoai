'use client'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

const TIPOS = [
  { id: 'prestacao-servico', icon: '📋', title: 'Prestação de Serviço' },
  { id: 'parceria', icon: '🤝', title: 'Acordo de Parceria' },
  { id: 'confidencialidade', icon: '🔒', title: 'NDA / Confidencialidade' },
  { id: 'locacao', icon: '🏠', title: 'Contrato de Locação' },
  { id: 'venda', icon: '🛒', title: 'Compra e Venda' },
  { id: 'trabalho-freelancer', icon: '💻', title: 'Contrato Freelancer' },
  { id: 'distrato', icon: '✂️', title: 'Distrato / Rescisão' },
  { id: 'termos-uso', icon: '📱', title: 'Termos de Uso + Privacidade' },
  { id: 'recibo', icon: '🧾', title: 'Recibo de Pagamento' },
]

function GerarContent() {
  const searchParams = useSearchParams()
  const initialTipo = searchParams.get('tipo') || ''

  const [step, setStep] = useState<'select' | 'form' | 'loading' | 'result'>(initialTipo ? 'form' : 'select')
  const [tipo, setTipo] = useState(initialTipo)
  const [campos, setCampos] = useState<string[]>([])
  const [respostas, setRespostas] = useState<string[]>([])
  const [contrato, setContrato] = useState('')
  const [tipoNome, setTipoNome] = useState('')
  const [error, setError] = useState('')
  const resultRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
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
  }, [tipo])

  const selectTipo = (id: string) => {
    setTipo(id)
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
        body: JSON.stringify({ tipo, respostas }),
      })
      const data = await res.json()
      if (data.error) { setError(data.error); setStep('form'); return }
      setContrato(data.contrato)
      setTipoNome(data.tipo)
      setStep('result')
    } catch {
      setError('Erro de conexão. Tente novamente.')
      setStep('form')
    }
  }

  const fileName = tipoNome.replace(/[^a-zA-Z0-9 ]/g, '').trim()

  const downloadPdf = async () => {
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
    navigator.clipboard.writeText(contrato).then(() => {}).catch(() => {})
  }

  return (
    <div style={{ minHeight: '100vh', padding: '80px 24px 40px' }}>
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
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32 }}>
          <Link href={typeof window !== 'undefined' && localStorage.getItem('cai_token') ? '/painel' : '/'} style={{ width: 36, height: 36, borderRadius: 8, background: 'var(--surface)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text2)' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          </Link>
          <div>
            <h1 style={{ fontSize: 24 }}>Gerar documento</h1>
            {tipoNome && step !== 'select' && <p style={{ fontSize: 13, color: 'var(--text2)', marginTop: 2 }}>{tipoNome}</p>}
          </div>
        </div>

        {/* Step: Select tipo */}
        {step === 'select' && (
          <div>
            <p style={{ fontSize: 15, color: 'var(--text2)', marginBottom: 24 }}>Qual documento você precisa?</p>
            <div className="tipo-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 10 }}>
              {TIPOS.map(t => (
                <button key={t.id} className="tipo-btn" onClick={() => selectTipo(t.id)}>
                  <span style={{ fontSize: 24 }}>{t.icon}</span>
                  <span style={{ fontWeight: 600, fontSize: 14 }}>{t.title}</span>
                </button>
              ))}
            </div>
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
          <div ref={resultRef}>
            <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
              <button onClick={downloadPdf} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 20px', borderRadius: 10, background: '#ef4444', color: '#fff', fontSize: 14, fontWeight: 600 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/><path d="M14 2v6h6"/></svg>
                Baixar PDF
              </button>
              <button onClick={downloadWord} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 20px', borderRadius: 10, background: '#2563EB', color: '#fff', fontSize: 14, fontWeight: 600 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/><path d="M14 2v6h6"/></svg>
                Baixar Word
              </button>
              <button onClick={copyToClipboard} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 20px', borderRadius: 10, background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text2)', fontSize: 14, fontWeight: 500 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                Copiar
              </button>
              <button onClick={() => { setStep('select'); setTipo(''); setCampos([]); setRespostas([]); setContrato('') }} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 20px', borderRadius: 10, background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text2)', fontSize: 14, fontWeight: 500 }}>
                + Novo documento
              </button>
            </div>
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: '32px', whiteSpace: 'pre-wrap', fontSize: 14, lineHeight: 1.8, color: 'var(--text)', fontFamily: "'Inter',sans-serif", maxHeight: '70vh', overflowY: 'auto' }}>
              {contrato}
            </div>
          </div>
        )}
      </div>
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
