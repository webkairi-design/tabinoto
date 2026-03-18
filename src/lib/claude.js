const ANTHROPIC_API_KEY = import.meta.env.VITE_ANTHROPIC_API_KEY

export async function collectTravelInfo(placeName) {
  if (!ANTHROPIC_API_KEY) {
    throw new Error('Claude APIキーが設定されていません。')
  }
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: 'あなたは旅行ガイドのアシスタントです。訪問地について、基本情報・見どころ・おすすめの過ごし方・近隣のおすすめを日本語でまとめてください。',
      messages: [{ role: 'user', content: '「' + placeName + '」について旅行情報を収集してまとめてください。' }],
    }),
  })
  if (!response.ok) {
    const err = await response.json().catch(() => ({}))
    throw new Error(err.error?.message || 'API Error: ' + response.status)
  }
  const data = await response.json()
  return data.content.filter((b) => b.type === 'text').map((b) => b.text).join('\n')
}

export async function summarizeDiary(diaryText, placeName) {
  if (!ANTHROPIC_API_KEY) {
    throw new Error('Claude APIキーが設定されていません。')
  }
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 512,
      system: '日記テキストを受け取り、必ずJSONのみを返してください。形式: {"summary": "2〜3文の要約", "tags": ["タグ1", "タグ2"]}',
      messages: [{ role: 'user', content: '訪問地: ' + placeName + '\n\n日記:\n' + diaryText }],
    }),
  })
  if (!response.ok) throw new Error('API Error: ' + response.status)
  const data = await response.json()
  const raw = data.content[0]?.text || '{}'
  try { return JSON.parse(raw) } catch { return { summary: raw, tags: [] } }
}
