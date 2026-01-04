import { createClient } from '@/lib/supabase/server'
import { monitorSchema } from '@/lib/utils/validation'
import { canCreateMonitor, canUseInterval, getPlanViolationMessage, type Plan } from '@/lib/plan'
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

  // Ensure profile exists for the user (create if it doesn't exist)
  const { data: profile } = await supabase
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
    .select('plan')
    .single()

  const plan = (profile?.plan || 'free') as Plan

  // Count active monitors
  const { count } = await supabase
    .from('monitors')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('is_active', true)

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
