import { useState } from 'react'
import { collectTravelInfo } from '../lib/claude'
import styles from './AiResearchPage.module.css'

const EXAMPLES = ['広島平和記念公園', '京都嵐山', '沖縄美ら海水族館', '東京浅草寺', '箱根温泉']

export default function AiResearchPage() {
  const [query, setQuery] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [history, setHistory] = useState([])

  const handleSearch = async (place) => {
    const target = place || query.trim()
    if (!target) return

    setLoading(true)
    setError(null)
    setResult(null)
    setQuery(target)

    try {
      const text = await collectTravelInfo(target)
      setResult({ place: target, text, timestamp: new Date() })
      setHistory((prev) => [{ place: target, timestamp: new Date() }, ...prev.slice(0, 9)])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>AI情報収集</h1>
        <p className={styles.subtitle}>
          訪問予定地を入力すると、Claude APIがWeb検索して旅行情報を自動整理します
        </p>
      </div>

      <div className={styles.searchBox}>
        <input
          className={styles.searchInput}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          placeholder="訪問予定地を入力（例：広島平和記念公園）"
          disabled={loading}
        />
        <button
          className={styles.searchBtn}
          onClick={() => handleSearch()}
          disabled={loading || !query.trim()}
        >
          {loading ? '収集中...' : '情報を収集'}
        </button>
      </div>

      <div className={styles.examples}>
        <span className={styles.examplesLabel}>例：</span>
        {EXAMPLES.map((ex) => (
          <button key={ex} className={styles.exampleBtn} onClick={() => handleSearch(ex)}>
            {ex}
          </button>
        ))}
      </div>

      {error && (
        <div className={styles.error}>
          <strong>エラー：</strong>{error}
          {error.includes('APIキー') && (
            <p className={styles.errorHint}>
              .envファイルに <code>VITE_ANTHROPIC_API_KEY</code> を設定してください。
            </p>
          )}
        </div>
      )}

      {loading && (
        <div className={styles.loadingCard}>
          <div className={styles.loadingDots}>
            <span /><span /><span />
          </div>
          <p>「{query}」の情報をWeb検索して整理しています...</p>
        </div>
      )}

      {result && (
        <div className={styles.resultCard}>
          <div className={styles.resultHeader}>
            <span className={styles.resultPlace}>{result.place}</span>
            <span className={styles.resultTime}>
              {result.timestamp.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}
            </span>
            <span className={styles.aiBadge}>✦ Claude AI</span>
          </div>
          <div className={styles.resultBody}>
            <MarkdownLike text={result.text} />
          </div>
        </div>
      )}

      {history.length > 1 && (
        <div className={styles.history}>
          <h2 className={styles.historyTitle}>検索履歴</h2>
          <div className={styles.historyList}>
            {history.slice(1).map((h, i) => (
              <button key={i} className={styles.historyItem} onClick={() => handleSearch(h.place)}>
                {h.place}
              </button>
            ))}
          </div>
        </div>
      )}

      {!result && !loading && (
        <div className={styles.howto}>
          <h2 className={styles.howtoTitle}>仕組み</h2>
          <div className={styles.steps}>
            {[
              ['①', '訪問地名を入力してボタンを押す'],
              ['②', 'Claude APIがweb_searchツールでリアルタイム検索'],
              ['③', '基本情報・見どころ・おすすめを自動整理'],
              ['④', '日記を書く前の下調べや、旅先での情報収集に活用'],
            ].map(([num, desc]) => (
              <div key={num} className={styles.step}>
                <span className={styles.stepNum}>{num}</span>
                <span className={styles.stepDesc}>{desc}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function MarkdownLike({ text }) {
  if (!text) return null
  const lines = text.split('\n')
  return (
    <div>
      {lines.map((line, i) => {
        if (line.startsWith('## ')) return <h2 key={i} className={styles.mdH2}>{line.slice(3)}</h2>
        if (line.startsWith('# ')) return <h1 key={i} className={styles.mdH1}>{line.slice(2)}</h1>
        if (line.startsWith('- ') || line.startsWith('・')) return <li key={i} className={styles.mdLi}>{line.slice(2)}</li>
        if (line.trim() === '') return <div key={i} className={styles.mdSpacer} />
        return <p key={i} className={styles.mdP}>{line}</p>
      })}
    </div>
  )
}