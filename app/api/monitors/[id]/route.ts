import { createClient } from '@/lib/supabase/server'
import { canCreateMonitor, canUseInterval, getPlanViolationMessage, type Plan } from '@/lib/plan'
import { NextResponse } from 'next/server'

export const runtime = 'nodejs'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()
  
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    console.error('[API Monitor GET] Auth error:', authError?.message || 'No user')
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: monitor, error } = await supabase
    .from('monitors')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (error) {
    console.error('[API Monitor GET] Query error:', {
      userId: user.id,
      monitorId: id,
      error: error.message,
      code: error.code,
    })
    return NextResponse.json({ error: 'Monitor not found' }, { status: 404 })
  }

  if (!monitor) {
    return NextResponse.json({ error: 'Monitor not found' }, { status: 404 })
  }

  return NextResponse.json({ monitor })
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()
  
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    console.error('[API Monitor PATCH] Auth error:', authError?.message || 'No user')
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()

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
      console.error('[API Monitor PATCH] Profile upsert error:', {
        userId: user.id,
        monitorId: id,
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
      console.error('[API Monitor PATCH] Profile fetch error:', {
        userId: user.id,
        monitorId: id,
        error: profileError.message,
        code: profileError.code,
      })
      return NextResponse.json(
        { error: 'Failed to fetch user profile' },
        { status: 500 }
      )
    }

    const plan = (profile?.plan || 'free') as Plan

    // Get existing monitor to check current state
    const { data: existingMonitor, error: monitorError } = await supabase
      .from('monitors')
      .select('is_active')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (monitorError) {
      console.error('[API Monitor PATCH] Monitor fetch error:', {
        userId: user.id,
        monitorId: id,
        error: monitorError.message,
        code: monitorError.code,
      })
      return NextResponse.json({ error: 'Monitor not found' }, { status: 404 })
    }

    if (!existingMonitor) {
      return NextResponse.json({ error: 'Monitor not found' }, { status: 404 })
    }

    // If activating a monitor, check plan limits
    if (body.is_active === true && !existingMonitor.is_active) {
      const { count, error: countError } = await supabase
        .from('monitors')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('is_active', true)

      if (countError) {
        console.error('[API Monitor PATCH] Count query error:', {
          userId: user.id,
          monitorId: id,
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
    }

    // If updating interval, check plan limits
    if (body.interval_minutes !== undefined) {
      if (!canUseInterval(plan, body.interval_minutes)) {
        return NextResponse.json(
          { error: getPlanViolationMessage(plan, 'interval_limit') },
          { status: 403 }
        )
      }
    }

    const { data: monitor, error } = await supabase
      .from('monitors')
      .update(body)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      console.error('[API Monitor PATCH] Update error:', {
        userId: user.id,
        monitorId: id,
        error: error.message,
        code: error.code,
      })
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ monitor })
  } catch (error) {
    console.error('[API Monitor PATCH] Request error:', {
      userId: user.id,
      monitorId: id,
      error: error instanceof Error ? error.message : 'Unknown error',
    })
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()
  
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    console.error('[API Monitor DELETE] Auth error:', authError?.message || 'No user')
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { error } = await supabase
    .from('monitors')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    console.error('[API Monitor DELETE] Delete error:', {
      userId: user.id,
      monitorId: id,
      error: error.message,
      code: error.code,
    })
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
