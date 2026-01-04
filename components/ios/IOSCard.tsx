import { ReactNode } from 'react'

interface IOSCardProps {
  children: ReactNode
  title?: string
  className?: string
}

export default function IOSCard({ children, title, className = '' }: IOSCardProps) {
  return (
    <div className={`bg-ios-card rounded-ioslg shadow-ios overflow-hidden ${className}`}>
      {title && (
        <div className="px-4 pt-2 pb-1">
          <h3 className="text-[11px] uppercase tracking-wider text-ios-secondary font-medium">
            {title}
          </h3>
        </div>
      )}
      <div className={title ? 'border-t border-ios-separator' : ''}>
        {children}
      </div>
    </div>
  )
}
