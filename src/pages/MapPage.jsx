import { useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import { useEntries } from '../hooks/useEntries'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import styles from './MapPage.module.css'

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

export default function MapPage() {
  const { entries } = useEntries()
  const gpsEntries = entries.filter(e => e.gps_lat && e.gps_lng)

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>旅の地図</h1>
        <p className={styles.subtitle}>訪問した場所の記録</p>
      </div>
      <div className={styles.mapWrapper}>
        <MapContainer
          center={gpsEntries.length > 0
            ? [gpsEntries[0].gps_lat, gpsEntries[0].gps_lng]
            : [35.6762, 139.6503]}
          zoom={10}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; OpenStreetMap contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {gpsEntries.map(entry => (
            <Marker key={entry.id} position={[entry.gps_lat, entry.gps_lng]}>
              <Popup>
                <strong>{entry.title}</strong><br />
                {entry.place_name}<br />
                {entry.visited_at}
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  )
}