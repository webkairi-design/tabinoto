import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useEntries } from '../hooks/useEntries'
import { useWishlist } from '../hooks/useWishlist'
import styles from './MapPage.module.css'

const REGION_MAP = {
  '北海道': '北海道',
  '青森県': '東北', '岩手県': '東北', '宮城県': '東北', '秋田県': '東北', '山形県': '東北', '福島県': '東北',
  '茨城県': '関東', '栃木県': '関東', '群馬県': '関東', '埼玉県': '関東', '千葉県': '関東', '東京都': '関東', '神奈川県': '関東',
  '新潟県': '中部', '富山県': '中部', '石川県': '中部', '福井県': '中部', '山梨県': '中部', '長野県': '中部', '岐阜県': '中部', '静岡県': '中部', '愛知県': '中部',
  '三重県': '近畿', '滋賀県': '近畿', '京都府': '近畿', '大阪府': '近畿', '兵庫県': '近畿', '奈良県': '近畿', '和歌山県': '近畿',
  '鳥取県': '中国', '島根県': '中国', '岡山県': '中国', '広島県': '中国', '山口県': '中国',
  '徳島県': '四国', '香川県': '四国', '愛媛県': '四国', '高知県': '四国',
  '福岡県': '九州・沖縄', '佐賀県': '九州・沖縄', '長崎県': '九州・沖縄', '熊本県': '九州・沖縄', '大分県': '九州・沖縄', '宮崎県': '九州・沖縄', '鹿児島県': '九州・沖縄', '沖縄県': '九州・沖縄',
}
const REGION_ORDER = ['北海道', '東北', '関東', '中部', '近畿', '中国', '四国', '九州・沖縄']

function getPrefecture(placeName) {
  const map = {
    '北海道': '北海道',
    '青森': '青森県', '岩手': '岩手県', '宮城': '宮城県', '秋田': '秋田県', '山形': '山形県', '福島': '福島県',
    '茨城': '茨城県', '栃木': '栃木県', '群馬': '群馬県', '埼玉': '埼玉県', '千葉': '千葉県', '東京': '東京都', '神奈川': '神奈川県',
    '新潟': '新潟県', '富山': '富山県', '石川': '石川県', '福井': '福井県', '山梨': '山梨県', '長野': '長野県', '岐阜': '岐阜県', '静岡': '静岡県', '愛知': '愛知県',
    '三重': '三重県', '滋賀': '滋賀県', '京都': '京都府', '大阪': '大阪府', '兵庫': '兵庫県', '奈良': '奈良県', '和歌山': '和歌山県',
    '鳥取': '鳥取県', '島根': '島根県', '岡山': '岡山県', '広島': '広島県', '山口': '山口県',
    '徳島': '徳島県', '香川': '香川県', '愛媛': '愛媛県', '高知': '高知県',
    '福岡': '福岡県', '佐賀': '佐賀県', '長崎': '長崎県', '熊本': '熊本県', '大分': '大分県', '宮崎': '宮崎県', '鹿児島': '鹿児島県', '沖縄': '沖縄県',// 市区町村名の追加マッピング
    '伊勢': '三重県', '志摩': '三重県', '鳥羽': '三重県', '松阪': '三重県',
    '宮島': '広島県', '廿日市': '広島県', '呉': '広島県', '福山': '広島県',
    '出雲': '島根県', '松江': '島根県', '浜田': '島根県', '益田': '島根県',
    '南大隅': '鹿児島県', '指宿': '鹿児島県', '霧島': '鹿児島県',
    '那覇': '沖縄県', '石垣': '沖縄県', '宮古': '沖縄県',
    '金沢': '石川県', '富士': '静岡県', '浜松': '静岡県',
    '奈良': '奈良県', '吉野': '奈良県',
    '日光': '栃木県', '草津': '群馬県',
    '長崎': '長崎県', '佐世保': '長崎県',
    '別府': '大分県', '湯布院': '大分県',
  }
  for (const [key, pref] of Object.entries(map)) {
    if (placeName?.includes(key)) return pref
  }
  return 'その他'
}

export default function MapPage() {
  const { entries } = useEntries()
  const { wishlist } = useWishlist()
  const navigate = useNavigate()
  const mapRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const markersRef = useRef({})
  const initializedRef = useRef(false)
  const [openRegion, setOpenRegion] = useState(null)
  const [openPref, setOpenPref] = useState(null)
  const [filter, setFilter] = useState('all')

  const gpsEntries = entries.filter(e => e.gps_lat && e.gps_lng)

  const regionGroups = {}
  gpsEntries.forEach(entry => {
    const pref = getPrefecture(entry.place_name)
    const region = REGION_MAP[pref] || 'その他'
    if (!regionGroups[region]) regionGroups[region] = {}
    if (!regionGroups[region][pref]) regionGroups[region][pref] = []
    regionGroups[region][pref].push(entry)
  })

  const flyTo = (entry) => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([entry.gps_lat, entry.gps_lng], 13)
      markersRef.current[entry.id]?.openPopup()
    }
  }

  const flyToWish = (wish) => {
    if (mapInstanceRef.current && wish.latitude && wish.longitude) {
      mapInstanceRef.current.flyTo([wish.latitude, wish.longitude], 13)
      markersRef.current['wish_' + wish.id]?.openPopup()
    }
  }

  // 地図初期化＋青ピン（データ読み込み後に1回だけ実行）
  useEffect(() => {
    if (initializedRef.current) return
    if (!mapRef.current) return
    if (entries.length === 0 && wishlist.length === 0) return

    initializedRef.current = true

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

      const map = L.default.map(mapRef.current).setView(center, 7)
      mapInstanceRef.current = map

      L.default.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(map)

      // 青ピン（日記）
      gpsEntries.forEach(entry => {
        const photoUrl = entry.photos?.[0]
        const popupContent = `
          <div style="text-align:center;min-width:150px;cursor:pointer" data-id="${entry.id}">
            ${photoUrl ? `<img src="${photoUrl}" style="width:150px;height:100px;object-fit:cover;border-radius:8px;margin-bottom:6px"/>` : ''}
            <div style="font-weight:bold;font-size:14px">${entry.title}</div>
            <div style="color:#666;font-size:12px">${entry.place_name}</div>
            <div style="color:#999;font-size:11px">${entry.visited_at}</div>
            <div style="color:#4a7c59;font-size:12px;margin-top:4px">▶ 日記を見る</div>
          </div>`
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

      // 黄色ピン（wishlist）
      const yellowIcon = L.default.divIcon({
        className: '',
        html: `<div style="width:28px;height:28px;background:#f39c12;border:3px solid #fff;border-radius:50% 50% 50% 0;transform:rotate(-45deg);box-shadow:0 2px 6px rgba(0,0,0,0.3)"></div>`,
        iconSize: [28, 28],
        iconAnchor: [14, 28],
        popupAnchor: [0, -28],
      })
      wishlist.forEach(wish => {
        if (!wish.latitude || !wish.longitude) return
        const popupContent = `
          <div style="min-width:150px">
            <div style="font-weight:bold;font-size:14px">⭐ ${wish.name}</div>
            ${wish.location ? `<div style="color:#666;font-size:12px">${wish.location}</div>` : ''}
            ${wish.memo ? `<div style="color:#555;font-size:12px;margin-top:4px">${wish.memo}</div>` : ''}
          </div>`
        const marker = L.default.marker([wish.latitude, wish.longitude], { icon: yellowIcon })
          .addTo(map)
          .bindPopup(popupContent)
        markersRef.current['wish_' + wish.id] = marker
      })
    })

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
        initializedRef.current = false
      }
    }
  }, [entries, wishlist])

  const sortedRegions = REGION_ORDER.filter(r => regionGroups[r])
  if (regionGroups['その他']) sortedRegions.push('その他')

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>旅の地図</h1>
        <p className={styles.subtitle}>訪問した場所の記録</p>
      </div>

      <div ref={mapRef} className={styles.mapWrapper} />

      <div className={styles.filterRow}>
        <button className={`${styles.filterBtn} ${filter === 'all' ? styles.filterActive : ''}`} onClick={() => setFilter('all')}>すべて</button>
        <button className={`${styles.filterBtn} ${filter === 'diary' ? styles.filterActive : ''}`} onClick={() => setFilter('diary')}>📔 日記</button>
        <button className={`${styles.filterBtn} ${filter === 'wishlist' ? styles.filterActive : ''}`} onClick={() => setFilter('wishlist')}>⭐ 行きたい場所</button>
      </div>

      {(filter === 'all' || filter === 'diary') && (
        <div className={styles.prefList}>
          {sortedRegions.map(region => (
            <div key={region} className={styles.regionGroup}>
              <button className={styles.regionHeader} onClick={() => setOpenRegion(openRegion === region ? null : region)}>
                <span>🗺 {region}</span>
                <span>{Object.values(regionGroups[region]).flat().length}件 {openRegion === region ? '▲' : '▼'}</span>
              </button>
              {openRegion === region && (
                <div className={styles.prefGroups}>
                  {Object.entries(regionGroups[region]).map(([pref, prefEntries]) => (
                    <div key={pref} className={styles.prefGroup}>
                      <button className={styles.prefHeader} onClick={() => setOpenPref(openPref === pref ? null : pref)}>
                        <span>📍 {pref}</span>
                        <span>{prefEntries.length}件 {openPref === pref ? '▲' : '▼'}</span>
                      </button>
                      {openPref === pref && (
                        <ul className={styles.prefEntries}>
                          {prefEntries.map(entry => (
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
              )}
            </div>
          ))}
        </div>
      )}

      {(filter === 'all' || filter === 'wishlist') && wishlist.length > 0 && (
        <div className={styles.wishlistSection}>
          <h2 className={styles.wishlistTitle}>⭐ 行きたい場所</h2>
          <div className={styles.wishlistList}>
            {wishlist.map(wish => (
              <div key={wish.id} className={styles.wishCard} onClick={() => flyToWish(wish)}>
                <span className={styles.wishName}>{wish.name}</span>
                {wish.location && <span className={styles.wishLocation}>{wish.location}</span>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}