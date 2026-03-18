import { useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'

async function readGPS(file) {
  try {
    const exifr = await import('exifr')
    const gps = await exifr.gps(file)
    if (gps && gps.latitude && gps.longitude) {
      return { lat: gps.latitude, lng: gps.longitude }
    }
  } catch {
  }
  return null
}

async function reverseGeocode(lat, lng) {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=ja`,
      { headers: { 'User-Agent': 'Tabinoto/1.0' } }
    )
    const data = await res.json()
    const addr = data.address || {}
    return (
      addr.city ||
      addr.town ||
      addr.village ||
      addr.suburb ||
      addr.county ||
      addr.state ||
      data.display_name?.split(',')[0] ||
      null
    )
  } catch {
    return null
  }
}

export function usePhotoUpload() {
  const [uploading, setUploading] = useState(false)

  const processPhoto = useCallback(async (file) => {
    const gps = await readGPS(file)
    let placeName = null
    if (gps) {
      placeName = await reverseGeocode(gps.lat, gps.lng)
    }

    const previewUrl = URL.createObjectURL(file)

    setUploading(true)
    let publicUrl = previewUrl
    try {
      const ext = file.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

      const { data, error } = await supabase.storage
        .from('photos')
        .upload(fileName, file, { contentType: file.type })

      if (!error && data) {
        const { data: urlData } = supabase.storage.from('photos').getPublicUrl(data.path)
        publicUrl = urlData.publicUrl
      }
    } catch {
      publicUrl = await fileToBase64(file)
    } finally {
      setUploading(false)
    }

    return { url: publicUrl, previewUrl, gps, placeName }
  }, [])

  return { processPhoto, uploading }
}

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}