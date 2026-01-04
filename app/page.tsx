import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen bg-ios-bg">
      <div className="max-w-md mx-auto px-4 py-8">
        {/* Header */}
        <header className="flex justify-between items-center mb-16">
          <h1 className="text-[22px] font-semibold text-ios-label">PricePing</h1>
          <Link 
            href="/login" 
            className="text-ios-tint text-[15px]"
          >
            Sign In
          </Link>
        </header>

        {/* Hero Section */}
        <div className="text-center mb-16">
          <h2 className="text-[28px] font-semibold text-ios-label mb-3 leading-tight">
            Monitor Price Changes
          </h2>
          <p className="text-[15px] text-ios-secondary mb-10 leading-relaxed">
            Get email alerts when prices drop or content changes.
          </p>
          <Link 
            href="/login" 
            className="inline-block w-full max-w-xs bg-black text-white px-8 h-11 rounded-[22px] text-[15px] font-semibold active:opacity-80 transition-opacity flex items-center justify-center"
          >
            Get Started
          </Link>
        </div>

        {/* Features */}
        <div className="bg-ios-card rounded-ioslg shadow-ios overflow-hidden mb-16">
          <div className="px-4 py-4">
            <h3 className="text-[15px] font-semibold text-ios-label">Precise Monitoring</h3>
            <p className="text-[13px] text-ios-secondary mt-1 leading-relaxed">
              Monitor specific elements using CSS selectors.
            </p>
          </div>
          <div className="h-px bg-ios-separator" />
          <div className="px-4 py-4">
            <h3 className="text-[15px] font-semibold text-ios-label">Instant Alerts</h3>
            <p className="text-[13px] text-ios-secondary mt-1 leading-relaxed">
              Email notifications when changes are detected.
            </p>
          </div>
          <div className="h-px bg-ios-separator" />
          <div className="px-4 py-4">
            <h3 className="text-[15px] font-semibold text-ios-label">Affordable</h3>
            <p className="text-[13px] text-ios-secondary mt-1 leading-relaxed">
              Start free. Upgrade to Pro for up to 20 monitors.
            </p>
          </div>
        </div>

        {/* Footer */}
        <footer className="text-center">
          <div className="flex justify-center gap-6 text-[13px] text-ios-secondary">
            <Link href="/terms" className="hover:text-ios-label">
              Terms
            </Link>
            <Link href="/privacy" className="hover:text-ios-label">
              Privacy
            </Link>
            <Link href="/pricing" className="hover:text-ios-label">
              Pricing
            </Link>
          </div>
        </footer>
      </div>
    </main>
  )
}
