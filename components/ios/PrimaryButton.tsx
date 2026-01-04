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
      className={`w-full h-11 bg-black text-white font-semibold text-[15px] rounded-[22px] active:opacity-80 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed ${className}`}
    >
      {children}
    </button>
  )
}
