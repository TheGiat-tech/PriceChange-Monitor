import { createAdminClient } from '@/lib/supabase/admin'
import { fetchAndExtract } from '@/lib/monitoring/fetch'
import { normalizeText, hashValue } from '@/lib/monitoring/hash'
import { sendChangeAlert } from '@/lib/email/resend'
import { NextResponse } from 'next/server'
import pLimit from 'p-limit'

export const runtime = 'nodejs'
export const maxDuration = 300 // 5 minutes

const limit = pLimit(5) // Process 5 monitors concurrently

export async function POST(request: Request) {
  // Verify cron secret
  const authHeader = request.headers.get('authorization')
  const expectedAuth = `Bearer ${process.env.CRON_SECRET}`

  if (authHeader !== expectedAuth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createAdminClient()

  // Find monitors that are due for checking
  const now = new Date()
  const { data: monitors, error } = await supabase
    .from('monitors')
    .select('*')
    .eq('is_active', true)

  if (error) {
    console.error('Error fetching monitors:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  if (!monitors || monitors.length === 0) {
    return NextResponse.json({ message: 'No monitors to check', processed: 0 })
  }

  // Filter monitors that are due
  const dueMonitors = monitors.filter((monitor) => {
    if (!monitor.last_checked_at) {
      return true // Never checked, check now
    }
    const lastChecked = new Date(monitor.last_checked_at)
    const minutesSinceCheck = (now.getTime() - lastChecked.getTime()) / 1000 / 60
    return minutesSinceCheck >= monitor.interval_minutes
  })

  console.log(`Found ${dueMonitors.length} monitors due for checking`)

  // Process monitors with concurrency limit
  const results = await Promise.all(
    dueMonitors.map((monitor) =>
      limit(() => processMonitor(monitor, supabase))
    )
  )

  const successful = results.filter((r) => r.success).length
  const failed = results.filter((r) => !r.success).length

  return NextResponse.json({
    message: 'Cron check completed',
    processed: results.length,
    successful,
    failed,
  })
}

async function processMonitor(monitor: any, supabase: any) {
  const monitorId = monitor.id

  try {
    console.log(`Processing monitor ${monitorId}: ${monitor.url}`)

    // Fetch and extract value
    const result = await fetchAndExtract(monitor.url, monitor.selector)

    if (!result.success) {
      // Update monitor with error
      await supabase
        .from('monitors')
        .update({
          last_checked_at: new Date().toISOString(),
          last_status: 'error',
          last_error: result.error,
        })
        .eq('id', monitorId)

      console.error(`Monitor ${monitorId} error:`, result.error)
      return { success: false, monitorId, error: result.error }
    }

    // Normalize and hash the value
    const normalized = normalizeText(result.value!, monitor.value_type)
    const newHash = hashValue(normalized)

    // Check if value changed
    const hasChanged = monitor.last_hash && monitor.last_hash !== newHash

    if (hasChanged) {
      console.log(`Change detected for monitor ${monitorId}`)

      // Create event
      await supabase.from('events').insert({
        monitor_id: monitorId,
        user_id: monitor.user_id,
        old_value: monitor.last_value,
        new_value: normalized,
        old_hash: monitor.last_hash,
        new_hash: newHash,
        changed_at: new Date().toISOString(),
      })

      // Send email notification
      await sendChangeAlert({
        to: monitor.notification_email,
        url: monitor.url,
        label: monitor.label,
        oldValue: monitor.last_value,
        newValue: normalized,
        timestamp: new Date(),
      })
    }

    // Update monitor
    await supabase
      .from('monitors')
      .update({
        last_value: normalized,
        last_hash: newHash,
        last_checked_at: new Date().toISOString(),
        last_status: 'ok',
        last_error: null,
      })
      .eq('id', monitorId)

    return { success: true, monitorId, changed: hasChanged }
  } catch (error) {
    console.error(`Error processing monitor ${monitorId}:`, error)

    // Update monitor with error
    await supabase
      .from('monitors')
      .update({
        last_checked_at: new Date().toISOString(),
        last_status: 'error',
        last_error: error instanceof Error ? error.message : 'Unknown error',
      })
      .eq('id', monitorId)

    return { success: false, monitorId, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}
