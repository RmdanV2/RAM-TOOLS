import { NextRequest, NextResponse } from 'next/server'

// Keys are read from environment variables — NEVER hardcode here
const OPENROUTER_GPT_KEY   = process.env.OPENROUTER_GPT_KEY   || ''
const OPENROUTER_SONAR_KEY = process.env.OPENROUTER_SONAR_KEY || ''
const OPENROUTER_URL       = 'https://openrouter.ai/api/v1/chat/completions'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { message, system, engine } = body

    if (!OPENROUTER_GPT_KEY && !OPENROUTER_SONAR_KEY) {
      return NextResponse.json({
        content: `> **Demo Mode** — Tambahkan \`OPENROUTER_GPT_KEY\` dan \`OPENROUTER_SONAR_KEY\` di Vercel Environment Variables untuk mengaktifkan PRD Generator.\n\nLihat README.md untuk petunjuk setup.`
      })
    }

    let model: string
    let apiKey: string
    const messages: { role: string; content: string }[] = []

    if (engine === 'sonar') {
      // Perplexity via OpenRouter (free tier)
      model  = 'perplexity/sonar'
      apiKey = OPENROUTER_SONAR_KEY || OPENROUTER_GPT_KEY
      messages.push({ role: 'user', content: message })
    } else {
      // GPT-4o-mini via OpenRouter (free tier available)
      model  = 'openai/gpt-4o-mini'
      apiKey = OPENROUTER_GPT_KEY
      if (system) messages.push({ role: 'system', content: system })
      messages.push({ role: 'user', content: message })
    }

    const res = await fetch(OPENROUTER_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://ram-tools.vercel.app',
        'X-Title': 'RAM Tools PRD Generator',
      },
      body: JSON.stringify({ model, messages, max_tokens: 4096 }),
    })

    if (!res.ok) {
      const err = await res.text()
      throw new Error(`OpenRouter ${res.status}: ${err}`)
    }

    const data = await res.json()
    let content: string = data.choices?.[0]?.message?.content || ''

    // Strip JSON fences if the prompt requested JSON output
    if (system?.includes('JSON')) {
      content = content.replace(/```json/g, '').replace(/```/g, '').trim()
    }

    return NextResponse.json({ content })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Unknown error'
    console.error('[prd-chat] Error:', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
