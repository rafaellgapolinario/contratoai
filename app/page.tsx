'use client'
import Link from 'next/link'
import { useEffect } from 'react'

const DOCS = [
  { id: 'prestacao-servico', icon: '📋', title: 'Prestação de Serviço', desc: 'Freelancers, agências, consultorias. O mais usado.', tag: 'Popular' },
  { id: 'parceria', icon: '🤝', title: 'Acordo de Parceria', desc: 'Sociedades informais, collabs, projetos conjuntos.' },
  { id: 'confidencialidade', icon: '🔒', title: 'Termo de Confidencialidade (NDA)', desc: 'Proteja informações sensíveis do seu negócio.' },
  { id: 'locacao', icon: '🏠', title: 'Contrato de Locação', desc: 'Aluguel de imóvel, sala comercial, equipamento.' },
  { id: 'venda', icon: '🛒', title: 'Contrato de Compra e Venda', desc: 'Venda de produtos, veículos, equipamentos.' },
  { id: 'trabalho-freelancer', icon: '💻', title: 'Contrato Freelancer', desc: 'Projetos com escopo, prazo e pagamento definidos.' },
  { id: 'distrato', icon: '✂️', title: 'Distrato / Rescisão', desc: 'Encerre contratos de forma legal e documentada.' },
  { id: 'termos-uso', icon: '📱', title: 'Termos de Uso + Privacidade', desc: 'Pra seu app, site ou plataforma digital.' },
  { id: 'recibo', icon: '🧾', title: 'Recibo de Pagamento', desc: 'Comprove pagamentos com documento válido.' },
]

export default function Home() {
  useEffect(() => {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('vis'); io.unobserve(e.target) } })
    }, { threshold: 0.1 })
    document.querySelectorAll('.rv').forEach(el => io.observe(el))
  }, [])

  return (
    <div style={{ minHeight: '100vh' }}>
      <style>{`
        .rv { opacity:0; transform:translateY(24px); transition: opacity 0.6s cubic-bezier(0.16,1,0.3,1), transform 0.6s cubic-bezier(0.16,1,0.3,1); }
        .rv.vis { opacity:1; transform:translateY(0); }
        .d1{transition-delay:.1s} .d2{transition-delay:.2s} .d3{transition-delay:.3s} .d4{transition-delay:.4s} .d5{transition-delay:.5s} .d6{transition-delay:.6s} .d7{transition-delay:.7s} .d8{transition-delay:.8s}
        @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-12px)}}
        @keyframes pulse-glow{0%,100%{box-shadow:0 0 30px rgba(59,130,246,0.3)}50%{box-shadow:0 0 60px rgba(59,130,246,0.5)}}
        .doc-card { background:var(--surface); border:1px solid var(--border); border-radius:14px; padding:24px; cursor:pointer; transition:all 0.3s cubic-bezier(0.16,1,0.3,1); text-decoration:none; display:block; position:relative; overflow:hidden; }
        .doc-card:hover { border-color:var(--border-strong); transform:translateY(-4px); box-shadow:0 12px 40px rgba(0,0,0,0.3), 0 0 30px rgba(59,130,246,0.08); }
        .doc-card::after { content:''; position:absolute; inset:0; background:radial-gradient(circle at 50% 0%, rgba(59,130,246,0.05) 0%, transparent 60%); opacity:0; transition:opacity 0.3s; pointer-events:none; }
        .doc-card:hover::after { opacity:1; }
        @media(max-width:768px) { .hero-grid{grid-template-columns:1fr!important} .docs-grid{grid-template-columns:1fr!important} .stats-row{flex-direction:column!important} }
        @media(max-width:480px) { .hero-title{font-size:32px!important} }
      `}</style>

      {/* Nav */}
      <nav style={{ position:'fixed', top:0, left:0, right:0, zIndex:100, height:64, display:'flex', alignItems:'center', justifyContent:'center', background:'rgba(9,9,15,0.9)', backdropFilter:'blur(20px)', borderBottom:'1px solid var(--border)' }}>
        <div style={{ maxWidth:1100, width:'100%', padding:'0 32px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <Link href="/" style={{ fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, fontSize:20, display:'flex', alignItems:'center', gap:8 }}>
            <div style={{ width:32, height:32, borderRadius:8, background:'linear-gradient(135deg,var(--blue),var(--cyan))', display:'flex', alignItems:'center', justifyContent:'center', fontSize:16 }}>C</div>
            ContratoAI
          </Link>
          <div style={{ display:'flex', alignItems:'center', gap:16 }}>
            <a href="#documentos" style={{ fontSize:14, color:'var(--text2)' }}>Documentos</a>
            <a href="#como-funciona" style={{ fontSize:14, color:'var(--text2)' }}>Como funciona</a>
            <Link href="/gerar" style={{ fontSize:13, fontWeight:600, background:'var(--blue)', color:'#fff', padding:'9px 18px', borderRadius:8, boxShadow:'0 0 20px var(--glow)' }}>Gerar contrato</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', padding:'120px 32px 80px', position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', top:'10%', left:'20%', width:500, height:500, background:'radial-gradient(circle,rgba(59,130,246,0.12) 0%,transparent 70%)', filter:'blur(80px)', pointerEvents:'none' }} />
        <div style={{ position:'absolute', bottom:'10%', right:'10%', width:400, height:400, background:'radial-gradient(circle,rgba(6,182,212,0.08) 0%,transparent 70%)', filter:'blur(80px)', pointerEvents:'none' }} />

        <div style={{ maxWidth:800, textAlign:'center', position:'relative', zIndex:1 }}>
          <div className="rv" style={{ display:'inline-flex', alignItems:'center', gap:8, padding:'6px 16px', borderRadius:99, background:'rgba(59,130,246,0.1)', border:'1px solid rgba(59,130,246,0.2)', marginBottom:28, fontSize:13, color:'var(--blue-light)' }}>
            Inteligência Artificial Jurídica
          </div>
          <h1 className="rv d1 hero-title" style={{ fontSize:'clamp(36px,6vw,64px)', marginBottom:24, background:'linear-gradient(135deg, var(--text) 30%, var(--blue-light) 70%, var(--cyan))', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>
            Contratos profissionais em minutos.
          </h1>
          <p className="rv d2" style={{ fontSize:18, color:'var(--text2)', maxWidth:560, margin:'0 auto 40px', lineHeight:1.7 }}>
            Responda algumas perguntas simples. A IA gera seu contrato personalizado, pronto pra assinar e usar.
          </p>
          <div className="rv d3" style={{ display:'flex', gap:12, justifyContent:'center', flexWrap:'wrap' }}>
            <Link href="/gerar" style={{ fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, fontSize:16, background:'var(--blue)', color:'#fff', padding:'16px 36px', borderRadius:12, boxShadow:'0 0 40px var(--glow)', display:'inline-flex', alignItems:'center', gap:8, transition:'all 0.3s' }}>
              Gerar meu contrato
              <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </Link>
          </div>
          <div className="rv d4 stats-row" style={{ display:'flex', justifyContent:'center', gap:40, marginTop:56 }}>
            {[['9+', 'Tipos de documento'], ['< 3min', 'Pra gerar'], ['R$19,90', 'Por documento']].map(([n, l]) => (
              <div key={l} style={{ textAlign:'center' }}>
                <div style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:28, fontWeight:700, color:'var(--blue-light)' }}>{n}</div>
                <div style={{ fontSize:13, color:'var(--text3)', marginTop:4 }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Documentos */}
      <section id="documentos" style={{ padding:'100px 32px', maxWidth:1100, margin:'0 auto' }}>
        <div style={{ textAlign:'center', marginBottom:56 }}>
          <div className="rv" style={{ fontSize:11, fontWeight:700, letterSpacing:3, textTransform:'uppercase', color:'var(--blue-light)', marginBottom:12 }}>Documentos</div>
          <h2 className="rv d1" style={{ fontSize:'clamp(28px,4vw,44px)', marginBottom:16 }}>Escolha o que precisa</h2>
          <p className="rv d2" style={{ fontSize:16, color:'var(--text2)', maxWidth:480, margin:'0 auto' }}>Cada documento é gerado pela IA com base nas suas respostas. Personalizado, não genérico.</p>
        </div>
        <div className="docs-grid" style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:16 }}>
          {DOCS.map((doc, i) => (
            <Link href={`/gerar?tipo=${doc.id}`} key={doc.id} className={`doc-card rv d${Math.min(i+1,8)}`}>
              {doc.tag && <span style={{ position:'absolute', top:12, right:12, fontSize:10, fontWeight:700, padding:'3px 10px', borderRadius:99, background:'rgba(59,130,246,0.15)', color:'var(--blue-light)', letterSpacing:0.5 }}>{doc.tag}</span>}
              <div style={{ fontSize:28, marginBottom:12 }}>{doc.icon}</div>
              <div style={{ fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, fontSize:16, marginBottom:6 }}>{doc.title}</div>
              <div style={{ fontSize:13, color:'var(--text2)', lineHeight:1.6 }}>{doc.desc}</div>
            </Link>
          ))}
        </div>
      </section>

      {/* Como funciona */}
      <section id="como-funciona" style={{ padding:'100px 32px', background:'var(--bg2)' }}>
        <div style={{ maxWidth:800, margin:'0 auto' }}>
          <div style={{ textAlign:'center', marginBottom:56 }}>
            <div className="rv" style={{ fontSize:11, fontWeight:700, letterSpacing:3, textTransform:'uppercase', color:'var(--cyan)', marginBottom:12 }}>Como funciona</div>
            <h2 className="rv d1" style={{ fontSize:'clamp(28px,4vw,44px)' }}>3 passos. Sem complicação.</h2>
          </div>
          {[
            { n:'1', t:'Escolha o tipo de documento', d:'Prestação de serviço, NDA, parceria, locação... Temos templates pra tudo.' },
            { n:'2', t:'Responda perguntas simples', d:'Nome, valor, prazo, o que vai fazer. Linguagem humana, não juridiquês.' },
            { n:'3', t:'Baixe seu PDF profissional', d:'A IA gera o documento completo, personalizado, pronto pra assinar.' },
          ].map(({ n, t, d }, i) => (
            <div key={n} className={`rv d${i+1}`} style={{ display:'flex', gap:24, alignItems:'flex-start', marginBottom:48 }}>
              <div style={{ width:48, height:48, borderRadius:12, background:'rgba(59,130,246,0.12)', border:'1px solid rgba(59,130,246,0.2)', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, fontSize:20, color:'var(--blue-light)', flexShrink:0 }}>{n}</div>
              <div>
                <h3 style={{ fontSize:20, marginBottom:6 }}>{t}</h3>
                <p style={{ fontSize:15, color:'var(--text2)', lineHeight:1.7 }}>{d}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Final */}
      <section style={{ padding:'120px 32px', textAlign:'center', position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-50%)', width:600, height:400, background:'radial-gradient(circle,rgba(59,130,246,0.15) 0%,transparent 60%)', filter:'blur(80px)', pointerEvents:'none' }} />
        <div style={{ position:'relative', zIndex:1 }}>
          <h2 className="rv" style={{ fontSize:'clamp(28px,5vw,48px)', color:'var(--text2)', marginBottom:8 }}>Pare de trabalhar sem contrato.</h2>
          <h2 className="rv d1" style={{ fontSize:'clamp(32px,5.5vw,56px)', background:'linear-gradient(135deg,var(--text) 20%,var(--blue-light) 50%,var(--cyan))', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', marginBottom:24 }}>Proteja seu trabalho com IA.</h2>
          <p className="rv d2" style={{ fontSize:18, color:'var(--text2)', marginBottom:40 }}>A partir de R$19,90. Pronto em minutos.</p>
          <Link href="/gerar" className="rv d3" style={{ display:'inline-flex', alignItems:'center', gap:10, padding:'18px 44px', borderRadius:14, background:'var(--blue)', color:'#fff', fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, fontSize:18, animation:'pulse-glow 3s ease-in-out infinite' }}>
            Gerar meu contrato agora
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop:'1px solid var(--border)', padding:'32px' }}>
        <div style={{ maxWidth:1100, margin:'0 auto', display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:16 }}>
          <div style={{ fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, fontSize:16 }}>ContratoAI</div>
          <div style={{ fontSize:12, color:'var(--text3)' }}>&copy; 2026 ContratoAI by <a href="https://rga-technologies.com/" target="_blank" rel="noreferrer" style={{ color:'var(--blue-light)' }}>RGA Technologies</a></div>
        </div>
      </footer>
    </div>
  )
}
