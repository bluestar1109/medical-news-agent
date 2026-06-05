import Parser from 'rss-parser'
import type { RawArticle } from './types'

const parser = new Parser({
  timeout: 10000,
  headers: { 'User-Agent': 'Mozilla/5.0 (compatible; medical-news-agent/1.0)' },
})

export async function crawlNIH(): Promise<RawArticle[]> {
  const feed = await parser.parseURL('https://www.sciencedaily.com/rss/health_medicine.xml')
  return feed.items
    .slice(0, 20)
    .map((item) => ({
      source: 'NIH',
      title: item.title || '',
      url: item.link || '',
      published_at: item.pubDate ? new Date(item.pubDate).toISOString() : null,
      original_content: item.contentSnippet || item.content || item.summary || '',
    }))
    .filter((a) => a.title && a.url)
}
