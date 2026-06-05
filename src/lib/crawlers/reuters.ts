import Parser from 'rss-parser'
import type { RawArticle } from './types'

const parser = new Parser({ timeout: 10000 })

const RSS_URLS = [
  'https://feeds.reuters.com/Reuters/healthNews',
  'https://feeds.reuters.com/reuters/health',
]

export async function crawlReuters(): Promise<RawArticle[]> {
  for (const url of RSS_URLS) {
    try {
      const feed = await parser.parseURL(url)
      return feed.items
        .slice(0, 20)
        .map((item) => ({
          source: 'Reuters',
          title: item.title || '',
          url: item.link || '',
          published_at: item.pubDate ? new Date(item.pubDate).toISOString() : null,
          original_content: item.contentSnippet || item.content || item.summary || '',
        }))
        .filter((a) => a.title && a.url)
    } catch {
      continue
    }
  }
  return []
}
