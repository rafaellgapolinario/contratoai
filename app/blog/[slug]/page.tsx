'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'

export default function ArtigoPage() {
  const params = useParams()
  const slug = params.slug as string
  const [artigo, setArtigo] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!slug) return
    fetch(`/api/blog?slug=${slug}`).then(r => r.json()).then(d => {
      if (d.artigo) setArtigo(d.artigo)
    }).finally(() => setLoading(false))
  }, [slug])

  if (loading) return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><p style={{ color: 'var(--text3)' }}>Carregando...</p></div>
  if (!artigo) return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 12 }}><p style={{ color: 'var(--text2)', fontSize: 18 }}>Artigo nao encontrado</p><Link href="/blog" style={{ color: 'var(--blue-light)' }}>Voltar ao blog</Link></div>

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <nav style={{ height: 64, display: 'flex', alignItems: 'center', justifyContent: 'center', borderBottom: '1px solid var(--border)', background: 'rgba(9,9,15,0.95)', backdropFilter: 'blur(20px)' }}>
        <div style={{ maxWidth: 800, width: '100%', padding: '0 24px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <Link href="/blog" style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--surface)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text2)' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          </Link>
          <Link href="/" style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 18, display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 28, height: 28, borderRadius: 7, background: 'linear-gradient(135deg,var(--blue),var(--cyan))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, color: '#fff' }}>C</div>
            ContratoAI
          </Link>
        </div>
      </nav>

      <article style={{ maxWidth: 720, margin: '0 auto', padding: '48px 24px 80px' }}>
        <h1 style={{ fontSize: 32, fontFamily: "'Space Grotesk',sans-serif", marginBottom: 12, lineHeight: 1.2 }}>{artigo.titulo}</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 40 }}>
          <span style={{ fontSize: 13, color: 'var(--text3)' }}>{new Date(artigo.criado_em).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}</span>
          {artigo.tags?.map((t: string, i: number) => <span key={i} style={{ fontSize: 10, padding: '2px 8px', borderRadius: 99, background: 'rgba(59,130,246,0.1)', color: 'var(--blue-light)' }}>{t}</span>)}
        </div>

        <style>{`
          .blog-content { font-size: 16px; line-height: 1.9; color: var(--text2); }
          .blog-content h2 { font-size: 22px; color: var(--text); margin: 32px 0 12px; font-family: 'Space Grotesk', sans-serif; }
          .blog-content h3 { font-size: 18px; color: var(--text); margin: 24px 0 8px; font-family: 'Space Grotesk', sans-serif; }
          .blog-content p { margin-bottom: 16px; }
          .blog-content ul, .blog-content ol { margin: 0 0 16px 20px; }
          .blog-content li { margin-bottom: 6px; }
          .blog-content strong { color: var(--text); }
          .blog-content a { color: var(--blue-light); text-decoration: underline; }
        `}</style>

        <div className="blog-content" dangerouslySetInnerHTML={{
          __html: artigo.conteudo
            .replace(/^### (.*$)/gm, '<h3>$1</h3>')
            .replace(/^## (.*$)/gm, '<h2>$1</h2>')
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\n\n/g, '</p><p>')
            .replace(/^/, '<p>').replace(/$/, '</p>')
        }} />

        {/* CTA */}
        <div style={{ marginTop: 48, padding: '32px', background: 'linear-gradient(135deg, rgba(59,130,246,0.08), rgba(6,182,212,0.08))', border: '1px solid rgba(59,130,246,0.2)', borderRadius: 16, textAlign: 'center' }}>
          <h3 style={{ fontSize: 20, fontFamily: "'Space Grotesk',sans-serif", marginBottom: 8 }}>Precisa de um contrato?</h3>
          <p style={{ fontSize: 14, color: 'var(--text2)', marginBottom: 16 }}>Gere contratos e documentos juridicos profissionais em minutos com IA.</p>
          <Link href="/gerar" style={{ display: 'inline-block', padding: '12px 32px', borderRadius: 10, background: 'var(--blue)', color: '#fff', fontSize: 15, fontWeight: 700, fontFamily: "'Space Grotesk',sans-serif" }}>
            Gerar documento gratis
          </Link>
        </div>
      </article>
    </div>
  )
}
