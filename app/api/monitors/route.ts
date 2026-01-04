import { createClient } from '@/lib/supabase/server'
import { monitorSchema } from '@/lib/utils/validation'
import { NextResponse } from 'next/server'

export const runtime = 'nodejs'

export async function GET() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: monitors, error } = await supabase
    .from('monitors')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ monitors })
}

export async function POST(request: Request) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Get user's profile to check plan
  const { data: profile } = await supabase
    .from('profiles')
    .select('plan')
    .eq('id', user.id)
    .single()

  // Count active monitors
  const { count } = await supabase
    .from('monitors')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('is_active', true)

  const maxMonitors = profile?.plan === 'pro' ? 20 : 1

  if ((count || 0) >= maxMonitors) {
    return NextResponse.json(
      { error: `You have reached your monitor limit (${maxMonitors}). Upgrade to add more.` },
      { status: 403 }
    )
  }

  try {
    const body = await request.json()
    const validated = monitorSchema.parse(body)

    const { data: monitor, error } = await supabase
      .from('monitors')
      .insert({
        user_id: user.id,
        ...validated,
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ monitor }, { status: 201 })
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}
