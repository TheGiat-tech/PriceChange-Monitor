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

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  const { data: monitors } = await supabase
    .from('monitors')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const activeMonitorsCount = monitors?.filter(m => m.is_active).length || 0
  const maxMonitors = profile?.plan === 'pro' ? 20 : 1

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
      <div className="mb-6">
        <div className="flex justify-between items-center mb-1">
          <h1 className="text-[28px] font-semibold text-ios-label">PricePing</h1>
          <div className="flex items-center gap-3">
            <Link
              href="/pricing"
              className="text-ios-tint text-sm font-medium"
            >
              {profile?.plan === 'pro' ? 'Pro' : 'Upgrade'}
            </Link>
            <div className="w-9 h-9 rounded-full bg-ios-tint text-white flex items-center justify-center text-sm font-semibold">
              {userInitials}
            </div>
          </div>
        </div>
        <div className="h-px bg-ios-separator" />
      </div>

      {/* Welcome Card */}
      <IOSCard className="mb-4">
        <div className="p-6">
          <h2 className="text-[18px] font-semibold text-ios-label mb-2">
            Welcome back{user.email ? `, ${user.email.split('@')[0]}` : ''}
          </h2>
          <p className="text-[14px] text-ios-secondary mb-4">
            You have {activeMonitorsCount} active monitor{activeMonitorsCount !== 1 ? 's' : ''}
          </p>
          <Link href="/monitors/new">
            <TintButton disabled={activeMonitorsCount >= maxMonitors}>
              + Add Monitor
            </TintButton>
          </Link>
          {activeMonitorsCount >= maxMonitors && (
            <p className="text-xs text-ios-secondary mt-2 text-center">
              You&apos;ve reached your limit. {profile?.plan === 'free' && (
                <Link href="/pricing" className="text-ios-tint">Upgrade to Pro</Link>
              )}
            </p>
          )}
        </div>
      </IOSCard>

      {/* Active Monitors */}
      {!monitors || monitors.length === 0 ? (
        <IOSCard className="mb-4">
          <div className="p-8 text-center">
            <div className="text-5xl mb-4">📊</div>
            <h3 className="text-[18px] font-semibold text-ios-label mb-2">No monitors yet</h3>
            <p className="text-[14px] text-ios-secondary mb-6">
              Create your first monitor to start tracking changes
            </p>
          </div>
        </IOSCard>
      ) : (
        <IOSCard title="ACTIVE MONITORS" className="mb-4">
          {monitors.map((monitor, index) => (
            <div key={monitor.id}>
              {index > 0 && <div className="h-px bg-ios-separator mx-4" />}
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
        </IOSCard>
      )}

      {/* Try Example Monitor Card */}
      {(!monitors || monitors.length === 0) && (
        <IOSCard className="mb-4">
          <div className="p-6">
            <h3 className="text-[18px] font-semibold text-ios-label mb-2">
              Try an Example Monitor
            </h3>
            <p className="text-[14px] text-ios-secondary mb-4">
              Monitor example.com and set alerts for price changes
            </p>
            <Link href="/monitors/new">
              <PrimaryButton>Create from Example</PrimaryButton>
            </Link>
          </div>
        </IOSCard>
      )}

      {/* Sign Out */}
      <IOSCard className="mb-4">
        <form action={handleSignOut}>
          <button type="submit" className="w-full">
            <IOSRow label="Sign Out" className="text-red-600" />
          </button>
        </form>
      </IOSCard>

      {/* Footer */}
      <div className="mt-8 mb-4 text-center space-y-2">
        <div className="flex justify-center gap-4 text-xs text-ios-secondary">
          <Link href="/privacy" className="hover:text-ios-label">
            Privacy
          </Link>
          <Link href="/terms" className="hover:text-ios-label">
            Terms
          </Link>
          <Link href="/pricing" className="hover:text-ios-label">
            Pricing
          </Link>
        </div>
      </div>
    </IOSContainer>
  )
}
