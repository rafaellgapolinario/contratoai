'use client'
import Link from 'next/link'

export default function PrivacidadePage() {
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
        <h1 style={{ fontSize: 32, fontFamily: "'Space Grotesk',sans-serif", marginBottom: 8 }}>Politica de Privacidade</h1>
        <p style={{ fontSize: 13, color: 'var(--text3)', marginBottom: 40 }}>Ultima atualizacao: 14 de abril de 2026</p>

        <div style={{ fontSize: 15, lineHeight: 1.9, color: 'var(--text2)' }}>
          <style>{`.legal h2 { font-size:18px; font-weight:700; color:var(--text); margin:32px 0 12px; font-family:'Space Grotesk',sans-serif } .legal p { margin-bottom:16px } .legal ul { margin:0 0 16px 20px } .legal li { margin-bottom:8px }`}</style>
          <div className="legal">

<h2>1. Introducao</h2>
<p>Esta Politica de Privacidade descreve como o <strong>ContratoAI</strong> (<strong>contrato.rga-technologies.com</strong>), operado por <strong>RGA Technologies</strong>, coleta, utiliza, armazena e protege os dados pessoais dos usuarios, em conformidade com a <strong>Lei Geral de Protecao de Dados (LGPD — Lei 13.709/2018)</strong>.</p>

<h2>2. Dados Coletados</h2>
<p>Coletamos os seguintes dados:</p>
<ul>
<li><strong>Dados de cadastro:</strong> nome, email e senha (armazenada com hash criptografico bcrypt, nunca em texto puro).</li>
<li><strong>Dados de uso:</strong> tipo de documento gerado, data de criacao, informacoes fornecidas para geracao do documento.</li>
<li><strong>Dados de pagamento:</strong> processados integralmente pelo Mercado Pago. O ContratoAI NAO armazena dados de cartao de credito ou dados bancarios.</li>
<li><strong>Dados tecnicos:</strong> endereco IP, tipo de navegador, paginas visitadas (coletados automaticamente por logs de servidor).</li>
</ul>

<h2>3. Finalidade do Tratamento</h2>
<p>Seus dados sao utilizados para:</p>
<ul>
<li>Criar e gerenciar sua conta na plataforma.</li>
<li>Gerar documentos personalizados com base nas informacoes fornecidas.</li>
<li>Processar pagamentos e manter historico de transacoes.</li>
<li>Enviar comunicacoes sobre sua conta (confirmacoes, alteracoes de plano).</li>
<li>Melhorar a qualidade do servico e da inteligencia artificial.</li>
</ul>

<h2>4. Base Legal (LGPD Art. 7)</h2>
<ul>
<li><strong>Execucao de contrato:</strong> tratamento necessario para prestar o servico contratado (Art. 7, V).</li>
<li><strong>Consentimento:</strong> ao criar sua conta e aceitar estes termos, voce consente com o tratamento descrito (Art. 7, I).</li>
<li><strong>Interesse legitimo:</strong> para melhoria do servico e prevencao de fraude (Art. 7, IX).</li>
</ul>

<h2>5. Compartilhamento de Dados</h2>
<p>Seus dados NAO sao vendidos ou compartilhados com terceiros para fins de marketing. Compartilhamos dados apenas com:</p>
<ul>
<li><strong>Google (Gemini API):</strong> as informacoes fornecidas para gerar documentos sao enviadas a API do Google Gemini para processamento pela IA. O Google processa esses dados conforme sua propria politica de privacidade.</li>
<li><strong>Mercado Pago:</strong> para processamento de pagamentos.</li>
<li><strong>Autoridades legais:</strong> quando exigido por lei ou ordem judicial.</li>
</ul>

<h2>6. Armazenamento e Seguranca</h2>
<ul>
<li>Dados sao armazenados em servidor proprio com acesso restrito.</li>
<li>Senhas sao protegidas com hash criptografico (bcrypt).</li>
<li>Comunicacoes sao protegidas por HTTPS/TLS.</li>
<li>Backups automaticos realizados diariamente.</li>
<li>Acesso ao banco de dados restrito por firewall.</li>
</ul>

<h2>7. Retencao de Dados</h2>
<p>Seus dados sao mantidos enquanto sua conta estiver ativa. Apos exclusao da conta:</p>
<ul>
<li>Dados pessoais sao removidos em ate 30 dias.</li>
<li>Registros de pagamento sao mantidos por 5 anos conforme legislacao fiscal.</li>
<li>Backups sao automaticamente sobrescritos em ate 14 dias.</li>
</ul>

<h2>8. Direitos do Titular (LGPD Art. 18)</h2>
<p>Voce tem direito a:</p>
<ul>
<li><strong>Acesso:</strong> solicitar quais dados temos sobre voce.</li>
<li><strong>Correcao:</strong> solicitar correcao de dados incompletos ou incorretos.</li>
<li><strong>Exclusao:</strong> solicitar a eliminacao dos seus dados pessoais.</li>
<li><strong>Portabilidade:</strong> solicitar seus dados em formato estruturado.</li>
<li><strong>Revogacao do consentimento:</strong> revogar o consentimento a qualquer momento.</li>
<li><strong>Informacao:</strong> ser informado sobre com quem seus dados foram compartilhados.</li>
</ul>
<p>Para exercer qualquer desses direitos, entre em contato: <strong>gardaszconsultoria@gmail.com</strong></p>

<h2>9. Cookies</h2>
<p>O ContratoAI utiliza apenas cookies tecnicos essenciais (autenticacao via token armazenado em localStorage). Nao utilizamos cookies de rastreamento ou publicidade.</p>

<h2>10. Alteracoes nesta Politica</h2>
<p>Esta politica pode ser atualizada periodicamente. Alteracoes significativas serao comunicadas por email ou aviso na plataforma.</p>

<h2>11. Contato do Encarregado (DPO)</h2>
<p>Para questoes relacionadas a protecao de dados:</p>
<p><strong>Email:</strong> gardaszconsultoria@gmail.com<br/>
<strong>Responsavel:</strong> RGA Technologies</p>

          </div>
        </div>
      </div>
    </div>
  )
}
