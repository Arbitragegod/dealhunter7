import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    'https://etdkvsgvspefjzauhtbb.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV0ZGt2c2d2c3BlZmp6YXVodGJiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM1MDQwODMsImV4cCI6MjA4OTA4MDA4M30.K6Dbnx0IWJJTx644szuQnu_N0Ccc-2-M89Ad2e_IaU0'
  )
}
