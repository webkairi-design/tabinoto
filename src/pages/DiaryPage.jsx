import { Link } from 'react-router-dom'
import { useEntries } from '../hooks/useEntries'
import styles from './DiaryPage.module.css'

export default function DiaryPage() {
  const { entries, loading, deleteEntry } = useEntries()

  if (loading) {
    return <div className={styles.loading}>読み込み中...</div>
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>旅の日記</h1>
          <p className={styles.subtitle}>{entries.length} 件の記録</p>
        </div>
        <Link to="/diary/new" className={styles.newBtn}>
          + 新しい記録
        </Link>
      </div>

      {entries.length === 0 ? (
        <div className={styles.empty}>
          <div className={styles.emptyIcon}>✦</div>
          <p>まだ記録がありません</p>
          <Link to="/diary/new" className={styles.emptyLink}>最初の旅を記録する →</Link>
        </div>
      ) : (
        <div className={styles.list}>
          {entries.map((entry) => (
            <EntryCard key={entry.id} entry={entry} onDelete={deleteEntry} />
          ))}
        </div>
      )}
    </div>
  )
}

function EntryCard({ entry, onDelete }) {
  const tags = Array.isArray(entry.tags) ? entry.tags : []

  return (
    <Link to={`/diary/${entry.id}`} className={styles.card}>
      <div className={styles.cardLeft}>
        <div className={styles.cardDate}>
          {formatDate(entry.visited_at || entry.created_at)}
        </div>
        <h2 className={styles.cardTitle}>{entry.title}</h2>
        <div className={styles.cardPlace}>
          <span className={styles.placeDot} />
          {entry.place_name}
        </div>
        {entry.ai_summary && (
          <p className={styles.cardSummary}>{entry.ai_summary}</p>
        )}
        {tags.length > 0 && (
          <div className={styles.tags}>
            {tags.map((tag) => (
              <span key={tag} className={styles.tag}>{tag}</span>
            ))}
          </div>
        )}
      </div>

      {entry.photos?.[0] && (
        <div className={styles.cardThumb}>
          <img src={entry.photos[0]} alt={entry.title} />
        </div>
      )}
    </Link>
  )
}

function formatDate(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return new Intl.DateTimeFormat('ja-JP', {
    year: 'numeric', month: 'long', day: 'numeric',
  }).format(d)
}