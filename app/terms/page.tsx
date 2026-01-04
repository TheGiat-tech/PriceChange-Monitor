import Link from 'next/link'
import { IOSContainer } from '@/components/ios'

export default function TermsPage() {
  return (
    <IOSContainer>
      <div className="mb-4">
        <Link href="/" className="text-ios-tint text-sm font-medium">
          ← Back to Home
        </Link>
        <h1 className="text-[28px] font-semibold text-ios-label mt-2">Terms of Service</h1>
      </div>
      
      <div className="bg-ios-card rounded-ioslg shadow-ios p-6 space-y-6 text-ios-secondary text-[14px]">
        <section>
          <h2 className="text-[18px] font-semibold text-ios-label mb-3">1. Acceptance of Terms</h2>
          <p>
            By accessing and using PricePing (&quot;the Service&quot;), you accept and agree to be bound by these terms.
          </p>
        </section>

        <section>
          <h2 className="text-[18px] font-semibold text-ios-label mb-3">2. Description of Service</h2>
          <p>
            PricePing provides website content and price monitoring services with email notifications.
          </p>
        </section>

        <section>
          <h2 className="text-[18px] font-semibold text-ios-label mb-3">3. User Responsibilities</h2>
          <p className="mb-2">You agree to:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Provide accurate account information</li>
            <li>Use the Service in compliance with laws</li>
            <li>Not monitor websites that prohibit automated access</li>
            <li>Not disrupt the Service&apos;s operation</li>
          </ul>
        </section>

        <section>
          <h2 className="text-[18px] font-semibold text-ios-label mb-3">4. Service Plans</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>Free: 1 monitor, daily checks</li>
            <li>Pro: 20 monitors, hourly checks</li>
          </ul>
        </section>

        <section>
          <h2 className="text-[18px] font-semibold text-ios-label mb-3">5. Limitation of Liability</h2>
          <p>
            The Service is provided &quot;as is&quot; without warranties. We are not responsible for missed notifications or data extraction errors.
          </p>
        </section>

        <p className="text-xs text-ios-secondary mt-8">
          Last updated: {new Date().toLocaleDateString()}
        </p>
      </div>
    </IOSContainer>
  )
}
