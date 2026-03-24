// src/lib/claude.js

const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages';
const CLAUDE_MODEL = 'claude-sonnet-4-20250514';

// ヘルパー: JSONフェンス除去 + パース（最も重要な修正箇所）
function parseJsonSafely(text) {
  if (!text) return null;
  // ```json ... ``` や ``` ... ``` を除去
  const cleaned = text
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();
  try {
    return JSON.parse(cleaned);
  } catch (e) {
    console.error('JSON parse error:', e, '\nRaw text:', text);
    return null;
  }
}

// ヘルパー: APIレスポンスからテキストを取得
function extractText(data) {
  if (!data?.content) return '';
  const textBlock = data.content.find(block => block.type === 'text');
  return textBlock?.text || '';
}

// 旅行情報を調査する
export async function claudeResearch(query) {
  const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY;
  if (!apiKey) {
    return getMockResearch(query);
  }

  try {
    const response = await fetch(CLAUDE_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model: CLAUDE_MODEL,
        max_tokens: 2000,
        messages: [
          {
            role: 'user',
            content: `以下の旅行先について、日本語で詳しく教えてください。
観光スポット、グルメ、交通手段、ベストシーズン、注意事項などを含めてください。

場所: ${query}

マークダウン形式で読みやすく回答してください。`,
          },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    return extractText(data) || getMockResearch(query);
  } catch (error) {
    console.error('claudeResearch error:', error);
    return getMockResearch(query);
  }
}

// AIの調査結果から場所名を抽出する
export async function claudeExtractPlaces(researchContent) {
  const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY;
  if (!apiKey) {
    return getMockPlaces();
  }

  try {
    const response = await fetch(CLAUDE_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model: CLAUDE_MODEL,
        max_tokens: 500,
        messages: [
          {
            role: 'user',
            content: `以下の旅行情報から、訪問すべき具体的な場所・スポット名を最大10個抽出してください。

${researchContent}

必ずJSONのみで回答してください。他のテキストは一切含めないでください。
形式: {"places": ["場所1", "場所2", "場所3"]}`,
          },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    const text = extractText(data);
    const parsed = parseJsonSafely(text);
    return parsed?.places || getMockPlaces();
  } catch (error) {
    console.error('claudeExtractPlaces error:', error);
    return getMockPlaces();
  }
}

// 場所の詳細情報（住所・見どころ）を生成する ← 今回の修正箇所
export async function claudeGeneratePlaceInfo(placeName) {
  const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY;

  // APIキーがない場合はモックデータを返す
  if (!apiKey) {
    console.warn('VITE_ANTHROPIC_API_KEY が未設定です。モックデータを使用します。');
    return getMockPlaceInfo(placeName);
  }

  try {
    const response = await fetch(CLAUDE_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model: CLAUDE_MODEL,
        max_tokens: 400,
        messages: [
          {
            role: 'user',
            content: `「${placeName}」について、以下のJSON形式のみで回答してください。
余分なテキスト、説明、コードブロック記号は一切含めないでください。
JSONのみ出力してください。

{"address": "都道府県から始まる住所（例: 東京都新宿区歌舞伎町1-1-1）", "notes": "見どころや特徴を2〜3文で説明"}`,
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error('API response error:', response.status, errorBody);
      return getMockPlaceInfo(placeName);
    }

    const data = await response.json();
    const text = extractText(data);

    if (!text) {
      console.error('Empty response text from Claude');
      return getMockPlaceInfo(placeName);
    }

    const parsed = parseJsonSafely(text);

    if (!parsed || !parsed.address) {
      console.error('Failed to parse place info. Raw text:', text);
      return getMockPlaceInfo(placeName);
    }

    return {
      address: parsed.address || '',
      notes: parsed.notes || '',
    };
  } catch (error) {
    console.error('claudeGeneratePlaceInfo error:', error);
    return getMockPlaceInfo(placeName);
  }
}

// 日記のAI要約・タグ生成
export async function summarizeDiary(content) {
  const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY;
  if (!apiKey) return getMockSummary();

  try {
    const response = await fetch(CLAUDE_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model: CLAUDE_MODEL,
        max_tokens: 500,
        messages: [{
          role: 'user',
          content: `以下の旅行日記を読んで、要約とタグを生成してください。
JSONのみで回答してください。他のテキストは一切含めないでください。

日記:
${content}

形式: {"summary": "100文字以内の要約", "tags": ["タグ1", "タグ2", "タグ3"]}`,
        }],
      }),
    });
    if (!response.ok) throw new Error(`API error: ${response.status}`);
    const data = await response.json();
    const parsed = parseJsonSafely(extractText(data));
    return parsed || getMockSummary();
  } catch (error) {
    console.error('summarizeDiary error:', error);
    return getMockSummary();
  }
}

// ── モックデータ（APIキーなし・エラー時のフォールバック） ──

function getMockResearch(query) {
  return `# ${query} の旅行情報

## 概要
${query}は魅力的な観光地です。豊かな自然や文化、グルメを楽しめます。

## 主な観光スポット
- 中心部の観光エリア
- 歴史的建造物や文化施設
- 自然景観スポット

## グルメ
地元の名物料理や特産品が楽しめます。

## アクセス
主要都市からの交通手段が整っています。

## ベストシーズン
春と秋が観光に最適です。

> ※ デモモードです。VITE_ANTHROPIC_API_KEY を設定すると実際のAI情報を取得できます。`;
}

function getMockPlaces() {
  return ['観光スポットA', '観光スポットB', 'レストランC', '公園D', '博物館E'];
}

function getMockPlaceInfo(placeName) {
  return {
    address: `${placeName}周辺（住所はAIが自動生成します）`,
    notes: `${placeName}の見どころやおすすめ情報をここに表示します。APIキーを設定すると実際の情報が生成されます。`,
  };
}

function getMockSummary() {
  return {
    summary: '素晴らしい旅の思い出。様々な観光スポットを巡り、地元グルメも堪能しました。',
    tags: ['旅行', '観光', 'グルメ'],
  };
}
