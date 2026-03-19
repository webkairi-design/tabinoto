import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useEntries } from '../hooks/useEntries'
import styles from './MapPage.module.css'

export default function MapPage() {
  const { entries } = useEntries()
  const navigate = useNavigate()
  const mapRef = useRef(null)
  const mapInstanceRef = useRef(null)

  const gpsEntries = entries.filter(e => e.gps_lat && e.gps_lng)

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
    </div>
  )
}