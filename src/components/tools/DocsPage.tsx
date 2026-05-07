'use client'
import { useState, useEffect, useRef } from 'react'
import {
  BookOpen, FileText, Network, GitBranch, ChevronRight, ChevronDown,
  Search, ExternalLink, Copy, Check, Code2, Layers, Zap, Shield,
  TerminalSquare, Settings2, ArrowRight, Info, AlertTriangle, CheckCircle2,
  Hash, Link2, Package, Database, Server, Globe,
  type LucideIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Lang } from '@/lib/i18n'

interface DocsPageProps {
  lang: Lang
}

// ─── Types ───────────────────────────────────────────────────────────────────
interface DocSection {
  id: string
  title: { id: string; en: string }
  icon: LucideIcon
  subsections: DocSubsection[]
}

interface DocSubsection {
  id: string
  title: { id: string; en: string }
}

// ─── Nav Structure ────────────────────────────────────────────────────────────
const DOCS_NAV: DocSection[] = [
  {
    id: 'introduction',
    title: { id: 'Pengenalan', en: 'Introduction' },
    icon: BookOpen,
    subsections: [
      { id: 'overview',        title: { id: 'Ringkasan Platform',     en: 'Platform Overview' } },
      { id: 'quickstart',      title: { id: 'Mulai Cepat',            en: 'Quick Start' } },
      { id: 'architecture',    title: { id: 'Arsitektur Sistem',       en: 'System Architecture' } },
    ],
  },
  {
    id: 'prd-tool',
    title: { id: 'PRD Generator', en: 'PRD Generator' },
    icon: FileText,
    subsections: [
      { id: 'prd-overview',    title: { id: 'Cara Kerja',              en: 'How It Works' } },
      { id: 'prd-steps',       title: { id: 'Alur Tiga Langkah',      en: 'Three-Step Flow' } },
      { id: 'prd-output',      title: { id: 'Format Output',           en: 'Output Format' } },
      { id: 'prd-api',         title: { id: 'Konfigurasi API',         en: 'API Configuration' } },
    ],
  },
  {
    id: 'diagram-tool',
    title: { id: 'Diagram Sistem', en: 'System Diagram' },
    icon: Network,
    subsections: [
      { id: 'diagram-overview',title: { id: 'Cara Kerja',              en: 'How It Works' } },
      { id: 'diagram-nodes',   title: { id: 'Komponen Node',           en: 'Node Components' } },
      { id: 'diagram-arrows',  title: { id: 'Koneksi & Panah',         en: 'Connections & Arrows' } },
      { id: 'diagram-export',  title: { id: 'Export SVG',              en: 'Export SVG' } },
    ],
  },
  {
    id: 'flowchart-tool',
    title: { id: 'Flowchart Builder', en: 'Flowchart Builder' },
    icon: GitBranch,
    subsections: [
      { id: 'flow-overview',   title: { id: 'Cara Kerja',              en: 'How It Works' } },
      { id: 'flow-shapes',     title: { id: 'Bentuk Standar',          en: 'Standard Shapes' } },
      { id: 'flow-connections',title: { id: 'Menghubungkan Node',      en: 'Connecting Nodes' } },
      { id: 'flow-export',     title: { id: 'Export PNG / SVG',        en: 'Export PNG / SVG' } },
    ],
  },
  {
    id: 'configuration',
    title: { id: 'Konfigurasi', en: 'Configuration' },
    icon: Settings2,
    subsections: [
      { id: 'env-vars',        title: { id: 'Environment Variables',   en: 'Environment Variables' } },
      { id: 'deployment',      title: { id: 'Deployment',              en: 'Deployment' } },
      { id: 'theming',         title: { id: 'Tema & Styling',          en: 'Theming & Styling' } },
    ],
  },
  {
    id: 'api-reference',
    title: { id: 'Referensi API', en: 'API Reference' },
    icon: Code2,
    subsections: [
      { id: 'api-prd-chat',    title: { id: 'POST /api/prd-chat',      en: 'POST /api/prd-chat' } },
      { id: 'api-errors',      title: { id: 'Penanganan Error',        en: 'Error Handling' } },
    ],
  },
]

// ─── Code Block ───────────────────────────────────────────────────────────────
function CodeBlock({ code, language = 'bash' }: { code: string; language?: string }) {
  const [copied, setCopied] = useState(false)
  const copy = () => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <div className="relative group my-4 rounded-none border border-[var(--hairline)] overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 bg-[var(--surface-soft)] border-b border-[var(--hairline)]">
        <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[var(--muted)]">{language}</span>
        <button onClick={copy} className="flex items-center gap-1.5 text-[10px] font-medium text-[var(--muted)] hover:text-[var(--m-blue-light)] transition-colors">
          {copied ? <Check size={11} /> : <Copy size={11} />}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <pre className="p-4 overflow-x-auto bg-[var(--surface-card)]">
        <code className="text-xs font-mono text-[var(--body)] leading-relaxed whitespace-pre">{code}</code>
      </pre>
    </div>
  )
}

// ─── Callout ──────────────────────────────────────────────────────────────────
type CalloutType = 'info' | 'warning' | 'success'
function Callout({ type, children }: { type: CalloutType; children: React.ReactNode }) {
  const styles: Record<CalloutType, { border: string; bg: string; icon: React.ReactNode }> = {
    info:    { border: 'border-blue-500/30',  bg: 'bg-blue-500/5',  icon: <Info size={14} className="text-blue-400 flex-shrink-0 mt-0.5" /> },
    warning: { border: 'border-amber-500/30', bg: 'bg-amber-500/5', icon: <AlertTriangle size={14} className="text-amber-400 flex-shrink-0 mt-0.5" /> },
    success: { border: 'border-green-500/30', bg: 'bg-green-500/5', icon: <CheckCircle2 size={14} className="text-green-400 flex-shrink-0 mt-0.5" /> },
  }
  const s = styles[type]
  return (
    <div className={cn('flex gap-3 p-4 rounded-none border my-4 text-sm text-[var(--body)] leading-relaxed', s.border, s.bg)}>
      {s.icon}
      <div>{children}</div>
    </div>
  )
}

// ─── Section Heading ─────────────────────────────────────────────────────────
function SectionH2({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <h2 id={id} className="flex items-center gap-2 text-xl font-bold text-[var(--ink)] mt-10 mb-4 pb-2 border-b border-[var(--hairline)] scroll-mt-24">
      <Hash size={16} className="text-[var(--m-blue-light)]" />
      {children}
    </h2>
  )
}

function SectionH3({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <h3 id={id} className="text-base font-semibold text-[var(--ink)] mt-7 mb-3 scroll-mt-24">{children}</h3>
  )
}

function Para({ children }: { children: React.ReactNode }) {
  return <p className="text-sm text-[var(--body)] leading-relaxed mb-3">{children}</p>
}

function UL({ items }: { items: string[] }) {
  return (
    <ul className="my-3 space-y-1.5">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-2 text-sm text-[var(--body)] leading-relaxed">
          <ChevronRight size={13} className="text-[var(--m-blue-light)] flex-shrink-0 mt-0.5" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  )
}

// ─── Badge ────────────────────────────────────────────────────────────────────
function Badge({ children, color = 'gold' }: { children: React.ReactNode; color?: 'gold' | 'blue' | 'green' | 'red' }) {
  const cls: Record<string, string> = {
    gold:  'bg-[rgba(28,105,212,0.08)] text-[var(--m-blue-light)] border-[rgba(28,105,212,0.30)]',
    blue:  'bg-blue-500/10 text-blue-400 border-blue-500/30',
    green: 'bg-green-500/10 text-green-400 border-green-500/30',
    red:   'bg-red-500/10 text-red-400 border-red-500/30',
  }
  return (
    <span className={cn('inline-flex items-center px-2 py-0.5 rounded-none text-[10px] font-bold uppercase tracking-wide border', cls[color])}>
      {children}
    </span>
  )
}

// ─── Node Table ───────────────────────────────────────────────────────────────
function NodeTable({ lang }: { lang: Lang }) {
  const rows = [
    { node: 'server',       icon: <Server size={13} />,   color: '#d97706', label: { id: 'Server',        en: 'Server' },        desc: { id: 'Instans server fisik/virtual',       en: 'Physical/virtual server instance' } },
    { node: 'database',     icon: <Database size={13} />, color: '#0284c7', label: { id: 'Database',      en: 'Database' },      desc: { id: 'Sistem manajemen basis data',        en: 'Database management system' } },
    { node: 'firewall',     icon: <Shield size={13} />,   color: '#dc2626', label: { id: 'Firewall',      en: 'Firewall' },      desc: { id: 'Lapisan keamanan jaringan',          en: 'Network security layer' } },
    { node: 'cdn',          icon: <Globe size={13} />,    color: '#7c3aed', label: { id: 'CDN',           en: 'CDN' },           desc: { id: 'Content Delivery Network',           en: 'Content Delivery Network' } },
    { node: 'client',       icon: <Layers size={13} />,   color: '#059669', label: { id: 'Client',        en: 'Client' },        desc: { id: 'Aplikasi browser/mobile',            en: 'Browser/mobile application' } },
    { node: 'api',          icon: <Zap size={13} />,      color: '#b45309', label: { id: 'API Gateway',   en: 'API Gateway' },   desc: { id: 'Gerbang masuk API terpusat',         en: 'Centralized API entry point' } },
    { node: 'loadbalancer', icon: <ArrowRight size={13}/>,color: '#d97706', label: { id: 'Load Balancer', en: 'Load Balancer' }, desc: { id: 'Distribusi traffic ke beberapa server', en: 'Traffic distribution across servers' } },
    { node: 'cache',        icon: <Zap size={13} />,      color: '#6d28d9', label: { id: 'Cache',         en: 'Cache' },         desc: { id: 'Penyimpanan data sementara cepat',   en: 'Fast temporary data store' } },
    { node: 'queue',        icon: <Package size={13} />,  color: '#0891b2', label: { id: 'Message Queue', en: 'Message Queue' }, desc: { id: 'Antrian pesan asinkronus',           en: 'Asynchronous message queue' } },
    { node: 'storage',      icon: <Package size={13} />,  color: '#2563eb', label: { id: 'Storage',       en: 'Storage' },       desc: { id: 'Object/blob/file storage',           en: 'Object/blob/file storage' } },
    { node: 'microservice', icon: <Layers size={13} />,   color: '#16a34a', label: { id: 'Microservice',  en: 'Microservice' },  desc: { id: 'Unit layanan mandiri',               en: 'Independent service unit' } },
    { node: 'external',     icon: <Link2 size={13} />,    color: '#9333ea', label: { id: 'External API',  en: 'External API' },  desc: { id: 'Layanan pihak ketiga eksternal',     en: 'Third-party external service' } },
  ]
  return (
    <div className="my-4 rounded-none border border-[var(--hairline)] overflow-hidden">
      <table className="w-full text-xs">
        <thead>
          <tr className="bg-[var(--surface-soft)] border-b border-[var(--hairline)]">
            <th className="px-4 py-2.5 text-left font-semibold text-[var(--muted)] uppercase tracking-wide">{lang === 'id' ? 'Tipe' : 'Type'}</th>
            <th className="px-4 py-2.5 text-left font-semibold text-[var(--muted)] uppercase tracking-wide">{lang === 'id' ? 'Label' : 'Label'}</th>
            <th className="px-4 py-2.5 text-left font-semibold text-[var(--muted)] uppercase tracking-wide">{lang === 'id' ? 'Deskripsi' : 'Description'}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={r.node} className={cn('border-b border-[var(--hairline)] last:border-0', i % 2 === 0 ? 'bg-[var(--surface-card)]' : 'bg-[var(--surface-soft)]/40')}>
              <td className="px-4 py-2.5">
                <div className="flex items-center gap-2">
                  <span style={{ color: r.color }}>{r.icon}</span>
                  <code className="font-mono text-[var(--m-blue-light)]">{r.node}</code>
                </div>
              </td>
              <td className="px-4 py-2.5 text-[var(--body)]">{r.label[lang]}</td>
              <td className="px-4 py-2.5 text-[var(--muted)]">{r.desc[lang]}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ─── Flowchart Shapes Table ───────────────────────────────────────────────────
function ShapesTable({ lang }: { lang: Lang }) {
  const shapes = [
    { type: 'terminal',   label: { id: 'Terminator',         en: 'Terminator' },         iso: 'ISO 5807',  desc: { id: 'Titik Mulai/Selesai proses',       en: 'Process Start/End point' } },
    { type: 'process',    label: { id: 'Proses',             en: 'Process' },            iso: 'ISO 5807',  desc: { id: 'Langkah atau operasi',             en: 'Step or operation' } },
    { type: 'decision',   label: { id: 'Keputusan',          en: 'Decision' },           iso: 'ISO 5807',  desc: { id: 'Percabangan Ya/Tidak',             en: 'Yes/No branch' } },
    { type: 'io',         label: { id: 'Input/Output',       en: 'Input/Output' },       iso: 'ISO 5807',  desc: { id: 'Data masuk atau keluar',           en: 'Data input or output' } },
    { type: 'predefined', label: { id: 'Proses Terdefinisi', en: 'Predefined Process' }, iso: 'ISO 5807',  desc: { id: 'Sub-rutin atau fungsi',            en: 'Sub-routine or function' } },
    { type: 'connector',  label: { id: 'Konektor',           en: 'Connector' },          iso: 'ISO 5807',  desc: { id: 'Titik penghubung antar bagian',    en: 'Connection point between sections' } },
    { type: 'database',   label: { id: 'Database',           en: 'Database' },           iso: 'ISO 5807',  desc: { id: 'Penyimpanan data persisten',       en: 'Persistent data storage' } },
    { type: 'document',   label: { id: 'Dokumen',            en: 'Document' },           iso: 'ISO 5807',  desc: { id: 'Output berbentuk dokumen',         en: 'Document-form output' } },
    { type: 'manual',     label: { id: 'Operasi Manual',     en: 'Manual Operation' },   iso: 'ISO 5807',  desc: { id: 'Langkah dilakukan manusia',        en: 'Step performed by human' } },
    { type: 'delay',      label: { id: 'Penundaan',          en: 'Delay' },              iso: 'ISO 5807',  desc: { id: 'Waktu tunggu dalam proses',        en: 'Wait time in process' } },
    { type: 'display',    label: { id: 'Tampilan',           en: 'Display' },            iso: 'ISO 5807',  desc: { id: 'Output ke layar/monitor',         en: 'Output to screen/monitor' } },
    { type: 'annotation', label: { id: 'Anotasi',            en: 'Annotation' },         iso: 'ISO 5807',  desc: { id: 'Komentar atau catatan penjelasan', en: 'Comment or explanatory note' } },
  ]
  return (
    <div className="my-4 rounded-none border border-[var(--hairline)] overflow-hidden">
      <table className="w-full text-xs">
        <thead>
          <tr className="bg-[var(--surface-soft)] border-b border-[var(--hairline)]">
            <th className="px-4 py-2.5 text-left font-semibold text-[var(--muted)] uppercase tracking-wide">{lang === 'id' ? 'Tipe' : 'Type'}</th>
            <th className="px-4 py-2.5 text-left font-semibold text-[var(--muted)] uppercase tracking-wide">{lang === 'id' ? 'Nama' : 'Name'}</th>
            <th className="px-4 py-2.5 text-left font-semibold text-[var(--muted)] uppercase tracking-wide">{lang === 'id' ? 'Standar' : 'Standard'}</th>
            <th className="px-4 py-2.5 text-left font-semibold text-[var(--muted)] uppercase tracking-wide">{lang === 'id' ? 'Kegunaan' : 'Usage'}</th>
          </tr>
        </thead>
        <tbody>
          {shapes.map((s, i) => (
            <tr key={s.type} className={cn('border-b border-[var(--hairline)] last:border-0', i % 2 === 0 ? 'bg-[var(--surface-card)]' : 'bg-[var(--surface-soft)]/40')}>
              <td className="px-4 py-2.5"><code className="font-mono text-[var(--m-blue-light)]">{s.type}</code></td>
              <td className="px-4 py-2.5 font-medium text-[var(--body)]">{s.label[lang]}</td>
              <td className="px-4 py-2.5"><Badge color="blue">{s.iso}</Badge></td>
              <td className="px-4 py-2.5 text-[var(--muted)]">{s.desc[lang]}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ─── Main Content Renderer ────────────────────────────────────────────────────
function DocContent({ activeSection, lang }: { activeSection: string; lang: Lang }) {
  const t = (id: string, en: string) => lang === 'id' ? id : en

  // INTRODUCTION
  if (activeSection === 'introduction') return (
    <div>
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <Badge>v1.0</Badge>
          <Badge color="green">{t('Stabil', 'Stable')}</Badge>
        </div>
        <h1 className="text-3xl font-bold text-[var(--ink)] mb-3">{t('Dokumentasi RAM Tools', 'RAM Tools Documentation')}</h1>
        <p className="text-base text-[var(--body)] leading-relaxed max-w-2xl">
          {t(
            'RAM Tools adalah platform all-in-one untuk kebutuhan dokumentasi dan perancangan proyek IT. Platform ini menyediakan tiga alat utama: PRD Generator berbasis AI, Diagram Sistem visual, dan Flowchart Builder berbasis standar industri.',
            'RAM Tools is an all-in-one platform for IT project documentation and design needs. It provides three core tools: an AI-powered PRD Generator, a visual System Diagram builder, and an industry-standard Flowchart Builder.'
          )}
        </p>
      </div>

      <SectionH2 id="overview">{t('Ringkasan Platform', 'Platform Overview')}</SectionH2>
      <Para>{t('Platform ini dibangun dengan Next.js 14 (App Router), TypeScript, dan Tailwind CSS. Setiap alat dirancang untuk bekerja secara mandiri namun terintegrasi dalam satu antarmuka yang konsisten.', 'The platform is built with Next.js 14 (App Router), TypeScript, and Tailwind CSS. Each tool is designed to work independently but integrated into one consistent interface.')}</Para>
      <UL items={[
        t('PRD Generator — menghasilkan dokumen lengkap dari ide produk menggunakan AI (GPT + Sonar)', 'PRD Generator — generates complete documents from product ideas using AI (GPT + Sonar)'),
        t('Diagram Sistem — canvas drag-and-drop untuk arsitektur infrastruktur', 'System Diagram — drag-and-drop canvas for infrastructure architecture'),
        t('Flowchart Builder — editor flowchart dengan semua simbol ISO 5807', 'Flowchart Builder — flowchart editor with all ISO 5807 symbols'),
        t('Dukungan bilingual (Bahasa Indonesia & English)', 'Bilingual support (Indonesian & English)'),
        t('Light/Dark mode dengan sistem tema CSS custom property', 'Light/Dark mode with custom CSS property theming system'),
      ]} />

      <SectionH2 id="quickstart">{t('Mulai Cepat', 'Quick Start')}</SectionH2>
      <Para>{t('Clone repositori dan install dependensi:', 'Clone the repository and install dependencies:')}</Para>
      <CodeBlock language="bash" code={`git clone https://github.com/your-org/ram-tools.git
cd ram-tools
npm install`} />
      <Para>{t('Salin file environment dan isi variabel yang diperlukan:', 'Copy the environment file and fill in the required variables:')}</Para>
      <CodeBlock language="bash" code={`cp .env.local.example .env.local
# Edit .env.local dengan editor favoritmu`} />
      <Para>{t('Jalankan development server:', 'Start the development server:')}</Para>
      <CodeBlock language="bash" code="npm run dev" />
      <Callout type="success">{t('Aplikasi akan berjalan di http://localhost:3000', 'The application will run at http://localhost:3000')}</Callout>

      <SectionH2 id="architecture">{t('Arsitektur Sistem', 'System Architecture')}</SectionH2>
      <Para>{t('RAM Tools menggunakan pendekatan monorepo tunggal dengan struktur direktori berikut:', 'RAM Tools uses a single monorepo approach with the following directory structure:')}</Para>
      <CodeBlock language="text" code={`ram-tools/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── prd-chat/route.ts   # API endpoint PRD
│   │   ├── globals.css             # CSS custom properties & theme
│   │   ├── layout.tsx              # Root layout + ThemeProvider
│   │   └── page.tsx                # Main app shell + routing
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Navbar.tsx          # Navigation bar
│   │   │   ├── Footer.tsx          # Footer
│   │   │   └── ThemeProvider.tsx   # next-themes wrapper
│   │   └── tools/
│   │       ├── HomePage.tsx        # Landing page
│   │       ├── PRDTool.tsx         # PRD Generator
│   │       ├── DiagramTool.tsx     # System Diagram
│   │       ├── FlowchartTool.tsx   # Flowchart Builder
│   │       └── DocsPage.tsx        # Documentation
│   └── lib/
│       ├── i18n.ts                 # Translations
│       └── utils.ts                # Utility functions
└── tailwind.config.ts`} />
    </div>
  )

  // PRD TOOL
  if (activeSection === 'prd-tool') return (
    <div>
      <h1 className="text-3xl font-bold text-[var(--ink)] mb-3">PRD Generator</h1>
      <Para>{t('PRD Generator menggunakan AI untuk mengubah ide kasar menjadi Product Requirements Document yang lengkap dan terstruktur.', 'PRD Generator uses AI to transform rough ideas into complete, structured Product Requirements Documents.')}</Para>

      <SectionH2 id="prd-overview">{t('Cara Kerja', 'How It Works')}</SectionH2>
      <Para>{t('Generator memanfaatkan dua mesin AI yang berbeda untuk tahap yang berbeda:', 'The generator leverages two different AI engines for different stages:')}</Para>
      <UL items={[
        t('GPT — untuk memroses dan menyempurnakan konsep produk, serta menghasilkan pilihan arsitektur', 'GPT — for processing and refining product concepts, and generating architecture options'),
        t('Sonar (Perplexity) — untuk riset teknologi terkini dari internet (2025–2026)', 'Sonar (Perplexity) — for researching latest technology from the internet (2025–2026)'),
      ]} />
      <Callout type="info">{t('Kedua engine dipanggil secara paralel di Step 2 untuk menghemat waktu menggunakan Promise.all().', 'Both engines are called in parallel at Step 2 to save time using Promise.all().')}</Callout>

      <SectionH2 id="prd-steps">{t('Alur Tiga Langkah', 'Three-Step Flow')}</SectionH2>
      <SectionH3 id="step1">{t('Step 1 — Konsep Produk', 'Step 1 — Product Concept')}</SectionH3>
      <Para>{t('Pengguna memasukkan ide kasar. GPT kemudian merefinasi ide tersebut menjadi konsep produk dengan elevator pitch, target pengguna, dan masalah yang diselesaikan.', 'The user enters a rough idea. GPT then refines it into a product concept with elevator pitch, target users, and problems solved.')}</Para>
      <SectionH3 id="step2">{t('Step 2 — Pemilihan Arsitektur', 'Step 2 — Architecture Selection')}</SectionH3>
      <Para>{t('GPT menghasilkan pilihan tech stack dalam 4 kategori: Frontend, Backend, Database, dan Infrastructure. Pengguna memilih satu opsi per kategori. Sonar secara bersamaan mengumpulkan tren arsitektur terkini.', 'GPT generates tech stack options in 4 categories: Frontend, Backend, Database, and Infrastructure. The user selects one option per category. Sonar simultaneously gathers the latest architecture trends.')}</Para>
      <SectionH3 id="step3">{t('Step 3 — Dokumen PRD', 'Step 3 — PRD Document')}</SectionH3>
      <Para>{t('GPT menghasilkan PRD lengkap berformat Markdown yang mencakup semua bagian standar dokumen produk profesional.', 'GPT generates a complete Markdown-formatted PRD covering all standard sections of a professional product document.')}</Para>

      <SectionH2 id="prd-output">{t('Format Output', 'Output Format')}</SectionH2>
      <Para>{t('PRD yang dihasilkan mencakup bagian-bagian berikut:', 'The generated PRD includes the following sections:')}</Para>
      <UL items={[
        t('Executive Summary — ringkasan eksekutif produk', 'Executive Summary — product executive summary'),
        t('Problem Statement & Goals — pernyataan masalah dan tujuan', 'Problem Statement & Goals — problem statement and objectives'),
        t('User Personas & User Stories — persona pengguna dan user stories', 'User Personas & User Stories — user personas and user stories'),
        t('System Architecture Diagram (ASCII) — diagram arsitektur dalam ASCII', 'System Architecture Diagram (ASCII) — architecture diagram in ASCII'),
        t('Entity Relationship Diagram (ERD) — diagram relasi entitas', 'Entity Relationship Diagram (ERD) — entity relationship diagram'),
        t('API Endpoints Documentation — dokumentasi endpoint API', 'API Endpoints Documentation — API endpoint documentation'),
        t('UI Wireframes (ASCII) — wireframe antarmuka dalam ASCII', 'UI Wireframes (ASCII) — interface wireframes in ASCII'),
        t('Risk Analysis & Mitigation — analisis risiko dan mitigasi', 'Risk Analysis & Mitigation — risk analysis and mitigation'),
        t('Implementation Roadmap — peta jalan implementasi', 'Implementation Roadmap — implementation roadmap'),
        t('Success Metrics & KPI — metrik kesuksesan dan KPI', 'Success Metrics & KPI — success metrics and KPI'),
      ]} />

      <SectionH2 id="prd-api">{t('Konfigurasi API', 'API Configuration')}</SectionH2>
      <Para>{t('PRD Tool memanggil endpoint internal /api/prd-chat yang kemudian meneruskan permintaan ke upstream AI API.', 'PRD Tool calls the internal endpoint /api/prd-chat which then forwards requests to the upstream AI API.')}</Para>
      <CodeBlock language="typescript" code={`// src/app/api/prd-chat/route.ts
// Payload yang dikirim ke /api/prd-chat:
{
  message: string,      // Prompt untuk AI
  system?: string,      // System prompt opsional
  engine: 'gpt' | 'sonar'  // AI engine yang digunakan
}`} />
      <Callout type="warning">{t('Pastikan NEXT_PUBLIC_UPSTREAM_URL dan NEXT_PUBLIC_UPSTREAM_COOKIE sudah dikonfigurasi di .env.local sebelum menggunakan PRD Generator.', 'Make sure NEXT_PUBLIC_UPSTREAM_URL and NEXT_PUBLIC_UPSTREAM_COOKIE are configured in .env.local before using the PRD Generator.')}</Callout>
    </div>
  )

  // DIAGRAM TOOL
  if (activeSection === 'diagram-tool') return (
    <div>
      <h1 className="text-3xl font-bold text-[var(--ink)] mb-3">{t('Diagram Sistem', 'System Diagram')}</h1>
      <Para>{t('Tool visual berbasis SVG untuk merancang arsitektur infrastruktur sistem dengan komponen drag-and-drop yang terstandarisasi.', 'SVG-based visual tool for designing system infrastructure architecture with standardized drag-and-drop components.')}</Para>

      <SectionH2 id="diagram-overview">{t('Cara Kerja', 'How It Works')}</SectionH2>
      <Para>{t('Diagram Sistem menggunakan SVG murni untuk canvas dan React state untuk menyimpan data node dan arrow. Tidak ada library diagram eksternal yang digunakan.', 'System Diagram uses pure SVG for the canvas and React state to store node and arrow data. No external diagram libraries are used.')}</Para>
      <UL items={[
        t('Semua node disimpan sebagai array objek {id, type, x, y, label}', 'All nodes are stored as an array of objects {id, type, x, y, label}'),
        t('Semua koneksi disimpan sebagai array objek {id, from, to, label, animated}', 'All connections are stored as an array of objects {id, from, to, label, animated}'),
        t('Pan dan zoom ditangani menggunakan transform SVG', 'Pan and zoom are handled using SVG transforms'),
        t('Double-click pada node atau arrow untuk mengedit label', 'Double-click on a node or arrow to edit its label'),
      ]} />

      <SectionH2 id="diagram-nodes">{t('Komponen Node', 'Node Components')}</SectionH2>
      <Para>{t('Terdapat 12 tipe node yang tersedia, masing-masing merepresentasikan komponen infrastruktur yang berbeda:', 'There are 12 node types available, each representing a different infrastructure component:')}</Para>
      <NodeTable lang={lang} />

      <SectionH2 id="diagram-arrows">{t('Koneksi & Panah', 'Connections & Arrows')}</SectionH2>
      <Para>{t('Untuk membuat koneksi antara dua node:', 'To create a connection between two nodes:')}</Para>
      <UL items={[
        t('Klik tombol "Panah" di toolbar untuk mengaktifkan mode Arrow', 'Click the "Arrow" button in the toolbar to activate Arrow mode'),
        t('Klik node pertama sebagai sumber koneksi', 'Click the first node as the connection source'),
        t('Klik node kedua sebagai tujuan koneksi', 'Click the second node as the connection destination'),
        t('Klik titik tengah pada panah untuk mengedit label koneksi', 'Click the midpoint on an arrow to edit the connection label'),
      ]} />
      <Callout type="info">{t('Panah ditampilkan dengan animasi dashed stroke yang bisa diaktifkan/dinonaktifkan. Setiap panah mendukung label teks bebas.', 'Arrows are displayed with animated dashed strokes that can be enabled/disabled. Each arrow supports free text labels.')}</Callout>

      <SectionH2 id="diagram-export">{t('Export SVG', 'Export SVG')}</SectionH2>
      <Para>{t('Klik tombol "SVG" di pojok kanan atas untuk mengunduh diagram sebagai file .svg yang bisa dibuka di Figma, Illustrator, atau editor SVG lainnya.', 'Click the "SVG" button in the top right to download the diagram as an .svg file that can be opened in Figma, Illustrator, or other SVG editors.')}</Para>
      <Callout type="success">{t('File SVG yang dihasilkan mengandung semua node, panah, dan label dengan warna dan styling yang tepat.', 'The generated SVG file contains all nodes, arrows, and labels with correct colors and styling.')}</Callout>
    </div>
  )

  // FLOWCHART TOOL
  if (activeSection === 'flowchart-tool') return (
    <div>
      <h1 className="text-3xl font-bold text-[var(--ink)] mb-3">{t('Flowchart Builder', 'Flowchart Builder')}</h1>
      <Para>{t('Editor flowchart profesional menggunakan simbol standar ISO 5807 dengan kemampuan export ke PNG dan SVG.', 'Professional flowchart editor using ISO 5807 standard symbols with PNG and SVG export capabilities.')}</Para>

      <SectionH2 id="flow-overview">{t('Cara Kerja', 'How It Works')}</SectionH2>
      <Para>{t('Flowchart Builder diimplementasikan menggunakan SVG dengan custom shape rendering. Setiap bentuk dirender sebagai SVG path yang mengikuti standar flowchart internasional.', 'Flowchart Builder is implemented using SVG with custom shape rendering. Each shape is rendered as an SVG path following international flowchart standards.')}</Para>

      <SectionH2 id="flow-shapes">{t('Bentuk Standar', 'Standard Shapes')}</SectionH2>
      <Para>{t('Semua 12 bentuk yang tersedia mengikuti standar ISO 5807 untuk notasi flowchart:', 'All 12 available shapes follow ISO 5807 standard for flowchart notation:')}</Para>
      <ShapesTable lang={lang} />

      <SectionH2 id="flow-connections">{t('Menghubungkan Node', 'Connecting Nodes')}</SectionH2>
      <UL items={[
        t('Aktifkan mode Arrow dengan klik tombol Arrow di toolbar', 'Enable Arrow mode by clicking the Arrow button in the toolbar'),
        t('Klik node sumber, kemudian klik node tujuan', 'Click the source node, then click the target node'),
        t('Label pada koneksi bisa diedit dengan double-click pada garis koneksi', 'Labels on connections can be edited by double-clicking on the connection line'),
        t('Hapus koneksi dengan memilihnya lalu klik Delete', 'Delete a connection by selecting it then clicking Delete'),
      ]} />

      <SectionH2 id="flow-export">{t('Export PNG / SVG', 'Export PNG / SVG')}</SectionH2>
      <Para>{t('Flowchart dapat diekspor ke dua format:', 'The flowchart can be exported to two formats:')}</Para>
      <UL items={[
        t('PNG — menggunakan canvas.toBlob() via foreignObject untuk kualitas pixel tinggi', 'PNG — uses canvas.toBlob() via foreignObject for high pixel quality'),
        t('SVG — mengekstrak SVG DOM langsung untuk vektor yang bisa di-scale bebas', 'SVG — directly extracts the SVG DOM for freely scalable vectors'),
      ]} />
      <Callout type="info">{t('Export PNG menggunakan resolusi 2x untuk tampilan yang tajam di layar retina/HiDPI.', 'PNG export uses 2x resolution for sharp display on retina/HiDPI screens.')}</Callout>
    </div>
  )

  // CONFIGURATION
  if (activeSection === 'configuration') return (
    <div>
      <h1 className="text-3xl font-bold text-[var(--ink)] mb-3">{t('Konfigurasi', 'Configuration')}</h1>

      <SectionH2 id="env-vars">{t('Environment Variables', 'Environment Variables')}</SectionH2>
      <Para>{t('Salin .env.local.example ke .env.local dan isi nilai yang sesuai:', 'Copy .env.local.example to .env.local and fill in the appropriate values:')}</Para>
      <CodeBlock language="bash" code={`# .env.local

# URL upstream AI API proxy
NEXT_PUBLIC_UPSTREAM_URL=https://your-ai-proxy.example.com

# Cookie autentikasi untuk upstream API
NEXT_PUBLIC_UPSTREAM_COOKIE=your_session_cookie_here`} />
      <div className="my-4 rounded-none border border-[var(--hairline)] overflow-hidden">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-[var(--surface-soft)] border-b border-[var(--hairline)]">
              <th className="px-4 py-2.5 text-left font-semibold text-[var(--muted)] uppercase tracking-wide">{t('Variabel', 'Variable')}</th>
              <th className="px-4 py-2.5 text-left font-semibold text-[var(--muted)] uppercase tracking-wide">{t('Wajib', 'Required')}</th>
              <th className="px-4 py-2.5 text-left font-semibold text-[var(--muted)] uppercase tracking-wide">{t('Keterangan', 'Description')}</th>
            </tr>
          </thead>
          <tbody>
            {[
              { name: 'NEXT_PUBLIC_UPSTREAM_URL',    req: true,  desc: { id: 'URL endpoint AI proxy yang digunakan oleh PRD Generator', en: 'AI proxy endpoint URL used by PRD Generator' } },
              { name: 'NEXT_PUBLIC_UPSTREAM_COOKIE', req: true,  desc: { id: 'Cookie autentikasi sesi untuk upstream API', en: 'Session authentication cookie for upstream API' } },
            ].map((v, i) => (
              <tr key={v.name} className={cn('border-b border-[var(--hairline)] last:border-0', i % 2 === 0 ? 'bg-[var(--surface-card)]' : 'bg-[var(--surface-soft)]/40')}>
                <td className="px-4 py-2.5"><code className="font-mono text-[var(--m-blue-light)]">{v.name}</code></td>
                <td className="px-4 py-2.5"><Badge color={v.req ? 'red' : 'blue'}>{v.req ? t('Wajib', 'Required') : t('Opsional', 'Optional')}</Badge></td>
                <td className="px-4 py-2.5 text-[var(--muted)]">{v.desc[lang]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <SectionH2 id="deployment">{t('Deployment', 'Deployment')}</SectionH2>
      <Para>{t('RAM Tools dapat di-deploy ke platform manapun yang mendukung Next.js. Vercel adalah pilihan yang direkomendasikan:', 'RAM Tools can be deployed to any platform that supports Next.js. Vercel is the recommended choice:')}</Para>
      <CodeBlock language="bash" code={`# Install Vercel CLI
npm i -g vercel

# Deploy ke Vercel
vercel

# Deploy ke production
vercel --prod`} />
      <Callout type="warning">{t('Pastikan environment variables sudah dikonfigurasi di dashboard platform deployment kamu, bukan hanya di .env.local yang bersifat lokal.', 'Make sure environment variables are configured in your deployment platform dashboard, not just in .env.local which is local only.')}</Callout>

      <SectionH2 id="theming">{t('Tema & Styling', 'Theming & Styling')}</SectionH2>
      <Para>{t('RAM Tools menggunakan sistem CSS Custom Properties untuk theming. Semua variabel warna didefinisikan di globals.css:', 'RAM Tools uses a CSS Custom Properties system for theming. All color variables are defined in globals.css:')}</Para>
      <CodeBlock language="css" code={`/* Contoh custom properties theme */
:root {
  --bg-primary:    #0a0a0a;
  --bg-secondary:  #111111;
  --bg-card:       #141414;
  --text-primary:  #f5f5f5;
  --text-secondary:#a3a3a3;
  --text-muted:    #737373;
  --border:        rgba(255,255,255,0.08);
  --gold-primary:  #d4a017;
  --gold-accent:   #f59e0b;
  --gold-subtle:   rgba(245,158,11,0.08);
  --gold-border:   rgba(245,158,11,0.25);
}`} />
    </div>
  )

  // API REFERENCE
  if (activeSection === 'api-reference') return (
    <div>
      <h1 className="text-3xl font-bold text-[var(--ink)] mb-3">{t('Referensi API', 'API Reference')}</h1>
      <Para>{t('RAM Tools menyediakan satu internal API endpoint yang digunakan oleh PRD Generator.', 'RAM Tools provides one internal API endpoint used by the PRD Generator.')}</Para>

      <SectionH2 id="api-prd-chat">POST /api/prd-chat</SectionH2>
      <div className="flex items-center gap-2 my-3">
        <Badge color="blue">POST</Badge>
        <code className="text-sm font-mono text-[var(--m-blue-light)]">/api/prd-chat</code>
      </div>
      <Para>{t('Mengirim pesan ke AI engine dan mengembalikan respons teks.', 'Sends a message to the AI engine and returns a text response.')}</Para>

      <SectionH3 id="request-body">{t('Request Body', 'Request Body')}</SectionH3>
      <CodeBlock language="json" code={`{
  "message": "string",        // Prompt teks untuk AI (wajib)
  "system": "string",         // System prompt opsional
  "engine": "gpt" | "sonar"   // Engine AI yang digunakan (wajib)
}`} />

      <SectionH3 id="response-body">{t('Response Body', 'Response Body')}</SectionH3>
      <CodeBlock language="json" code={`// Sukses (200 OK)
{
  "content": "string"   // Teks respons dari AI
}

// Error
{
  "error": "string"     // Pesan error
}`} />

      <SectionH2 id="api-errors">{t('Penanganan Error', 'Error Handling')}</SectionH2>
      <div className="my-4 rounded-none border border-[var(--hairline)] overflow-hidden">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-[var(--surface-soft)] border-b border-[var(--hairline)]">
              <th className="px-4 py-2.5 text-left font-semibold text-[var(--muted)] uppercase tracking-wide">{t('Status', 'Status')}</th>
              <th className="px-4 py-2.5 text-left font-semibold text-[var(--muted)] uppercase tracking-wide">{t('Penyebab', 'Cause')}</th>
              <th className="px-4 py-2.5 text-left font-semibold text-[var(--muted)] uppercase tracking-wide">{t('Solusi', 'Solution')}</th>
            </tr>
          </thead>
          <tbody>
            {[
              { status: '400', cause: { id: 'Body request tidak valid atau field wajib tidak ada', en: 'Invalid request body or missing required fields' }, sol: { id: 'Pastikan message dan engine ada di payload', en: 'Ensure message and engine are in the payload' } },
              { status: '401', cause: { id: 'Cookie autentikasi tidak valid atau kadaluarsa', en: 'Invalid or expired authentication cookie' }, sol: { id: 'Perbarui NEXT_PUBLIC_UPSTREAM_COOKIE di .env.local', en: 'Update NEXT_PUBLIC_UPSTREAM_COOKIE in .env.local' } },
              { status: '500', cause: { id: 'Error dari upstream API atau server internal', en: 'Error from upstream API or internal server' }, sol: { id: 'Periksa log server dan pastikan UPSTREAM_URL benar', en: 'Check server logs and verify UPSTREAM_URL is correct' } },
              { status: '503', cause: { id: 'Upstream API tidak tersedia atau timeout', en: 'Upstream API unavailable or timed out' }, sol: { id: 'Coba kembali beberapa saat, periksa status upstream', en: 'Retry after a moment, check upstream status' } },
            ].map((r, i) => (
              <tr key={r.status} className={cn('border-b border-[var(--hairline)] last:border-0', i % 2 === 0 ? 'bg-[var(--surface-card)]' : 'bg-[var(--surface-soft)]/40')}>
                <td className="px-4 py-2.5"><Badge color={r.status === '400' ? 'gold' : r.status === '401' ? 'red' : 'red'}>{r.status}</Badge></td>
                <td className="px-4 py-2.5 text-[var(--body)]">{r.cause[lang]}</td>
                <td className="px-4 py-2.5 text-[var(--muted)]">{r.sol[lang]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )

  return <div className="text-[var(--muted)] text-sm pt-10">{t('Pilih topik dari sidebar kiri.', 'Select a topic from the left sidebar.')}</div>
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function DocsPage({ lang }: DocsPageProps) {
  const [activeSection, setActiveSection] = useState('introduction')
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['introduction']))
  const [searchQuery, setSearchQuery] = useState('')
  const contentRef = useRef<HTMLDivElement>(null)

  const t = (id: string, en: string) => lang === 'id' ? id : en

  const toggleSection = (id: string) => {
    setExpandedSections(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const handleNavClick = (sectionId: string, parentId: string) => {
    setActiveSection(parentId)
    setExpandedSections(prev => new Set(Array.from(prev).concat(parentId)))
    setTimeout(() => {
      const el = document.getElementById(sectionId)
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 100)
  }

  const filteredNav = searchQuery
    ? DOCS_NAV.map(section => ({
        ...section,
        subsections: section.subsections.filter(sub =>
          sub.title[lang].toLowerCase().includes(searchQuery.toLowerCase()) ||
          section.title[lang].toLowerCase().includes(searchQuery.toLowerCase())
        ),
      })).filter(s => s.subsections.length > 0)
    : DOCS_NAV

  return (
    <div className="flex min-h-screen pt-16">
      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0 border-r border-[var(--hairline)] bg-[var(--surface-card)] fixed left-0 top-16 bottom-0 overflow-y-auto z-30">
        <div className="p-4">
          {/* Header */}
          <div className="flex items-center gap-2 mb-4">
            <BookOpen size={15} className="text-[var(--m-blue-light)]" />
            <span className="text-sm font-bold text-[var(--ink)]">
              {t('Dokumentasi', 'Documentation')}
            </span>
            <Badge>v1.0</Badge>
          </div>

          {/* Search */}
          <div className="relative mb-4">
            <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
            <input
              type="text"
              placeholder={t('Cari...', 'Search...')}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-7 pr-3 py-1.5 text-xs rounded-none border border-[var(--hairline)] bg-[var(--surface-soft)] text-[var(--ink)] placeholder-[var(--muted)] focus:outline-none focus:border-[rgba(28,105,212,0.30)] transition-colors"
            />
          </div>

          {/* Nav */}
          <nav className="space-y-1">
            {filteredNav.map(section => {
              const isExpanded = expandedSections.has(section.id)
              const isActive = activeSection === section.id
              return (
                <div key={section.id}>
                  <button
                    onClick={() => {
                      toggleSection(section.id)
                      setActiveSection(section.id)
                      if (contentRef.current) contentRef.current.scrollTop = 0
                    }}
                    className={cn(
                      'w-full flex items-center gap-2 px-2.5 py-2 rounded-none text-left text-xs font-semibold transition-all',
                      isActive
                        ? 'bg-[rgba(28,105,212,0.08)] text-[var(--m-blue-light)] border border-[rgba(28,105,212,0.30)]'
                        : 'text-[var(--body)] hover:bg-[var(--surface-soft)] hover:text-[var(--ink)]'
                    )}
                  >
                    <section.icon size={13} />
                    <span className="flex-1">{section.title[lang]}</span>
                    {isExpanded ? <ChevronDown size={11} /> : <ChevronRight size={11} />}
                  </button>

                  {isExpanded && (
                    <div className="ml-5 mt-0.5 space-y-0.5 border-l border-[var(--hairline)] pl-3">
                      {section.subsections.map(sub => (
                        <button
                          key={sub.id}
                          onClick={() => handleNavClick(sub.id, section.id)}
                          className="w-full text-left text-xs py-1.5 px-2 rounded text-[var(--muted)] hover:text-[var(--m-blue-light)] hover:bg-[rgba(28,105,212,0.08)] transition-all"
                        >
                          {sub.title[lang]}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </nav>

          {/* Footer links */}
          <div className="mt-6 pt-4 border-t border-[var(--hairline)] space-y-1">
            <a href="https://github.com" target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 text-xs text-[var(--muted)] hover:text-[var(--m-blue-light)] transition-colors py-1">
              <ExternalLink size={11} />
              GitHub Repository
            </a>
            <a href="#" className="flex items-center gap-2 text-xs text-[var(--muted)] hover:text-[var(--m-blue-light)] transition-colors py-1">
              <TerminalSquare size={11} />
              Changelog
            </a>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main ref={contentRef} className="flex-1 ml-64 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-8 py-10">
          {/* Breadcrumb */}
          <div className="flex items-center gap-1.5 text-xs text-[var(--muted)] mb-8">
            <BookOpen size={11} />
            <span>{t('Dokumentasi', 'Docs')}</span>
            <ChevronRight size={11} />
            <span className="text-[var(--m-blue-light)] font-medium">
              {DOCS_NAV.find(s => s.id === activeSection)?.title[lang]}
            </span>
          </div>

          {/* Content */}
          <DocContent activeSection={activeSection} lang={lang} />

          {/* Pagination */}
          <div className="mt-12 pt-6 border-t border-[var(--hairline)] flex items-center justify-between">
            {(() => {
              const idx = DOCS_NAV.findIndex(s => s.id === activeSection)
              const prev = idx > 0 ? DOCS_NAV[idx - 1] : null
              const next = idx < DOCS_NAV.length - 1 ? DOCS_NAV[idx + 1] : null
              return (
                <>
                  {prev ? (
                    <button onClick={() => setActiveSection(prev.id)}
                      className="flex items-center gap-2 text-xs text-[var(--muted)] hover:text-[var(--m-blue-light)] transition-colors">
                      <ChevronRight size={12} className="rotate-180" />
                      {prev.title[lang]}
                    </button>
                  ) : <div />}
                  {next ? (
                    <button onClick={() => setActiveSection(next.id)}
                      className="flex items-center gap-2 text-xs text-[var(--muted)] hover:text-[var(--m-blue-light)] transition-colors">
                      {next.title[lang]}
                      <ChevronRight size={12} />
                    </button>
                  ) : <div />}
                </>
              )
            })()}
          </div>
        </div>
      </main>
    </div>
  )
}
