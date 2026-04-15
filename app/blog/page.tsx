'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'

interface Artigo { id: string; slug: string; titulo: string; meta_description: string; tags: string[]; criado_em: string }

export default function BlogPage() {
  const [artigos, setArtigos] = useState<Artigo[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/blog').then(r => r.json()).then(d => setArtigos(d.artigos || [])).finally(() => setLoading(false))
  }, [])

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <nav style={{ height: 64, display: 'flex', alignItems: 'center', justifyContent: 'center', borderBottom: '1px solid var(--border)', background: 'rgba(9,9,15,0.95)', backdropFilter: 'blur(20px)' }}>
        <div style={{ maxWidth: 800, width: '100%', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href="/" style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 18, display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 28, height: 28, borderRadius: 7, background: 'linear-gradient(135deg,var(--blue),var(--cyan))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, color: '#fff' }}>C</div>
            ContratoAI
          </Link>
          <Link href="/login" style={{ fontSize: 13, color: 'var(--blue-light)', fontWeight: 600 }}>Entrar</Link>
        </div>
      </nav>

      <div style={{ maxWidth: 800, margin: '0 auto', padding: '48px 24px' }}>
        <h1 style={{ fontSize: 32, fontFamily: "'Space Grotesk',sans-serif", marginBottom: 8 }}>Blog ContratoAI</h1>
        <p style={{ fontSize: 15, color: 'var(--text2)', marginBottom: 40 }}>Artigos sobre contratos, direito e dicas juridicas para empreendedores.</p>

        {loading ? (
          <p style={{ color: 'var(--text3)' }}>Carregando...</p>
        ) : artigos.length === 0 ? (
          <p style={{ color: 'var(--text3)', fontSize: 15 }}>Novos artigos em breve.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {artigos.map(a => (
              <Link key={a.id} href={`/blog/${a.slug}`} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: '24px', transition: 'border-color 0.2s' }}>
                <h2 style={{ fontSize: 20, marginBottom: 8, fontFamily: "'Space Grotesk',sans-serif" }}>{a.titulo}</h2>
                {a.meta_description && <p style={{ fontSize: 14, color: 'var(--text2)', lineHeight: 1.6, marginBottom: 12 }}>{a.meta_description}</p>}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 12, color: 'var(--text3)' }}>{new Date(a.criado_em).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}</span>
                  {a.tags?.map((t, i) => <span key={i} style={{ fontSize: 10, padding: '2px 8px', borderRadius: 99, background: 'rgba(59,130,246,0.1)', color: 'var(--blue-light)' }}>{t}</span>)}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
