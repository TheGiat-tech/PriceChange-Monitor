import Link from 'next/link'
import { IOSContainer } from '@/components/ios'

export default function PrivacyPage() {
  return (
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
          </ul>
        </section>

        <section>
          <h2 className="text-[18px] font-semibold text-ios-label mb-3">3. Data Storage and Security</h2>
          <p>
            Your data is stored securely using industry-standard encryption. We use Supabase for data storage and authentication.
          </p>
        </section>

        <section>
          <h2 className="text-[18px] font-semibold text-ios-label mb-3">4. Your Rights</h2>
          <p className="mb-2">You have the right to:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Access your personal data</li>
            <li>Correct inaccurate data</li>
            <li>Request deletion of your account and data</li>
          </ul>
        </section>

        <p className="text-xs text-ios-secondary mt-8">
          Last updated: {new Date().toLocaleDateString()}
        </p>
      </div>
    </IOSContainer>
  )
}
