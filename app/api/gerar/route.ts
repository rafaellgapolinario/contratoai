import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { query } from '@/lib/db'
import { getTokenFromHeader } from '@/lib/jwt'
import { searchRelevantChunks } from '@/lib/rag'
import { getDateContext } from '@/lib/date-context'

const GEMINI_KEY = process.env.GEMINI_API_KEY || ''

const TEMPLATES: Record<string, { nome: string; campos: string[] }> = {
  'prestacao-servico': {
    nome: 'Contrato de Prestação de Serviço',
    campos: ['Nome completo do prestador', 'CPF/CNPJ do prestador', 'Nome completo do contratante', 'CPF/CNPJ do contratante', 'Descrição detalhada do serviço', 'Valor total (R$)', 'Forma de pagamento', 'Prazo de entrega', 'Cidade/Estado'],
  },
  'parceria': {
    nome: 'Acordo de Parceria',
    campos: ['Nome do Parceiro 1', 'CPF/CNPJ do Parceiro 1', 'Nome do Parceiro 2', 'CPF/CNPJ do Parceiro 2', 'Objetivo da parceria', 'Responsabilidades do Parceiro 1', 'Responsabilidades do Parceiro 2', 'Divisão de lucros (%)', 'Prazo da parceria', 'Cidade/Estado'],
  },
  'confidencialidade': {
    nome: 'Termo de Confidencialidade (NDA)',
    campos: ['Nome da parte divulgadora', 'CPF/CNPJ da parte divulgadora', 'Nome da parte receptora', 'CPF/CNPJ da parte receptora', 'Tipo de informação confidencial', 'Prazo de confidencialidade', 'Cidade/Estado'],
  },
  'locacao': {
    nome: 'Contrato de Locação',
    campos: ['Nome do locador (dono)', 'CPF/CNPJ do locador', 'Nome do locatário (inquilino)', 'CPF/CNPJ do locatário', 'Descrição do imóvel/bem', 'Endereço completo', 'Valor do aluguel (R$)', 'Dia do vencimento', 'Prazo do contrato', 'Valor da caução/garantia', 'Cidade/Estado'],
  },
  'venda': {
    nome: 'Contrato de Compra e Venda',
    campos: ['Nome do vendedor', 'CPF/CNPJ do vendedor', 'Nome do comprador', 'CPF/CNPJ do comprador', 'Descrição do item vendido', 'Valor total (R$)', 'Forma de pagamento', 'Prazo de entrega', 'Cidade/Estado'],
  },
  'trabalho-freelancer': {
    nome: 'Contrato de Trabalho Freelancer',
    campos: ['Nome do freelancer', 'CPF/CNPJ do freelancer', 'Nome do contratante', 'CPF/CNPJ do contratante', 'Descrição do projeto', 'Entregáveis esperados', 'Valor total (R$)', 'Cronograma de pagamento', 'Prazo do projeto', 'Número de revisões incluídas', 'Cidade/Estado'],
  },
  'distrato': {
    nome: 'Distrato / Rescisão Contratual',
    campos: ['Nome da Parte 1', 'CPF/CNPJ da Parte 1', 'Nome da Parte 2', 'CPF/CNPJ da Parte 2', 'Data do contrato original', 'Objeto do contrato original', 'Motivo da rescisão', 'Obrigações pendentes', 'Multa (se houver)', 'Cidade/Estado'],
  },
  'termos-uso': {
    nome: 'Termos de Uso e Política de Privacidade',
    campos: ['Nome da empresa/app', 'CNPJ', 'URL do site/app', 'Descrição do serviço', 'Dados coletados dos usuários', 'Como os dados são usados', 'E-mail de contato/DPO', 'Cidade/Estado'],
  },
  'recibo': {
    nome: 'Recibo de Pagamento',
    campos: ['Nome de quem recebeu', 'CPF/CNPJ de quem recebeu', 'Nome de quem pagou', 'CPF/CNPJ de quem pagou', 'Valor recebido (R$)', 'Referente a (descrição)', 'Forma de pagamento', 'Data do pagamento', 'Cidade/Estado'],
  },
  // --- Pecas judiciais ---
  'peticao-inicial': {
    nome: 'Petição Inicial',
    campos: ['Nome completo do autor', 'CPF/CNPJ do autor', 'Endereço do autor', 'Nome completo do réu', 'CPF/CNPJ do réu', 'Endereço do réu', 'Tipo de ação (ex: cobrança, indenização, obrigação de fazer)', 'Descrição dos fatos', 'Fundamentos jurídicos (leis aplicáveis)', 'Pedidos (o que deseja do juiz)', 'Valor da causa (R$)', 'Provas que pretende produzir', 'Comarca/Foro'],
  },
  'contestacao': {
    nome: 'Contestação',
    campos: ['Nome completo do réu/contestante', 'CPF/CNPJ do réu', 'Nome do autor da ação', 'Número do processo', 'Vara/Comarca', 'Resumo da ação original', 'Argumentos de defesa', 'Fatos que contesta', 'Fundamentos jurídicos da defesa', 'Provas que pretende produzir', 'Pedidos (improcedência, etc)'],
  },
  'recurso-apelacao': {
    nome: 'Recurso de Apelação',
    campos: ['Nome do apelante', 'CPF/CNPJ do apelante', 'Nome do apelado', 'Número do processo', 'Vara/Comarca de origem', 'Resumo da sentença recorrida', 'Pontos que contesta na sentença', 'Fundamentos jurídicos do recurso', 'Pedidos (reforma total/parcial)', 'Tribunal de destino'],
  },
  'notificacao-extrajudicial': {
    nome: 'Notificação Extrajudicial',
    campos: ['Nome do notificante', 'CPF/CNPJ do notificante', 'Endereço do notificante', 'Nome do notificado', 'CPF/CNPJ do notificado', 'Endereço do notificado', 'Assunto da notificação', 'Descrição detalhada dos fatos', 'O que está sendo exigido/solicitado', 'Prazo para cumprimento (dias)', 'Consequências do não cumprimento', 'Cidade/Estado'],
  },
  'procuracao': {
    nome: 'Procuração',
    campos: ['Nome do outorgante (quem concede)', 'CPF/CNPJ do outorgante', 'Endereço do outorgante', 'Estado civil do outorgante', 'Nome do outorgado (procurador)', 'CPF do outorgado', 'OAB do outorgado (se advogado)', 'Poderes concedidos (amplos/específicos)', 'Finalidade da procuração', 'Prazo de validade', 'Cidade/Estado'],
  },
  'declaracao': {
    nome: 'Declaração',
    campos: ['Nome completo do declarante', 'CPF/CNPJ do declarante', 'Endereço do declarante', 'Conteúdo da declaração (o que está declarando)', 'Finalidade da declaração (para quem/para quê)', 'Cidade/Estado'],
  },
  'acordo-trabalhista': {
    nome: 'Acordo Trabalhista Extrajudicial',
    campos: ['Nome do empregador', 'CNPJ do empregador', 'Nome do empregado', 'CPF do empregado', 'Cargo/função', 'Data de admissão', 'Data de desligamento', 'Motivo do desligamento', 'Verbas rescisórias acordadas (R$)', 'Forma de pagamento das verbas', 'Cláusula de quitação (parcial/total)', 'Cidade/Estado'],
  },
  'contrato-social': {
    nome: 'Contrato Social (Abertura de Empresa)',
    campos: ['Nome da empresa', 'Tipo societário (LTDA, MEI, S.A.)', 'CNAE principal (atividade)', 'Endereço da sede', 'Capital social (R$)', 'Nome do Sócio 1', 'CPF do Sócio 1', 'Participação do Sócio 1 (%)', 'Nome do Sócio 2', 'CPF do Sócio 2', 'Participação do Sócio 2 (%)', 'Administrador(es)', 'Prazo da sociedade (determinado/indeterminado)', 'Cidade/Estado'],
  },
  'carta-demissao': {
    nome: 'Carta de Demissão',
    campos: ['Nome do empregado', 'CPF do empregado', 'Cargo/função', 'Nome da empresa', 'CNPJ da empresa', 'Data de admissão', 'Cumprirá aviso prévio? (sim/não)', 'Motivo da demissão (opcional)', 'Cidade/Estado'],
  },
  'habeas-corpus': {
    nome: 'Habeas Corpus',
    campos: ['Nome do paciente (quem está preso/ameaçado)', 'CPF do paciente', 'Nome do impetrante (quem pede)', 'CPF/OAB do impetrante', 'Autoridade coatora (delegado, juiz, etc)', 'Descrição da coação/ameaça à liberdade', 'Fundamentos jurídicos', 'Pedido (relaxamento, salvo-conduto, etc)', 'Comarca/Tribunal'],
  },
}

export async function POST(req: NextRequest) {
  try {
    const { tipo, respostas, modelo_id } = await req.json()
    if (!GEMINI_KEY) return NextResponse.json({ error: 'API key não configurada' }, { status: 500 })

    let template: { nome: string; campos: string[] } | null = null
    let promptExtra = ''

    if (modelo_id) {
      // Modelo personalizado do usuario
      const payload = getTokenFromHeader(req.headers.get('authorization'))
      if (!payload?.id) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
      const rows = await query('SELECT nome, campos, prompt_extra FROM contratoai.modelos WHERE id = $1 AND user_id = $2', [modelo_id, payload.id])
      if (!rows.length) return NextResponse.json({ error: 'Modelo não encontrado' }, { status: 404 })
      template = { nome: rows[0].nome, campos: rows[0].campos }
      promptExtra = rows[0].prompt_extra || ''
    } else {
      template = TEMPLATES[tipo]
    }

    if (!template) return NextResponse.json({ error: 'Tipo inválido' }, { status: 400 })

    const camposPreenchidos = template.campos.map((campo: string, i: number) => `${campo}: ${respostas[i] || 'Não informado'}`).join('\n')

    // Detectar tipo de documento pra adaptar o prompt
    const PECAS_JUDICIAIS = ['peticao-inicial', 'contestacao', 'recurso-apelacao', 'habeas-corpus']
    const DOCS_SIMPLES = ['declaracao', 'carta-demissao', 'recibo', 'procuracao']
    const isPeca = PECAS_JUDICIAIS.includes(tipo)
    const isSimples = DOCS_SIMPLES.includes(tipo)

    let regras = ''
    if (isPeca) {
      regras = `REGRAS:
- Use linguagem jurídica formal e técnica
- Estruture conforme as normas processuais brasileiras (CPC/CPP)
- Inclua: endereçamento ao juízo, qualificação das partes, dos fatos, do direito, dos pedidos
- Cite artigos de lei, jurisprudência e doutrina quando aplicável
- Para petição inicial: inclua valor da causa, provas, pedidos com alíneas, requerimentos finais
- Para contestação: inclua preliminares (se houver), mérito, pedido de improcedência
- Para recurso: inclua tempestividade, cabimento, razões do recurso, pedido de reforma
- Para habeas corpus: inclua descrição da coação, fumus boni iuris, periculum in mora
- Inclua local, data e espaço para assinatura do advogado (Nome, OAB)
- NÃO inclua comentários ou explicações, apenas a peça pronta
- Formate com quebras de linha claras entre seções
- O documento deve ter entre 1500 e 4000 palavras`
    } else if (isSimples) {
      regras = `REGRAS:
- Use linguagem formal mas objetiva
- Seja direto e conciso
- Inclua local e data no final
- Inclua espaço para assinatura
- Baseie-se na legislação brasileira vigente
- NÃO inclua comentários ou explicações, apenas o documento pronto
- O documento deve ter entre 200 e 800 palavras`
    } else {
      regras = `REGRAS:
- Use linguagem jurídica formal mas compreensível
- Inclua todas as cláusulas necessárias (objeto, obrigações, prazo, pagamento, rescisão, foro, disposições gerais)
- Numere as cláusulas (CLÁUSULA PRIMEIRA, CLÁUSULA SEGUNDA, etc.)
- Inclua local e data no final
- Inclua espaço para assinaturas de ambas as partes
- Inclua espaço para 2 testemunhas
- Baseie-se na legislação brasileira vigente (Código Civil)
- NÃO inclua comentários ou explicações, apenas o contrato pronto
- Formate com quebras de linha claras entre cláusulas
- O contrato deve ter entre 800 e 2000 palavras dependendo da complexidade`
    }

    // 1) Buscar base RAG primeiro
    const ragQuery = `${template.nome} ${camposPreenchidos.slice(0, 1500)}`
    const rag = await searchRelevantChunks(ragQuery, 6)
    const usedWeb = !rag.hasEnoughEvidence

    const baseContexto = rag.hasEnoughEvidence
      ? `\n\nDOCUMENTOS DA BASE INTERNA (use como referencia prioritaria de clausulas, modelos e legislacao):\n\n${rag.context}\n`
      : ''

    const { bloco: dateCtx } = getDateContext()
    const prompt = `Você é um advogado brasileiro especialista em direito civil, trabalhista e processual. Gere um "${template.nome}" completo, profissional e juridicamente válido com base nestas informações:

${camposPreenchidos}

${regras}

${dateCtx}${promptExtra ? `\n\nINSTRUÇÕES ADICIONAIS DO USUÁRIO:\n${promptExtra}` : ''}${baseContexto}${usedWeb ? '\n\nA base interna nao tem material suficiente sobre este tipo de documento. Pesquise na web por modelos e legislacao vigente (priorize o ano corrente, depois anos anteriores em ordem decrescente).' : ''}`

    const genAI = new GoogleGenerativeAI(GEMINI_KEY)
    const modelConfig: any = { model: 'gemini-3.1-flash-lite-preview' }
    if (usedWeb) modelConfig.tools = [{ googleSearch: {} }]
    const model = genAI.getGenerativeModel(modelConfig)
    const result = await model.generateContent(prompt)
    const text = result.response.text()

    // Salvar no banco se usuario logado
    let docId = null
    const payload = getTokenFromHeader(req.headers.get('authorization'))
    if (payload?.id) {
      const rows = await query(
        'INSERT INTO contratoai.documents (user_id, tipo, tipo_nome, respostas, conteudo) VALUES ($1, $2, $3, $4, $5) RETURNING id',
        [payload.id, tipo, template.nome, JSON.stringify(respostas), text]
      )
      docId = rows[0]?.id
    }

    return NextResponse.json({
      contrato: text,
      tipo: template.nome,
      docId,
      sources: rag.sources,
      mode: rag.hasEnoughEvidence ? 'base' : 'web',
    })
  } catch (e: any) {
    console.error('Erro ao gerar contrato:', e)
    return NextResponse.json({ error: e.message || 'Erro interno' }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  const tipo = req.nextUrl.searchParams.get('tipo') || ''
  const template = TEMPLATES[tipo]
  if (!template) {
    return NextResponse.json({ tipos: Object.entries(TEMPLATES).map(([id, t]) => ({ id, nome: t.nome, campos: t.campos })) })
  }
  return NextResponse.json(template)
}
