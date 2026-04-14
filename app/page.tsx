'use client'
import Link from 'next/link'
import { useEffect, useState } from 'react'

const DOCS = [
  { id: 'prestacao-servico', title: 'Prestação de Serviço', desc: 'Freelancers, agências, consultorias. O mais usado.', tag: 'Popular', cls: 'bc-big', icon: 'doc' },
  { id: 'parceria', title: 'Acordo de Parceria', desc: 'Sociedades informais, collabs, projetos conjuntos.', cls: 'bc-med', icon: 'handshake' },
  { id: 'confidencialidade', title: 'NDA (Confidencialidade)', desc: 'Proteja informações sensíveis do seu negócio.', cls: 'bc-med', icon: 'lock' },
  { id: 'locacao', title: 'Contrato de Locação', desc: 'Aluguel de imóvel, sala comercial, equipamento.', cls: 'bc-sm', icon: 'home' },
  { id: 'venda', title: 'Compra e Venda', desc: 'Produtos, veículos, equipamentos.', cls: 'bc-sm', icon: 'cart' },
  { id: 'trabalho-freelancer', title: 'Contrato Freelancer', desc: 'Projetos com escopo, prazo e pagamento definidos.', cls: 'bc-sm', icon: 'code' },
  { id: 'distrato', title: 'Distrato / Rescisão', desc: 'Encerre contratos de forma legal e documentada.', cls: 'bc-sm', icon: 'scissors' },
  { id: 'termos-uso', title: 'Termos de Uso + Privacidade', desc: 'Pra apps, sites e plataformas digitais.', cls: 'bc-med', icon: 'phone' },
  { id: 'recibo', title: 'Recibo de Pagamento', desc: 'Comprove pagamentos com documento válido.', cls: 'bc-sm', icon: 'receipt' },
]

const FAQS = [
  { q: 'O contrato gerado tem validade jurídica?', a: 'Sim, contratos particulares têm validade entre as partes conforme o Código Civil brasileiro.' },
  { q: 'Preciso de advogado?', a: 'Para a maioria dos casos do dia a dia, não. Para situações complexas, recomendamos consultar um profissional.' },
  { q: 'Como funciona o pagamento?', a: 'Você paga R$11,90 por documento avulso ou R$34,90/mês para gerar ilimitado. Sem fidelidade.' },
  { q: 'Posso editar o contrato depois?', a: 'Sim, o documento é seu. Pode editar, imprimir e usar como quiser.' },
  { q: 'Quais tipos de contrato vocês geram?', a: 'Prestação de serviço, parceria, NDA, locação, compra e venda, freelancer, distrato, termos de uso e recibo.' },
  { q: 'A IA erra?', a: 'A IA gera com base nas suas respostas. Sempre revise o documento antes de assinar.' },
]

function DocIcon({ type }: { type: string }) {
  const p = { width: 20, height: 20, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const }
  if (type === 'doc') return <svg {...p}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/><path d="M14 2v6h6"/><path d="M16 13H8"/><path d="M16 17H8"/></svg>
  if (type === 'handshake') return <svg {...p}><path d="M20 8H4l3-3"/><path d="m4 16 3 3"/><path d="M4 8v8"/><path d="M20 16V8"/><path d="m9 12 2 2 4-4"/></svg>
  if (type === 'lock') return <svg {...p}><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
  if (type === 'home') return <svg {...p}><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
  if (type === 'cart') return <svg {...p}><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>
  if (type === 'code') return <svg {...p}><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8"/><path d="M12 17v4"/></svg>
  if (type === 'scissors') return <svg {...p}><circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M20 4 8.12 15.88"/><path d="m14.47 14.48 5.53 5.52"/><path d="M8.12 8.12 12 12"/></svg>
  if (type === 'phone') return <svg {...p}><rect x="5" y="2" width="14" height="20" rx="2"/><path d="M12 18h.01"/></svg>
  if (type === 'receipt') return <svg {...p}><path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z"/><path d="M16 8H8"/><path d="M16 12H8"/></svg>
  return <svg {...p}><circle cx="12" cy="12" r="10"/></svg>
}

export default function Home() {
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  useEffect(() => {
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('vis'); io.unobserve(e.target) } })
    }, { threshold: 0.08 })
    document.querySelectorAll('.rv').forEach(el => io.observe(el))

    // Navbar scroll
    const nav = document.getElementById('cai-nav')
    const onScroll = () => { if (nav) nav.classList.toggle('nav-s', window.scrollY > 50) }
    window.addEventListener('scroll', onScroll, { passive: true })

    // Parallax
    const mq = window.matchMedia('(min-width:768px)')
    let tick = false
    const onPx = () => {
      if (!tick) { tick = true; requestAnimationFrame(() => {
        if (mq.matches) {
          const sy = window.scrollY
          document.querySelectorAll<HTMLElement>('.px-s').forEach(el => { el.style.transform = `translateY(${sy * 0.06}px)` })
        }
        tick = false
      })}
    }
    window.addEventListener('scroll', onPx, { passive: true })

    // Smooth scroll
    document.querySelectorAll('a[href^="#"]').forEach(a => {
      a.addEventListener('click', e => { e.preventDefault(); document.querySelector((a as HTMLAnchorElement).href.split('#')[1] ? '#' + (a as HTMLAnchorElement).href.split('#')[1] : '#')?.scrollIntoView({ behavior: 'smooth' }) })
    })

    return () => { window.removeEventListener('scroll', onScroll); window.removeEventListener('scroll', onPx) }
  }, [])

  return (
    <div className="cai">
      <style>{`
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=DM+Sans:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');
.cai{--bg:#0F172A;--bg2:#1E293B;--blue:#1E3A8A;--blue-l:#3B82F6;--green:#22C55E;--text:#FFFFFF;--text2:#94A3B8;--text3:#64748B;--border:rgba(30,58,138,0.2);--glow-b:rgba(30,58,138,0.3);--glow-g:rgba(34,197,94,0.3);font-family:'DM Sans',sans-serif;background:var(--bg);color:var(--text);overflow-x:hidden;line-height:1.6;-webkit-font-smoothing:antialiased}
.cai *{box-sizing:border-box;margin:0;padding:0}
.cai h1,.cai h2,.cai h3,.cai h4{font-family:'Space Grotesk',sans-serif;letter-spacing:-0.02em;line-height:1.1}
.cai a{color:inherit;text-decoration:none}
.cai::before{content:'';position:fixed;inset:0;z-index:9999;pointer-events:none;opacity:0.02;background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");background-repeat:repeat;background-size:128px}

/* Dot pattern */
.dot-bg{background-image:radial-gradient(rgba(30,58,138,0.15) 1px,transparent 1px);background-size:24px 24px}

/* Reveal */
.rv{opacity:0;transform:translateY(24px);transition:opacity 0.65s cubic-bezier(0.16,1,0.3,1),transform 0.65s cubic-bezier(0.16,1,0.3,1)}
.rv.vis{opacity:1;transform:translateY(0)}
.d1{transition-delay:.1s}.d2{transition-delay:.2s}.d3{transition-delay:.3s}.d4{transition-delay:.4s}.d5{transition-delay:.5s}.d6{transition-delay:.6s}.d7{transition-delay:.7s}.d8{transition-delay:.8s}

/* Nav */
#cai-nav{position:fixed;top:0;left:0;right:0;z-index:1000;height:68px;display:flex;align-items:center;justify-content:center;transition:all 0.4s cubic-bezier(0.16,1,0.3,1)}
#cai-nav.nav-s{height:56px;background:rgba(15,23,42,0.95);backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);border-bottom:1px solid var(--border)}
.nav-in{max-width:1140px;width:100%;padding:0 32px;display:flex;align-items:center;justify-content:space-between}
.nav-logo{font-family:'Space Grotesk',sans-serif;font-weight:700;font-size:19;display:flex;align-items:center;gap:8px}
.nav-links{display:flex;align-items:center;gap:24px}
.nav-links a{font-size:14px;color:var(--text2);transition:color 0.2s}
.nav-links a:hover{color:var(--text)}
.cta-green{font-size:13px;font-weight:600;background:var(--green);color:#fff;padding:10px 20px;border-radius:8px;box-shadow:0 0 20px var(--glow-g);transition:all 0.3s;border:none;cursor:pointer;display:inline-flex;align-items:center;gap:6px}
.cta-green:hover{box-shadow:0 0 32px var(--glow-g);transform:translateY(-1px)}
.nav-mob{display:none;font-size:13px;font-weight:600;background:var(--green);color:#fff;padding:8px 16px;border-radius:8px}

/* Glass card */
.glass{background:rgba(15,23,42,0.8);backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);border:1px solid var(--border);border-radius:12px;transition:all 0.35s cubic-bezier(0.16,1,0.3,1)}
.glass:hover{border-color:rgba(59,130,246,0.35);box-shadow:0 0 32px rgba(30,58,138,0.12)}

/* Sec */
.sec{position:relative;overflow:hidden}
.sec-in{max-width:1140px;margin:0 auto;padding:0 32px}
.sec-label{font-family:'JetBrains Mono',monospace;font-size:11px;font-weight:500;letter-spacing:2px;text-transform:uppercase;color:var(--blue-l);margin-bottom:14px}
.sec-title{font-size:clamp(28px,4.5vw,48px);margin-bottom:16px}
.sec-sub{font-size:17px;color:var(--text2);max-width:520px;line-height:1.7}
.sec-line{width:80px;height:1px;background:linear-gradient(90deg,var(--blue-l),transparent);margin:12px 0 0}

/* Bento */
.bento{display:grid;grid-template-columns:repeat(4,1fr);gap:14px}
.bc-big{grid-column:span 2;grid-row:span 2}
.bc-med{grid-column:span 2}
.bc-sm{grid-column:span 1}
.bento-card{padding:24px;cursor:pointer;position:relative;overflow:hidden}
.bento-card .bc-icon{width:40px;height:40px;border-radius:10px;background:rgba(30,58,138,0.2);display:flex;align-items:center;justify-content:center;color:var(--blue-l);margin-bottom:12px;transition:all 0.3s}
.bento-card:hover .bc-icon{background:rgba(59,130,246,0.15);box-shadow:0 0 16px var(--glow-b)}
.bento-card .bc-t{font-family:'Space Grotesk',sans-serif;font-weight:700;font-size:15px;margin-bottom:4px}
.bento-card .bc-d{font-size:13px;color:var(--text2);line-height:1.6}
.bento-card::after{content:'';position:absolute;inset:0;background:radial-gradient(circle at 50% 0%,rgba(30,58,138,0.06),transparent 60%);opacity:0;transition:opacity 0.3s;pointer-events:none}
.bento-card:hover::after{opacity:1}

/* Timeline */
.tl-row{display:flex;gap:32px;position:relative;margin-top:48px}
.tl-step{flex:1;position:relative;padding-top:48px}
.tl-num{position:absolute;top:0;left:0;font-family:'Space Grotesk',sans-serif;font-size:64px;font-weight:700;color:rgba(30,58,138,0.15);line-height:1}
.tl-line{position:absolute;top:24px;left:0;right:0;height:2px;background:rgba(30,58,138,0.15)}
@keyframes tl-fill{from{width:0}to{width:100%}}
.tl-line-fill{height:100%;background:linear-gradient(90deg,var(--blue-l),var(--blue));width:0}
.tl-line-fill.vis{animation:tl-fill 1.5s cubic-bezier(0.16,1,0.3,1) forwards}

/* Mockup */
.mock{max-width:560px;margin:0 auto;perspective:800px}
.mock-doc{background:#0B1120;border:1px solid rgba(59,130,246,0.2);border-radius:8px;padding:32px;box-shadow:0 20px 60px rgba(0,0,0,0.4),0 0 40px rgba(30,58,138,0.08);transform:rotateX(2deg) rotateY(-1deg);transition:transform 0.5s}
.mock-doc:hover{transform:rotateX(0) rotateY(0)}
.mock-line{height:8px;border-radius:4px;background:rgba(148,163,184,0.1);margin-bottom:10px}
.mock-line.hl{background:rgba(59,130,246,0.15);border:1px solid rgba(59,130,246,0.2)}

/* Killer */
.killer{background:var(--bg2);clip-path:polygon(0 32px,100% 0,100% calc(100% - 32px),0 100%)}
.k-grid{display:grid;grid-template-columns:1fr 1fr;gap:20px;max-width:880px;margin:48px auto 0}
.k-item{padding:28px;display:flex;gap:16px;align-items:flex-start}
.k-icon{width:48px;height:48px;border-radius:12px;background:rgba(30,58,138,0.15);display:flex;align-items:center;justify-content:center;color:var(--blue-l);flex-shrink:0}
.k-item h4{font-size:17px;margin-bottom:4px}
.k-item p{font-size:14px;color:var(--text2);line-height:1.6}

/* Pricing */
.price-card{max-width:420px;margin:48px auto 0;padding:40px;text-align:center;border:1px solid rgba(59,130,246,0.25);box-shadow:0 0 48px rgba(30,58,138,0.15)}
.price-val{font-family:'Space Grotesk',sans-serif;font-size:48px;font-weight:700;margin:16px 0 4px}
.price-val span{font-size:16px;font-weight:400;color:var(--text2)}
.price-list{list-style:none;text-align:left;margin:24px 0;display:flex;flex-direction:column;gap:12px}
.price-list li{font-size:14px;color:var(--text2);display:flex;align-items:center;gap:10px}
.price-list li::before{content:'';width:18px;height:18px;border-radius:50%;background:rgba(30,58,138,0.2);flex-shrink:0;background-image:url("data:image/svg+xml,%3Csvg width='10' height='10' viewBox='0 0 24 24' fill='none' stroke='%233B82F6' stroke-width='3' xmlns='http://www.w3.org/2000/svg'%3E%3Cpolyline points='20 6 9 17 4 12'/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:center;background-size:10px}

/* FAQ */
.faq-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:40px}
.faq-item{border:1px solid var(--border);border-radius:10px;overflow:hidden;transition:border-color 0.3s}
.faq-item.open{border-color:rgba(59,130,246,0.3)}
.faq-q{padding:16px 20px;display:flex;align-items:center;justify-content:space-between;cursor:pointer;font-weight:600;font-size:14px;gap:12px;background:transparent;border:none;color:var(--text);width:100%;text-align:left;font-family:'DM Sans',sans-serif}
.faq-q:hover{color:var(--blue-l)}
.faq-icon{width:20px;height:20px;border-radius:50%;background:rgba(30,58,138,0.15);display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:transform 0.3s;font-size:14px;color:var(--blue-l)}
.faq-item.open .faq-icon{transform:rotate(45deg)}
.faq-a{padding:0 20px 16px;font-size:13px;color:var(--text2);line-height:1.7;display:none}
.faq-item.open .faq-a{display:block}

/* CTA final */
.cta-final{background:var(--blue);padding:100px 32px;text-align:center}
.cta-final h2{font-size:clamp(24px,4vw,40px);color:rgba(255,255,255,0.7);margin-bottom:8px}
.cta-final .big{font-size:clamp(28px,5vw,52px);color:#fff;margin-bottom:20px}
.cta-final .sub{font-size:17px;color:rgba(255,255,255,0.6);margin-bottom:36px}
@keyframes glow-pulse{0%,100%{box-shadow:0 0 24px var(--glow-g)}50%{box-shadow:0 0 48px var(--glow-g)}}

/* Footer */
.cai-footer{border-top:1px solid var(--border);padding:32px}
.cai-footer .sec-in{display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px}

.px-s{will-change:transform}

/* Responsive */
@media(max-width:1024px){.bento{grid-template-columns:repeat(2,1fr)}.bc-big{grid-row:span 1}.k-grid{grid-template-columns:1fr}}
@media(max-width:768px){
  .sec-in{padding:0 20px}
  .nav-in{padding:0 20px}
  .nav-links{display:none!important}
  .nav-mob{display:flex!important}
  .bento{grid-template-columns:1fr}.bc-big,.bc-med{grid-column:span 1}
  .tl-row{flex-direction:column;gap:40px}
  .tl-line{display:none}
  .faq-grid{grid-template-columns:1fr}
  .cai-footer .sec-in{flex-direction:column;text-align:center}
  .hero-grid{grid-template-columns:1fr!important;text-align:center}
  .hero-grid .sec-sub{margin-left:auto;margin-right:auto}
  .hero-badges{justify-content:center!important}
  .killer{clip-path:polygon(0 16px,100% 0,100% calc(100% - 16px),0 100%)}
}
@media(max-width:480px){.sec-title{font-size:26px!important}}
      `}</style>

      {/* Nav */}
      <nav id="cai-nav">
        <div className="nav-in">
          <Link href="/" className="nav-logo">
            <div style={{ width: 30, height: 30, borderRadius: 7, background: 'linear-gradient(135deg,var(--blue),var(--blue-l))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700 }}>C</div>
            ContratoAI
          </Link>
          <div className="nav-links">
            <a href="#documentos">Documentos</a>
            <a href="#como-funciona">Como funciona</a>
            <a href="#preco">Preço</a>
            <Link href="/login" style={{ fontSize: 14, color: 'var(--text2)' }}>Entrar</Link>
            <Link href="/gerar" className="cta-green">Gerar contrato</Link>
          </div>
          <Link href="/gerar" className="nav-mob">Gerar contrato</Link>
        </div>
      </nav>

      {/* 1. HERO */}
      <section className="sec dot-bg" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', padding: '100px 0 60px' }}>
        <div className="sec-in">
          <div className="hero-grid" style={{ display: 'grid', gridTemplateColumns: '55% 45%', gap: 48, alignItems: 'center' }}>
            <div>
              <div className="rv" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 14px', borderRadius: 99, background: 'rgba(30,58,138,0.2)', border: '1px solid rgba(59,130,246,0.15)', marginBottom: 24 }}>
                <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 11, color: 'var(--blue-l)', fontWeight: 500 }}>Inteligência Artificial Jurídica</span>
              </div>
              <h1 className="rv d1" style={{ fontSize: 'clamp(36px,5.5vw,60px)', marginBottom: 20 }}>
                Contratos profissionais<br />
                <span style={{ color: 'var(--blue-l)' }}>em minutos.</span>
              </h1>
              <p className="rv d2 sec-sub">Responda perguntas simples. A IA gera seu contrato personalizado, com cláusulas específicas do seu caso, pronto pra assinar e usar.</p>
              <div className="rv d2 sec-line" />
              <div className="rv d3 hero-badges" style={{ display: 'flex', gap: 16, marginTop: 28, flexWrap: 'wrap' }}>
                {[['9+', 'Tipos de documento'], ['< 3min', 'Pra gerar'], ['R$11,90', 'Por documento']].map(([n, l]) => (
                  <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 14, fontWeight: 500, color: 'var(--blue-l)' }}>{n}</span>
                    <span style={{ fontSize: 13, color: 'var(--text3)' }}>{l}</span>
                  </div>
                ))}
              </div>
              <Link href="/gerar" className="cta-green rv d4" style={{ marginTop: 32, padding: '16px 32px', fontSize: 16, fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, borderRadius: 10, display: 'inline-flex' }}>
                Gerar meu contrato
                <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </Link>
            </div>
            {/* Mockup */}
            <div className="rv d3" style={{ display: 'flex', justifyContent: 'center' }}>
              <div className="mock">
                <div className="mock-doc">
                  <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 13, fontWeight: 700, color: 'var(--blue-l)', letterSpacing: 1, marginBottom: 20, textTransform: 'uppercase' }}>Contrato de Prestação de Serviço</div>
                  <div className="mock-line" style={{ width: '100%' }} />
                  <div className="mock-line" style={{ width: '90%' }} />
                  <div className="mock-line hl" style={{ width: '70%' }} />
                  <div className="mock-line" style={{ width: '95%' }} />
                  <div className="mock-line" style={{ width: '80%' }} />
                  <div className="mock-line hl" style={{ width: '60%' }} />
                  <div className="mock-line" style={{ width: '88%' }} />
                  <div className="mock-line" style={{ width: '75%' }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 28, paddingTop: 20, borderTop: '1px solid rgba(59,130,246,0.1)' }}>
                    <div>
                      <div style={{ width: 80, height: 1, background: 'var(--text3)', marginBottom: 4 }} />
                      <div style={{ fontSize: 10, color: 'var(--text3)' }}>Contratante</div>
                    </div>
                    <div>
                      <div style={{ width: 80, height: 1, background: 'var(--text3)', marginBottom: 4 }} />
                      <div style={{ fontSize: 10, color: 'var(--text3)' }}>Prestador</div>
                    </div>
                  </div>
                  <div style={{ position: 'absolute', top: 16, right: 16, padding: '3px 8px', borderRadius: 4, background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.15)', fontFamily: "'JetBrains Mono',monospace", fontSize: 9, color: 'var(--blue-l)' }}>Gerado por IA</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="px-s" style={{ position: 'absolute', top: '15%', right: '5%', width: 300, height: 300, background: 'radial-gradient(circle,rgba(30,58,138,0.12),transparent 70%)', filter: 'blur(60px)', pointerEvents: 'none' }} />
      </section>

      {/* 2. DOCUMENTOS */}
      <section id="documentos" className="sec" style={{ padding: '100px 0' }}>
        <div className="sec-in" style={{ marginBottom: 48 }}>
          <div className="sec-label rv">Documentos</div>
          <h2 className="sec-title rv d1">Escolha o que precisa</h2>
          <p className="sec-sub rv d2">Cada documento é gerado pela IA com base nas suas respostas. Personalizado, não genérico.</p>
          <div className="rv d2 sec-line" />
        </div>
        <div className="sec-in">
          <div className="bento">
            {DOCS.map((doc, i) => (
              <Link href={`/gerar?tipo=${doc.id}`} key={doc.id} className={`glass bento-card ${doc.cls} rv d${Math.min(i + 1, 8)}`}>
                {doc.tag && <span style={{ position: 'absolute', top: 12, right: 12, fontFamily: "'JetBrains Mono',monospace", fontSize: 10, fontWeight: 500, padding: '3px 10px', borderRadius: 99, background: 'rgba(59,130,246,0.12)', color: 'var(--blue-l)', letterSpacing: 0.5 }}>{doc.tag}</span>}
                <div className="bc-icon"><DocIcon type={doc.icon} /></div>
                <div className="bc-t">{doc.title}</div>
                <div className="bc-d">{doc.desc}</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 3. COMO FUNCIONA */}
      <section id="como-funciona" className="sec" style={{ padding: '100px 0', background: 'var(--bg2)' }}>
        <div className="sec-in" style={{ textAlign: 'center' }}>
          <div className="sec-label rv">Como funciona</div>
          <h2 className="sec-title rv d1">3 passos. Sem complicação.</h2>
        </div>
        <div className="sec-in">
          <div className="tl-row">
            <div className="tl-line"><div className="tl-line-fill rv" /></div>
            {[
              { n: '1', t: 'Escolha o tipo de documento', d: 'Prestação de serviço, NDA, parceria, locação... Temos 9 tipos.' },
              { n: '2', t: 'Responda perguntas simples', d: 'Linguagem humana, não juridiquês. Nome, valor, prazo, o que vai fazer.' },
              { n: '3', t: 'Baixe seu documento', d: 'A IA gera o contrato completo, personalizado, pronto pra assinar.' },
            ].map(({ n, t, d }, i) => (
              <div key={n} className={`tl-step rv d${i + 1}`}>
                <div className="tl-num">{n}</div>
                <h3 style={{ fontSize: 18, marginBottom: 6 }}>{t}</h3>
                <p style={{ fontSize: 14, color: 'var(--text2)', lineHeight: 1.7 }}>{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. PREVIEW */}
      <section className="sec" style={{ padding: '100px 0' }}>
        <div className="sec-in" style={{ textAlign: 'center', marginBottom: 48 }}>
          <div className="sec-label rv">Preview</div>
          <h2 className="sec-title rv d1">Documento profissional e completo</h2>
          <p className="sec-sub rv d2" style={{ margin: '0 auto' }}>Cláusulas numeradas, linguagem jurídica formal, espaço pra assinatura. Tudo pronto pra usar.</p>
        </div>
        <div className="sec-in rv d2">
          <div className="mock" style={{ maxWidth: 620 }}>
            <div className="mock-doc" style={{ padding: 40 }}>
              <div style={{ textAlign: 'center', marginBottom: 24 }}>
                <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 15, fontWeight: 700, color: 'var(--text)', letterSpacing: 1 }}>CONTRATO DE PRESTAÇÃO DE SERVIÇO</div>
                <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 4 }}>Gerado em 14/04/2026 por ContratoAI</div>
              </div>
              <div style={{ fontSize: 12, color: 'var(--text2)', lineHeight: 2, marginBottom: 16 }}>
                <strong style={{ color: 'var(--blue-l)' }}>CLÁUSULA PRIMEIRA — DO OBJETO</strong><br />
                <div className="mock-line" style={{ width: '100%', margin: '6px 0' }} />
                <div className="mock-line" style={{ width: '92%', margin: '6px 0' }} />
                <div className="mock-line hl" style={{ width: '75%', margin: '6px 0' }} />
              </div>
              <div style={{ fontSize: 12, color: 'var(--text2)', lineHeight: 2, marginBottom: 16 }}>
                <strong style={{ color: 'var(--blue-l)' }}>CLÁUSULA SEGUNDA — DO VALOR</strong><br />
                <div className="mock-line" style={{ width: '88%', margin: '6px 0' }} />
                <div className="mock-line hl" style={{ width: '60%', margin: '6px 0' }} />
              </div>
              <div style={{ fontSize: 12, color: 'var(--text2)', lineHeight: 2 }}>
                <strong style={{ color: 'var(--blue-l)' }}>CLÁUSULA TERCEIRA — DO PRAZO</strong><br />
                <div className="mock-line" style={{ width: '95%', margin: '6px 0' }} />
                <div className="mock-line" style={{ width: '70%', margin: '6px 0' }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 32, paddingTop: 24, borderTop: '1px solid rgba(59,130,246,0.1)' }}>
                <div style={{ textAlign: 'center' }}>
                  <svg width="80" height="24" viewBox="0 0 80 24"><path d="M5 20 C15 5, 25 18, 40 10 S60 5, 75 15" fill="none" stroke="rgba(148,163,184,0.4)" strokeWidth="1.5"/></svg>
                  <div style={{ width: 80, height: 1, background: 'var(--text3)' }} />
                  <div style={{ fontSize: 10, color: 'var(--text3)', marginTop: 4 }}>Contratante</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <svg width="80" height="24" viewBox="0 0 80 24"><path d="M5 15 C20 5, 35 20, 50 8 S65 18, 75 10" fill="none" stroke="rgba(148,163,184,0.4)" strokeWidth="1.5"/></svg>
                  <div style={{ width: 80, height: 1, background: 'var(--text3)' }} />
                  <div style={{ fontSize: 10, color: 'var(--text3)', marginTop: 4 }}>Prestador</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. POR QUE USAR */}
      <section className="sec killer" style={{ padding: '120px 0' }}>
        <div className="sec-in" style={{ textAlign: 'center', paddingTop: 20 }}>
          <div className="sec-label rv">Por que usar</div>
          <h2 className="sec-title rv d1">Sem advogado. Sem burocracia.</h2>
        </div>
        <div className="sec-in">
          <div className="k-grid">
            {[
              { t: 'Sem advogado, sem burocracia', d: 'Contratos válidos e profissionais sem precisar de consultoria jurídica.', icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg> },
              { t: 'Personalizado, não template', d: 'Cada contrato é único, gerado pela IA com base nas suas respostas.', icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/><path d="M14 2v6h6"/></svg> },
              { t: 'Pronto em menos de 3 minutos', d: 'Preencha, clique em gerar e o documento fica pronto na hora.', icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg> },
              { t: 'Download imediato', d: 'Baixe o documento completo e use como quiser. Sem espera.', icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg> },
            ].map(({ t, d, icon }, i) => (
              <div key={t} className={`glass k-item rv d${i + 1}`}>
                <div className="k-icon">{icon}</div>
                <div><h4>{t}</h4><p>{d}</p></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. PREÇO */}
      <section id="preco" className="sec" style={{ padding: '100px 0' }}>
        <div className="sec-in" style={{ textAlign: 'center' }}>
          <div className="sec-label rv">Preço</div>
          <h2 className="sec-title rv d1">Simples e transparente</h2>
        </div>
        <div className="sec-in">
          <div className="glass price-card rv d2" style={{ borderRadius: 16 }}>
            <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 12, color: 'var(--blue-l)', marginBottom: 4 }}>AVULSO</div>
            <div className="price-val">R$11,90 <span>/documento</span></div>
            <p style={{ fontSize: 14, color: 'var(--text3)', marginBottom: 8 }}>ou <strong style={{ color: 'var(--blue-l)' }}>R$34,90/mês</strong> ilimitado</p>
            <ul className="price-list">
              <li>Contrato personalizado com IA</li>
              <li>Cláusulas específicas do seu caso</li>
              <li>Linguagem jurídica formal</li>
              <li>Pronto pra assinar</li>
              <li>Download imediato</li>
            </ul>
            <Link href="/gerar" className="cta-green" style={{ width: '100%', justifyContent: 'center', padding: '16px', fontSize: 16, fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, borderRadius: 10, animation: 'glow-pulse 3s ease-in-out infinite' }}>
              Gerar meu contrato agora
            </Link>
            <p style={{ fontSize: 12, color: 'var(--text3)', marginTop: 16 }}>Sem assinatura obrigatória. Pague só quando precisar.</p>
          </div>
        </div>
      </section>

      {/* 7. FAQ */}
      <section className="sec" style={{ padding: '100px 0', background: 'var(--bg2)' }}>
        <div className="sec-in" style={{ textAlign: 'center', marginBottom: 8 }}>
          <div className="sec-label rv">FAQ</div>
          <h2 className="sec-title rv d1">Dúvidas frequentes</h2>
        </div>
        <div className="sec-in">
          <div className="faq-grid">
            {FAQS.map((faq, i) => (
              <div key={i} className={`faq-item rv d${Math.min(i + 1, 6)} ${openFaq === i ? 'open' : ''}`}>
                <button className="faq-q" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                  {faq.q}
                  <span className="faq-icon">+</span>
                </button>
                <div className="faq-a">{faq.a}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 8. CTA + FOOTER */}
      <section className="cta-final">
        <h2 className="rv">Pare de trabalhar sem contrato.</h2>
        <h2 className="rv d1 big">Proteja seu trabalho com IA.</h2>
        <p className="rv d2 sub">A partir de R$11,90. Pronto em minutos.</p>
        <Link href="/gerar" className="cta-green rv d3" style={{ padding: '18px 44px', fontSize: 18, fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, borderRadius: 12, animation: 'glow-pulse 3s ease-in-out infinite' }}>
          Gerar meu contrato agora
          <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
        </Link>
      </section>

      <footer className="cai-footer">
        <div className="sec-in">
          <div className="nav-logo" style={{ fontSize: 16 }}>
            <div style={{ width: 24, height: 24, borderRadius: 6, background: 'linear-gradient(135deg,var(--blue),var(--blue-l))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700 }}>C</div>
            ContratoAI
          </div>
          <div style={{ fontSize: 12, color: 'var(--text3)' }}>
            &copy; 2026 ContratoAI by <a href="https://rga-technologies.com/" target="_blank" rel="noreferrer" style={{ color: 'var(--blue-l)' }}>RGA Technologies</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
