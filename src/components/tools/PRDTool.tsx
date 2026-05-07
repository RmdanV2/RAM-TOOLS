'use client'
import { useState, useCallback } from 'react'
import { FileText, ArrowRight, RotateCcw, Copy, Check, ChevronRight, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Lang } from '@/lib/i18n'

type Step = 1 | 2 | 3

interface State {
  step: Step
  userInput: string
  concept: string
  categories: Category[]
  research: string
  prd: string
  isGenerating: boolean
  loadingText: string
}

interface Category {
  id: string
  name: string
  options: Option[]
}

interface Option {
  name: string
  description: string
  badge?: string
}

const UPSTREAM = process.env.NEXT_PUBLIC_UPSTREAM_URL || ''
const COOKIE    = process.env.NEXT_PUBLIC_UPSTREAM_COOKIE || ''

async function apiCall(payload: { message: string; system?: string; engine: 'gpt' | 'sonar' }) {
  const res = await fetch('/api/prd-chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const data = await res.json()
  if (data.error) throw new Error(data.error)
  return data as { content: string }
}

const STEPS = {
  id: ['Konsep', 'Arsitektur', 'Dokumen'],
  en: ['Concept', 'Architecture', 'Document'],
}

export default function PRDTool({ lang }: { lang: Lang }) {
  const [S, setS] = useState<State>({
    step: 1, userInput: '', concept: '', categories: [], research: '',
    prd: '', isGenerating: false, loadingText: '',
  })
  const [selStack, setSelStack] = useState<Record<string, string>>({})
  const [copied, setCopied] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [userNote, setUserNote] = useState('')
  const [revInput, setRevInput] = useState('')

  const set = useCallback((partial: Partial<State>) => setS(p => ({ ...p, ...partial })), [])

  const reset = () => {
    setS({ step: 1, userInput: '', concept: '', categories: [], research: '', prd: '', isGenerating: false, loadingText: '' })
    setSelStack({}); setError(''); setLoading(false); setUserNote(''); setRevInput('')
  }

  const refineConcept = async (input: string) => {
    setLoading(true); setError('')
    try {
      const d = await apiCall({
        message: 'RAW IDEA: ' + input + '\nRefine this idea.',
        system: 'You are an elite Product Manager. Transform the user idea into a solid Product Concept: Elevator Pitch, Target User, Key Problems Solved. Max 2-3 paragraphs. Markdown format. No preamble.',
        engine: 'gpt',
      })
      set({ concept: d.content })
    } catch (e: any) { setError(e.message) }
    setLoading(false)
  }

  const startPlanning = async () => {
    set({ step: 2 }); setLoading(true); setError('')
    try {
      const [pRes, rRes] = await Promise.all([
        apiCall({
          message: 'CONCEPT:\n' + S.concept + '\n\nProvide tech stack options grouped by categories.',
          system: 'You are a Senior Software Architect. Provide tech stack options grouped by EXACTLY these categories: 1."frontend" (Frontend Framework/UI), 2."backend" (Backend API & Language), 3."database" (Database System), 4."infra" (Deployment & Infrastructure). For each category, 3-4 options with a "badge" field (e.g. "Paling Hemat","Paling Pro","Standard","Populer"). Format output EXACTLY as JSON: { "categories": [ { "id": "frontend", "name": "Frontend", "options": [ { "name": "Next.js", "description": "Great for SEO", "badge": "Paling Populer" } ] } ] }',
          engine: 'gpt',
        }),
        apiCall({
          message: 'Recommended architecture trends (Tech Stack, Infra) in 2025-2026 for this concept: ' + S.concept + '. Brief (1 paragraph + bullets).',
          engine: 'sonar',
        }),
      ])
      let raw = pRes.content
      const m = raw.match(/\{[\s\S]*\}/)
      if (m) raw = m[0]
      const parsed = JSON.parse(raw)
      set({ categories: parsed.categories, research: rRes.content || '', step: 2 })
    } catch (e: any) { setError(e.message) }
    setLoading(false)
  }

  const generatePRD = async () => {
    if (Object.keys(selStack).length < S.categories.length) {
      setError(lang === 'id' ? 'Pilih satu opsi untuk setiap kategori.' : 'Select one option for every category.'); return
    }
    setError('')
    const stackSelection = Object.entries(selStack).map(([catId, val]) => {
      const catName = S.categories.find(c => c.id === catId)?.name || catId
      return `- ${catName}: ${val}`
    }).join('\n')

    set({ step: 3, prd: '', isGenerating: true, loadingText: lang === 'id' ? 'Meneliti Integrasi API via Sonar...' : 'Researching API Integrations via Sonar...' })

    try {
      let apiDocs = ''
      try {
        const sonarQ = `Identify external third-party APIs needed for: ${S.concept}. Notes: ${userNote}. Search for their official API docs and return concrete endpoint examples and JSON payloads. If no external API needed, reply "No external APIs required."`
        const rRes = await apiCall({ message: sonarQ, engine: 'sonar' })
        apiDocs = rRes.content || ''
      } catch { apiDocs = '(API research unavailable. Use best knowledge for integrations.)' }

      set({ loadingText: lang === 'id' ? 'Menyusun PRD (Fase 1/3)...' : 'Compiling PRD (Phase 1/3)...' })
      const sys1 = 'You are an elite PRD Generator. STRICT RULES:\n1. NO PREAMBLE. Output Markdown immediately.\n2. MUST use these 7 sections: # PRD, ## 1. Overview, ## 2. Requirements, ## 3. Core Features, ## 4. User Flow, ## 5. Architecture & Integrations, ## 6. Database Schema, ## 7. Constraints.\n3. Incorporate provided API DOCS into section 5.\n4. Format with markdown tables and lists. Be concise but thorough.'
      const p1 = `CONCEPT:\n${S.concept}\n\nCHOSEN TECH STACK:\n${stackSelection}\n\nUSER NOTES:\n${userNote || 'None'}\n\nAPI DOCS:\n${apiDocs}\n\nWrite Phase 1: The structured PRD.`
      const d1 = await apiCall({ message: p1, system: sys1, engine: 'gpt' })
      set({ prd: d1.content })

      set({ loadingText: lang === 'id' ? 'Menunggu (5d)... Menyiapkan Arsitektur & BRD (Fase 2/3)' : 'Waiting (5s)... Preparing Architecture & BRD (Phase 2/3)' })
      await new Promise(r => setTimeout(r, 5000))

      set({ loadingText: lang === 'id' ? 'Menyusun Arsitektur & BRD (Fase 2/3)...' : 'Compiling Architecture & BRD (Phase 2/3)...' })
      const sys2 = 'You are an elite System Architect. NO PREAMBLE.\n1. Create Business Requirements Document (BRD) section.\n2. Create Detailed Tech Stack section.\n3. Create API Documentation listing internal endpoints, methods, and JSON payloads.\n4. Create Entity Relationship Diagram using mermaid erDiagram syntax, followed by DB schema table.\n5. Tie perfectly into the given PRD.'
      const p2 = `Here is the PRD:\n\n${S.prd}\n\nWrite Phase 2: BRD, Tech Stack Details, Internal API Endpoints & Payloads, ERD (Mermaid) + DB Schema.`
      const d2 = await apiCall({ message: p2, system: sys2, engine: 'gpt' })
      setS((prev: State) => ({ ...prev, prd: prev.prd + '\n\n---\n\n' + d2.content }))

      set({ loadingText: lang === 'id' ? 'Menunggu (5d)... Menyiapkan UI/UX Mockup (Fase 3/3)' : 'Waiting (5s)... Preparing UI/UX Mockups (Phase 3/3)' })
      await new Promise(r => setTimeout(r, 5000))

      set({ loadingText: lang === 'id' ? 'Menyusun UI/UX ASCII Mockup (Fase 3/3)...' : 'Compiling UI/UX ASCII Mockups (Phase 3/3)...' })
      const sys3 = 'You are an elite UX/UI Designer. NO PREAMBLE.\n1. Create UI/UX Structure section outlining main screens.\n2. Create 2-3 ASCII Art wireframes inside markdown code blocks for critical screens.\n3. Keep it practical for programmers.'
      const p3 = `Here is the PRD & Arch:\n\n${S.prd}\n\nWrite Phase 3: UI/UX Structure and ASCII wireframes for the main screens.`
      const d3 = await apiCall({ message: p3, system: sys3, engine: 'gpt' })
      setS((prev: State) => ({ ...prev, prd: prev.prd + '\n\n---\n\n' + d3.content, isGenerating: false }))
    } catch (e: any) {
      set({ isGenerating: false })
      setError(e.message)
    }
  }

  const copyPRD = () => {
    navigator.clipboard.writeText(S.prd)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const stepLabels = STEPS[lang]

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <FileText size={18} className="text-[var(--m-blue-light)]" />
              <span className="text-xs font-semibold uppercase tracking-widest text-[var(--muted)]">
                {lang === 'id' ? 'PRD Generator' : 'PRD Generator'}
              </span>
            </div>
            <h1 className="font-bold text-2xl font-bold text-[var(--ink)]">
              {lang === 'id' ? 'Buat Product Requirements Document' : 'Create Product Requirements Document'}
            </h1>
          </div>
          <button onClick={reset} className="flex items-center gap-1.5 text-sm text-[var(--muted)] hover:text-[var(--ink)] transition-colors">
            <RotateCcw size={14} />
            {lang === 'id' ? 'Reset' : 'Reset'}
          </button>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center gap-2 mb-10">
          {stepLabels.map((label, i) => {
            const step = (i + 1) as Step
            const isActive = S.step === step
            const isDone = S.step > step
            return (
              <div key={label} className="flex items-center gap-2">
                <div className={cn('flex items-center gap-2 text-sm font-medium transition-all', isActive && 'text-[var(--m-blue-light)]', isDone && 'text-[var(--muted)]', !isActive && !isDone && 'text-[var(--muted)]')}>
                  <div className={cn('w-7 h-7 rounded-none flex items-center justify-center text-xs font-bold border-2 transition-all', isActive && 'border-[var(--m-blue-light)] bg-[rgba(28,105,212,0.08)] text-[var(--m-blue-light)]', isDone && 'border-[var(--m-blue-dark)] bg-[var(--m-blue-dark)] text-white', !isActive && !isDone && 'border-[var(--hairline)] text-[var(--muted)]')}>
                    {isDone ? <Check size={12} /> : step}
                  </div>
                  <span className="hidden sm:block">{label}</span>
                </div>
                {i < 2 && <ChevronRight size={14} className="text-[var(--hairline)]" />}
              </div>
            )
          })}
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-none border border-red-500/30 bg-red-500/5 text-red-500 text-sm">
            {error}
          </div>
        )}

        {/* Step 1: Input */}
        {S.step === 1 && !S.concept && (
          <div className="max-w-3xl mx-auto animate-slide-up">
            <div className="card p-8 mb-6">
              <label className="block text-xs font-mono font-semibold uppercase tracking-widest text-[var(--m-blue-light)] mb-4">
                {lang === 'id' ? 'Konsep Produkmu' : 'Your Product Concept'}
              </label>
              <textarea
                rows={4}
                value={S.userInput}
                onChange={e => set({ userInput: e.target.value })}
                placeholder={lang === 'id' ? 'Deskripsikan ide applikasi kamu (misal: Marketplace untuk chef lokal pesan masakan...)' : 'Describe your app idea (e.g., A marketplace for local chefs to sell home-cooked meals...)'}
                className="input-base resize-none mb-5"
              />
              <button
                disabled={!S.userInput.trim() || loading}
                onClick={() => { set({ userInput: S.userInput }); refineConcept(S.userInput) }}
                className="btn-gold flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : <><span>{lang === 'id' ? 'Analisis Konsep' : 'Analyze Concept'}</span><ArrowRight size={15} /></>}
              </button>
            </div>
          </div>
        )}

        {/* Step 1: Concept Review */}
        {S.step === 1 && S.concept && (
          <div className="animate-slide-up grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <div className="card p-8">
                <h2 className="text-sm font-mono font-semibold text-[var(--m-blue-light)] uppercase tracking-widest mb-5">
                  {lang === 'id' ? 'Hasil Penyempurnaan Konsep' : 'Refined Concept'}
                </h2>
                <div className="prd-content" dangerouslySetInnerHTML={{ __html: renderMarkdown(S.concept) }} />
              </div>
            </div>
            <div className="space-y-4">
              <div className="card p-5">
                <h3 className="text-xs font-mono text-[var(--muted)] uppercase mb-3">{lang === 'id' ? 'Revisi / Feedback' : 'Revision / Feedback'}</h3>
                <textarea
                  rows={4}
                  value={revInput}
                  onChange={e => setRevInput(e.target.value)}
                  className="input-base resize-none mb-3"
                  placeholder={lang === 'id' ? 'Ada yang perlu diubah? Ketik di sini...' : 'Need changes? Type here...'}
                />
                <button
                  onClick={() => { refineConcept(S.concept + '\n\nUser Revision: ' + revInput); setRevInput('') }}
                  disabled={!revInput.trim() || loading}
                  className="w-full py-2.5 rounded-none border border-[var(--hairline)] text-sm font-medium text-[var(--body)] hover:border-[rgba(28,105,212,0.30)] transition-all disabled:opacity-50"
                >
                  {lang === 'id' ? 'Perbarui Konsep' : 'Update Concept'}
                </button>
              </div>
              <button
                onClick={startPlanning}
                className="btn-gold w-full flex items-center justify-center gap-2"
              >
                {lang === 'id' ? 'Lanjut ke Arsitektur' : 'Proceed to Architecture'}
                <ArrowRight size={15} />
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Tech Stack Selection */}
        {S.step === 2 && !loading && S.categories.length > 0 && (
          <div className="animate-slide-up max-w-5xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="font-bold text-2xl font-bold text-[var(--ink)] mb-2">
                {lang === 'id' ? 'Pilih Tech Stack' : 'Choose Tech Stack'}
              </h2>
              <p className="text-sm text-[var(--muted)]">
                {lang === 'id' ? 'Pilih satu opsi untuk setiap lapisan aplikasimu' : 'Select one option for each layer of your application'}
              </p>
            </div>

            {S.research && (
              <div className="card border-[rgba(28,105,212,0.30)] bg-[rgba(28,105,212,0.08)]/30 p-5 mb-8">
                <h3 className="text-xs font-mono font-semibold text-[var(--m-blue-light)] uppercase mb-3">
                  ◆ Sonar Market Insights 2025
                </h3>
                <div className="prd-content text-sm" dangerouslySetInnerHTML={{ __html: renderMarkdown(S.research) }} />
              </div>
            )}

            {S.categories.map(cat => (
              <div key={cat.id} className="mb-7">
                <h3 className="text-base font-semibold text-[var(--ink)] mb-3 flex items-center gap-2">
                  <span className="w-1.5 h-5 rounded-none bg-[var(--m-blue-light)]" />
                  {cat.name}
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {cat.options.map(opt => (
                    <label key={opt.name} className="cursor-pointer relative mt-3 block">
                      <input
                        type="radio" name={`cat_${cat.id}`} value={opt.name} className="hidden"
                        onChange={() => setSelStack(p => ({ ...p, [cat.id]: opt.name }))}
                      />
                      <div className={cn(
                        'card p-4 h-full transition-all relative flex flex-col min-h-[90px]',
                        selStack[cat.id] === opt.name && 'border-[var(--m-blue-light)] bg-[rgba(28,105,212,0.08)]/40 shadow-md'
                      )}>
                        {opt.badge && (
                          <span className="absolute -top-2.5 right-2 bg-[var(--m-blue-light)] text-white text-[9px] font-bold px-2 py-0.5 rounded-none uppercase tracking-wider">
                            {opt.badge}
                          </span>
                        )}
                        {selStack[cat.id] === opt.name && (
                          <div className="absolute top-2 left-2 w-4 h-4 bg-[var(--m-blue-light)] rounded-none flex items-center justify-center">
                            <Check size={9} className="text-white" />
                          </div>
                        )}
                        <h4 className="text-sm font-bold text-[var(--ink)] mb-1.5 mt-1">{opt.name}</h4>
                        <p className="text-xs text-[var(--muted)] leading-relaxed flex-1">{opt.description}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            ))}

            <div className="card p-5 mb-4 flex flex-col sm:flex-row gap-4 items-center">
              <div className="flex-1 w-full">
                <label className="block text-xs font-mono text-[var(--muted)] uppercase mb-2">
                  {lang === 'id' ? 'Catatan Tambahan (Opsional)' : 'Additional Notes (Optional)'}
                </label>
                <input
                  type="text" value={userNote} onChange={e => setUserNote(e.target.value)}
                  className="input-base"
                  placeholder={lang === 'id' ? 'misal: Timeline 3 minggu, prioritas fitur payment...' : 'e.g., Timeline 3 weeks, priority on payment features...'}
                />
              </div>
              <button onClick={generatePRD} className="btn-gold shrink-0 flex items-center gap-2">
                {lang === 'id' ? 'Generate PRD' : 'Generate PRD'}
                <ArrowRight size={15} />
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Loading */}
        {S.step === 2 && loading && (
          <div className="flex flex-col items-center justify-center py-24 animate-slide-up">
            <Loader2 size={40} className="text-[var(--m-blue-light)] animate-spin mb-4" />
            <h2 className="text-lg font-semibold text-[var(--ink)] mb-1">
              {lang === 'id' ? 'Menganalisis Arsitektur...' : 'Analyzing Architecture...'}
            </h2>
            <p className="text-sm text-[var(--muted)] font-mono">
              {lang === 'id' ? 'Memproses model, evaluasi tech stack' : 'Processing models, evaluating tech stacks'}
            </p>
          </div>
        )}

        {/* Step 3: PRD Output */}
        {S.step === 3 && (
          <div className="animate-slide-up max-w-4xl mx-auto">
            {!S.prd && S.isGenerating && (
              <div className="flex flex-col items-center justify-center py-24">
                <Loader2 size={40} className="text-[var(--m-blue-light)] animate-spin mb-4" />
                <h2 className="text-lg font-semibold text-[var(--ink)] mb-1">{S.loadingText}</h2>
                <p className="text-xs font-mono text-[var(--muted)]">
                  {lang === 'id' ? 'Menghasilkan dokumen lengkap...' : 'Generating complete document...'}
                </p>
              </div>
            )}

            {S.prd && (
              <>
                <div className="flex items-center justify-between mb-6 pb-5 border-b border-[var(--hairline)]">
                  <div>
                    <h2 className="font-bold text-2xl font-bold text-[var(--ink)]">
                      {lang === 'id' ? 'Dokumen Final' : 'Final Document'}
                    </h2>
                    <p className="text-xs font-mono mt-1">
                      <span className={S.isGenerating ? 'text-amber-500' : 'text-emerald-500'}>
                        ● {S.isGenerating ? (lang === 'id' ? 'Sedang dibuat...' : 'Generating...') : (lang === 'id' ? 'Siap untuk Engineering' : 'Ready for Engineering')}
                      </span>
                    </p>
                  </div>
                  <button onClick={copyPRD} className="btn-gold flex items-center gap-2">
                    {copied ? <Check size={14} /> : <Copy size={14} />}
                    {copied ? 'Copied!' : 'Copy Markdown'}
                  </button>
                </div>

                <div className="card p-8 prd-content" dangerouslySetInnerHTML={{ __html: renderMarkdown(S.prd) }} />

                {S.isGenerating && (
                  <div className="flex items-center gap-2 mt-4 text-[var(--m-blue-light)] text-sm font-mono animate-pulse">
                    <Loader2 size={14} className="animate-spin" />
                    {S.loadingText}
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function renderMarkdown(text: string): string {
  if (typeof window === 'undefined') return text
  try {
    // Simple safe markdown render
    return text
      .replace(/^### (.+)$/gm, '<h3>$1</h3>')
      .replace(/^## (.+)$/gm, '<h2>$1</h2>')
      .replace(/^# (.+)$/gm, '<h1>$1</h1>')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      .replace(/^- (.+)$/gm, '<li>$1</li>')
      .replace(/((?:<li>[\s\S]*?<\/li>\s*)+)/, '<ul>$1</ul>')
      .replace(/\n\n/g, '</p><p>')
      .replace(/^(?!<[hlu])/gm, '')
  } catch { return text }
}
