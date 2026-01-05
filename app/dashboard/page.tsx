import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { IOSContainer, IOSCard, IOSRow, IOSBadge, TintButton, PrimaryButton } from '@/components/ios'

export default async function DashboardPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login')
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
    console.error('Error upserting profile:', upsertError)
  }
  
  // Then fetch the profile
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  // Fallback to free plan if profile doesn't exist or error occurs
  const userProfile = profile || { id: user.id, email: user.email || '', plan: 'free' as const }

  if (profileError) {
    console.error('Error fetching profile:', profileError)
  }

  const { data: monitors, error: monitorsError } = await supabase
    .from('monitors')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (monitorsError) {
    console.error('Error fetching monitors:', monitorsError)
  }

  const activeMonitorsCount = monitors?.filter(m => m.is_active).length || 0
  const maxMonitors = userProfile.plan === 'pro' ? 20 : 1

  // Get user initials for avatar
  const userInitials = user.email?.substring(0, 2).toUpperCase() || 'U'

  const handleSignOut = async () => {
    'use server'
    const supabase = await createClient()
    await supabase.auth.signOut()
    redirect('/login')
  }

  return (
    <IOSContainer>
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-1">
          <h1 className="text-[28px] font-semibold text-ios-label">PricePing</h1>
          <div className="flex items-center gap-4">
            <Link
              href="/pricing"
              className="text-ios-tint text-[15px]"
            >
              {userProfile.plan === 'pro' ? 'Pro' : 'Upgrade'}
            </Link>
            <div className="w-8 h-8 rounded-full bg-ios-separator/40 text-ios-label flex items-center justify-center text-[13px] font-medium">
              {userInitials}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Card */}
      {!monitors || monitors.length === 0 ? (
        <>
          <IOSCard className="mb-6">
            <div className="px-4 py-12 text-center">
              <p className="text-[17px] text-ios-label mb-6">No monitors yet</p>
              <Link href="/monitors/new">
                <button className="text-ios-tint text-[17px]">
                  Add monitor
                </button>
              </Link>
            </div>
          </IOSCard>
        </>
      ) : (
        <IOSCard className="mb-6">
          {/* Summary */}
          <div className="px-4 py-4">
            <div className="flex items-center justify-between">
              <span className="text-[15px] text-ios-label">{activeMonitorsCount} active</span>
              {activeMonitorsCount < maxMonitors && (
                <Link href="/monitors/new" className="text-ios-tint text-[15px]">
                  Add monitor
                </Link>
              )}
            </div>
          </div>
          
          <div className="h-px bg-ios-separator" />
          
          {/* Monitors List */}
          {monitors.map((monitor, index) => (
            <div key={monitor.id}>
              {index > 0 && <div className="h-px bg-ios-separator" />}
              <IOSRow
                label={monitor.label || monitor.url}
                secondary={`Checked ${monitor.last_checked_at ? new Date(monitor.last_checked_at).toLocaleDateString() : 'never'}`}
                badge={
                  <IOSBadge 
                    status={monitor.is_active ? (monitor.last_status as any) : 'inactive'} 
                  />
                }
                chevron
                href={`/monitors/${monitor.id}`}
              />
            </div>
          ))}
          
          {activeMonitorsCount >= maxMonitors && (
            <>
              <div className="h-px bg-ios-separator" />
              <div className="px-4 py-3">
                <p className="text-[13px] text-ios-secondary text-center">
                  Monitor limit reached. {userProfile.plan === 'free' && (
                    <Link href="/pricing" className="text-ios-tint">Upgrade</Link>
                  )}
                </p>
              </div>
            </>
          )}
        </IOSCard>
      )}

      {/* Sign Out */}
      <IOSCard className="mb-6">
        <form action={handleSignOut}>
          <button type="submit" className="w-full">
            <IOSRow label="Sign Out" className="text-red-600" />
          </button>
        </form>
      </IOSCard>

      {/* Footer */}
      <div className="mt-12 mb-6 text-center">
        <div className="flex justify-center gap-6 text-[13px] text-ios-secondary">
          <Link href="/privacy" className="hover:text-ios-label">
            Privacy
          </Link>
          <Link href="/terms" className="hover:text-ios-label">
            Terms
          </Link>
        </div>
      </div>
    </IOSContainer>
  )
}
