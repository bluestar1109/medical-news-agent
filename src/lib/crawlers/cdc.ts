import Parser from 'rss-parser'
import type { RawArticle } from './types'

const parser = new Parser({ timeout: 10000 })

export async function crawlCDC(): Promise<RawArticle[]> {
  const feed = await parser.parseURL(
    'https://tools.cdc.gov/api/v2/resources/media/316422.rss'
  )
  return feed.items
    .slice(0, 20)
    .map((item) => ({
      source: 'CDC',
      title: item.title || '',
      url: item.link || '',
      published_at: item.pubDate ? new Date(item.pubDate).toISOString() : null,
      original_content: item.contentSnippet || item.content || item.summary || '',
    }))
    .filter((a) => a.title && a.url)
}
