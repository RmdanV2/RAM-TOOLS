'use client'
import { useEffect, useState } from 'react'
import { Globe, Menu, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface NavbarProps {
  lang: 'id' | 'en'
  onLangChange: (lang: 'id' | 'en') => void
  activeTool: string
  onToolChange: (tool: string) => void
}

const TOOLS = [
  { id: 'home',      label: { id: 'Beranda',      en: 'Home' } },
  { id: 'prd',       label: { id: 'PRD Generator', en: 'PRD Generator' } },
  { id: 'diagram',   label: { id: 'Diagram Sistem', en: 'System Diagram' } },
  { id: 'flowchart', label: { id: 'Flowchart',     en: 'Flowchart' } },
  { id: 'docs',      label: { id: 'Dokumentasi',   en: 'Documentation' } },
]

export default function Navbar({ lang, onLangChange, activeTool, onToolChange }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', handler)
    return () => window.removeEventListener('scroll', handler)
  }, [])

  return (
    <>
      <header
        className={cn(
          'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
          scrolled ? 'bg-[#000]/95 backdrop-blur-sm border-b border-[var(--hairline)]' : 'bg-[#000]'
        )}
        style={{ height: 64 }}
      >
        {/* M stripe at very top */}
        <div className="m-stripe" style={{ height: 3 }} />

        <div className="max-w-[1440px] mx-auto px-6 lg:px-12 flex items-center justify-between" style={{ height: 61 }}>

          {/* Logo — M wordmark style */}
          <button
            onClick={() => { onToolChange('home'); setMobileOpen(false) }}
            className="flex items-center gap-3 group"
          >
            {/* M Tricolor badge */}
            <div className="flex h-7 overflow-hidden" style={{ borderRadius: 0 }}>
              <div style={{ width: 8, background: 'var(--m-blue-light)' }} />
              <div style={{ width: 8, background: 'var(--m-blue-dark)' }} />
              <div style={{ width: 8, background: 'var(--m-red)' }} />
            </div>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--ink)' }}>
              RAM<span style={{ color: 'var(--m-blue-light)' }}>M</span>
            </span>
          </button>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            {TOOLS.map((tool) => (
              <button
                key={tool.id}
                onClick={() => onToolChange(tool.id)}
                className={cn(
                  'relative py-2 transition-colors duration-200',
                  'text-sm tracking-[0.5px]',
                  activeTool === tool.id
                    ? 'text-[var(--ink)] font-medium'
                    : 'text-[var(--muted)] hover:text-[var(--body-strong)]'
                )}
                style={{ fontFamily: 'var(--font-display)', fontSize: 13, letterSpacing: '0.5px' }}
              >
                {tool.label[lang]}
                {/* Active underline — white */}
                {activeTool === tool.id && (
                  <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[var(--ink)]" />
                )}
              </button>
            ))}
          </nav>

          {/* Right controls */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => onLangChange(lang === 'id' ? 'en' : 'id')}
              className="flex items-center gap-1.5 text-[var(--muted)] hover:text-[var(--ink)] transition-colors"
              style={{ fontFamily: 'var(--font-display)', fontSize: 12, fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase' }}
            >
              <Globe size={13} />
              {lang.toUpperCase()}
            </button>

            {/* Mobile hamburger */}
            <button
              className="md:hidden text-[var(--muted)] hover:text-[var(--ink)] transition-colors"
              onClick={() => setMobileOpen(v => !v)}
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile full-screen overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 flex flex-col" style={{ background: 'var(--canvas)', paddingTop: 64 }}>
          <div className="m-stripe" style={{ height: 4 }} />
          <nav className="flex flex-col px-6 pt-10 gap-1">
            {TOOLS.map((tool) => (
              <button
                key={tool.id}
                onClick={() => { onToolChange(tool.id); setMobileOpen(false) }}
                className="text-left py-4 border-b border-[var(--hairline)]"
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 20,
                  fontWeight: activeTool === tool.id ? 700 : 300,
                  color: activeTool === tool.id ? 'var(--ink)' : 'var(--body)',
                  textTransform: 'uppercase',
                  letterSpacing: 1
                }}
              >
                {tool.label[lang]}
              </button>
            ))}
          </nav>
        </div>
      )}
    </>
  )
}
