interface IOSBadgeProps {
  status: 'active' | 'paused' | 'error' | 'ok' | 'inactive' | 'blocked'
  label?: string
  className?: string
}

export default function IOSBadge({ status, label, className = '' }: IOSBadgeProps) {
  const statusConfig = {
    active: { bg: 'bg-green-100', text: 'text-green-800', label: label || 'Active' },
    ok: { bg: 'bg-green-100', text: 'text-green-800', label: label || 'OK' },
    paused: { bg: 'bg-gray-100', text: 'text-gray-800', label: label || 'Paused' },
    inactive: { bg: 'bg-gray-100', text: 'text-gray-800', label: label || 'Inactive' },
    error: { bg: 'bg-red-100', text: 'text-red-800', label: label || 'Error' },
    blocked: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: label || 'Blocked' },
  }

  const config = statusConfig[status]

  return (
    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text} ${className}`}>
      {config.label}
    </span>
  )
}
