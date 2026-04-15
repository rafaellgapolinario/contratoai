'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface Modelo {
  id: string
  nome: string
  descricao: string | null
  campos: string[]
  prompt_extra: string | null
  criado_em: string
}

export default function ModelosPage() {
  const [modelos, setModelos] = useState<Modelo[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [nome, setNome] = useState('')
  const [descricao, setDescricao] = useState('')
  const [campos, setCampos] = useState<string[]>([''])
  const [promptExtra, setPromptExtra] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const router = useRouter()

  const getToken = () => typeof window !== 'undefined' ? localStorage.getItem('cai_token') : null

  useEffect(() => {
    if (!getToken()) { router.push('/login'); return }
    fetchModelos()
  }, [router])

  const fetchModelos = async () => {
    try {
      const res = await fetch('/api/modelos', { headers: { Authorization: `Bearer ${getToken()}` } })
      const data = await res.json()
      setModelos(data.modelos || [])
    } catch {}
    setLoading(false)
  }

  const addCampo = () => setCampos([...campos, ''])
  const removeCampo = (i: number) => setCampos(campos.filter((_, idx) => idx !== i))
  const updateCampo = (i: number, val: string) => {
    const n = [...campos]; n[i] = val; setCampos(n)
  }

  const resetForm = () => {
    setNome(''); setDescricao(''); setCampos(['']); setPromptExtra(''); setEditId(null); setShowForm(false); setError('')
  }

  const editModelo = (m: Modelo) => {
    setEditId(m.id); setNome(m.nome); setDescricao(m.descricao || ''); setCampos(m.campos.length ? m.campos : ['']); setPromptExtra(m.prompt_extra || ''); setShowForm(true)
  }

  const saveModelo = async () => {
    const cleanCampos = campos.map(c => c.trim()).filter(c => c)
    if (!nome.trim()) { setError('Nome obrigatorio'); return }
    if (!cleanCampos.length) { setError('Adicione pelo menos 1 campo'); return }

    setSaving(true); setError('')
    try {
      const method = editId ? 'PUT' : 'POST'
      const body = { id: editId, nome: nome.trim(), descricao: descricao.trim(), campos: cleanCampos, prompt_extra: promptExtra.trim() }
      const res = await fetch('/api/modelos', {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (data.error) { setError(data.error); setSaving(false); return }
      resetForm(); fetchModelos()
    } catch { setError('Erro de conexao') }
    setSaving(false)
  }

  const deleteModelo = async (id: string, name: string) => {
    if (!confirm(`Deletar modelo "${name}"?`)) return
    await fetch('/api/modelos', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
      body: JSON.stringify({ id }),
    })
    fetchModelos()
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>

      <div style={{ maxWidth: 800, margin: '0 auto', padding: '32px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <p style={{ fontSize: 14, color: 'var(--text2)' }}>
            Crie seus proprios modelos de documento. Defina os campos e a IA gera o documento personalizado.
          </p>
          {!showForm && (
            <button onClick={() => setShowForm(true)} style={{ padding: '10px 20px', borderRadius: 10, background: 'var(--blue)', color: '#fff', fontSize: 14, fontWeight: 600, whiteSpace: 'nowrap', marginLeft: 16 }}>
              + Novo modelo
            </button>
          )}
        </div>

        {/* Form */}
        {showForm && (
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: 24, marginBottom: 32 }}>
            <h2 style={{ fontSize: 16, marginBottom: 16 }}>{editId ? 'Editar modelo' : 'Novo modelo'}</h2>
            {error && <div style={{ padding: '10px 14px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, color: '#f87171', fontSize: 13, marginBottom: 16 }}>{error}</div>}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 4, display: 'block' }}>Nome do modelo <span style={{ color: '#f87171' }}>*</span></label>
                <input value={nome} onChange={e => setNome(e.target.value)} placeholder="Ex: Contrato de Consultoria de Marketing" style={{ width: '100%', padding: '10px 14px', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text)', fontSize: 14 }} />
              </div>

              <div>
                <label style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 4, display: 'block' }}>Descricao (opcional)</label>
                <input value={descricao} onChange={e => setDescricao(e.target.value)} placeholder="Breve descricao do modelo" style={{ width: '100%', padding: '10px 14px', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text)', fontSize: 14 }} />
              </div>

              <div>
                <label style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 8, display: 'block' }}>Campos do formulario <span style={{ color: '#f87171' }}>*</span></label>
                <p style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 10 }}>Defina os campos que o usuario vai preencher ao gerar o documento</p>
                {campos.map((campo, i) => (
                  <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                    <input
                      value={campo}
                      onChange={e => updateCampo(i, e.target.value)}
                      placeholder={`Campo ${i + 1} (ex: Nome do cliente, Valor, Prazo...)`}
                      style={{ flex: 1, padding: '10px 14px', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text)', fontSize: 14 }}
                    />
                    {campos.length > 1 && (
                      <button onClick={() => removeCampo(i)} style={{ width: 36, borderRadius: 8, border: '1px solid rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.08)', color: '#f87171', fontSize: 16 }}>x</button>
                    )}
                  </div>
                ))}
                <button onClick={addCampo} style={{ fontSize: 13, color: 'var(--blue-light)', fontWeight: 600, padding: '6px 0' }}>+ Adicionar campo</button>
              </div>

              <div>
                <label style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 4, display: 'block' }}>Instrucoes extras pra IA (opcional)</label>
                <textarea
                  value={promptExtra}
                  onChange={e => setPromptExtra(e.target.value)}
                  placeholder="Ex: Incluir clausula de nao-concorrencia por 2 anos. Usar tom mais informal. Focar em direito do consumidor."
                  rows={3}
                  style={{ width: '100%', padding: '10px 14px', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text)', fontSize: 14, resize: 'vertical' }}
                />
                <p style={{ fontSize: 12, color: 'var(--text3)', marginTop: 4 }}>A IA vai seguir essas instrucoes ao gerar o documento</p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
              <button onClick={resetForm} style={{ padding: '10px 20px', borderRadius: 8, background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text2)', fontSize: 14 }}>Cancelar</button>
              <button onClick={saveModelo} disabled={saving} style={{ flex: 1, padding: '12px', borderRadius: 8, background: 'var(--blue)', color: '#fff', fontSize: 14, fontWeight: 600, opacity: saving ? 0.6 : 1 }}>
                {saving ? 'Salvando...' : editId ? 'Salvar alteracoes' : 'Criar modelo'}
              </button>
            </div>
          </div>
        )}

        {/* Lista de modelos */}
        {loading ? (
          <p style={{ color: 'var(--text3)' }}>Carregando...</p>
        ) : modelos.length === 0 && !showForm ? (
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: 48, textAlign: 'center' }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>📐</div>
            <p style={{ color: 'var(--text2)', fontSize: 15, marginBottom: 8 }}>Nenhum modelo criado ainda</p>
            <p style={{ color: 'var(--text3)', fontSize: 13, marginBottom: 16 }}>Crie modelos personalizados com seus proprios campos e instrucoes</p>
            <button onClick={() => setShowForm(true)} style={{ fontSize: 14, color: 'var(--blue-light)', fontWeight: 600 }}>Criar primeiro modelo</button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {modelos.map(m => (
              <div key={m.id} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: '16px 20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 15 }}>{m.nome}</div>
                    {m.descricao && <div style={{ fontSize: 13, color: 'var(--text3)', marginTop: 2 }}>{m.descricao}</div>}
                    <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 6 }}>
                      {m.campos.length} campos &middot; {new Date(m.criado_em).toLocaleDateString('pt-BR')}
                    </div>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 8 }}>
                      {m.campos.map((c, i) => (
                        <span key={i} style={{ fontSize: 11, padding: '2px 8px', borderRadius: 99, background: 'rgba(59,130,246,0.08)', color: 'var(--blue-light)' }}>{c}</span>
                      ))}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                    <Link href={`/gerar?modelo=${m.id}`} style={{ padding: '6px 14px', borderRadius: 8, background: 'var(--blue)', color: '#fff', fontSize: 12, fontWeight: 600 }}>
                      Gerar
                    </Link>
                    <button onClick={() => editModelo(m)} style={{ padding: '6px 12px', borderRadius: 8, border: '1px solid var(--border)', color: 'var(--text2)', fontSize: 12 }}>
                      Editar
                    </button>
                    <button onClick={() => deleteModelo(m.id, m.nome)} style={{ padding: '6px 12px', borderRadius: 8, border: '1px solid rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.08)', color: '#f87171', fontSize: 12 }}>
                      Deletar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
