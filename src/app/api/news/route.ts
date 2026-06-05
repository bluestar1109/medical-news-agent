import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const source = searchParams.get('source') || ''
  const limit = Math.min(parseInt(searchParams.get('limit') || '60'), 100)
  const page = parseInt(searchParams.get('page') || '0')

  let query = supabase
    .from('news_articles')
    .select('id, source, title, url, published_at, summary, created_at')
    .order('published_at', { ascending: false, nullsFirst: false })
    .order('created_at', { ascending: false })
    .range(page * limit, (page + 1) * limit - 1)

  if (source) {
    query = query.eq('source', source)
  }

  const { data, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ articles: data || [] })
}
