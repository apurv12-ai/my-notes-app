import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://pualchdvhrawfncaogdy.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB1YWxjaGR2aHJhd2ZuY2FvZ2R5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA3MjQyODUsImV4cCI6MjA5NjMwMDI4NX0.JQHt6o6eDNaGOY7LrWy5rdKQAoP19oW0QMdsrUScif0'

export const supabase = createClient(supabaseUrl, supabaseKey)