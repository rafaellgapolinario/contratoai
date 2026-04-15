'use client'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

const MASTER_EMAIL = 'gardaszconsultoria@gmail.com'

interface Doc {
  id: string
  filename: string
  file_type: string
  file_size: number
  chunk_count: number
  criado_em: string
}

interface ClientUser {
  id: string; email: string; nome: string; plano: string; plano_expira: string | null
  criado_em: string; total_docs: string; total_pagamentos: string
}

export default function AdminPage() {
  const [docs, setDocs] = useState<Doc[]>([])
  const [clients, setClients] = useState<ClientUser[]>([])
  const [clientStats, setClientStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState('')
  const [error, setError] = useState('')
  const [textMode, setTextMode] = useState(false)
  const [textContent, setTextContent] = useState('')
  const [textFilename, setTextFilename] = useState('')
  const [tab, setTab] = useState<'docs' | 'clients'>('docs')
  const [isMaster, setIsMaster] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  const getToken = () => typeof window !== 'undefined' ? localStorage.getItem('cai_token') : null

  useEffect(() => {
    const token = getToken()
    if (!token) { router.push('/login'); return }
    // Check if master
    const userStr = typeof window !== 'undefined' ? localStorage.getItem('cai_user') : null
    if (userStr) {
      try { const u = JSON.parse(userStr); setIsMaster(u.email === MASTER_EMAIL) } catch {}
    }
    fetchDocs()
  }, [router])

  useEffect(() => {
    if (isMaster && tab === 'clients') fetchClients()
  }, [isMaster, tab])

  const fetchClients = async () => {
    try {
      const res = await fetch('/api/admin/users', { headers: { Authorization: `Bearer ${getToken()}` } })
      const data = await res.json()
      if (!data.error) { setClients(data.users || []); setClientStats(data.stats) }
    } catch {}
  }

  const fetchDocs = async () => {
    try {
      const res = await fetch('/api/admin/rag', { headers: { Authorization: `Bearer ${getToken()}` } })
      const data = await res.json()
      if (data.error) { setError(data.error); setLoading(false); return }
      setDocs(data.documents || [])
    } catch { setError('Erro ao carregar documentos') }
    setLoading(false)
  }

  const uploadFile = async (file: File) => {
    setUploading(true)
    setUploadProgress('Enviando arquivo...')
    setError('')
    try {
      const form = new FormData()
      form.append('file', file)
      form.append('filename', file.name)

      setUploadProgress('Processando PDF, extraindo texto, gerando embeddings... pode levar ate 1 minuto')
      const res = await fetch('/api/admin/rag', {
        method: 'POST',
        headers: { Authorization: `Bearer ${getToken()}` },
        body: form,
      })
      const data = await res.json()
      if (data.error) { setError(data.error); setUploading(false); setUploadProgress(''); return }

      setUploadProgress(`Pronto! ${data.document.chunks} trechos indexados.`)
      setTimeout(() => { setUploadProgress(''); fetchDocs() }, 2000)
    } catch { setError('Erro no upload') }
    setUploading(false)
  }

  const uploadText = async () => {
    if (!textContent.trim() || !textFilename.trim()) { setError('Preencha nome e conteudo'); return }
    setUploading(true)
    setUploadProgress('Processando texto...')
    setError('')
    try {
      const form = new FormData()
      form.append('text', textContent)
      form.append('filename', textFilename)

      const res = await fetch('/api/admin/rag', {
        method: 'POST',
        headers: { Authorization: `Bearer ${getToken()}` },
        body: form,
      })
      const data = await res.json()
      if (data.error) { setError(data.error); setUploading(false); setUploadProgress(''); return }

      setUploadProgress(`Pronto! ${data.document.chunks} trechos indexados.`)
      setTextContent('')
      setTextFilename('')
      setTextMode(false)
      setTimeout(() => { setUploadProgress(''); fetchDocs() }, 2000)
    } catch { setError('Erro no upload') }
    setUploading(false)
  }

  const deleteDoc = async (id: string, name: string) => {
    if (!confirm(`Deletar "${name}" e todos os trechos indexados?`)) return
    try {
      await fetch('/api/admin/rag', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({ id }),
      })
      fetchDocs()
    } catch {}
  }

  const totalChunks = docs.reduce((s, d) => s + d.chunk_count, 0)

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>

      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '32px 24px' }}>
        <h1 style={{ fontSize: 24, fontFamily: "'Space Grotesk',sans-serif", marginBottom: 8 }}>Painel Admin</h1>
        <p style={{ fontSize: 14, color: 'var(--text2)', marginBottom: 20 }}>
          Gerencie documentos da base de conhecimento{isMaster ? ' e veja os clientes cadastrados' : ''}.
        </p>

        {/* Tabs */}
        {isMaster && (
          <div style={{ display: 'flex', gap: 4, marginBottom: 28, borderRadius: 10, overflow: 'hidden', border: '1px solid var(--border)', width: 'fit-content' }}>
            <button onClick={() => setTab('docs')} style={{ padding: '8px 20px', fontSize: 13, fontWeight: 600, background: tab === 'docs' ? 'var(--blue)' : 'transparent', color: tab === 'docs' ? '#fff' : 'var(--text2)' }}>Documentos</button>
            <button onClick={() => setTab('clients')} style={{ padding: '8px 20px', fontSize: 13, fontWeight: 600, background: tab === 'clients' ? 'var(--blue)' : 'transparent', color: tab === 'clients' ? '#fff' : 'var(--text2)' }}>Clientes</button>
          </div>
        )}

        {/* Clients tab (master only) */}
        {isMaster && tab === 'clients' && (
          <div>
            {clientStats && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 32 }}>
                <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: 24 }}>
                  <div style={{ fontSize: 13, color: 'var(--text3)', marginBottom: 4 }}>Total clientes</div>
                  <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 32, fontWeight: 700 }}>{clientStats.total_users}</div>
                </div>
                <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: 24 }}>
                  <div style={{ fontSize: 13, color: 'var(--text3)', marginBottom: 4 }}>Plano Mensal</div>
                  <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 32, fontWeight: 700, color: 'var(--blue-light)' }}>{clientStats.ativos_mensal}</div>
                </div>
                <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: 24 }}>
                  <div style={{ fontSize: 13, color: 'var(--text3)', marginBottom: 4 }}>Free</div>
                  <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 32, fontWeight: 700 }}>{clientStats.free}</div>
                </div>
              </div>
            )}
            <h2 style={{ fontSize: 18, marginBottom: 16 }}>Clientes cadastrados</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {clients.map(c => (
                <div key={c.id} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{c.nome || c.email}</div>
                    <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 2 }}>
                      {c.email} &middot; Desde {new Date(c.criado_em).toLocaleDateString('pt-BR')}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 12, color: 'var(--text3)' }}>{c.total_docs} docs</span>
                    <span style={{ fontSize: 12, color: 'var(--text3)' }}>{c.total_pagamentos} pgtos</span>
                    <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 99, background: c.plano === 'mensal' && c.plano_expira && new Date(c.plano_expira) > new Date() ? 'rgba(59,130,246,0.15)' : 'rgba(255,255,255,0.06)', color: c.plano === 'mensal' && c.plano_expira && new Date(c.plano_expira) > new Date() ? 'var(--blue-light)' : 'var(--text3)' }}>
                      {c.plano === 'mensal' && c.plano_expira && new Date(c.plano_expira) > new Date() ? 'Mensal' : 'Free'}
                    </span>
                  </div>
                </div>
              ))}
              {clients.length === 0 && <p style={{ color: 'var(--text3)', fontSize: 14 }}>Nenhum cliente cadastrado ainda</p>}
            </div>
          </div>
        )}

        {/* Docs tab */}
        {tab === 'docs' && <>
        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16, marginBottom: 32 }}>
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: 24 }}>
            <div style={{ fontSize: 13, color: 'var(--text3)', marginBottom: 4 }}>Documentos</div>
            <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 32, fontWeight: 700 }}>{docs.length}</div>
          </div>
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: 24 }}>
            <div style={{ fontSize: 13, color: 'var(--text3)', marginBottom: 4 }}>Trechos indexados</div>
            <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 32, fontWeight: 700 }}>{totalChunks}</div>
          </div>
        </div>

        {/* Upload area */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: 24, marginBottom: 32 }}>
          <h2 style={{ fontSize: 16, marginBottom: 16 }}>Adicionar documento</h2>

          {error && <div style={{ padding: '10px 14px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, color: '#f87171', fontSize: 13, marginBottom: 16 }}>{error}</div>}
          {uploadProgress && <div style={{ padding: '10px 14px', background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: 8, color: 'var(--blue-light)', fontSize: 13, marginBottom: 16 }}>{uploadProgress}</div>}

          <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
            <button onClick={() => setTextMode(false)} style={{ padding: '8px 16px', borderRadius: 8, background: !textMode ? 'var(--blue)' : 'var(--surface)', color: !textMode ? '#fff' : 'var(--text2)', border: '1px solid var(--border)', fontSize: 13, fontWeight: 600 }}>
              Upload PDF
            </button>
            <button onClick={() => setTextMode(true)} style={{ padding: '8px 16px', borderRadius: 8, background: textMode ? 'var(--blue)' : 'var(--surface)', color: textMode ? '#fff' : 'var(--text2)', border: '1px solid var(--border)', fontSize: 13, fontWeight: 600 }}>
              Colar texto
            </button>
          </div>

          {!textMode ? (
            <div>
              <input
                ref={fileRef}
                type="file"
                accept=".pdf,.txt,.md"
                style={{ display: 'none' }}
                onChange={e => { if (e.target.files?.[0]) uploadFile(e.target.files[0]) }}
              />
              <button
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                style={{ width: '100%', padding: '40px 20px', borderRadius: 12, border: '2px dashed var(--border)', background: 'transparent', color: 'var(--text2)', fontSize: 14, cursor: uploading ? 'not-allowed' : 'pointer' }}
              >
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ margin: '0 auto 12px', display: 'block', opacity: 0.5 }}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                {uploading ? 'Processando...' : 'Clique para enviar PDF, TXT ou MD'}
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <input
                value={textFilename}
                onChange={e => setTextFilename(e.target.value)}
                placeholder="Nome do documento (ex: FAQ Juridico)"
                style={{ padding: '10px 14px', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text)', fontSize: 14 }}
              />
              <textarea
                value={textContent}
                onChange={e => setTextContent(e.target.value)}
                placeholder="Cole o conteudo do documento aqui..."
                rows={8}
                style={{ padding: '10px 14px', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text)', fontSize: 14, resize: 'vertical' }}
              />
              <button
                onClick={uploadText}
                disabled={uploading || !textContent.trim()}
                style={{ padding: '12px', borderRadius: 8, background: 'var(--blue)', color: '#fff', fontSize: 14, fontWeight: 600, opacity: uploading || !textContent.trim() ? 0.6 : 1 }}
              >
                {uploading ? 'Processando...' : 'Indexar documento'}
              </button>
            </div>
          )}
        </div>

        {/* Documents list */}
        <h2 style={{ fontSize: 18, marginBottom: 16 }}>Documentos indexados</h2>
        {loading ? (
          <p style={{ color: 'var(--text3)' }}>Carregando...</p>
        ) : docs.length === 0 ? (
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: 48, textAlign: 'center' }}>
            <p style={{ color: 'var(--text2)', fontSize: 15 }}>Nenhum documento adicionado ainda</p>
            <p style={{ color: 'var(--text3)', fontSize: 13, marginTop: 8 }}>Suba PDFs ou cole textos para alimentar o chat juridico</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {docs.map(doc => (
              <div key={doc.id} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/><path d="M14 2v6h6"/></svg>
                    {doc.filename}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 4 }}>
                    {doc.chunk_count} trechos indexados &middot; {(doc.file_size / 1024).toFixed(0)}KB &middot; {new Date(doc.criado_em).toLocaleDateString('pt-BR')}
                  </div>
                </div>
                <button onClick={() => deleteDoc(doc.id, doc.filename)} style={{ padding: '6px 12px', borderRadius: 8, border: '1px solid rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.08)', color: '#f87171', fontSize: 12, fontWeight: 600 }}>
                  Deletar
                </button>
              </div>
            ))}
          </div>
        )}
        </>}
      </div>
    </div>
  )
}
