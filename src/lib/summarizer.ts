export async function summarizeArticle(title: string, content: string): Promise<string> {
  const apiKey = process.env.OPENROUTER_API_KEY
  if (!apiKey) throw new Error('OPENROUTER_API_KEY not set')

  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'https://medical-news-agent.vercel.app',
      'X-Title': 'Medical News Agent',
    },
    body: JSON.stringify({
      model: 'openrouter/auto',
      messages: [
        {
          role: 'system',
          content:
            '당신은 의료/질병 뉴스 전문 요약가입니다. 주어진 뉴스를 한국어로 3-4문장으로 핵심만 간결하게 요약하세요. 일반인도 이해할 수 있는 쉬운 언어를 사용하세요. 요약만 출력하고 다른 설명은 하지 마세요.',
        },
        {
          role: 'user',
          content: `제목: ${title}\n\n내용: ${content.slice(0, 2000)}`,
        },
      ],
      max_tokens: 600,
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`OpenRouter error: ${err}`)
  }

  const data = await res.json()
  return data.choices?.[0]?.message?.content?.trim() || '요약 생성 실패'
}
