import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Dashboard from './Dashboard'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
  const { data: log } = await supabase.from('outreach_log').select('*').eq('user_id', user.id).order('sent_at', { ascending: false }).limit(50)
  return <Dashboard user={user} profile={profile} log={log || []} />
}
