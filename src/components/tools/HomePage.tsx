'use client'
import { useEffect, useRef } from 'react'
import { FileText, Network, GitBranch, ArrowRight, Zap, Shield, BookOpen } from 'lucide-react'
import type { Lang } from '@/lib/i18n'

interface HomePageProps {
  lang: Lang
  onToolChange: (tool: string) => void
}

const TOOLS = [
  {
    id: 'prd',
    icon: FileText,
    label: { id: 'PRD GENERATOR', en: 'PRD GENERATOR' },
    desc: {
      id: 'Hasilkan Product Requirements Document lengkap dengan AI — arsitektur, ERD, API docs, dan wireframe ASCII.',
      en: 'Generate complete PRDs with AI — architecture, ERD, API docs, and ASCII wireframes included.',
    },
    badge: { id: 'PALING POPULER', en: 'MOST POPULAR' },
    badgeColor: 'var(--m-blue-dark)',
  },
  {
    id: 'diagram',
    icon: Network,
    label: { id: 'DIAGRAM SISTEM', en: 'SYSTEM DIAGRAM' },
    desc: {
      id: 'Canvas visual untuk merancang infrastruktur — server, database, CDN, firewall — tersambung dengan panah berlabel.',
      en: 'Visual canvas to design infrastructure — servers, databases, CDN, firewalls — with labeled arrows.',
    },
    badge: { id: 'BARU', en: 'NEW' },
    badgeColor: 'var(--m-red)',
  },
  {
    id: 'flowchart',
    icon: GitBranch,
    label: { id: 'FLOWCHART BUILDER', en: 'FLOWCHART BUILDER' },
    desc: {
      id: 'Semua simbol standar flowchart ISO 5807. Drag, sambungkan, beri label, dan ekspor ke PNG/SVG.',
      en: 'All ISO 5807 standard flowchart symbols. Drag, connect, label, and export to PNG/SVG.',
    },
    badge: { id: 'PRO', en: 'PRO' },
    badgeColor: 'var(--m-blue-light)',
  },
  {
    id: 'docs',
    icon: BookOpen,
    label: { id: 'DOKUMENTASI', en: 'DOCUMENTATION' },
    desc: {
      id: 'Referensi lengkap platform — panduan penggunaan, API reference, konfigurasi, dan deployment.',
      en: 'Complete platform reference — usage guides, API reference, configuration, and deployment.',
    },
    badge: { id: 'REFERENSI', en: 'REFERENCE' },
    badgeColor: 'var(--carbon-gray)',
  },
  {
    id: 'cv',
    icon: FileText,
    label: { id: 'CV GENERATOR', en: 'CV GENERATOR' },
    desc: {
      id: '6 template profesional, ATS optimizer, AI enhance, dan download PDF. Tingkatkan peluang diterima kerja hingga 90%.',
      en: '6 professional templates, ATS optimizer, AI enhance, and PDF download. Increase your hiring chance up to 90%.',
    },
    badge: { id: 'BARU', en: 'NEW' },
    badgeColor: 'var(--success)',
  },
]

const SPECS = [
  { value: '3', label: { id: 'TOOLS AKTIF', en: 'ACTIVE TOOLS' } },
  { value: 'AI', label: { id: 'POWERED', en: 'POWERED' } },
  { value: '0ms', label: { id: 'DATA DISIMPAN', en: 'DATA STORED' } },
  { value: '100%', label: { id: 'OPEN SOURCE', en: 'OPEN SOURCE' } },
]

export default function HomePage({ lang, onToolChange }: HomePageProps) {
  const heroRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = heroRef.current
    if (!el) return
    el.style.opacity = '0'
    el.style.transform = 'translateY(24px)'
    requestAnimationFrame(() => {
      el.style.transition = 'opacity 0.8s cubic-bezier(0.16,1,0.3,1), transform 0.8s cubic-bezier(0.16,1,0.3,1)'
      el.style.opacity = '1'
      el.style.transform = 'translateY(0)'
    })
  }, [])

  return (
    <div style={{ background: 'var(--canvas)', minHeight: '100vh' }}>

      {/* ── HERO BAND ── */}
      <section ref={heroRef} style={{ paddingTop: 128, paddingBottom: 96, maxWidth: 1440, margin: '0 auto', padding: '128px 48px 96px' }}>
        <p className="label-uppercase mb-6" style={{ color: 'var(--m-blue-light)' }}>
          {lang === 'id' ? 'PLATFORM TOOLS IT PROFESIONAL' : 'PROFESSIONAL IT TOOLS PLATFORM'}
        </p>

        <h1 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(40px, 6vw, 80px)',
          fontWeight: 700,
          lineHeight: 1,
          color: 'var(--ink)',
          textTransform: 'uppercase',
          letterSpacing: 0,
          marginBottom: 32,
          maxWidth: 900,
        }}>
          {lang === 'id'
            ? <>SEMUA YANG KAMU BUTUHKAN<br />UNTUK MEMBANGUN<br /><span style={{ color: 'var(--m-blue-light)' }}>PRODUK DIGITAL</span></>
            : <>EVERYTHING YOU NEED<br />TO BUILD YOUR<br /><span style={{ color: 'var(--m-blue-light)' }}>DIGITAL PRODUCT</span></>
          }
        </h1>

        <p style={{ fontSize: 18, fontWeight: 300, color: 'var(--body)', lineHeight: 1.6, maxWidth: 560, marginBottom: 48 }}>
          {lang === 'id'
            ? 'PRD Generator AI, Diagram Sistem visual, dan Flowchart Builder — semua dalam satu platform berkecepatan tinggi.'
            : 'AI PRD Generator, visual System Diagram, and Flowchart Builder — all in one high-performance platform.'}
        </p>

        <div className="flex flex-wrap gap-4">
          <button className="btn-m-filled" onClick={() => onToolChange('prd')}>
            {lang === 'id' ? 'MULAI SEKARANG' : 'GET STARTED'}
          </button>
          <button className="btn-m" onClick={() => onToolChange('docs')} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {lang === 'id' ? 'DOKUMENTASI' : 'DOCUMENTATION'}
            <ArrowRight size={14} />
          </button>
        </div>
      </section>

      {/* ── M STRIPE DIVIDER ── */}
      <div className="m-stripe" />

      {/* ── SPEC BAND ── */}
      <section style={{ background: 'var(--surface-soft)', padding: '40px 48px', maxWidth: 1440, margin: '0 auto' }}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {SPECS.map((s) => (
            <div key={s.value}>
              <p style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 700, color: 'var(--ink)', lineHeight: 1, marginBottom: 8 }}>
                {s.value}
              </p>
              <p className="label-uppercase" style={{ color: 'var(--muted)' }}>
                {s.label[lang]}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── M STRIPE DIVIDER ── */}
      <div className="m-stripe" />

      {/* ── TOOLS GRID ── */}
      <section style={{ maxWidth: 1440, margin: '0 auto', padding: '96px 48px' }}>
        <p className="label-uppercase mb-4" style={{ color: 'var(--muted)' }}>
          {lang === 'id' ? 'TOOLS TERSEDIA' : 'AVAILABLE TOOLS'}
        </p>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 40, fontWeight: 700, color: 'var(--ink)', textTransform: 'uppercase', marginBottom: 48 }}>
          {lang === 'id' ? 'PILIH TOOLS KAMU' : 'SELECT YOUR TOOL'}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-px" style={{ border: '1px solid var(--hairline)' }}>
          {TOOLS.map((tool) => {
            const Icon = tool.icon
            return (
              <button
                key={tool.id}
                onClick={() => onToolChange(tool.id)}
                className="group text-left"
                style={{
                  background: 'var(--surface-card)',
                  padding: 32,
                  borderRight: '1px solid var(--hairline)',
                  borderBottom: '1px solid var(--hairline)',
                  transition: 'background 0.2s',
                  cursor: 'pointer',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--surface-elevated)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'var(--surface-card)')}
              >
                <div className="flex items-start justify-between mb-6">
                  <div style={{
                    width: 48, height: 48,
                    background: 'var(--canvas)',
                    border: '1px solid var(--hairline)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    <Icon size={20} color="var(--ink)" />
                  </div>
                  <span style={{
                    fontSize: 10, fontWeight: 700, letterSpacing: '1.5px',
                    padding: '4px 8px', background: tool.badgeColor,
                    color: 'var(--ink)', textTransform: 'uppercase',
                  }}>
                    {tool.badge[lang]}
                  </span>
                </div>

                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, color: 'var(--ink)', marginBottom: 12, letterSpacing: 0.5 }}>
                  {tool.label[lang]}
                </h3>
                <p style={{ fontSize: 14, fontWeight: 300, color: 'var(--body)', lineHeight: 1.6, marginBottom: 24 }}>
                  {tool.desc[lang]}
                </p>
                <div className="flex items-center gap-2" style={{ fontSize: 13, fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--muted)' }}>
                  {lang === 'id' ? 'BUKA TOOL' : 'OPEN TOOL'}
                  <ArrowRight size={13} />
                </div>
              </button>
            )
          })}
        </div>
      </section>

      {/* ── M STRIPE ── */}
      <div className="m-stripe" />

      {/* ── FEATURE BAND ── */}
      <section style={{ background: 'var(--surface-soft)', padding: '96px 48px', maxWidth: 1440, margin: '0 auto' }}>
        <p className="label-uppercase mb-4" style={{ color: 'var(--muted)' }}>
          {lang === 'id' ? 'KEUNGGULAN' : 'ADVANTAGES'}
        </p>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 40, fontWeight: 700, color: 'var(--ink)', textTransform: 'uppercase', marginBottom: 48 }}>
          {lang === 'id' ? 'DIRANCANG UNTUK PRESISI' : 'ENGINEERED FOR PRECISION'}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-px" style={{ border: '1px solid var(--hairline)' }}>
          {[
            { icon: Zap, title: { id: 'AI-POWERED', en: 'AI-POWERED' }, body: { id: 'Didukung model AI terkini GPT & Sonar untuk dokumentasi yang akurat dan komprehensif.', en: 'Powered by latest GPT & Sonar AI models for accurate, comprehensive documentation.' } },
            { icon: Shield, title: { id: 'AMAN & PRIVAT', en: 'SAFE & PRIVATE' }, body: { id: 'Data tidak disimpan di server. Semua proses berjalan di browser kamu sendiri.', en: 'Data is not stored on server. All processing runs in your own browser.' } },
            { icon: Network, title: { id: 'EXPORT LENGKAP', en: 'FULL EXPORT' }, body: { id: 'Export ke Markdown, SVG, PNG. Kompatibel dengan semua platform modern.', en: 'Export to Markdown, SVG, PNG. Compatible with all modern platforms.' } },
          ].map(({ icon: Icon, title, body }) => (
            <div key={title.en} style={{ background: 'var(--surface-card)', padding: 32, borderRight: '1px solid var(--hairline)' }}>
              <Icon size={24} color="var(--m-blue-light)" style={{ marginBottom: 20 }} />
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, color: 'var(--ink)', letterSpacing: 0.5, marginBottom: 12 }}>
                {title[lang]}
              </h3>
              <p style={{ fontSize: 14, fontWeight: 300, color: 'var(--body)', lineHeight: 1.6 }}>
                {body[lang]}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA BAND ── */}
      <section style={{ background: 'var(--canvas)', padding: '96px 48px', maxWidth: 1440, margin: '0 auto', textAlign: 'center' }}>
        <div className="m-stripe mb-12 mx-auto" style={{ maxWidth: 80 }} />
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(32px, 4vw, 56px)', fontWeight: 700, color: 'var(--ink)', textTransform: 'uppercase', marginBottom: 24, letterSpacing: 0 }}>
          {lang === 'id' ? 'SIAP MEMULAI?' : 'READY TO START?'}
        </h2>
        <p style={{ fontSize: 16, fontWeight: 300, color: 'var(--body)', marginBottom: 40, maxWidth: 480, margin: '0 auto 40px' }}>
          {lang === 'id'
            ? 'Mulai buat PRD, diagram, atau flowchart kamu sekarang — gratis.'
            : 'Start creating your PRD, diagram, or flowchart now — for free.'}
        </p>
        <button className="btn-m-filled" onClick={() => onToolChange('prd')}>
          {lang === 'id' ? 'MULAI GRATIS' : 'START FOR FREE'}
        </button>
      </section>

    </div>
  )
}
