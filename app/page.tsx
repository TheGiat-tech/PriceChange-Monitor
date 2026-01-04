import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen bg-ios-bg">
      <div className="max-w-md mx-auto px-4 py-8">
        {/* Header */}
        <header className="flex justify-between items-center mb-12">
          <h1 className="text-2xl font-semibold text-ios-label">PricePing</h1>
          <Link 
            href="/login" 
            className="text-ios-tint text-[15px] font-medium"
          >
            Sign In
          </Link>
        </header>

        {/* Hero Section */}
        <div className="text-center mb-12">
          <h2 className="text-[28px] font-semibold text-ios-label mb-4 leading-tight">
            Monitor Price Changes
          </h2>
          <p className="text-[15px] text-ios-secondary mb-8 leading-relaxed">
            Get instant email alerts when prices drop or content changes on any website.
          </p>
          <Link 
            href="/login" 
            className="inline-block w-full max-w-xs bg-ios-tint text-white px-8 h-12 rounded-lg text-[15px] font-semibold active:scale-[0.98] transition-transform flex items-center justify-center"
          >
            Get Started
          </Link>
        </div>

        {/* Features */}
        <div className="space-y-4 mb-12">
          <div className="bg-ios-card p-6 rounded-ioslg shadow-ios">
            <div className="text-3xl mb-3">🎯</div>
            <h3 className="text-[18px] font-semibold mb-2 text-ios-label">Precise Monitoring</h3>
            <p className="text-[14px] text-ios-secondary leading-relaxed">
              Monitor specific elements using CSS selectors for accurate tracking.
            </p>
          </div>
          <div className="bg-ios-card p-6 rounded-ioslg shadow-ios">
            <div className="text-3xl mb-3">⚡</div>
            <h3 className="text-[18px] font-semibold mb-2 text-ios-label">Instant Alerts</h3>
            <p className="text-[14px] text-ios-secondary leading-relaxed">
              Email notifications when changes are detected. Choose hourly to daily intervals.
            </p>
          </div>
          <div className="bg-ios-card p-6 rounded-ioslg shadow-ios">
            <div className="text-3xl mb-3">💰</div>
            <h3 className="text-[18px] font-semibold mb-2 text-ios-label">Affordable Pricing</h3>
            <p className="text-[14px] text-ios-secondary leading-relaxed">
              Start free with 1 monitor. Upgrade to Pro to monitor up to 20 pages.
            </p>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-16 text-center space-y-2">
          <div className="flex justify-center gap-4 text-xs text-ios-secondary">
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
