import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()
  return createServerClient(
    'https://etdkvsgvspefjzauhtbb.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV0ZGt2c2d2c3BlZmp6YXVodGJiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM1MDQwODMsImV4cCI6MjA4OTA4MDA4M30.K6Dbnx0IWJJTx644szuQnu_N0Ccc-2-M89Ad2e_IaU0',
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          try { cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options)) } catch {}
        },
      },
    }
  )
}
