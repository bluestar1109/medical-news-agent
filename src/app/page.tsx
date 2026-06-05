'use client'

import { useEffect, useState, useCallback } from 'react'

interface Article {
  id: string
  source: string
  title: string
  url: string
  published_at: string | null
  summary: string | null
  created_at: string
}

const SOURCE_COLORS: Record<string, string> = {
  WHO: 'bg-blue-100 text-blue-800',
  CDC: 'bg-red-100 text-red-800',
  NIH: 'bg-emerald-100 text-emerald-800',
  PubMed: 'bg-purple-100 text-purple-800',
  MedicalXpress: 'bg-teal-100 text-teal-800',
  'Google News': 'bg-orange-100 text-orange-800',
  Reuters: 'bg-slate-100 text-slate-800',
}

const SOURCES = ['전체', 'WHO', 'CDC', 'NIH', 'PubMed', 'MedicalXpress', 'Google News', 'Reuters']

function timeAgo(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const days = Math.floor(hours / 24)
  if (hours < 1) return '방금 전'
  if (hours < 24) return `${hours}시간 전`
  if (days < 7) return `${days}일 전`
  return date.toLocaleDateString('ko-KR')
}

function NewsCard({ article }: { article: Article }) {
  const colorClass = SOURCE_COLORS[article.source] || 'bg-gray-100 text-gray-800'
  const dateStr = article.published_at || article.created_at

  return (
    <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${colorClass}`}>
          {article.source}
        </span>
        <span className="text-xs text-gray-400">{timeAgo(dateStr)}</span>
      </div>
      <h3 className="font-semibold text-gray-900 leading-snug line-clamp-2 text-sm">
        {article.title}
      </h3>
      {article.summary ? (
        <div className="bg-blue-50 rounded-lg p-3 flex-1">
          <p className="text-xs text-blue-600 font-medium mb-1">🤖 AI 요약</p>
          <p className="text-sm text-gray-700 leading-relaxed line-clamp-4">{article.summary}</p>
        </div>
      ) : (
        <div className="flex-1" />
      )}
      <a
        href={article.url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-sm text-blue-600 hover:text-blue-800 font-medium"
      >
        원문 보기 →
      </a>
    </div>
  )
}

function SkeletonCard() {
  return (
    <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 animate-pulse flex flex-col gap-3">
      <div className="flex justify-between">
        <div className="h-6 w-16 bg-gray-200 rounded-full" />
        <div className="h-4 w-16 bg-gray-200 rounded" />
      </div>
      <div className="h-4 bg-gray-200 rounded w-full" />
      <div className="h-4 bg-gray-200 rounded w-4/5" />
      <div className="bg-gray-100 rounded-lg p-3 space-y-2">
        <div className="h-3 bg-gray-200 rounded w-full" />
        <div className="h-3 bg-gray-200 rounded w-5/6" />
        <div className="h-3 bg-gray-200 rounded w-3/4" />
      </div>
    </div>
  )
}

export default function Home() {
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [collecting, setCollecting] = useState(false)
  const [selectedSource, setSelectedSource] = useState('전체')
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [collectStatus, setCollectStatus] = useState<string | null>(null)

  const fetchNews = useCallback(async () => {
    setLoading(true)
    try {
      const source = selectedSource === '전체' ? '' : selectedSource
      const res = await fetch(`/api/news?source=${encodeURIComponent(source)}&limit=60`)
      const data = await res.json()
      setArticles(data.articles || [])
      setLastUpdated(new Date())
    } catch {
      /* no-op */
    } finally {
      setLoading(false)
    }
  }, [selectedSource])

  const triggerCollect = async () => {
    setCollecting(true)
    setCollectStatus('수집 중...')
    try {
      const res = await fetch('/api/collect')
      const data = await res.json()
      setCollectStatus(`완료: ${data.saved}개 저장 / 전체 ${data.total}개`)
      await fetchNews()
    } catch {
      setCollectStatus('수집 실패')
    } finally {
      setCollecting(false)
      setTimeout(() => setCollectStatus(null), 6000)
    }
  }

  useEffect(() => {
    fetchNews()
  }, [fetchNews])

  const displayArticles =
    selectedSource === '전체' ? articles : articles.filter((a) => a.source === selectedSource)

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="bg-gradient-to-r from-blue-900 to-blue-700 text-white py-8 px-4 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">🏥 의료 뉴스 에이전트</h1>
              <p className="text-blue-200 mt-1 text-sm">
                WHO · CDC · NIH · PubMed · MedicalXpress · Google News · Reuters — 최신 질병 정보 자동 수집 &amp; AI 요약
              </p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <button
                onClick={triggerCollect}
                disabled={collecting}
                className="bg-white text-blue-800 hover:bg-blue-50 disabled:opacity-60 px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors shadow-sm"
              >
                {collecting ? '⏳ 수집 중...' : '🔄 지금 수집'}
              </button>
              {collectStatus && (
                <span className="text-xs text-blue-200">{collectStatus}</span>
              )}
              {lastUpdated && !collectStatus && (
                <span className="text-xs text-blue-300">
                  업데이트: {lastUpdated.toLocaleTimeString('ko-KR')}
                </span>
              )}
            </div>
          </div>

          <div className="mt-4 flex gap-2 flex-wrap">
            {SOURCES.slice(1).map((source) => {
              const count = articles.filter((a) => a.source === source).length
              return count > 0 ? (
                <span
                  key={source}
                  className="text-xs bg-blue-800 bg-opacity-50 px-3 py-1 rounded-full text-blue-200"
                >
                  {source}: {count}건
                </span>
              ) : null
            })}
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex gap-2 flex-wrap mb-6">
          {SOURCES.map((source) => (
            <button
              key={source}
              onClick={() => setSelectedSource(source)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                selectedSource === source
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-blue-300 hover:text-blue-600'
              }`}
            >
              {source}
              {source !== '전체' && articles.filter((a) => a.source === source).length > 0 && (
                <span
                  className={`ml-1.5 text-xs ${selectedSource === source ? 'text-blue-200' : 'text-gray-400'}`}
                >
                  {articles.filter((a) => a.source === source).length}
                </span>
              )}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(9)].map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : displayArticles.length === 0 ? (
          <div className="text-center py-24 text-gray-400">
            <div className="text-6xl mb-4">📰</div>
            <p className="text-xl font-medium text-gray-500 mb-2">수집된 뉴스가 없습니다</p>
            <p className="text-sm">
              상단의 <strong className="text-gray-600">지금 수집</strong> 버튼을 눌러 뉴스를 가져오세요
            </p>
            <p className="text-xs mt-2 text-gray-400">AI 요약은 OpenRouter API 키 설정 후 활성화됩니다</p>
          </div>
        ) : (
          <>
            <p className="text-sm text-gray-400 mb-4">{displayArticles.length}건</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {displayArticles.map((article) => (
                <NewsCard key={article.id} article={article} />
              ))}
            </div>
          </>
        )}
      </div>
    </main>
  )
}
