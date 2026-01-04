import { ReactNode } from 'react'

interface PrimaryButtonProps {
  children: ReactNode
  onClick?: () => void
  type?: 'button' | 'submit'
  disabled?: boolean
  className?: string
}

export default function PrimaryButton({ 
  children, 
  onClick, 
  type = 'button', 
  disabled = false,
  className = '' 
}: PrimaryButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`w-full h-12 bg-ios-label text-white font-semibold text-[15px] rounded-lg active:scale-[0.98] transition-transform disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
      {children}
    </button>
  )
}
