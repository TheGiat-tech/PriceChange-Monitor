import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

export const runtime = 'nodejs'

export async function POST(request: Request) {
  const body = await request.text()
  
  let event: any
  
  try {
    event = JSON.parse(body)
  } catch (error) {
    console.error('Invalid JSON payload:', error)
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  // Verify webhook signature (simplified - in production, use proper verification)
  const webhookId = request.headers.get('paypal-transmission-id')
  if (!webhookId) {
    console.error('Missing PayPal webhook ID')
    return NextResponse.json({ error: 'Invalid webhook' }, { status: 400 })
  }

  const supabase = createAdminClient()

  try {
    const eventType = event.event_type

    switch (eventType) {
      case 'BILLING.SUBSCRIPTION.ACTIVATED': {
        const subscription = event.resource
        const userId = subscription.custom_id

        if (!userId) {
          console.error('No custom_id (userId) in subscription')
          break
        }

        await supabase
          .from('profiles')
          .update({
            paypal_subscription_id: subscription.id,
            paypal_status: 'ACTIVE',
            billing_provider: 'paypal',
            plan: 'pro',
            subscription_status: 'active',
          })
          .eq('id', userId)

        console.log(`PayPal: Activated subscription for user ${userId}`)
        break
      }

      case 'BILLING.SUBSCRIPTION.SUSPENDED': {
        const subscription = event.resource
        
        const { data: profile } = await supabase
          .from('profiles')
          .select('id')
          .eq('paypal_subscription_id', subscription.id)
          .single()

        if (!profile) {
          console.error('No profile found for subscription:', subscription.id)
          break
        }

        await supabase
          .from('profiles')
          .update({
            paypal_status: 'SUSPENDED',
            plan: 'free',
            subscription_status: 'suspended',
          })
          .eq('id', profile.id)

        console.log(`PayPal: Suspended subscription for user ${profile.id}`)
        break
      }

      case 'BILLING.SUBSCRIPTION.CANCELLED': {
        const subscription = event.resource
        
        const { data: profile } = await supabase
          .from('profiles')
          .select('id')
          .eq('paypal_subscription_id', subscription.id)
          .single()

        if (!profile) {
          console.error('No profile found for subscription:', subscription.id)
          break
        }

        await supabase
          .from('profiles')
          .update({
            paypal_status: 'CANCELLED',
            plan: 'free',
            subscription_status: 'canceled',
          })
          .eq('id', profile.id)

        console.log(`PayPal: Cancelled subscription for user ${profile.id}`)
        break
      }

      case 'BILLING.SUBSCRIPTION.EXPIRED': {
        const subscription = event.resource
        
        const { data: profile } = await supabase
          .from('profiles')
          .select('id')
          .eq('paypal_subscription_id', subscription.id)
          .single()

        if (!profile) {
          console.error('No profile found for subscription:', subscription.id)
          break
        }

        await supabase
          .from('profiles')
          .update({
            paypal_status: 'EXPIRED',
            plan: 'free',
            subscription_status: 'expired',
          })
          .eq('id', profile.id)

        console.log(`PayPal: Expired subscription for user ${profile.id}`)
        break
      }

      default:
        console.log(`Unhandled PayPal event type: ${eventType}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('PayPal webhook processing error:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}
