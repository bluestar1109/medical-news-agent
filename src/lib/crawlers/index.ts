import { crawlWHO } from './who'
import { crawlCDC } from './cdc'
import { crawlNIH } from './nih'
import { crawlPubMed } from './pubmed'
import { crawlMedicalXpress } from './medicalxpress'
import { crawlGoogleNews } from './google-news'
import { crawlReuters } from './reuters'
import type { RawArticle } from './types'

const CRAWLERS = [
  { name: 'WHO', fn: crawlWHO },
  { name: 'CDC', fn: crawlCDC },
  { name: 'NIH', fn: crawlNIH },
  { name: 'PubMed', fn: crawlPubMed },
  { name: 'MedicalXpress', fn: crawlMedicalXpress },
  { name: 'Google News', fn: crawlGoogleNews },
  { name: 'Reuters', fn: crawlReuters },
]

export async function crawlAll(): Promise<RawArticle[]> {
  const results = await Promise.allSettled(CRAWLERS.map((c) => c.fn()))
  const articles: RawArticle[] = []

  results.forEach((result, i) => {
    if (result.status === 'fulfilled') {
      articles.push(...result.value)
    } else {
      console.error(`[${CRAWLERS[i].name}] 크롤링 실패:`, result.reason?.message)
    }
  })

  return articles
}
