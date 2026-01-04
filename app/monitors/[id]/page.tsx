import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

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

  const { data: monitor } = await supabase
    .from('monitors')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!monitor) {
    redirect('/dashboard')
  }

  const { data: events } = await supabase
    .from('events')
    .select('*')
    .eq('monitor_id', id)
    .order('changed_at', { ascending: false })
    .limit(20)

  const handleDelete = async () => {
    'use server'
    const supabase = await createClient()
    const { id } = await params
    await supabase.from('monitors').delete().eq('id', id)
    redirect('/dashboard')
  }

  const handleToggleActive = async () => {
    'use server'
    const supabase = await createClient()
    const { id } = await params
    
    const { data: currentMonitor } = await supabase
      .from('monitors')
      .select('is_active')
      .eq('id', id)
      .single()

    await supabase
      .from('monitors')
      .update({ is_active: !currentMonitor?.is_active })
      .eq('id', id)
    
    redirect(`/monitors/${id}`)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center">
            <Link href="/dashboard" className="text-blue-600 hover:text-blue-700 mr-4">
              ← Back to Dashboard
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">Monitor Details</h1>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Monitor Info */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex justify-between items-start mb-6">
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                {monitor.label || 'Untitled Monitor'}
              </h2>
              <p className="text-gray-600 break-all">{monitor.url}</p>
            </div>
            <div className="flex space-x-2">
              <form action={handleToggleActive}>
                <button
                  type="submit"
                  className={`px-4 py-2 rounded-lg text-sm font-medium ${
                    monitor.is_active
                      ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                      : 'bg-green-100 text-green-800 hover:bg-green-200'
                  }`}
                >
                  {monitor.is_active ? 'Pause' : 'Activate'}
                </button>
              </form>
              <form action={handleDelete}>
                <button
                  type="submit"
                  className="px-4 py-2 bg-red-100 text-red-800 rounded-lg hover:bg-red-200 text-sm font-medium"
                  onClick={(e) => {
                    if (!confirm('Are you sure you want to delete this monitor?')) {
                      e.preventDefault()
                    }
                  }}
                >
                  Delete
                </button>
              </form>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Configuration</h3>
              <dl className="space-y-2">
                <div>
                  <dt className="text-sm text-gray-600">Selector:</dt>
                  <dd className="text-sm font-mono bg-gray-50 p-2 rounded">{monitor.selector}</dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-600">Value Type:</dt>
                  <dd className="text-sm capitalize">{monitor.value_type}</dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-600">Check Interval:</dt>
                  <dd className="text-sm">
                    {monitor.interval_minutes === 60 && 'Every hour'}
                    {monitor.interval_minutes === 240 && 'Every 4 hours'}
                    {monitor.interval_minutes === 1440 && 'Daily'}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-600">Notification Email:</dt>
                  <dd className="text-sm">{monitor.notification_email}</dd>
                </div>
              </dl>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Status</h3>
              <dl className="space-y-2">
                <div>
                  <dt className="text-sm text-gray-600">Last Check:</dt>
                  <dd className="text-sm">
                    {monitor.last_checked_at
                      ? new Date(monitor.last_checked_at).toLocaleString()
                      : 'Never'}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-600">Last Status:</dt>
                  <dd className="text-sm">
                    <span
                      className={`px-2 py-1 rounded text-xs font-semibold ${
                        monitor.last_status === 'ok'
                          ? 'bg-green-100 text-green-800'
                          : monitor.last_status === 'error'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {monitor.last_status}
                    </span>
                  </dd>
                </div>
                {monitor.last_error && (
                  <div>
                    <dt className="text-sm text-gray-600">Last Error:</dt>
                    <dd className="text-sm text-red-600">{monitor.last_error}</dd>
                  </div>
                )}
                <div>
                  <dt className="text-sm text-gray-600">Last Value:</dt>
                  <dd className="text-sm font-mono bg-gray-50 p-2 rounded break-all">
                    {monitor.last_value || 'No value yet'}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-600">Last Hash:</dt>
                  <dd className="text-sm font-mono text-xs text-gray-500">
                    {monitor.last_hash || 'N/A'}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </div>

        {/* Change History */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Change History</h3>
          
          {!events || events.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No changes detected yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {events.map((event) => (
                <div key={event.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-sm text-gray-600">
                      {new Date(event.changed_at).toLocaleString()}
                    </span>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-xs font-medium text-gray-500 mb-1">Previous Value</h4>
                      <p className="text-sm bg-red-50 p-2 rounded border border-red-100">
                        {event.old_value}
                      </p>
                    </div>
                    <div>
                      <h4 className="text-xs font-medium text-gray-500 mb-1">New Value</h4>
                      <p className="text-sm bg-green-50 p-2 rounded border border-green-100">
                        {event.new_value}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
