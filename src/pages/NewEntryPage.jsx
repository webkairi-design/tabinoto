import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useEntries } from '../hooks/useEntries'
import { usePhotoUpload } from '../hooks/usePhotoUpload'
import { summarizeDiary } from '../lib/claude'
import styles from './NewEntryPage.module.css'

export default function NewEntryPage() {
  const navigate = useNavigate()
  const { addEntry } = useEntries()
  const { processPhoto, uploading } = usePhotoUpload()
  const fileInputRef = useRef(null)

  const [form, setForm] = useState({
    title: '',
    place_name: '',
    visited_at: new Date().toISOString().slice(0, 10),
    body: '',
  })
  const [photos, setPhotos] = useState([])
  const [saving, setSaving] = useState(false)
  const [aiLoading, setAiLoading] = useState(false)
  const [gpsHint, setGpsHint] = useState(null)
  const [error, setError] = useState(null)

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleFiles = async (e) => {
    const files = Array.from(e.target.files)
    for (const file of files) {
      const result = await processPhoto(file)
      setPhotos((prev) => [...prev, result])
      if (result.placeName && !form.place_name) {
        setGpsHint(result.placeName)
      }
    }
  }

  const applyGpsHint = () => {
    setForm((prev) => ({ ...prev, place_name: gpsHint }))
    setGpsHint(null)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    const files = Array.from(e.dataTransfer.files).filter((f) => f.type.startsWith('image/'))
    if (files.length) {
      const dt = new DataTransfer()
      files.forEach((f) => dt.items.add(f))
      fileInputRef.current.files = dt.files
      handleFiles({ target: fileInputRef.current })
    }
  }

  const removePhoto = (index) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSave = async () => {
    if (!form.title || !form.place_name || !form.body) {
      setError('タイトル・訪問地・本文は必須です。')
      return
    }
    setError(null)
    setSaving(true)

    let ai_summary = null
    let tags = []
    setAiLoading(true)
    try {
      const result = await summarizeDiary(form.body, form.place_name)
      ai_summary = result.summary
      tags = result.tags
    } catch {
    } finally {
      setAiLoading(false)
    }

    const gps = photos.find((p) => p.gps)?.gps || null

    const entry = {
      ...form,
      photos: photos.map((p) => p.url),
      gps_lat: gps?.lat || null,
      gps_lng: gps?.lng || null,
      ai_summary,
      tags,
    }

    const { data } = await addEntry(entry)
    setSaving(false)
    navigate(`/diary/${data.id}`)
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <button className={styles.back} onClick={() => navigate('/diary')}>← 戻る</button>
        <h1 className={styles.title}>新しい記録</h1>
      </div>

      {error && <div className={styles.error}>{error}</div>}

      <div className={styles.form}>
        <section className={styles.section}>
          <label className={styles.label}>訪問地 <span className={styles.required}>必須</span></label>
          <input
            className={styles.input}
            name="place_name"
            value={form.place_name}
            onChange={handleChange}
            placeholder="例：広島平和記念公園"
          />
          {gpsHint && (
            <div className={styles.gpsHint}>
              📍 GPS情報から「{gpsHint}」が検出されました。
              <button className={styles.gpsApply} onClick={applyGpsHint}>使用する</button>
            </div>
          )}
        </section>

        <div className={styles.row}>
          <section className={styles.section}>
            <label className={styles.label}>タイトル <span className={styles.required}>必須</span></label>
            <input
              className={styles.input}
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="今日の旅を一言で"
            />
          </section>
          <section className={styles.section}>
            <label className={styles.label}>訪問日</label>
            <input
              className={styles.input}
              type="date"
              name="visited_at"
              value={form.visited_at}
              onChange={handleChange}
            />
          </section>
        </div>

        <section className={styles.section}>
          <label className={styles.label}>記録 <span className={styles.required}>必須</span></label>
          <textarea
            className={styles.textarea}
            name="body"
            value={form.body}
            onChange={handleChange}
            placeholder="旅の記録を自由に書いてください。保存時にAIが自動で要約・タグ付けします。"
          />
          {aiLoading && <p className={styles.aiNote}>✦ AIが要約・タグを生成中...</p>}
        </section>

        <section className={styles.section}>
          <label className={styles.label}>写真</label>
          <div
            className={styles.dropzone}
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            onClick={() => fileInputRef.current.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              onChange={handleFiles}
              style={{ display: 'none' }}
            />
            {uploading ? (
              <span>アップロード中...</span>
            ) : (
              <span>写真をドロップ、またはクリックして選択<br /><small>GPS情報が含まれる写真は自動で場所を取得します</small></span>
            )}
          </div>

          {photos.length > 0 && (
            <div className={styles.photoGrid}>
              {photos.map((photo, i) => (
                <div key={i} className={styles.photoItem}>
                  <img src={photo.previewUrl || photo.url} alt="" />
                  {photo.gps && (
                    <span className={styles.gpsBadge}>📍</span>
                  )}
                  <button className={styles.removePhoto} onClick={() => removePhoto(i)}>✕</button>
                </div>
              ))}
            </div>
          )}
        </section>

        <div className={styles.actions}>
          <button className={styles.cancelBtn} onClick={() => navigate('/diary')}>キャンセル</button>
          <button className={styles.saveBtn} onClick={handleSave} disabled={saving}>
            {saving ? '保存中...' : '記録を保存'}
          </button>
        </div>
      </div>
    </div>
  )
}