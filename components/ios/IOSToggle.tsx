'use client'

interface IOSToggleProps {
  checked: boolean
  onChange: (checked: boolean) => void
  disabled?: boolean
  label?: string
}

export default function IOSToggle({ 
  checked, 
  onChange, 
  disabled = false,
  label 
}: IOSToggleProps) {
  return (
    <label className="flex items-center cursor-pointer">
      {label && (
        <span className="text-ios-label text-[15px] font-medium mr-3">{label}</span>
      )}
      <div className="relative">
        <input
          type="checkbox"
          className="sr-only"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          disabled={disabled}
        />
        <div className={`w-12 h-7 rounded-full transition-colors ${
          checked ? 'bg-ios-tint' : 'bg-gray-300'
        } ${disabled ? 'opacity-50' : ''}`}>
          <div className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full transition-transform ${
            checked ? 'transform translate-x-5' : ''
          }`} />
        </div>
      </div>
    </label>
  )
}
