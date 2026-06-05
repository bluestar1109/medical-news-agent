export interface NewsArticle {
  id: string
  source: string
  title: string
  url: string
  published_at: string | null
  original_content: string | null
  summary: string | null
  tags: string[]
  created_at: string
}

export interface RawArticle {
  source: string
  title: string
  url: string
  published_at: string | null
  original_content: string
}
