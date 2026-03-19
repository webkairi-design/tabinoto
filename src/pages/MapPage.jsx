import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useEntries } from '../hooks/useEntries'
import styles from './MapPage.module.css'

// 場所名から都道府県を推測
function getPrefecture(placeName) {
  const map = {
    '北海道': '北海道', '青森': '青森県', '岩手': '岩手県', '宮城': '宮城県',
    '秋田': '秋田県', '山形': '山形県', '福島': '福島県', '茨城': '茨城県',
    '栃木': '栃木県', '群馬': '群馬県', '埼玉': '埼玉県', '千葉': '千葉県',
    '東京': '東京都', '神奈川': '神奈川県', '新潟': '新潟県', '富山': '富山県',
    '石川': '石川県', '福井': '福井県', '山梨': '山梨県', '長野': '長野県',
    '岐阜': '岐阜県', '静岡': '静岡県', '愛知': '愛知県', '三重': '三重県',
    '滋賀': '滋賀県', '京都': '京都府', '大阪': '大阪府', '兵庫': '兵庫県',
    '奈良': '奈良県', '和歌山': '和歌山県', '鳥取': '鳥取県', '島根': '島根県',
    '岡山': '岡山県', '広島': '広島県', '山口': '山口県', '徳島': '徳島県',
    '香川': '香川県', '愛媛': '愛媛県', '高知': '高知県', '福岡': '福岡県',
    '佐賀': '佐賀県', '長崎': '長崎県', '熊本': '熊本県', '大分': '大分県',
    '宮崎': '宮崎県', '鹿児島': '鹿児島県', '沖縄': '沖縄県',
    '宮島': '広島県', '南大隅': '鹿児島県',
  }
  for (const [key, pref] of Object.entries(map)) {
    if (placeName?.includes(key)) return pref
  }
  return 'その他'
}

export default function MapPage() {
  const { entries } = useEntries()
  const navigate = useNavigate()
  const mapRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const markersRef = useRef({})
  const [openPref, setOpenPref] = useState(null)

  const gpsEntries = entries.filter(e => e.gps_lat && e.gps_lng)

  // 都道府県別グループ
  const prefGroups = {}
  gpsEntries.forEach(entry => {
    const pref = getPrefecture(entry.place_name)
    if (!prefGroups[pref]) prefGroups[pref] = []
    prefGroups[pref].push(entry)
  })

  const flyTo = (entry) => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([entry.gps_lat, entry.gps_lng], 13)
      markersRef.current[entry.id]?.openPopup()
    }
  }

  useEffect(() => {
    if (mapInstanceRef.current) return
    if (!mapRef.current) return

    import('leaflet').then(L => {
      import('leaflet/dist/leaflet.css')
      delete L.default.Icon.Default.prototype._getIconUrl
      L.default.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      })

      const center = gpsEntries.length > 0
        ? [gpsEntries[0].gps_lat, gpsEntries[0].gps_lng]
        : [34.3853, 132.4553]

      const map = L.default.map(mapRef.current).setView(center, 8)
      mapInstanceRef.current = map

      L.default.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(map)

      gpsEntries.forEach(entry => {
        const photoUrl = entry.photos?.[0]
        const popupContent = `
          <div style="text-align:center;min-width:150px;cursor:pointer" data-id="${entry.id}">
            ${photoUrl ? `<img src="${photoUrl}" style="width:150px;height:100px;object-fit:cover;border-radius:8px;margin-bottom:6px"/>` : ''}
            <div style="font-weight:bold;font-size:14px">${entry.title}</div>
            <div style="color:#666;font-size:12px">${entry.place_name}</div>
            <div style="color:#999;font-size:11px">${entry.visited_at}</div>
            <div style="color:#4a7c59;font-size:12px;margin-top:4px">→ 日記を見る</div>
          </div>
        `
        const marker = L.default.marker([entry.gps_lat, entry.gps_lng])
          .addTo(map)
          .bindPopup(popupContent)

        markersRef.current[entry.id] = marker

        marker.on('popupopen', () => {
          setTimeout(() => {
            const el = document.querySelector(`[data-id="${entry.id}"]`)
            if (el) el.addEventListener('click', () => navigate(`/diary/${entry.id}`))
          }, 100)
        })
      })
    })

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [gpsEntries, navigate])

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>旅の地図</h1>
        <p className={styles.subtitle}>訪問した場所の記録</p>
      </div>
      <div ref={mapRef} className={styles.mapWrapper} />

      <div className={styles.prefList}>
        {Object.entries(prefGroups).map(([pref, entries]) => (
          <div key={pref} className={styles.prefGroup}>
            <button
              className={styles.prefHeader}
              onClick={() => setOpenPref(openPref === pref ? null : pref)}
            >
              <span>📍 {pref}</span>
              <span>{entries.length}件 {openPref === pref ? '▲' : '▼'}</span>
            </button>
            {openPref === pref && (
              <ul className={styles.prefEntries}>
                {entries.map(entry => (
                  <li key={entry.id} className={styles.prefEntry} onClick={() => flyTo(entry)}>
                    <span className={styles.prefEntryName}>{entry.place_name}</span>
                    <span className={styles.prefEntryTitle}>{entry.title}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}