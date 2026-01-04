import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'PricePing - Simple Price & Content Monitoring',
  description: 'Monitor website prices and content changes with instant alerts',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  )
}
