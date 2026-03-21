import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useEntries } from '../hooks/useEntries'
import styles from './NewEntryPage.module.css'

export default function EditEntryPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { entries, updateEntry } = useEntries()

  const entry = entries.find((e) => String(e.id) === String(id))

  const [form, setForm] = useState({
    title: '',
    place_name: '',
    visited_at: '',
    body: '',
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (entry) {
      setForm({
        title: entry.title || '',
        place_name: entry.place_name || '',
        visited_at: entry.visited_at?.slice(0, 10) || '',
        body: entry.body || '',
      })
    }
  }, [entry])

  if (!entry) return <div className={styles.page}>記録が見つかりません。</div>

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSave = async () => {
    if (!form.title || !form.place_name || !form.body) {
      setError('タイトル・訪問地・本文は必須です。')
      return
    }
    setError(null)
    setSaving(true)
    await updateEntry(entry.id, {
      title: form.title,
      place_name: form.place_name,
      visited_at: form.visited_at || entry.visited_at,
      body: form.body,
    })
    setSaving(false)
    navigate(`/diary/${entry.id}`)
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <button className={styles.back} onClick={() => navigate(`/diary/${entry.id}`)}>← 戻る</button>
        <h1 className={styles.title}>日記を編集</h1>
      </div>

      {error && <div className={styles.error}>{error}</div>}

      <div className={styles.form}>
        <section className={styles.section}>
          <label className={styles.label}>訪問地 <span className={styles.required}>必須</span></label>
          <input className={styles.input} name="place_name" value={form.place_name} onChange={handleChange} />
        </section>

        <div className={styles.row}>
          <section className={styles.section}>
            <label className={styles.label}>タイトル <span className={styles.required}>必須</span></label>
            <input className={styles.input} name="title" value={form.title} onChange={handleChange} />
          </section>
          <section className={styles.section}>
            <label className={styles.label}>訪問日</label>
            <input className={styles.input} type="date" name="visited_at" value={form.visited_at} onChange={handleChange} />
          </section>
        </div>

        <section className={styles.section}>
          <label className={styles.label}>記録 <span className={styles.required}>必須</span></label>
          <textarea className={styles.textarea} name="body" value={form.body} onChange={handleChange} />
        </section>

        <div className={styles.actions}>
          <button className={styles.cancelBtn} onClick={() => navigate(`/diary/${entry.id}`)}>キャンセル</button>
          <button className={styles.saveBtn} onClick={handleSave} disabled={saving}>
            {saving ? '保存中...' : '変更を保存'}
          </button>
        </div>
      </div>
    </div>
  )
}