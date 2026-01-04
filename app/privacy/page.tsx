import Link from 'next/link'
import { IOSContainer } from '@/components/ios'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-ios-bg">
      <IOSContainer>
        <div className="mb-4">
          <Link href="/" className="text-ios-tint text-sm font-medium">
            ← Back to Home
          </Link>
          <h1 className="text-[28px] font-semibold text-ios-label mt-2">Privacy Policy</h1>
        </div>
        
        <div className="bg-ios-card rounded-ioslg shadow-ios p-6 space-y-6 text-ios-secondary text-[14px]">
          <section>
            <h2 className="text-[18px] font-semibold text-ios-label mb-3">1. Information We Collect</h2>
            <p className="mb-3">We collect the following information when you use PricePing:</p>
            
            <h3 className="text-[15px] font-semibold text-ios-label mb-2">Account Information</h3>
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li>Email address (used for authentication and notifications)</li>
              <li>Subscription and billing information (processed securely through Stripe and PayPal)</li>
            </ul>

            <h3 className="text-[15px] font-semibold text-ios-label mb-2">Monitor Data</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>URLs of websites you choose to monitor</li>
              <li>CSS selectors for content extraction</li>
              <li>Notification email addresses</li>
              <li>Historical data about detected changes</li>
            </ul>
          </section>

          <section>
            <h2 className="text-[18px] font-semibold text-ios-label mb-3">2. How We Use Your Information</h2>
            <p className="mb-2">We use your information to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Provide and maintain the monitoring service</li>
              <li>Send email notifications when changes are detected</li>
              <li>Process subscription payments</li>
              <li>Improve and optimize the Service</li>
              <li>Communicate with you about service updates or account issues</li>
              <li>Prevent fraud and ensure security</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Data Storage and Security</h2>
            <p>
              Your data is stored securely using industry-standard encryption and security practices. We use 
              Supabase for data storage and authentication, which provides enterprise-grade security features.
            </p>
            <p className="mt-4">
              Payment information is processed directly by our payment providers (Stripe and PayPal) and is not 
              stored on our servers.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Third-Party Services</h2>
            <p className="mb-2">We use the following third-party services:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Supabase:</strong> Authentication and database hosting</li>
              <li><strong>Stripe:</strong> Payment processing</li>
              <li><strong>PayPal:</strong> Payment processing</li>
              <li><strong>Resend:</strong> Email delivery</li>
            </ul>
            <p className="mt-4">
              These services have their own privacy policies and handle data according to their respective terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Data Sharing</h2>
            <p>
              We do not sell, trade, or rent your personal information to third parties. We only share your 
              information with service providers necessary to operate the Service, and they are bound by 
              confidentiality agreements.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Your Rights</h2>
            <p className="mb-2">You have the right to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Access your personal data</li>
              <li>Correct inaccurate data</li>
              <li>Request deletion of your account and data</li>
              <li>Export your data</li>
              <li>Opt-out of marketing communications</li>
            </ul>
            <p className="mt-4">
              To exercise these rights, please contact us at privacy@priceping.app.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Cookies and Tracking</h2>
            <p>
              We use essential cookies to maintain your login session and preferences. We do not use third-party 
              tracking cookies or advertising technologies.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Data Retention</h2>
            <p>
              We retain your data as long as your account is active. If you delete your account, we will remove 
              your personal information within 30 days, except where we are required to retain it for legal or 
              regulatory purposes.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Children&apos;s Privacy</h2>
            <p>
              The Service is not intended for users under the age of 13. We do not knowingly collect information 
              from children under 13.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Changes to Privacy Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of significant changes by 
              email or through the Service. Continued use after changes constitutes acceptance of the updated policy.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Contact</h2>
            <p>
              If you have questions about this Privacy Policy or our data practices, please contact us at 
              privacy@priceping.app.
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
