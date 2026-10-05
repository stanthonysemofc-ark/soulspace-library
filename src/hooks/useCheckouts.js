import { useState } from 'react'
import { supabase } from '../lib/supabase'

export function useCheckouts() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  async function checkoutBook({ bookId, borrowerName, grade, notes = '' }) {
    setLoading(true)
    setError(null)
    const dueDate = new Date()
    dueDate.setDate(dueDate.getDate() + 14) // 2 weeks

    const { data, error } = await supabase.from('checkouts').insert([{
      book_id: bookId,
      borrower_name: borrowerName,
      grade: grade || null,
      due_date: dueDate.toISOString().split('T')[0],
      notes,
    }]).select().single()

    setLoading(false)
    if (error) { setError(error.message); return { data: null, error: error.message } }
    return { data, error: null }
  }

  async function returnBook(checkoutId) {
    setLoading(true)
    setError(null)
    const { data, error } = await supabase
      .from('checkouts')
      .update({ returned_at: new Date().toISOString() })
      .eq('id', checkoutId)
      .select()
      .single()

    setLoading(false)
    if (error) { setError(error.message); return { data: null, error: error.message } }
    return { data, error: null }
  }

  async function fetchActiveCheckouts() {
    setLoading(true)
    const { data, error } = await supabase
      .from('checkouts')
      .select(`*, books(title, author)`)
      .is('returned_at', null)
      .order('due_date')
    setLoading(false)
    if (error) return { data: [], error: error.message }
    return { data: data || [], error: null }
  }

  async function fetchOverdueCheckouts() {
    const today = new Date().toISOString().split('T')[0]
    const { data, error } = await supabase
      .from('checkouts')
      .select(`*, books(title, author)`)
      .is('returned_at', null)
      .lt('due_date', today)
      .order('due_date')
    if (error) return { data: [], error: error.message }
    return { data: data || [], error: null }
  }

  async function fetchStats() {
    const [totalRes, outRes, overdueRes] = await Promise.all([
      supabase.from('books').select('id', { count: 'exact', head: true }),
      supabase.from('checkouts').select('id', { count: 'exact', head: true }).is('returned_at', null),
      supabase.from('checkouts').select('id', { count: 'exact', head: true })
        .is('returned_at', null)
        .lt('due_date', new Date().toISOString().split('T')[0]),
    ])
    return {
      total: totalRes.count || 0,
      out: outRes.count || 0,
      overdue: overdueRes.count || 0,
    }
  }

  async function exportBorrowedCSV() {
    const { data } = await supabase
      .from('checkouts')
      .select(`*, books(title, author)`)
      .is('returned_at', null)
      .order('due_date')

    if (!data || data.length === 0) return

    const rows = [
      ['Book Title', 'Author', 'Borrower', 'Checked Out', 'Due Date'],
      ...data.map(c => [
        c.books?.title || '',
        c.books?.author || '',
        c.borrower_name,
        new Date(c.checked_out_at).toLocaleDateString(),
        c.due_date,
      ])
    ]
    const csv = rows.map(r => r.map(v => `"${v}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `borrowed-books-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  async function fetchAllCheckoutsHistory() {
    setLoading(true)
    const { data, error } = await supabase
      .from('checkouts')
      .select(`*, books(id, title, author, category, cover_url)`)
      .order('checked_out_at', { ascending: false })
    setLoading(false)
    if (error) return { data: [], error: error.message }
    return { data: data || [], error: null }
  }

  async function exportAllHistoryCSV(records) {
    const list = records || []
    if (list.length === 0) return

    const rows = [
      ['Book Title', 'Author', 'Borrower Name', 'Grade', 'Status', 'Checked Out Date', 'Due Date', 'Returned Date', 'Notes'],
      ...list.map(c => {
        const isOverdue = !c.returned_at && c.due_date < new Date().toISOString().split('T')[0]
        const status = c.returned_at ? 'Returned' : isOverdue ? 'Overdue' : 'Active'
        return [
          c.books?.title || '',
          c.books?.author || '',
          c.borrower_name || '',
          c.grade || '',
          status,
          c.checked_out_at ? new Date(c.checked_out_at).toLocaleDateString() : '',
          c.due_date || '',
          c.returned_at ? new Date(c.returned_at).toLocaleDateString() : 'N/A',
          c.notes || '',
        ]
      })
    ]
    const csv = rows.map(r => r.map(v => `"${(v || '').toString().replace(/"/g, '""')}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `checkout-history-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return {
    loading,
    error,
    checkoutBook,
    returnBook,
    fetchActiveCheckouts,
    fetchOverdueCheckouts,
    fetchAllCheckoutsHistory,
    fetchStats,
    exportBorrowedCSV,
    exportAllHistoryCSV
  }
}
