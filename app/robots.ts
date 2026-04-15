import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/painel/', '/admin/', '/gerar/', '/chat/', '/analisar/', '/modelos/', '/jurisprudencia/', '/teses/'],
    },
    sitemap: 'https://contrato.rga-technologies.com/sitemap.xml',
  }
}
