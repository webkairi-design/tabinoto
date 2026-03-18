import { useEntries } from '../hooks/useEntries'
import { Link } from 'react-router-dom'
import styles from './MapPage.module.css'

export default function MapPage() {
  const { entries, loading } = useEntries()
  const gpsEntries = entries.filter((e) => e.gps_lat && e.gps_lng)
  const places = [...new Set(entries.map((e) => e.place_name).filter(Boolean))]
  if (loading) return <div className={styles.loading}>読み込み中...</div>
  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>旅の地図</h1>
        <p className={styles.subtitle}>訪問した場所の記録</p>
      </div>
      <div className={styles.stats}>
        <div className={styles.stat}>
          <span className={styles.statNum}>{entries.length}</span>
          <span className={styles.statLabel}>記録数</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statNum}>{places.length}</span>
          <span className={styles.statLabel}>訪問地</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statNum}>{gpsEntries.length}</span>
          <span className={styles.statLabel}>GPS付き</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statNum}>
            {entries.reduce((a, e) => a + (Array.isArray(e.photos) ? e.photos.length : 0), 0)}
          </span>
          <span className={styles.statLabel}>写真</span>
        </div>
      </div>
      {gpsEntries.length > 0 ? (
        <div className={styles.mapSection}>
          <div className={styles.mapInfo}>
            <span className={styles.mapInfoText}>GPS: {gpsEntries.length}件</span>
          </div>
          <div className={styles.coordinateList}>
            {gpsEntries.map((e) => (
              <div key={e.id} className={styles.coordItem}>
                <div className={styles.coordPin}>📍</div>
                <div className={styles.coordInfo}>
                  <span className={styles.coordPlace}>{e.place_name}</span>
                  <span className={styles.coordValue}>
                    {Number(e.gps_lat).toFixed(5)}, {Number(e.gps_lng).toFixed(5)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className={styles.noGps}>
          <div className={styles.noGpsIcon}>◎</div>
          <p>GPS情報付きの写真をアップロードすると表示されます</p>
          <Link to="/diary/new" className={styles.noGpsLink}>記録を追加する</Link>
        </div>
      )}
      {places.length > 0 && (
        <div className={styles.placeSection}>
          <h2 className={styles.sectionTitle}>訪問した場所</h2>
          <div className={styles.placeList}>
            {places.map((place) => {
              const placeEntries = entries.filter((e) => e.place_name === place)
              return (
                <div key={place} className={styles.placeItem}>
                  <div className={styles.placeHeader}>
                    <span className={styles.placeDot} />
                    <span className={styles.placeName}>{place}</span>
                    <span className={styles.placeCount}>{placeEntries.length}件</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
