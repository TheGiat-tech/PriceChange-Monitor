import { testSelectorSchema } from '@/lib/utils/validation'
import { fetchAndExtract } from '@/lib/monitoring/fetch'
import { NextResponse } from 'next/server'

export const runtime = 'nodejs'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const validated = testSelectorSchema.parse(body)

    const result = await fetchAndExtract(validated.url, validated.selector)

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      value: result.value,
    })
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 })
    }
    return NextResponse.json({ success: false, error: 'Invalid request' }, { status: 400 })
  }
}
