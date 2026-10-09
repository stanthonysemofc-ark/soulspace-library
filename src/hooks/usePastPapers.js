import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export function usePastPapers() {
  const [papers, setPapers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchPapers = async () => {
    try {
      setLoading(true)
      setError(null)
      const { data, error: err } = await supabase
        .from('past_papers')
        .select('*')
        .order('grade', { ascending: true })
        .order('year', { ascending: false })

      if (err) throw err
      setPapers(data || [])
    } catch (err) {
      console.error('Error loading past papers:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPapers()
  }, [])

  const incrementDownload = async (id) => {
    try {
      const paper = papers.find(p => p.id === id)
      if (!paper) return
      const updatedCount = (paper.download_count || 0) + 1
      setPapers(prev => prev.map(p => p.id === id ? { ...p, download_count: updatedCount } : p))
      await supabase
        .from('past_papers')
        .update({ download_count: updatedCount })
        .eq('id', id)
    } catch (e) {
      console.error('Error updating download count:', e)
    }
  }

  const addPaper = async (newPaper) => {
    try {
      const { data, error: err } = await supabase
        .from('past_papers')
        .insert([newPaper])
        .select()

      if (err) throw err
      setPapers(prev => [data[0], ...prev])
      return { success: true }
    } catch (err) {
      console.error('Error adding past paper:', err)
      return { success: false, error: err.message }
    }
  }

  const deletePaper = async (id) => {
    try {
      const { error: err } = await supabase
        .from('past_papers')
        .delete()
        .eq('id', id)

      if (err) throw err
      setPapers(prev => prev.filter(p => p.id !== id))
      return { success: true }
    } catch (err) {
      console.error('Error deleting past paper:', err)
      return { success: false, error: err.message }
    }
  }

  return { papers, loading, error, refetch: fetchPapers, incrementDownload, addPaper, deletePaper }
}
