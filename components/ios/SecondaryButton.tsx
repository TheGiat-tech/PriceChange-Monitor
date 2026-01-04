import { ReactNode } from 'react'

interface SecondaryButtonProps {
  children: ReactNode
  onClick?: () => void
  type?: 'button' | 'submit'
  disabled?: boolean
  className?: string
}

export default function SecondaryButton({ 
  children, 
  onClick, 
  type = 'button', 
  disabled = false,
  className = '' 
}: SecondaryButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`w-full h-11 bg-white border border-ios-separator text-ios-label font-medium text-[15px] rounded-[22px] active:bg-black/5 transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${className}`}
    >
      {children}
    </button>
  )
}
