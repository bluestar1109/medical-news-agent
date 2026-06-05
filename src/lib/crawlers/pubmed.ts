import Parser from 'rss-parser'
import type { RawArticle } from './types'

const parser = new Parser({
  timeout: 15000,
  headers: { 'User-Agent': 'Mozilla/5.0 (compatible; medical-news-agent/1.0)' },
  customFields: {
    item: [['dc:title', 'dcTitle'], ['description', 'description']],
  },
})

export async function crawlPubMed(): Promise<RawArticle[]> {
  const feed = await parser.parseURL(
    'https://www.thelancet.com/rssfeed/lanpub_current.xml'
  )
  return feed.items
    .slice(0, 15)
    .map((item) => ({
      source: 'PubMed',
      title: (item as { dcTitle?: string }).dcTitle || item.title || '',
      url: item.link || '',
      published_at: item.pubDate ? new Date(item.pubDate).toISOString() : null,
      original_content: item.contentSnippet || item.content || item.summary || '',
    }))
    .filter((a) => a.title && a.url)
}
