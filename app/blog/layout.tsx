import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Blog — Artigos sobre Contratos e Direito',
  description: 'Dicas juridicas, modelos de contrato e orientacoes para empreendedores e PMEs. Aprenda a proteger seu negocio.',
  alternates: { canonical: '/blog' },
  openGraph: {
    title: 'Blog ContratoAI — Artigos sobre Contratos e Direito',
    description: 'Dicas juridicas, modelos de contrato e orientacoes para empreendedores e PMEs.',
    type: 'website',
  },
}

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
