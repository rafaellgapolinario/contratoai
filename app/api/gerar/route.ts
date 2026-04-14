import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

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
}

export async function POST(req: NextRequest) {
  try {
    const { tipo, respostas } = await req.json()
    const template = TEMPLATES[tipo]
    if (!template) return NextResponse.json({ error: 'Tipo inválido' }, { status: 400 })
    if (!GEMINI_KEY) return NextResponse.json({ error: 'API key não configurada' }, { status: 500 })

    const camposPreenchidos = template.campos.map((campo, i) => `${campo}: ${respostas[i] || 'Não informado'}`).join('\n')

    const prompt = `Você é um advogado brasileiro especialista em contratos. Gere um "${template.nome}" completo, profissional e juridicamente válido com base nestas informações:

${camposPreenchidos}

REGRAS:
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

    const genAI = new GoogleGenerativeAI(GEMINI_KEY)
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-lite' })
    const result = await model.generateContent(prompt)
    const text = result.response.text()

    return NextResponse.json({ contrato: text, tipo: template.nome })
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
