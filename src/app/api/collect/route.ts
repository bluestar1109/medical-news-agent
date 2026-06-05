import { NextRequest, NextResponse } from 'next/server'
import { crawlAll } from '@/lib/crawlers'
import { summarizeArticle } from '@/lib/summarizer'
import { getAdminClient } from '@/lib/supabase'

export const dynamic = 'force-dynamic'
export const maxDuration = 300

export async function GET() {
  return handleCollect()
}

export async function POST(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET
  const authHeader = request.headers.get('authorization')
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  return handleCollect()
}

async function handleCollect() {
  const db = getAdminClient()

  const rawArticles = await crawlAll()

  const urls = rawArticles.map((a) => a.url).filter(Boolean)
  const { data: existing } = await db
    .from('news_articles')
    .select('url')
    .in('url', urls)

  const existingUrls = new Set((existing || []).map((r: { url: string }) => r.url))
  const freshArticles = rawArticles.filter((a) => a.url && !existingUrls.has(a.url))

  // 소스별로 최대 7개씩 균등 선택 (총 최대 49개)
  const bySource = new Map<string, typeof freshArticles>()
  for (const a of freshArticles) {
    if (!bySource.has(a.source)) bySource.set(a.source, [])
    bySource.get(a.source)!.push(a)
  }
  const newArticles: typeof freshArticles = []
  let added = true
  while (added && newArticles.length < 49) {
    added = false
    for (const [, items] of bySource) {
      if (items.length > 0) {
        newArticles.push(items.shift()!)
        added = true
        if (newArticles.length >= 49) break
      }
    }
  }

  const hasOpenRouter = !!process.env.OPENROUTER_API_KEY
  let saved = 0
  let errors = 0

  for (const article of newArticles) {
    let summary: string | null = null

    if (hasOpenRouter && article.original_content) {
      try {
        summary = await summarizeArticle(article.title, article.original_content)
      } catch {
        errors++
      }
    }

    const { error } = await db.from('news_articles').insert({
      source: article.source,
      title: article.title,
      url: article.url,
      published_at: article.published_at,
      original_content: article.original_content.slice(0, 5000),
      summary,
    })

    if (!error) {
      saved++
    } else {
      console.error('[insert error]', error.message, '|', article.url)
      errors++
    }
  }

  return NextResponse.json({
    total: rawArticles.length,
    new: newArticles.length,
    saved,
    errors,
  })
}
