import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://zimbrfvkffxufndmefaz.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InppbWJyZnZrZmZ4dWZuZG1lZmF6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTEyMDAwMzksImV4cCI6MjEwNjc3NjAzOX0.U6E4y5aP8uDfokdetHfmlKqwvxaXgrT940Tbzg0slPM'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
