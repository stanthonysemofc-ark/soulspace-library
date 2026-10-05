import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export function useAbout() {
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  async function fetchMembers() {
    setLoading(true)
    setError(null)
    const { data, error } = await supabase
      .from('about_members')
      .select('*')
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: true })

    if (error) setError(error.message)
    else setMembers(data || [])
    setLoading(false)
  }

  async function addMember(memberData) {
    const { data, error } = await supabase
      .from('about_members')
      .insert([memberData])
      .select()
      .single()
    if (error) return { data: null, error: error.message }
    await fetchMembers()
    return { data, error: null }
  }

  async function updateMember(id, memberData) {
    const { data, error } = await supabase
      .from('about_members')
      .update(memberData)
      .eq('id', id)
      .select()
      .single()
    if (error) return { data: null, error: error.message }
    await fetchMembers()
    return { data, error: null }
  }

  async function deleteMember(id) {
    const { error } = await supabase
      .from('about_members')
      .delete()
      .eq('id', id)
    if (error) return { error: error.message }
    await fetchMembers()
    return { error: null }
  }

  useEffect(() => {
    fetchMembers()
  }, [])

  return { members, loading, error, fetchMembers, addMember, updateMember, deleteMember }
}
