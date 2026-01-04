import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-16">
        {/* Header */}
        <header className="flex justify-between items-center mb-16">
          <h1 className="text-2xl font-bold text-gray-900">PricePing</h1>
          <nav className="space-x-4">
            <Link 
              href="/pricing" 
              className="text-gray-600 hover:text-gray-900"
            >
              Pricing
            </Link>
            <Link 
              href="/login" 
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
            >
              Sign In
            </Link>
          </nav>
        </header>

        {/* Hero Section */}
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold text-gray-900 mb-6">
            Monitor Price & Content Changes
            <br />
            <span className="text-blue-600">Simple. Easy. Affordable.</span>
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Get instant email alerts when prices drop or content changes on any website. 
            Like Visualping but simpler and cheaper.
          </p>
          <Link 
            href="/login" 
            className="inline-block bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700"
          >
            Start Monitoring Free
          </Link>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="text-3xl mb-4">🎯</div>
            <h3 className="text-xl font-semibold mb-2">Precise Monitoring</h3>
            <p className="text-gray-600">
              Monitor specific elements on a page using CSS selectors. No screenshots, just clean text tracking.
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="text-3xl mb-4">⚡</div>
            <h3 className="text-xl font-semibold mb-2">Instant Alerts</h3>
            <p className="text-gray-600">
              Get email notifications the moment a change is detected. Choose check intervals from hourly to daily.
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="text-3xl mb-4">💰</div>
            <h3 className="text-xl font-semibold mb-2">Affordable Pricing</h3>
            <p className="text-gray-600">
              Start free with 1 monitor. Upgrade to Pro for just a few dollars to monitor up to 20 pages.
            </p>
          </div>
        </div>

        {/* How It Works */}
        <div className="bg-white rounded-lg p-8 shadow-sm">
          <h3 className="text-2xl font-bold text-center mb-8">How It Works</h3>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="bg-blue-100 text-blue-600 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                1
              </div>
              <p className="text-gray-600">Add the URL you want to monitor</p>
            </div>
            <div className="text-center">
              <div className="bg-blue-100 text-blue-600 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                2
              </div>
              <p className="text-gray-600">Specify the CSS selector for the element</p>
            </div>
            <div className="text-center">
              <div className="bg-blue-100 text-blue-600 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                3
              </div>
              <p className="text-gray-600">Choose your check interval</p>
            </div>
            <div className="text-center">
              <div className="bg-blue-100 text-blue-600 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                4
              </div>
              <p className="text-gray-600">Get instant email alerts on changes</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-16 text-center text-gray-500">
          <p>&copy; 2024 PricePing. All rights reserved.</p>
        </footer>
      </div>
    </main>
  )
}
