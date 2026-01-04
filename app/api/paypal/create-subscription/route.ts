import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export const runtime = 'nodejs'

export async function POST(request: Request) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const planId = process.env.PAYPAL_PLAN_ID
    
    if (!planId) {
      return NextResponse.json({ error: 'PayPal not configured' }, { status: 500 })
    }

    // Create PayPal subscription
    const auth = Buffer.from(
      `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`
    ).toString('base64')

    const response = await fetch(
      `${process.env.PAYPAL_API_URL || 'https://api-m.paypal.com'}/v1/billing/subscriptions`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Basic ${auth}`,
        },
        body: JSON.stringify({
          plan_id: planId,
          custom_id: user.id,
          application_context: {
            brand_name: 'PricePing',
            locale: 'en-US',
            shipping_preference: 'NO_SHIPPING',
            user_action: 'SUBSCRIBE_NOW',
            return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?paypal=success`,
            cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing?paypal=cancelled`,
          },
        }),
      }
    )

    if (!response.ok) {
      const errorData = await response.json()
      console.error('PayPal subscription creation failed:', errorData)
      return NextResponse.json(
        { error: 'Failed to create subscription' },
        { status: 500 }
      )
    }

    const subscription = await response.json()
    
    // Find the approval URL
    const approvalUrl = subscription.links?.find(
      (link: any) => link.rel === 'approve'
    )?.href

    if (!approvalUrl) {
      return NextResponse.json(
        { error: 'No approval URL returned' },
        { status: 500 }
      )
    }

    return NextResponse.json({ approvalUrl })
  } catch (error) {
    console.error('PayPal subscription error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
