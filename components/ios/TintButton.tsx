import { ReactNode } from 'react'

interface TintButtonProps {
  children: ReactNode
  onClick?: () => void
  type?: 'button' | 'submit'
  disabled?: boolean
  className?: string
}

export default function TintButton({ 
  children, 
  onClick, 
  type = 'button', 
  disabled = false,
  className = '' 
}: TintButtonProps) {
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
