import { forwardRef } from 'react'

interface IOSInputProps {
  label?: string
  type?: string
  placeholder?: string
  value?: string
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
  required?: boolean
  disabled?: boolean
  maxLength?: number
  className?: string
  id?: string
  helperText?: string
}

const IOSInput = forwardRef<HTMLInputElement, IOSInputProps>(({
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  required = false,
  disabled = false,
  maxLength,
  className = '',
  id,
  helperText
}, ref) => {
  return (
    <div className={className}>
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-ios-label mb-2">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <input
        ref={ref}
        id={id}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
        disabled={disabled}
        maxLength={maxLength}
        className="w-full px-4 py-3 bg-white border border-ios-separator rounded-ios text-ios-label text-[15px] focus:outline-none focus:ring-2 focus:ring-ios-tint focus:border-transparent disabled:opacity-50"
      />
      {helperText && (
        <p className="mt-2 text-xs text-ios-secondary">{helperText}</p>
      )}
    </div>
  )
})

IOSInput.displayName = 'IOSInput'

export default IOSInput
