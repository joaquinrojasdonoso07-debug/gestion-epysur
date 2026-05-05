import { createClient } from '@supabase/supabase-js'

// URL corregida sin /rest/v1/ al final
const supabaseUrl = 'https://euddjafblrunkwzzrymk.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV1ZGRqYWZibHJ1bmt3enpyeW1rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc4NDM0MzQsImV4cCI6MjA5MzQxOTQzNH0.VVLiJCr3B8pH1jzV_-0fJt9S7Eu5FtOHhrRSJ2QgrJc'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
