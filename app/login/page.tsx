'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { IOSContainer, IOSCard, IOSInput, TintButton } from '@/components/ios'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      if (isSignUp) {
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/api/auth/callback`,
          },
        })

        if (signUpError) throw signUpError

        // Profile is automatically created by database trigger
        router.push('/dashboard')
        router.refresh()
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        })

        if (signInError) throw signInError

        router.push('/dashboard')
        router.refresh()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <IOSContainer>
      <div className="flex flex-col items-center justify-center min-h-[80vh]">
        <Link href="/" className="mb-12">
          <h1 className="text-[28px] font-semibold text-ios-label">PricePing</h1>
        </Link>

        <IOSCard className="w-full">
          <div className="p-6">
            <h2 className="text-[22px] font-semibold text-ios-label text-center mb-8">
              {isSignUp ? 'Create Account' : 'Sign In'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-ios text-sm">
                  {error}
                </div>
              )}

              <IOSInput
                label="Email"
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
              />

              <IOSInput
                label="Password"
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Enter your password"
              />

              <div className="pt-2">
                <TintButton type="submit" disabled={loading}>
                  {loading ? 'Loading...' : isSignUp ? 'Sign Up' : 'Sign In'}
                </TintButton>
              </div>
            </form>

            <div className="mt-8 pt-6 border-t border-ios-separator text-center">
              <button
                type="button"
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-ios-tint text-[15px]"
              >
                {isSignUp ? 'Already have an account?' : 'Create account'}
              </button>
            </div>
          </div>
        </IOSCard>
      </div>
    </IOSContainer>
  )
}
