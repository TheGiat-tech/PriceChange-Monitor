import { ReactNode } from 'react'

interface IOSContainerProps {
  children: ReactNode
  className?: string
}

export default function IOSContainer({ children, className = '' }: IOSContainerProps) {
  return (
    <div className={`min-h-screen bg-ios-bg ${className}`}>
      <div className="max-w-md mx-auto px-4 py-6">
        {children}
      </div>
    </div>
  )
}
