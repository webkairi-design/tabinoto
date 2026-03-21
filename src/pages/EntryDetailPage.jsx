import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useEntries } from '../hooks/useEntries'
import styles from './EntryDetailPage.module.css'

export default function EntryDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { entries, deleteEntry } = useEntries()
  const [lightbox, setLightbox] = useState(null)

  const entry = entries.find((e) => String(e.id) === String(id))

  if (!entry) {
    return <div className={styles.notFound}>記録が見つかりません。</div>
  }

  const tags = Array.isArray(entry.tags) ? entry.tags : []
  const photos = Array.isArray(entry.photos) ? entry.photos : []

  const handleDelete = async () => {
    if (window.confirm('この記録を削除しますか？')) {
      await deleteEntry(entry.id)
      navigate('/diary')
    }
  }

  return (
    <div className={styles.page}>
      <button className={styles.back} onClick={() => navigate('/diary')}>← 一覧に戻る</button>

      <div className={styles.meta}>
        <span className={styles.date}>{formatDate(entry.visited_at || entry.created_at)}</span>
        <span className={styles.place}>
          <span className={styles.placeDot} />
          {entry.place_name}
        </span>
        {entry.gps_lat && (
          <span className={styles.gps}>
            📍 {Number(entry.gps_lat).toFixed(4)}, {Number(entry.gps_lng).toFixed(4)}
          </span>
        )}
      </div>

      <h1 className={styles.title}>{entry.title}</h1>

      {tags.length > 0 && (
        <div className={styles.tags}>
          {tags.map((tag) => <span key={tag} className={styles.tag}>{tag}</span>)}
        </div>
      )}

      {entry.ai_summary && (
        <div className={styles.aiSummary}>
          <span className={styles.aiLabel}>✨ AI要約</span>
          <p>{entry.ai_summary}</p>
        </div>
      )}

      <div className={styles.body}>{entry.body}</div>

      {photos.length > 0 && (
        <div className={styles.photoGrid}>
          {photos.map((src, i) => (
            <div key={i} className={styles.photoItem} onClick={() => setLightbox(src)}>
              <img src={src} alt={`写真 ${i + 1}`} />
            </div>
          ))}
        </div>
      )}

      <div className={styles.actions}>
        <button className={styles.editBtn} onClick={() => navigate(`/diary/${entry.id}/edit`)}>編集</button>
        <button className={styles.deleteBtn} onClick={handleDelete}>削除</button>
      </div>

      {lightbox && (
        <div
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 1000, cursor: 'zoom-out'
          }}
          onClick={() => setLightbox(null)}
        >
          <img src={lightbox} style={{ maxWidth: '90vw', maxHeight: '90vh', borderRadius: '8px' }} />
        </div>
      )}
    </div>
  )
}

function formatDate(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return new Intl.DateTimeFormat('ja-JP', {
    year: 'numeric', month: 'long', day: 'numeric', weekday: 'short',
  }).format(d)
}