import { createClient } from '@/lib/supabase/server'
import { monitorSchema } from '@/lib/utils/validation'
import { canCreateMonitor, canUseInterval, getPlanViolationMessage, type Plan } from '@/lib/plan'
import { NextResponse } from 'next/server'

export const runtime = 'nodejs'

export async function GET() {
  const supabase = await createClient()
  
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    console.error('[API Monitors GET] Auth error:', authError?.message || 'No user')
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: monitors, error } = await supabase
    .from('monitors')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('[API Monitors GET] Query error:', {
      userId: user.id,
      error: error.message,
      code: error.code,
    })
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ monitors })
}

export async function POST(request: Request) {
  const supabase = await createClient()
  
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    console.error('[API Monitors POST] Auth error:', authError?.message || 'No user')
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Ensure profile exists for the user (create if it doesn't exist)
  // First, try to upsert (will create if doesn't exist, ignore if exists)
  const { error: upsertError } = await supabase
    .from('profiles')
    .upsert(
      {
        id: user.id,
        email: user.email || '',
        plan: 'free',
      },
      {
        onConflict: 'id',
        ignoreDuplicates: true,
      }
    )
  
  if (upsertError) {
    console.error('[API Monitors POST] Profile upsert error:', {
      userId: user.id,
      error: upsertError.message,
      code: upsertError.code,
    })
  }
  
  // Then fetch the profile (this will always return the profile)
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('plan')
    .eq('id', user.id)
    .single()

  if (profileError) {
    console.error('[API Monitors POST] Profile fetch error:', {
      userId: user.id,
      error: profileError.message,
      code: profileError.code,
    })
    return NextResponse.json(
      { error: 'Failed to fetch user profile' },
      { status: 500 }
    )
  }

  const plan = (profile?.plan || 'free') as Plan

  // Count active monitors
  const { count, error: countError } = await supabase
    .from('monitors')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('is_active', true)

  if (countError) {
    console.error('[API Monitors POST] Count query error:', {
      userId: user.id,
      error: countError.message,
      code: countError.code,
    })
    return NextResponse.json(
      { error: 'Failed to check monitor limits' },
      { status: 500 }
    )
  }

  if (!canCreateMonitor(plan, count || 0)) {
    return NextResponse.json(
      { error: getPlanViolationMessage(plan, 'monitor_limit') },
      { status: 403 }
    )
  }

  try {
    const body = await request.json()
    const validated = monitorSchema.parse(body)

    // Enforce interval limits based on plan
    if (!canUseInterval(plan, validated.interval_minutes)) {
      return NextResponse.json(
        { error: getPlanViolationMessage(plan, 'interval_limit') },
        { status: 403 }
      )
    }

    const { data: monitor, error } = await supabase
      .from('monitors')
      .insert({
        user_id: user.id,
        ...validated,
      })
      .select()
      .single()

    if (error) {
      console.error('[API Monitors POST] Insert error:', {
        userId: user.id,
        error: error.message,
        code: error.code,
      })
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ monitor }, { status: 201 })
  } catch (error) {
    console.error('[API Monitors POST] Request error:', {
      userId: user.id,
      error: error instanceof Error ? error.message : 'Unknown error',
    })
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}
