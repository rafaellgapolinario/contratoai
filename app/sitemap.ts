import type { MetadataRoute } from 'next'
import { query } from '@/lib/db'

export const dynamic = 'force-dynamic'

const BASE = 'https://contrato.rga-technologies.com'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE, lastModified: new Date(), changeFrequency: 'weekly', priority: 1 },
    { url: `${BASE}/blog`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${BASE}/login`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
    { url: `${BASE}/termos`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.2 },
    { url: `${BASE}/privacidade`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.2 },
  ]

  // Blog articles
  let blogPages: MetadataRoute.Sitemap = []
  try {
    const artigos = await query(
      'SELECT slug, criado_em FROM contratoai.artigos WHERE publicado = true ORDER BY criado_em DESC'
    )
    blogPages = artigos.map((a: any) => ({
      url: `${BASE}/blog/${a.slug}`,
      lastModified: new Date(a.criado_em),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    }))
  } catch {}

  return [...staticPages, ...blogPages]
}
