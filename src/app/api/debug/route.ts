import { NextResponse } from 'next/server'

export async function GET() {
  const gptKey   = process.env.OPENROUTER_GPT_KEY   || ''
  const sonarKey = process.env.OPENROUTER_SONAR_KEY || ''

  // Test OpenRouter connectivity
  let pingResult = 'not tested'
  try {
    const res = await fetch('https://openrouter.ai/api/v1/models', {
      headers: { 'Authorization': `Bearer ${gptKey || sonarKey}` }
    })
    pingResult = `HTTP ${res.status}`
  } catch (e: unknown) {
    pingResult = `fetch error: ${e instanceof Error ? e.message : String(e)}`
  }

  return NextResponse.json({
    env: {
      OPENROUTER_GPT_KEY:   gptKey   ? `set (${gptKey.slice(0,12)}...)` : 'MISSING',
      OPENROUTER_SONAR_KEY: sonarKey ? `set (${sonarKey.slice(0,12)}...)` : 'MISSING',
    },
    openrouter_ping: pingResult,
    node_version: process.version,
  })
}
