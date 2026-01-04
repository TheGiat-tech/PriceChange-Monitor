import { createClient } from '@/lib/supabase/server'
import { createCheckoutSession } from '@/lib/stripe'
import { NextResponse } from 'next/server'

export const runtime = 'nodejs'

export async function POST() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Ensure profile exists for the user (create if it doesn't exist)
  // First, try to upsert (will create if doesn't exist, ignore if exists)
  await supabase
    .from('profiles')
    .upsert(
      {
        id: user.id,
        email: user.email || '',
        plan: 'free',
      },
      {
        onConflict: 'id',
        ignoreDuplicates: true,
      }
    )
  
  // Then fetch the profile (this will always return the profile)
  const { data: profile } = await supabase
    .from('profiles')
    .select('stripe_customer_id, email')
    .eq('id', user.id)
    .single()

  if (!profile) {
    return NextResponse.json({ error: 'Failed to create profile' }, { status: 500 })
  }

  try {
    const url = await createCheckoutSession(
      profile.stripe_customer_id,
      user.id,
      profile.email
    )

    return NextResponse.json({ url })
  } catch (error) {
    console.error('Checkout error:', error)
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}
