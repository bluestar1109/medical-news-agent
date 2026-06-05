import Parser from 'rss-parser'
import type { RawArticle } from './types'

const parser = new Parser({ timeout: 10000 })

const RSS_URL =
  'https://news.google.com/rss/search?q=disease+outbreak+health+infectious&hl=en-US&gl=US&ceid=US:en'

export async function crawlGoogleNews(): Promise<RawArticle[]> {
  const feed = await parser.parseURL(RSS_URL)
  return feed.items
    .slice(0, 20)
    .map((item) => ({
      source: 'Google News',
      title: item.title || '',
      url: item.link || '',
      published_at: item.pubDate ? new Date(item.pubDate).toISOString() : null,
      original_content: item.contentSnippet || item.content || item.summary || '',
    }))
    .filter((a) => a.title && a.url)
}
