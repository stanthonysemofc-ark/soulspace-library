import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export function useBooks() {
  const [books, setBooks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  async function fetchBooks(search = '', category = '') {
    setLoading(true)
    setError(null)
    let query = supabase
      .from('books')
      .select(`
        *,
        checkouts(id, borrower_name, checked_out_at, due_date, returned_at)
      `)
      .order('title')

    if (search) {
      query = query.or(`title.ilike.%${search}%,author.ilike.%${search}%,category.ilike.%${search}%`)
    }
    if (category) {
      query = query.eq('category', category)
    }

    const { data, error } = await query
    if (error) setError(error.message)
    else setBooks(data || [])
    setLoading(false)
  }

  async function fetchBookById(id) {
    const { data, error } = await supabase
      .from('books')
      .select(`*, checkouts(*, id, borrower_name, checked_out_at, due_date, returned_at, notes)`)
      .eq('id', id)
      .single()
    if (error) return { data: null, error: error.message }
    return { data, error: null }
  }

  async function addBook(bookData) {
    const { data, error } = await supabase.from('books').insert([bookData]).select().single()
    if (error) return { data: null, error: error.message }
    return { data, error: null }
  }

  async function updateBook(id, bookData) {
    const { data, error } = await supabase.from('books').update(bookData).eq('id', id).select().single()
    if (error) return { data: null, error: error.message }
    return { data, error: null }
  }

  async function deleteBook(id) {
    const { error } = await supabase.from('books').delete().eq('id', id)
    if (error) return { error: error.message }
    return { error: null }
  }

  async function fetchCategories() {
    const { data, error } = await supabase.from('books').select('category').neq('category', null).neq('category', '')
    if (error) return []
    const unique = [...new Set(data.map(d => d.category))].sort()
    return unique
  }

  useEffect(() => {
    fetchBooks()
  }, [])

  return { books, loading, error, fetchBooks, fetchBookById, addBook, updateBook, deleteBook, fetchCategories }
}
