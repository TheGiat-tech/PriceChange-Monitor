import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

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

  const handleSignOut = async () => {
    'use server'
    const supabase = await createClient()
    await supabase.auth.signOut()
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">PricePing</h1>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Plan: <span className="font-semibold capitalize">{profile?.plan || 'free'}</span>
              </span>
              {profile?.plan !== 'pro' && (
                <Link
                  href="/pricing"
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm"
                >
                  Upgrade
                </Link>
              )}
              <form action={handleSignOut}>
                <button
                  type="submit"
                  className="text-gray-600 hover:text-gray-900 text-sm"
                >
                  Sign Out
                </button>
              </form>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Stats */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Your Monitors</h2>
              <p className="text-gray-600 mt-1">
                {activeMonitorsCount} / {maxMonitors} active monitors
              </p>
            </div>
            <Link
              href="/monitors/new"
              className={`px-6 py-3 rounded-lg font-semibold ${
                activeMonitorsCount >= maxMonitors
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              Add Monitor
            </Link>
          </div>
          {activeMonitorsCount >= maxMonitors && (
            <p className="text-sm text-red-600 mt-2">
              You&apos;ve reached your monitor limit. {profile?.plan === 'free' && (
                <Link href="/pricing" className="underline">Upgrade to Pro</Link>
              )} to add more.
            </p>
          )}
        </div>

        {/* Monitors List */}
        {!monitors || monitors.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <div className="text-6xl mb-4">📊</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No monitors yet</h3>
            <p className="text-gray-600 mb-6">
              Create your first monitor to start tracking price and content changes
            </p>
            <Link
              href="/monitors/new"
              className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
            >
              Create Your First Monitor
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Monitor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Interval
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Check
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {monitors.map((monitor) => (
                  <tr key={monitor.id}>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {monitor.label || monitor.url}
                      </div>
                      <div className="text-sm text-gray-500 truncate max-w-md">
                        {monitor.url}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {monitor.interval_minutes === 60 && 'Hourly'}
                      {monitor.interval_minutes === 240 && 'Every 4 hours'}
                      {monitor.interval_minutes === 1440 && 'Daily'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {monitor.last_checked_at
                        ? new Date(monitor.last_checked_at).toLocaleString()
                        : 'Never'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          monitor.last_status === 'ok'
                            ? 'bg-green-100 text-green-800'
                            : monitor.last_status === 'error'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {monitor.is_active ? monitor.last_status : 'inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <Link
                        href={`/monitors/${monitor.id}`}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        View Details
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  )
}
