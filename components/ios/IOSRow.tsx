import { ReactNode } from 'react'
import Link from 'next/link'

interface IOSRowProps {
  label: string
  value?: string
  secondary?: string
  badge?: ReactNode
  chevron?: boolean
  href?: string
  onClick?: () => void
  className?: string
}

export default function IOSRow({ 
  label, 
  value, 
  secondary, 
  badge, 
  chevron = false, 
  href, 
  onClick,
  className = '' 
}: IOSRowProps) {
  const content = (
    <div className={`flex items-center justify-between px-4 py-3 min-h-[48px] ${
      (href || onClick) ? 'active:bg-black/5 cursor-pointer' : ''
    } ${className}`}>
      <div className="flex-1 min-w-0 pr-3">
        <div className="text-ios-label font-medium text-[15px]">{label}</div>
        {secondary && (
          <div className="text-ios-secondary text-xs mt-0.5">{secondary}</div>
        )}
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        {badge}
        {value && (
          <span className="text-ios-secondary text-[15px]">{value}</span>
        )}
        {chevron && (
          <svg className="w-4 h-4 text-ios-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
          </svg>
        )}
      </div>
    </div>
  )

  if (href) {
    return <Link href={href}>{content}</Link>
  }

  if (onClick) {
    return <button type="button" onClick={onClick} className="w-full text-left">{content}</button>
  }

  return content
}
