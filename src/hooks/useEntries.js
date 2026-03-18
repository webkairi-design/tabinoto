import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export function useEntries() {
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchEntries = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const { data, error } = await supabase
        .from('entries')
        .select('*')
        .order('visited_at', { ascending: false })

      if (error) throw error
      setEntries(data || [])
    } catch (err) {
      setError(err.message)
      const local = localStorage.getItem('tabinoto_entries')
      if (local) setEntries(JSON.parse(local))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchEntries()
  }, [fetchEntries])

  const addEntry = useCallback(async (entry) => {
    try {
      const { data, error } = await supabase
        .from('entries')
        .insert([entry])
        .select()
        .single()

      if (error) throw error
      setEntries((prev) => [data, ...prev])
      return { data, error: null }
    } catch (err) {
      const newEntry = { ...entry, id: Date.now().toString(), created_at: new Date().toISOString() }
      const updated = [newEntry, ...entries]
      setEntries(updated)
      localStorage.setItem('tabinoto_entries', JSON.stringify(updated))
      return { data: newEntry, error: null }
    }
  }, [entries])

  const deleteEntry = useCallback(async (id) => {
    try {
      const { error } = await supabase.from('entries').delete().eq('id', id)
      if (error) throw error
    } catch {
    } finally {
      const updated = entries.filter((e) => e.id !== id)
      setEntries(updated)
      localStorage.setItem('tabinoto_entries', JSON.stringify(updated))
    }
  }, [entries])

  const updateEntry = useCallback(async (id, updates) => {
    try {
      const { data, error } = await supabase
        .from('entries')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      setEntries((prev) => prev.map((e) => (e.id === id ? data : e)))
      return { data, error: null }
    } catch (err) {
      const updated = entries.map((e) => (e.id === id ? { ...e, ...updates } : e))
      setEntries(updated)
      localStorage.setItem('tabinoto_entries', JSON.stringify(updated))
      return { data: { ...entries.find((e) => e.id === id), ...updates }, error: null }
    }
  }, [entries])

  return { entries, loading, error, addEntry, deleteEntry, updateEntry, refetch: fetchEntries }
}