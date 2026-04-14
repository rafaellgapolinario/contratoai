'use client'
import Link from 'next/link'

export default function TermosPage() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <nav style={{ height: 64, display: 'flex', alignItems: 'center', justifyContent: 'center', borderBottom: '1px solid var(--border)', background: 'rgba(9,9,15,0.95)', backdropFilter: 'blur(20px)' }}>
        <div style={{ maxWidth: 800, width: '100%', padding: '0 24px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <Link href="/" style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 18, display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 28, height: 28, borderRadius: 7, background: 'linear-gradient(135deg,var(--blue),var(--cyan))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, color: '#fff' }}>C</div>
            ContratoAI
          </Link>
        </div>
      </nav>

      <div style={{ maxWidth: 800, margin: '0 auto', padding: '48px 24px 80px' }}>
        <h1 style={{ fontSize: 32, fontFamily: "'Space Grotesk',sans-serif", marginBottom: 8 }}>Termos de Uso</h1>
        <p style={{ fontSize: 13, color: 'var(--text3)', marginBottom: 40 }}>Ultima atualizacao: 14 de abril de 2026</p>

        <div style={{ fontSize: 15, lineHeight: 1.9, color: 'var(--text2)' }}>
          <style>{`.legal h2 { font-size:18px; font-weight:700; color:var(--text); margin:32px 0 12px; font-family:'Space Grotesk',sans-serif } .legal p { margin-bottom:16px } .legal ul { margin:0 0 16px 20px } .legal li { margin-bottom:8px }`}</style>
          <div className="legal">

<h2>1. Aceitacao dos Termos</h2>
<p>Ao criar uma conta ou utilizar os servicos do ContratoAI (<strong>contrato.rga-technologies.com</strong>), operado por <strong>RGA Technologies</strong>, voce declara ter lido, compreendido e concordado integralmente com estes Termos de Uso e com a nossa Politica de Privacidade.</p>
<p>Se voce nao concordar com qualquer disposicao destes termos, nao utilize a plataforma.</p>

<h2>2. Descricao do Servico</h2>
<p>O ContratoAI e uma <strong>ferramenta de auxilio na elaboracao de documentos</strong> que utiliza inteligencia artificial (IA) para gerar minutas de contratos, termos e outros documentos juridicos com base nas informacoes fornecidas pelo usuario.</p>
<p><strong>O ContratoAI NAO e um escritorio de advocacia, NAO presta assessoria juridica e NAO substitui a consulta a um advogado.</strong></p>

<h2>3. Limitacao de Responsabilidade — CLAUSULA ESSENCIAL</h2>
<p>O usuario reconhece e aceita expressamente que:</p>
<ul>
<li>Os documentos gerados pela IA sao <strong>minutas de referencia</strong> e podem conter imprecisoes, omissoes ou erros, incluindo mas nao limitado a: clausulas inadequadas, referencias legislativas desatualizadas, valores incorretos ou termos juridicamente imprecisos.</li>
<li>A <strong>responsabilidade pela revisao, validacao e uso</strong> de qualquer documento gerado e <strong>exclusivamente do usuario</strong>.</li>
<li>O ContratoAI <strong>nao se responsabiliza</strong> por quaisquer danos diretos, indiretos, incidentais, consequenciais, lucros cessantes, perdas financeiras ou disputas juridicas decorrentes do uso dos documentos gerados.</li>
<li>Recomendamos <strong>fortemente</strong> que documentos de alta complexidade ou alto valor sejam revisados por um advogado antes da assinatura.</li>
<li>A plataforma nao garante que os documentos gerados atendam a requisitos legais especificos de jurisdicoes, setores ou situacoes particulares.</li>
</ul>

<h2>4. Uso Adequado</h2>
<p>O usuario se compromete a:</p>
<ul>
<li>Fornecer informacoes verdadeiras e completas ao gerar documentos.</li>
<li>Nao utilizar a plataforma para fins ilegais, fraudulentos ou que violem direitos de terceiros.</li>
<li>Nao tentar burlar limitacoes tecnicas, de seguranca ou de cobranca da plataforma.</li>
<li>Revisar todo documento gerado antes de utiliza-lo.</li>
</ul>

<h2>5. Propriedade Intelectual</h2>
<p>Os documentos gerados pertencem ao usuario que os criou. O usuario pode usar, modificar, imprimir e distribuir os documentos como desejar.</p>
<p>A plataforma ContratoAI, incluindo sua marca, design, codigo-fonte e tecnologia, e propriedade exclusiva da RGA Technologies.</p>

<h2>6. Pagamentos e Reembolso</h2>
<ul>
<li><strong>Documento avulso (R$11,90):</strong> pagamento unico por documento. Nao reembolsavel apos a geracao do documento.</li>
<li><strong>Plano mensal (R$34,90/mes):</strong> acesso ilimitado por 30 dias. Nao renovado automaticamente. Nao reembolsavel apos ativacao.</li>
<li>Pagamentos sao processados pelo <strong>Mercado Pago</strong>. O ContratoAI nao armazena dados de cartao de credito.</li>
</ul>

<h2>7. Disponibilidade do Servico</h2>
<p>Nos nos esforcamos para manter a plataforma disponivel 24/7, mas nao garantimos disponibilidade ininterrupta. Manutencoes, atualizacoes ou fatores externos podem causar indisponibilidade temporaria.</p>

<h2>8. Modificacoes nos Termos</h2>
<p>Reservamo-nos o direito de alterar estes termos a qualquer momento. Alteracoes significativas serao comunicadas por email ou aviso na plataforma. O uso continuado apos a notificacao constitui aceitacao dos novos termos.</p>

<h2>9. Rescisao</h2>
<p>Podemos suspender ou encerrar sua conta a qualquer momento em caso de violacao destes termos. Voce pode encerrar sua conta a qualquer momento entrando em contato conosco.</p>

<h2>10. Legislacao Aplicavel</h2>
<p>Estes termos sao regidos pelas leis da Republica Federativa do Brasil. Fica eleito o foro da comarca de residencia do usuario para dirimir quaisquer controversias.</p>

<h2>11. Contato</h2>
<p>Para duvidas sobre estes termos: <strong>gardaszconsultoria@gmail.com</strong></p>

          </div>
        </div>

        <div style={{ marginTop: 48, padding: '20px 24px', background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 12 }}>
          <p style={{ fontSize: 14, color: '#f59e0b', fontWeight: 600, marginBottom: 8 }}>Aviso importante</p>
          <p style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.7 }}>
            O ContratoAI utiliza inteligencia artificial para gerar documentos. Documentos gerados por IA podem conter erros e <strong>devem ser revisados por um profissional qualificado</strong> antes de serem assinados ou utilizados para fins legais.
          </p>
        </div>
      </div>
    </div>
  )
}
