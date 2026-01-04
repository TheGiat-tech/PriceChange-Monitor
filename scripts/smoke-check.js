#!/usr/bin/env node

/**
 * PricePing Smoke Test
 * 
 * This script performs basic smoke tests to ensure the app is working correctly.
 * Run with: node scripts/smoke-check.js
 */

const APP_URL = process.env.APP_URL || 'http://localhost:3000'

async function checkEndpoint(name, url, options = {}) {
  try {
    console.log(`Checking ${name}...`)
    const response = await fetch(url, options)
    
    if (response.ok) {
      console.log(`✓ ${name} - OK (${response.status})`)
      return true
    } else {
      console.log(`✗ ${name} - Failed (${response.status})`)
      return false
    }
  } catch (error) {
    console.log(`✗ ${name} - Error: ${error.message}`)
    return false
  }
}

async function runSmokeTests() {
  console.log('Running PricePing Smoke Tests\n')
  console.log(`Testing app at: ${APP_URL}\n`)

  const results = []

  // Test public pages
  results.push(await checkEndpoint('Landing Page', `${APP_URL}/`))
  results.push(await checkEndpoint('Login Page', `${APP_URL}/login`))
  results.push(await checkEndpoint('Pricing Page', `${APP_URL}/pricing`))

  // Test API endpoints (should return 401 for unauthorized)
  results.push(await checkEndpoint(
    'Monitors API (auth check)',
    `${APP_URL}/api/monitors`,
    { method: 'GET' }
  ))

  // Test selector test endpoint
  results.push(await checkEndpoint(
    'Test Selector API',
    `${APP_URL}/api/monitors/test`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        url: 'https://example.com',
        selector: 'h1',
      }),
    }
  ))

  console.log('\n' + '='.repeat(50))
  const passed = results.filter(Boolean).length
  const total = results.length
  console.log(`\nResults: ${passed}/${total} tests passed`)

  if (passed === total) {
    console.log('✓ All smoke tests passed!')
    process.exit(0)
  } else {
    console.log('✗ Some tests failed')
    process.exit(1)
  }
}

runSmokeTests().catch((error) => {
  console.error('Smoke test error:', error)
  process.exit(1)
})
