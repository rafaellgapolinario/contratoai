'use client'
import Link from 'next/link'
import { useEffect, useState } from 'react'

const DOCS = [
  { id: 'prestacao-servico', title: 'Prestação de Serviço', desc: 'Freelancers, agências, consultorias. O mais usado no Brasil.', tag: 'Popular', cls: 'bc-big', icon: 'doc' },
  { id: 'peticao-inicial', title: 'Petição Inicial', desc: 'Ações judiciais de cobrança, indenização e mais. Fundamentação sólida.', tag: 'Novo', cls: 'bc-big', icon: 'doc' },
  { id: 'parceria', title: 'Acordo de Parceria', desc: 'Sociedades informais, collabs, projetos conjuntos.', cls: 'bc-med', icon: 'handshake' },
  { id: 'confidencialidade', title: 'NDA (Confidencialidade)', desc: 'Proteja informações sensíveis do seu negócio.', cls: 'bc-med', icon: 'lock' },
  { id: 'contestacao', title: 'Contestação', desc: 'Defesa em ações judiciais com fundamentos sólidos.', cls: 'bc-med', icon: 'doc' },
  { id: 'notificacao-extrajudicial', title: 'Notificação Extrajudicial', desc: 'Notifique formalmente antes de ir à Justiça.', cls: 'bc-med', icon: 'doc' },
  { id: 'locacao', title: 'Contrato de Locação', desc: 'Aluguel de imóvel, sala comercial, equipamento.', cls: 'bc-sm', icon: 'home' },
  { id: 'venda', title: 'Compra e Venda', desc: 'Produtos, veículos, equipamentos.', cls: 'bc-sm', icon: 'cart' },
  { id: 'trabalho-freelancer', title: 'Contrato Freelancer', desc: 'Projetos com escopo, prazo e pagamento definidos.', cls: 'bc-sm', icon: 'code' },
  { id: 'contrato-social', title: 'Contrato Social', desc: 'Abra sua empresa com contrato societário completo.', cls: 'bc-sm', icon: 'doc' },
  { id: 'procuracao', title: 'Procuração', desc: 'Delegue poderes com documento válido.', cls: 'bc-sm', icon: 'doc' },
  { id: 'recurso-apelacao', title: 'Recurso de Apelação', desc: 'Recorra de sentenças desfavoráveis.', cls: 'bc-sm', icon: 'doc' },
  { id: 'acordo-trabalhista', title: 'Acordo Trabalhista', desc: 'Rescisões e acordos extrajudiciais.', cls: 'bc-sm', icon: 'handshake' },
  { id: 'distrato', title: 'Distrato / Rescisão', desc: 'Encerre contratos de forma legal e documentada.', cls: 'bc-sm', icon: 'scissors' },
  { id: 'termos-uso', title: 'Termos de Uso + Privacidade', desc: 'Pra apps, sites e plataformas digitais.', cls: 'bc-med', icon: 'phone' },
  { id: 'declaracao', title: 'Declaração', desc: 'Declarações formais para qualquer finalidade.', cls: 'bc-sm', icon: 'doc' },
  { id: 'carta-demissao', title: 'Carta de Demissão', desc: 'Formalize seu pedido de desligamento.', cls: 'bc-sm', icon: 'doc' },
  { id: 'habeas-corpus', title: 'Habeas Corpus', desc: 'Proteja a liberdade contra prisão ilegal.', cls: 'bc-sm', icon: 'lock' },
  { id: 'recibo', title: 'Recibo de Pagamento', desc: 'Comprove pagamentos com documento válido.', cls: 'bc-sm', icon: 'receipt' },
]

const FAQS = [
  {
    q: 'O contrato gerado pelo ContratoAI tem validade jurídica?',
    a: 'Sim. Contratos particulares celebrados entre partes capazes têm plena validade jurídica no Brasil, conforme os artigos 104 e 421 do Código Civil. O ContratoAI gera documentos com todas as cláusulas essenciais exigidas pela legislação brasileira — objeto, partes, obrigações, valor, prazo, foro e condições de rescisão. O documento gerado serve como instrumento particular e pode ser utilizado em juízo como prova. Para contratos que exigem escritura pública (como compra e venda de imóveis acima de 30 salários mínimos), recomendamos registrar em cartório.'
  },
  {
    q: 'Preciso de advogado para usar o ContratoAI?',
    a: 'Para a maioria das situações do dia a dia — como contratos de prestação de serviço, NDAs, locações e recibos — não é necessário advogado. O ContratoAI gera documentos completos com linguagem jurídica formal e cláusulas de proteção. No entanto, para situações mais complexas (litígios trabalhistas, disputas societárias, contratos de alto valor), recomendamos que um advogado revise o documento. O ContratoAI é uma ferramenta que economiza tempo e dinheiro, mas não substitui o aconselhamento jurídico em casos que exigem análise especializada.'
  },
  {
    q: 'Qual a diferença entre o ContratoAI e o ChatGPT?',
    a: 'O ChatGPT é uma IA genérica que pode gerar textos sobre qualquer assunto, mas não foi treinada especificamente para o direito brasileiro. O ContratoAI é uma plataforma especializada em documentos jurídicos brasileiros. As principais diferenças são: (1) nossos prompts são otimizados com referências à legislação brasileira vigente — Código Civil, CLT, CDC, CPC; (2) os documentos seguem formatação jurídica profissional com cláusulas numeradas, foro, e espaço para assinatura; (3) oferecemos análise de risco, assinatura digital, pesquisa de jurisprudência e base de teses — funcionalidades que o ChatGPT não tem; (4) temos 19 tipos de documento pré-configurados com perguntas específicas para cada caso.'
  },
  {
    q: 'Como funciona o pagamento? Posso cancelar quando quiser?',
    a: 'Oferecemos duas formas de pagamento: Avulso (R$11,90 por documento, pague só quando precisar, sem compromisso) e Profissional (R$59,90/mês com tudo ilimitado). O plano Profissional inclui documentos ilimitados, consulta jurídica com IA, análise de risco de contratos, assinatura digital, pesquisa de jurisprudência, base de teses e modelos personalizados. Não há fidelidade — você pode cancelar a qualquer momento sem multa. O pagamento é processado com segurança pelo Mercado Pago via Pix, cartão de crédito ou boleto.'
  },
  {
    q: 'Posso editar o contrato depois de gerado?',
    a: 'Sim! Após gerar o documento, você pode editá-lo de duas formas: (1) Edição com IA — descreva o que quer alterar em linguagem natural (ex: "adicione uma cláusula de multa por atraso de 2%") e a IA aplica a mudança mantendo a formatação; (2) Download e edição livre — baixe o documento em Word (.docx) e edite como quiser no seu editor. O documento é seu. Além disso, o recurso de Diff mostra exatamente o que foi alterado (em verde o que foi adicionado, em vermelho o que foi removido), para você ter total controle das mudanças.'
  },
  {
    q: 'Quais tipos de documento o ContratoAI gera?',
    a: 'Atualmente geramos 19 tipos de documentos jurídicos, organizados em 4 categorias: Contratos (Prestação de Serviço, Parceria, NDA/Confidencialidade, Locação, Compra e Venda, Freelancer, Contrato Social, Distrato/Rescisão); Peças Judiciais (Petição Inicial, Contestação, Recurso de Apelação, Habeas Corpus); Documentos (Notificação Extrajudicial, Procuração, Declaração, Termos de Uso + Privacidade, Recibo de Pagamento); e Trabalhista (Acordo Trabalhista Extrajudicial, Carta de Demissão). Cada tipo tem perguntas específicas e prompts otimizados para gerar o documento mais completo possível.'
  },
  {
    q: 'A IA pode errar? Como garantir a qualidade?',
    a: 'Como toda ferramenta de IA, o ContratoAI gera documentos com base nas informações que você fornece. A qualidade do resultado depende da precisão das suas respostas. Para garantir a melhor qualidade: (1) responda todas as perguntas com informações corretas e completas; (2) use o recurso de Análise de Risco para verificar se há cláusulas faltando ou problemas no documento; (3) sempre revise o documento final antes de assinar; (4) para contratos de alto valor ou complexidade, consulte um advogado. Nossa IA é constantemente atualizada com a legislação brasileira, mas a revisão humana é sempre recomendada.'
  },
  {
    q: 'O que é a Consulta Jurídica com IA?',
    a: 'A Consulta Jurídica é um chat com IA alimentado por uma base de conhecimento jurídico (tecnologia RAG — Retrieval-Augmented Generation). Funciona assim: nossos administradores sobem livros de direito e legislação na plataforma, e quando você faz uma pergunta, a IA busca as passagens mais relevantes nesses documentos e responde com fundamentação. Não é uma consulta genérica — é baseada em fontes reais de direito brasileiro. Disponível no plano Profissional, com fontes citadas em cada resposta e disclaimer de que não substitui orientação de advogado.'
  },
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
  const [openFaqs, setOpenFaqs] = useState<Set<number>>(new Set())

  const toggleFaq = (i: number) => {
    setOpenFaqs(prev => {
      const next = new Set(prev)
      if (next.has(i)) next.delete(i)
      else next.add(i)
      return next
    })
  }

  useEffect(() => {
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('vis'); io.unobserve(e.target) } })
    }, { threshold: 0.08 })
    document.querySelectorAll('.rv').forEach(el => io.observe(el))

    const nav = document.getElementById('cai-nav')
    const onScroll = () => { if (nav) nav.classList.toggle('nav-s', window.scrollY > 50) }
    window.addEventListener('scroll', onScroll, { passive: true })

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

.dot-bg{background-image:radial-gradient(rgba(30,58,138,0.15) 1px,transparent 1px);background-size:24px 24px}

.rv{opacity:0;transform:translateY(24px);transition:opacity 0.65s cubic-bezier(0.16,1,0.3,1),transform 0.65s cubic-bezier(0.16,1,0.3,1)}
.rv.vis{opacity:1;transform:translateY(0)}
.d1{transition-delay:.1s}.d2{transition-delay:.2s}.d3{transition-delay:.3s}.d4{transition-delay:.4s}.d5{transition-delay:.5s}.d6{transition-delay:.6s}.d7{transition-delay:.7s}.d8{transition-delay:.8s}

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

.glass{background:rgba(15,23,42,0.8);backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);border:1px solid var(--border);border-radius:12px;transition:all 0.35s cubic-bezier(0.16,1,0.3,1)}
.glass:hover{border-color:rgba(59,130,246,0.35);box-shadow:0 0 32px rgba(30,58,138,0.12)}

.sec{position:relative;overflow:hidden}
.sec-in{max-width:1140px;margin:0 auto;padding:0 32px}
.sec-label{font-family:'JetBrains Mono',monospace;font-size:11px;font-weight:500;letter-spacing:2px;text-transform:uppercase;color:var(--blue-l);margin-bottom:14px}
.sec-title{font-size:clamp(28px,4.5vw,48px);margin-bottom:16px}
.sec-sub{font-size:17px;color:var(--text2);max-width:600px;line-height:1.7}
.sec-line{width:80px;height:1px;background:linear-gradient(90deg,var(--blue-l),transparent);margin:12px 0 0}

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

.tl-row{display:flex;gap:32px;position:relative;margin-top:48px}
.tl-step{flex:1;position:relative;padding-top:48px}
.tl-num{position:absolute;top:0;left:0;font-family:'Space Grotesk',sans-serif;font-size:64px;font-weight:700;color:rgba(30,58,138,0.15);line-height:1}
.tl-line{position:absolute;top:24px;left:0;right:0;height:2px;background:rgba(30,58,138,0.15)}
@keyframes tl-fill{from{width:0}to{width:100%}}
.tl-line-fill{height:100%;background:linear-gradient(90deg,var(--blue-l),var(--blue));width:0}
.tl-line-fill.vis{animation:tl-fill 1.5s cubic-bezier(0.16,1,0.3,1) forwards}

.mock{max-width:560px;margin:0 auto;perspective:800px}
.mock-doc{background:#0B1120;border:1px solid rgba(59,130,246,0.2);border-radius:8px;padding:32px;box-shadow:0 20px 60px rgba(0,0,0,0.4),0 0 40px rgba(30,58,138,0.08);transform:rotateX(2deg) rotateY(-1deg);transition:transform 0.5s}
.mock-doc:hover{transform:rotateX(0) rotateY(0)}
.mock-line{height:8px;border-radius:4px;background:rgba(148,163,184,0.1);margin-bottom:10px}
.mock-line.hl{background:rgba(59,130,246,0.15);border:1px solid rgba(59,130,246,0.2)}

.killer{background:var(--bg2);clip-path:polygon(0 32px,100% 0,100% calc(100% - 32px),0 100%)}
.k-grid{display:grid;grid-template-columns:1fr 1fr;gap:20px;max-width:880px;margin:48px auto 0}
.k-item{padding:28px;display:flex;gap:16px;align-items:flex-start}
.k-icon{width:48px;height:48px;border-radius:12px;background:rgba(30,58,138,0.15);display:flex;align-items:center;justify-content:center;color:var(--blue-l);flex-shrink:0}
.k-item h4{font-size:17px;margin-bottom:6px}
.k-item p{font-size:14px;color:var(--text2);line-height:1.7}

.price-val{font-family:'Space Grotesk',sans-serif;font-size:48px;font-weight:700;margin:16px 0 4px}
.price-val span{font-size:16px;font-weight:400;color:var(--text2)}
.price-list{list-style:none;text-align:left;margin:24px 0;display:flex;flex-direction:column;gap:12px}
.price-list li{font-size:14px;color:var(--text2);display:flex;align-items:center;gap:10px}
.price-list li::before{content:'';width:18px;height:18px;border-radius:50%;background:rgba(30,58,138,0.2);flex-shrink:0;background-image:url("data:image/svg+xml,%3Csvg width='10' height='10' viewBox='0 0 24 24' fill='none' stroke='%233B82F6' stroke-width='3' xmlns='http://www.w3.org/2000/svg'%3E%3Cpolyline points='20 6 9 17 4 12'/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:center;background-size:10px}

/* FAQ */
.faq-list{display:flex;flex-direction:column;gap:12px;margin-top:40px;max-width:800px;margin-left:auto;margin-right:auto}
.faq-item{border:1px solid var(--border);border-radius:12px;overflow:hidden;transition:border-color 0.3s}
.faq-item.open{border-color:rgba(59,130,246,0.3);background:rgba(30,58,138,0.05)}
.faq-q{padding:20px 24px;display:flex;align-items:center;justify-content:space-between;cursor:pointer;font-weight:600;font-size:15px;gap:16px;background:transparent;border:none;color:var(--text);width:100%;text-align:left;font-family:'DM Sans',sans-serif;line-height:1.4}
.faq-q:hover{color:var(--blue-l)}
.faq-chevron{width:24px;height:24px;border-radius:50%;background:rgba(30,58,138,0.15);display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:all 0.3s;color:var(--blue-l)}
.faq-item.open .faq-chevron{transform:rotate(180deg);background:rgba(59,130,246,0.15)}
.faq-a{max-height:0;overflow:hidden;transition:max-height 0.4s ease,padding 0.3s ease}
.faq-item.open .faq-a{max-height:500px;padding:0 24px 20px}
.faq-a-inner{font-size:14px;color:var(--text2);line-height:1.8}

/* Stats */
.stats-row{display:flex;justify-content:center;gap:48px;flex-wrap:wrap;margin-top:60px}
.stat-item{text-align:center}
.stat-num{font-family:'Space Grotesk',sans-serif;font-size:clamp(32px,5vw,48px);font-weight:700;background:linear-gradient(135deg,var(--blue-l),#22D3EE);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
.stat-label{font-size:14px;color:var(--text3);margin-top:4px}

/* Features detailed */
.feat-grid{display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-top:48px}
.feat-card{padding:32px;border-radius:16px}
.feat-card h4{font-size:18px;margin-bottom:8px;display:flex;align-items:center;gap:10px}
.feat-card p{font-size:14px;color:var(--text2);line-height:1.8}
.feat-badge{font-family:'JetBrains Mono',monospace;font-size:9px;padding:2px 8px;border-radius:99px;background:rgba(34,197,94,0.15);color:var(--green);font-weight:500;letter-spacing:0.5px}

/* CTA final */
.cta-final{background:linear-gradient(135deg,var(--blue),#1E3A8A 50%,#0F172A);padding:100px 32px;text-align:center}
.cta-final h2{font-size:clamp(24px,4vw,40px);color:rgba(255,255,255,0.7);margin-bottom:8px}
.cta-final .big{font-size:clamp(28px,5vw,52px);color:#fff;margin-bottom:20px}
.cta-final .sub{font-size:17px;color:rgba(255,255,255,0.6);margin-bottom:36px;max-width:600px;margin-left:auto;margin-right:auto;line-height:1.7}
@keyframes glow-pulse{0%,100%{box-shadow:0 0 24px var(--glow-g)}50%{box-shadow:0 0 48px var(--glow-g)}}

.cai-footer{border-top:1px solid var(--border);padding:32px}
.cai-footer .sec-in{display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px}

.px-s{will-change:transform}

/* Responsive */
@media(max-width:1024px){.bento{grid-template-columns:repeat(2,1fr)}.bc-big{grid-row:span 1}.k-grid{grid-template-columns:1fr}.feat-grid{grid-template-columns:1fr}}
@media(max-width:768px){
  .sec-in{padding:0 20px}
  .nav-in{padding:0 20px}
  .nav-links{display:none!important}
  .nav-mob{display:flex!important}
  .bento{grid-template-columns:1fr}.bc-big,.bc-med{grid-column:span 1}
  .tl-row{flex-direction:column;gap:40px}
  .tl-line{display:none}
  .cai-footer .sec-in{flex-direction:column;text-align:center}
  .hero-grid{grid-template-columns:1fr!important;text-align:center}
  .hero-grid .sec-sub{margin-left:auto;margin-right:auto}
  .hero-badges{justify-content:center!important}
  .killer{clip-path:polygon(0 16px,100% 0,100% calc(100% - 16px),0 100%)}
  .stats-row{gap:32px}
  .price-row{flex-direction:column!important;align-items:center!important}
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
            <a href="#funcionalidades">Funcionalidades</a>
            <a href="#documentos">Documentos</a>
            <a href="#como-funciona">Como funciona</a>
            <a href="#preco">Planos</a>
            <Link href="/blog" style={{ fontSize: 14, color: 'var(--text2)', transition: 'color 0.2s' }}>Blog</Link>
            <Link href="/login" style={{ fontSize: 14, color: '#fff', fontWeight: 500 }}>Entrar</Link>
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
                <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 11, color: 'var(--blue-l)', fontWeight: 500 }}>Inteligencia Artificial Juridica</span>
              </div>
              <h1 className="rv d1" style={{ fontSize: 'clamp(36px,5.5vw,56px)', marginBottom: 20 }}>
                Um dia de trabalho juridico<br />
                <span style={{ color: 'var(--blue-l)' }}>em menos de 3 minutos.</span>
              </h1>
              <p className="rv d2 sec-sub">Gere contratos, pecas judiciais e documentos juridicos profissionais com IA treinada na legislacao brasileira. Personalizado para o seu caso, com clausulas especificas, linguagem formal e pronto para assinar.</p>
              <div className="rv d2 sec-line" />
              <div className="rv d3 hero-badges" style={{ display: 'flex', gap: 20, marginTop: 28, flexWrap: 'wrap' }}>
                {[['19', 'Tipos de documento'], ['< 3min', 'Para gerar'], ['R$11,90', 'Por documento']].map(([n, l]) => (
                  <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 14px', borderRadius: 8, background: 'rgba(30,58,138,0.1)', border: '1px solid rgba(30,58,138,0.15)' }}>
                    <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 15, fontWeight: 600, color: 'var(--blue-l)' }}>{n}</span>
                    <span style={{ fontSize: 13, color: 'var(--text2)' }}>{l}</span>
                  </div>
                ))}
              </div>
              <div className="rv d4" style={{ display: 'flex', gap: 12, marginTop: 32, flexWrap: 'wrap' }}>
                <Link href="/gerar" className="cta-green" style={{ padding: '16px 32px', fontSize: 16, fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, borderRadius: 10, display: 'inline-flex' }}>
                  Gerar meu contrato
                  <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                </Link>
                <a href="#como-funciona" style={{ padding: '16px 24px', fontSize: 15, fontWeight: 600, color: 'var(--text2)', borderRadius: 10, border: '1px solid var(--border)', display: 'inline-flex', alignItems: 'center', gap: 6, transition: 'all 0.3s', fontFamily: "'Space Grotesk',sans-serif" }}>
                  Ver como funciona
                </a>
              </div>
            </div>
            <div className="rv d3" style={{ display: 'flex', justifyContent: 'center' }}>
              <div className="mock">
                <div className="mock-doc">
                  <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 13, fontWeight: 700, color: 'var(--blue-l)', letterSpacing: 1, marginBottom: 20, textTransform: 'uppercase' }}>Contrato de Prestacao de Servico</div>
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

          {/* Stats */}
          <div className="stats-row rv d5">
            {[
              ['19', 'Tipos de documento'],
              ['4', 'Categorias juridicas'],
              ['< 3min', 'Tempo de geracao'],
              ['100%', 'Legislacao brasileira'],
            ].map(([n, l]) => (
              <div key={l} className="stat-item">
                <div className="stat-num">{n}</div>
                <div className="stat-label">{l}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="px-s" style={{ position: 'absolute', top: '15%', right: '5%', width: 300, height: 300, background: 'radial-gradient(circle,rgba(30,58,138,0.12),transparent 70%)', filter: 'blur(60px)', pointerEvents: 'none' }} />
      </section>

      {/* 2. FUNCIONALIDADES DETALHADAS */}
      <section id="funcionalidades" className="sec" style={{ padding: '100px 0', background: 'var(--bg2)' }}>
        <div className="sec-in" style={{ textAlign: 'center' }}>
          <div className="sec-label rv">Funcionalidades</div>
          <h2 className="sec-title rv d1">Muito mais que um gerador de contratos</h2>
          <p className="sec-sub rv d2" style={{ margin: '0 auto' }}>Uma plataforma juridica completa com IA. Tudo o que voce precisa para criar, analisar e gerenciar documentos juridicos em um so lugar.</p>
        </div>
        <div className="sec-in">
          <div className="feat-grid">
            {[
              { t: 'Geracao de Documentos com IA', d: 'Responda perguntas simples em linguagem natural — nada de juridiques. A IA gera o documento completo com clausulas numeradas, linguagem juridica formal, referencias a legislacao brasileira e espaco para assinatura. Cada documento e unico e personalizado para o seu caso.', badge: '19 tipos' },
              { t: 'Analise de Risco', d: 'Envie qualquer contrato (PDF ou texto) e receba uma pontuacao de risco de 0 a 100. A IA identifica clausulas problematicas, clausulas ausentes que deveriam estar presentes e sugere correcoes especificas. Classificacao por severidade: critica, alta, media e baixa.', badge: 'Score 0-100' },
              { t: 'Consulta Juridica com IA (RAG)', d: 'Converse com uma IA alimentada por livros de direito e legislacao brasileira. Diferente do ChatGPT, as respostas sao baseadas em fontes reais — a IA cita os trechos dos documentos consultados. Ideal para tirar duvidas rapidas sem precisar contratar um advogado.', badge: 'Fontes reais' },
              { t: 'Assinatura Digital', d: 'Assine seus documentos direto na plataforma com assinatura digital integrada. O sistema gera um hash SHA-256 do conteudo e registra IP, data e imagem da assinatura. Se o documento for alterado depois, o sistema detecta automaticamente. Tudo com validade juridica.', badge: 'SHA-256' },
              { t: 'Pesquisa de Jurisprudencia', d: 'Busque decisoes do STF, STJ e Tribunais de Justica por tema e area do direito. A IA retorna ementas, teses firmadas, relatores e sumulas relacionadas. Ferramenta essencial para advogados fundamentarem pecas e para leigos entenderem precedentes.', badge: '8 areas' },
              { t: 'Base de Teses Juridicas', d: 'Catalogo com teses juridicas organizadas por area do direito (Civil, Trabalhista, Consumidor, Penal, Empresarial, Tributario, Familia, Constitucional). Cada tese inclui fundamentacao detalhada, legislacao aplicavel e jurisprudencia. Gere novas teses com IA.', badge: '80+ teses' },
              { t: 'Edicao Inteligente', d: 'Apos gerar o documento, descreva em linguagem natural o que quer alterar. A IA aplica a mudanca e mostra um diff visual (verde = adicionado, vermelho = removido), para voce ter total controle das alteracoes antes de aceitar.', badge: 'Diff visual' },
              { t: 'Modelos Personalizados', d: 'Crie seus proprios modelos de documento com campos customizados e instrucoes adicionais para a IA. Ideal para escritorios que geram o mesmo tipo de contrato com frequencia — configure uma vez, use sempre.', badge: 'Ate 10' },
            ].map(({ t, d, badge }, i) => (
              <div key={t} className={`glass feat-card rv d${Math.min(i + 1, 8)}`}>
                <h4><span>{t}</span> <span className="feat-badge">{badge}</span></h4>
                <p>{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. DOCUMENTOS */}
      <section id="documentos" className="sec" style={{ padding: '100px 0' }}>
        <div className="sec-in" style={{ marginBottom: 48 }}>
          <div className="sec-label rv">19 Tipos de Documento</div>
          <h2 className="sec-title rv d1">Escolha o que precisa</h2>
          <p className="sec-sub rv d2">Contratos, pecas judiciais, notificacoes, procuracoes e mais. Cada documento e gerado pela IA com base nas suas respostas — personalizado, nao generico.</p>
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

      {/* 4. COMO FUNCIONA */}
      <section id="como-funciona" className="sec" style={{ padding: '100px 0', background: 'var(--bg2)' }}>
        <div className="sec-in" style={{ textAlign: 'center' }}>
          <div className="sec-label rv">Como funciona</div>
          <h2 className="sec-title rv d1">3 passos. Sem complicacao.</h2>
          <p className="sec-sub rv d2" style={{ margin: '0 auto' }}>Voce nao precisa entender de direito. A IA faz o trabalho pesado — voce so responde perguntas simples.</p>
        </div>
        <div className="sec-in">
          <div className="tl-row">
            <div className="tl-line"><div className="tl-line-fill rv" /></div>
            {[
              { n: '1', t: 'Escolha o tipo de documento', d: 'Sao 19 opcoes organizadas em 4 categorias: contratos, pecas judiciais, documentos e trabalhista. Selecione o que precisa e a IA carrega as perguntas especificas para aquele tipo.' },
              { n: '2', t: 'Responda perguntas simples', d: 'Linguagem humana, nao juridiques. Nomes das partes, valor, prazo, o que sera feito. A IA entende o contexto e gera clausulas especificas com base nas suas respostas e na legislacao brasileira.' },
              { n: '3', t: 'Receba seu documento completo', d: 'Em menos de 3 minutos, o documento fica pronto. Com clausulas numeradas, linguagem formal, foro e espaco para assinatura. Baixe em PDF ou Word, edite com IA, analise riscos ou assine digitalmente.' },
            ].map(({ n, t, d }, i) => (
              <div key={n} className={`tl-step rv d${i + 1}`}>
                <div className="tl-num">{n}</div>
                <h3 style={{ fontSize: 18, marginBottom: 8 }}>{t}</h3>
                <p style={{ fontSize: 14, color: 'var(--text2)', lineHeight: 1.8 }}>{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. PREVIEW */}
      <section className="sec" style={{ padding: '100px 0' }}>
        <div className="sec-in" style={{ textAlign: 'center', marginBottom: 48 }}>
          <div className="sec-label rv">Preview</div>
          <h2 className="sec-title rv d1">Documento profissional e completo</h2>
          <p className="sec-sub rv d2" style={{ margin: '0 auto' }}>Nada de modelo pronto ou template generico. Cada documento e gerado pela IA com clausulas especificas do seu caso, linguagem juridica formal e formatacao profissional.</p>
        </div>
        <div className="sec-in rv d2">
          <div className="mock" style={{ maxWidth: 620 }}>
            <div className="mock-doc" style={{ padding: 40 }}>
              <div style={{ textAlign: 'center', marginBottom: 24 }}>
                <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 15, fontWeight: 700, color: 'var(--text)', letterSpacing: 1 }}>CONTRATO DE PRESTACAO DE SERVICO</div>
                <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 4 }}>Gerado por ContratoAI</div>
              </div>
              <div style={{ fontSize: 12, color: 'var(--text2)', lineHeight: 2, marginBottom: 16 }}>
                <strong style={{ color: 'var(--blue-l)' }}>CLAUSULA PRIMEIRA — DO OBJETO</strong><br />
                <div className="mock-line" style={{ width: '100%', margin: '6px 0' }} />
                <div className="mock-line" style={{ width: '92%', margin: '6px 0' }} />
                <div className="mock-line hl" style={{ width: '75%', margin: '6px 0' }} />
              </div>
              <div style={{ fontSize: 12, color: 'var(--text2)', lineHeight: 2, marginBottom: 16 }}>
                <strong style={{ color: 'var(--blue-l)' }}>CLAUSULA SEGUNDA — DO VALOR E PAGAMENTO</strong><br />
                <div className="mock-line" style={{ width: '88%', margin: '6px 0' }} />
                <div className="mock-line hl" style={{ width: '60%', margin: '6px 0' }} />
              </div>
              <div style={{ fontSize: 12, color: 'var(--text2)', lineHeight: 2 }}>
                <strong style={{ color: 'var(--blue-l)' }}>CLAUSULA TERCEIRA — DO PRAZO</strong><br />
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

      {/* 6. POR QUE USAR — Diferenciais */}
      <section className="sec killer" style={{ padding: '120px 0' }}>
        <div className="sec-in" style={{ textAlign: 'center', paddingTop: 20 }}>
          <div className="sec-label rv">Diferenciais</div>
          <h2 className="sec-title rv d1">Por que usar o ContratoAI?</h2>
          <p className="sec-sub rv d2" style={{ margin: '0 auto' }}>Diferente de templates genericos ou do ChatGPT, o ContratoAI foi construido especificamente para o direito brasileiro.</p>
        </div>
        <div className="sec-in">
          <div className="k-grid">
            {[
              { t: 'IA treinada em direito brasileiro', d: 'Nossos prompts sao otimizados com referencias ao Codigo Civil, CLT, CDC, CPC e legislacao brasileira vigente. Cada tipo de documento tem instrucoes especificas para gerar clausulas validas e completas — nao e um ChatGPT generico.', icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg> },
              { t: 'Personalizado, nao template', d: 'Cada contrato e unico, gerado pela IA com base nas suas respostas. Nada de preencher lacunas em um modelo generico. A IA entende o contexto do seu caso e adapta as clausulas, valores, prazos e condicoes automaticamente.', icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/><path d="M14 2v6h6"/></svg> },
              { t: 'Pronto em menos de 3 minutos', d: 'Um contrato que levaria horas com advogado ou pesquisa no Google fica pronto em minutos. Preencha, clique em gerar e receba o documento completo — com clausulas numeradas, foro, condicoes de rescisao e espaco para assinatura.', icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg> },
              { t: 'Ate 70% mais barato que concorrentes', d: 'Enquanto servicos como JusDocs cobram R$130/mes e JusIA R$209/mes, o ContratoAI oferece tudo por R$59,90/mes — ou R$11,90 por documento avulso. Mesma qualidade, funcionalidades exclusivas como assinatura digital, e sem fidelidade.', icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg> },
              { t: 'Plataforma completa', d: 'Nao e so gerar contratos. Analise riscos, assine digitalmente, pesquise jurisprudencia, consulte a IA sobre duvidas juridicas e crie modelos personalizados. Tudo em um so lugar, sem precisar de multiplas ferramentas ou assinaturas.', icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg> },
              { t: 'Download em PDF e Word', d: 'Baixe o documento completo em PDF (pronto para imprimir e assinar) ou em Word (para editar como quiser). O documento e seu — sem marcas d\'agua, sem restricoes, sem necessidade de manter a assinatura ativa para acessar.', icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg> },
            ].map(({ t, d, icon }, i) => (
              <div key={t} className={`glass k-item rv d${i + 1}`}>
                <div className="k-icon">{icon}</div>
                <div><h4>{t}</h4><p>{d}</p></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. PLANOS */}
      <section id="preco" className="sec" style={{ padding: '100px 0' }}>
        <div className="sec-in" style={{ textAlign: 'center' }}>
          <div className="sec-label rv">Planos</div>
          <h2 className="sec-title rv d1">Simples, transparente, sem surpresas</h2>
          <p className="sec-sub rv d2" style={{ margin: '0 auto' }}>Sem fidelidade, sem taxa oculta, sem letras miudas. Escolha o plano que faz sentido para voce.</p>
        </div>
        <div className="sec-in">
          <div className="price-row" style={{ display: 'flex', gap: 20, justifyContent: 'center', flexWrap: 'wrap', maxWidth: 880, margin: '48px auto 0' }}>
            {/* Avulso */}
            <div className="glass rv d1" style={{ borderRadius: 16, padding: '36px', flex: '1 1 320px', maxWidth: 400, textAlign: 'center' }}>
              <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 12, color: 'var(--text3)', marginBottom: 4 }}>AVULSO</div>
              <div className="price-val" style={{ fontSize: 40 }}>R$11,90 <span>/doc</span></div>
              <p style={{ fontSize: 14, color: 'var(--text3)', marginBottom: 20 }}>Pague so quando precisar. Sem compromisso.</p>
              <ul className="price-list">
                <li>1 documento personalizado com IA</li>
                <li>19 tipos disponiveis</li>
                <li>Download PDF e Word</li>
                <li>Linguagem juridica formal</li>
                <li>Edicao com IA inclusa</li>
              </ul>
              <Link href="/gerar" style={{ display: 'block', padding: '14px', borderRadius: 10, border: '1px solid var(--border)', color: 'var(--text)', fontSize: 15, fontWeight: 600, fontFamily: "'Space Grotesk',sans-serif", textAlign: 'center', transition: 'all 0.3s' }}>
                Gerar documento
              </Link>
              <p style={{ fontSize: 12, color: 'var(--text3)', marginTop: 12 }}>Pagamento via Pix, cartao ou boleto</p>
            </div>
            {/* Profissional */}
            <div className="glass rv d2" style={{ borderRadius: 16, padding: '36px', flex: '1 1 320px', maxWidth: 400, textAlign: 'center', border: '1px solid rgba(59,130,246,0.4)', boxShadow: '0 0 48px rgba(30,58,138,0.2)', position: 'relative' }}>
              <div style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', padding: '4px 16px', borderRadius: 99, background: 'linear-gradient(135deg,var(--blue-l),#22D3EE)', fontSize: 11, fontWeight: 700, fontFamily: "'JetBrains Mono',monospace", color: '#fff', letterSpacing: 1 }}>MAIS POPULAR</div>
              <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 12, color: 'var(--blue-l)', marginBottom: 4 }}>PROFISSIONAL</div>
              <div className="price-val">R$59,90 <span>/mes</span></div>
              <p style={{ fontSize: 14, color: 'var(--text3)', marginBottom: 20 }}>Tudo ilimitado. Cancele quando quiser.</p>
              <ul className="price-list">
                <li>Documentos ilimitados (19 tipos)</li>
                <li>Consulta juridica IA com fontes</li>
                <li>Analise de risco de contratos</li>
                <li>Assinatura digital integrada</li>
                <li>Pesquisa de jurisprudencia</li>
                <li>Base de teses juridicas</li>
                <li>Modelos personalizados</li>
                <li>Edicao com IA ilimitada</li>
              </ul>
              <Link href="/gerar" className="cta-green" style={{ width: '100%', justifyContent: 'center', padding: '16px', fontSize: 16, fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, borderRadius: 10, animation: 'glow-pulse 3s ease-in-out infinite' }}>
                Comecar agora
              </Link>
              <p style={{ fontSize: 12, color: 'var(--text3)', marginTop: 12 }}>Sem fidelidade. Pagamento seguro via Mercado Pago.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 8. FAQ */}
      <section id="faq" className="sec" style={{ padding: '100px 0', background: 'var(--bg2)' }}>
        <div className="sec-in" style={{ textAlign: 'center', marginBottom: 8 }}>
          <div className="sec-label rv">Perguntas Frequentes</div>
          <h2 className="sec-title rv d1">Tire suas duvidas</h2>
          <p className="sec-sub rv d2" style={{ margin: '0 auto' }}>Tudo o que voce precisa saber sobre o ContratoAI antes de comecar.</p>
        </div>
        <div className="sec-in">
          <div className="faq-list">
            {FAQS.map((faq, i) => (
              <div key={i} className={`faq-item rv d${Math.min(i + 1, 6)} ${openFaqs.has(i) ? 'open' : ''}`}>
                <button className="faq-q" onClick={() => toggleFaq(i)}>
                  {faq.q}
                  <span className="faq-chevron">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M6 9l6 6 6-6"/></svg>
                  </span>
                </button>
                <div className="faq-a">
                  <div className="faq-a-inner">{faq.a}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 9. CTA FINAL */}
      <section className="cta-final">
        <h2 className="rv">Pare de trabalhar sem contrato.</h2>
        <h2 className="rv d1 big">Proteja seu trabalho com IA.</h2>
        <p className="rv d2 sub">Gere contratos, pecas judiciais e documentos juridicos profissionais em minutos. A partir de R$11,90 por documento ou R$59,90/mes com tudo ilimitado.</p>
        <Link href="/gerar" className="cta-green rv d3" style={{ padding: '18px 44px', fontSize: 18, fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, borderRadius: 12, animation: 'glow-pulse 3s ease-in-out infinite' }}>
          Gerar meu contrato agora
          <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
        </Link>
        <p className="rv d4" style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', marginTop: 20 }}>Sem cadastro obrigatorio. Comece a gerar agora.</p>
      </section>

      <footer className="cai-footer">
        <div className="sec-in">
          <div className="nav-logo" style={{ fontSize: 16 }}>
            <div style={{ width: 24, height: 24, borderRadius: 6, background: 'linear-gradient(135deg,var(--blue),var(--blue-l))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700 }}>C</div>
            ContratoAI
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
            <Link href="/blog" style={{ fontSize: 12, color: 'var(--text3)' }}>Blog</Link>
            <Link href="/termos" style={{ fontSize: 12, color: 'var(--text3)' }}>Termos de Uso</Link>
            <Link href="/privacidade" style={{ fontSize: 12, color: 'var(--text3)' }}>Privacidade</Link>
            <span style={{ fontSize: 12, color: 'var(--text3)' }}>
              &copy; 2026 ContratoAI by <a href="https://rga-technologies.com/" target="_blank" rel="noreferrer" style={{ color: 'var(--blue-l)' }}>RGA Technologies</a>
            </span>
          </div>
        </div>
      </footer>
    </div>
  )
}
