import Parser from 'rss-parser'
import type { RawArticle } from './types'

const parser = new Parser({ timeout: 15000 })

const RSS_URL =
  'https://pubmed.ncbi.nlm.nih.gov/rss/search/?term=emerging+infectious+disease+outbreak&format=abstract&limit=15'

export async function crawlPubMed(): Promise<RawArticle[]> {
  const feed = await parser.parseURL(RSS_URL)
  return feed.items
    .slice(0, 15)
    .map((item) => ({
      source: 'PubMed',
      title: item.title || '',
      url: item.link || '',
      published_at: item.pubDate ? new Date(item.pubDate).toISOString() : null,
      original_content: item.contentSnippet || item.content || item.summary || '',
    }))
    .filter((a) => a.title && a.url)
}
