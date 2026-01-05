import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { IOSContainer, IOSCard, IOSRow, IOSBadge, SecondaryButton } from '@/components/ios'

export default async function MonitorDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login')
  }

  const { data: monitor, error: monitorError } = await supabase
    .from('monitors')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (monitorError || !monitor) {
    console.error('Error fetching monitor:', monitorError)
    redirect('/dashboard')
  }

  const { data: events, error: eventsError } = await supabase
    .from('events')
    .select('*')
    .eq('monitor_id', id)
    .order('changed_at', { ascending: false })
    .limit(20)

  if (eventsError) {
    console.error('Error fetching events:', eventsError)
  }

  const handleDelete = async () => {
    'use server'
    const supabase = await createClient()
    const { id } = await params
    
    try {
      const { error } = await supabase.from('monitors').delete().eq('id', id)
      if (error) {
        console.error('Error deleting monitor:', error)
      }
    } catch (err) {
      console.error('Exception deleting monitor:', err)
    }
    
    redirect('/dashboard')
  }

  const handleToggleActive = async () => {
    'use server'
    const supabase = await createClient()
    const { id } = await params
    
    try {
      const { data: currentMonitor, error: fetchError } = await supabase
        .from('monitors')
        .select('is_active')
        .eq('id', id)
        .single()

      if (fetchError || !currentMonitor) {
        console.error('Error fetching monitor for toggle:', fetchError)
        redirect(`/monitors/${id}`)
      }

      const { error: updateError } = await supabase
        .from('monitors')
        .update({ is_active: !currentMonitor.is_active })
        .eq('id', id)
      
      if (updateError) {
        console.error('Error updating monitor:', updateError)
      }
    } catch (err) {
      console.error('Exception toggling monitor:', err)
    }
    
    redirect(`/monitors/${id}`)
  }

  return (
    <IOSContainer>
      <div className="mb-6">
        <Link href="/dashboard" className="text-ios-tint text-[15px]">
          ← Back
        </Link>
        <div className="flex items-center justify-between mt-2">
          <h1 className="text-[28px] font-semibold text-ios-label">
            {monitor.label || 'Monitor'}
          </h1>
          <IOSBadge status={monitor.is_active ? (monitor.last_status as any) : 'inactive'} />
        </div>
      </div>

      {/* Monitor Info */}
      <IOSCard className="mb-6">
        <IOSRow label="URL" value={monitor.url.substring(0, 30) + '...'} />
        <div className="h-px bg-ios-separator" />
        <IOSRow label="Selector" value={monitor.selector} />
        <div className="h-px bg-ios-separator" />
        <IOSRow 
          label="Interval" 
          value={
            monitor.interval_minutes === 60 ? 'Hourly' :
            monitor.interval_minutes === 240 ? 'Every 4h' : 'Daily'
          } 
        />
        <div className="h-px bg-ios-separator" />
        <IOSRow label="Email" value={monitor.notification_email} />
        <div className="h-px bg-ios-separator" />
        <IOSRow 
          label="Last Check" 
          value={monitor.last_checked_at 
            ? new Date(monitor.last_checked_at).toLocaleDateString() 
            : 'Never'
          } 
        />
        <div className="h-px bg-ios-separator" />
        <IOSRow 
          label="Last Value" 
          value={monitor.last_value ? monitor.last_value.substring(0, 20) : 'None'} 
        />
        {monitor.last_error && (
          <>
            <div className="h-px bg-ios-separator" />
            <div className="px-4 py-3">
              <div className="text-[13px] text-ios-secondary mb-1">Last Error</div>
              <div className="text-xs text-red-600">{monitor.last_error}</div>
            </div>
          </>
        )}
      </IOSCard>

      {/* Actions */}
      <IOSCard className="mb-6">
        <form action={handleToggleActive}>
          <button type="submit" className="w-full">
            <IOSRow 
              label={monitor.is_active ? 'Pause' : 'Activate'} 
              className={monitor.is_active ? 'text-yellow-600' : 'text-green-600'}
            />
          </button>
        </form>
        <div className="h-px bg-ios-separator" />
        <form action={handleDelete}>
          <button 
            type="submit" 
            className="w-full"
            onClick={(e) => {
              if (!confirm('Delete this monitor?')) {
                e.preventDefault()
              }
            }}
          >
            <IOSRow label="Delete" className="text-red-600" />
          </button>
        </form>
      </IOSCard>

      {/* Change History */}
      {events && events.length > 0 ? (
        <IOSCard className="mb-6">
          {events.map((event, index) => (
            <div key={event.id}>
              {index > 0 && <div className="h-px bg-ios-separator" />}
              <div className="px-4 py-3">
                <div className="text-xs text-ios-secondary mb-2">
                  {new Date(event.changed_at).toLocaleString()}
                </div>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <div className="text-ios-secondary mb-1">Old</div>
                    <div className="bg-red-50 p-2 rounded text-red-800 break-all">
                      {event.old_value}
                    </div>
                  </div>
                  <div>
                    <div className="text-ios-secondary mb-1">New</div>
                    <div className="bg-green-50 p-2 rounded text-green-800 break-all">
                      {event.new_value}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </IOSCard>
      ) : (
        <IOSCard className="mb-6">
          <div className="px-4 py-12 text-center">
            <p className="text-ios-secondary text-[15px]">No changes yet</p>
          </div>
        </IOSCard>
      )}
    </IOSContainer>
  )
}
