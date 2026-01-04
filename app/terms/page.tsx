import Link from 'next/link'

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <Link href="/" className="text-2xl font-bold text-gray-900">
              PricePing
            </Link>
            <Link href="/" className="text-blue-600 hover:text-blue-700">
              Back to Home
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Terms of Service</h1>
        
        <div className="bg-white rounded-lg shadow-sm p-8 space-y-6 text-gray-700">
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Acceptance of Terms</h2>
            <p>
              By accessing and using PricePing (&quot;the Service&quot;), you accept and agree to be bound by the terms 
              and provision of this agreement. If you do not agree to these terms, please do not use the Service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Description of Service</h2>
            <p>
              PricePing provides website content and price monitoring services. The Service allows you to monitor 
              specified web pages for changes and receive email notifications when changes are detected.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. User Responsibilities</h2>
            <p className="mb-2">You agree to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Provide accurate and complete information when creating an account</li>
              <li>Maintain the security of your account credentials</li>
              <li>Use the Service in compliance with all applicable laws and regulations</li>
              <li>Not monitor websites that explicitly prohibit automated access</li>
              <li>Not use the Service to scrape, harvest, or collect data for commercial purposes</li>
              <li>Not attempt to disrupt or interfere with the Service&apos;s operation</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Service Plans and Billing</h2>
            <p className="mb-2">
              PricePing offers both free and paid subscription plans:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Free Plan: Limited to 1 active monitor with a minimum check interval of 24 hours</li>
              <li>Pro Plan: Up to 20 active monitors with a minimum check interval of 1 hour</li>
            </ul>
            <p className="mt-4">
              Subscription fees are billed in advance on a monthly or annual basis. You may cancel your subscription 
              at any time, but refunds are not provided for partial months or years.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Service Availability</h2>
            <p>
              While we strive to provide reliable service, we do not guarantee that the Service will be available 
              at all times. The Service may be temporarily unavailable due to maintenance, updates, or circumstances 
              beyond our control.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Limitation of Liability</h2>
            <p>
              The Service is provided &quot;as is&quot; without warranties of any kind. We are not responsible for:
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>Missed change notifications due to technical issues or website changes</li>
              <li>Inaccurate data extraction from monitored websites</li>
              <li>Any losses or damages resulting from your use of the Service</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Termination</h2>
            <p>
              We reserve the right to suspend or terminate your access to the Service at any time, with or without 
              cause, including for violation of these Terms of Service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Changes to Terms</h2>
            <p>
              We reserve the right to modify these terms at any time. Continued use of the Service after changes 
              constitutes acceptance of the modified terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Contact</h2>
            <p>
              If you have any questions about these Terms of Service, please contact us at support@priceping.app.
            </p>
          </section>

          <p className="text-sm text-gray-500 mt-8">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </div>
      </main>

      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex justify-center space-x-6 text-sm text-gray-600">
            <Link href="/terms" className="hover:text-gray-900">Terms of Service</Link>
            <Link href="/privacy" className="hover:text-gray-900">Privacy Policy</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
