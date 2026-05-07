'use client'
import { useState, useCallback } from 'react'
import {
  FileText, ArrowRight, RotateCcw, Copy, Check, ChevronRight,
  Loader2, Download, Package, Users, TrendingUp, Code2,
  Layers, Zap, Shield, AlertTriangle, CheckSquare, BookOpen,
  Terminal, FolderTree, Star, Sparkles, MessageSquare, ChevronDown,
  type LucideIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Lang } from '@/lib/i18n'

// ─── Types ────────────────────────────────────────────────────────────────────
type Step = 1 | 2 | 3 | 4
type PRDMode = 'standar' | 'lengkap' | 'enterprise'
type OutputTool = 'markdown' | 'claude-code'

interface Category { id: string; name: string; options: Option[] }
interface Option { name: string; description: string; badge?: string }

interface State {
  step: Step
  mode: PRDMode
  outputTool: OutputTool
  userInput: string
  concept: string
  categories: Category[]
  research: string
  prd: string
  isGenerating: boolean
  loadingText: string
  loadingPhase: number
  totalPhases: number
}

// ─── API Helper ───────────────────────────────────────────────────────────────
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

// ─── PRD Mode Config ──────────────────────────────────────────────────────────
const PRD_MODES = {
  standar: {
    label: 'STANDAR',
    sublabel: '3–5 menit',
    desc: 'PRD solid untuk startup & MVP. Cocok untuk tim kecil dan project cepat.',
    icon: Zap,
    color: 'var(--m-blue-light)',
    phases: 3,
    badge: 'CEPAT',
  },
  lengkap: {
    label: 'LENGKAP',
    sublabel: '5–8 menit',
    desc: 'PRD komprehensif dengan analisis kompetitor, user journey, dan estimasi tim.',
    icon: Layers,
    color: 'var(--m-blue-dark)',
    phases: 5,
    badge: 'POPULER',
  },
  enterprise: {
    label: 'ENTERPRISE',
    sublabel: '8–12 menit',
    desc: 'Dokumen level perusahaan. Struktur folder clean, output ZIP siap Claude Code.',
    icon: Shield,
    color: 'var(--m-red)',
    phases: 7,
    badge: 'PREMIUM',
  },
}

// ─── System Prompts ───────────────────────────────────────────────────────────
// ─── Coding Rules (injected into every PRD) ───────────────────────────────────
const CODING_RULES = `
## CODING RULES & ENGINEERING STANDARDS

> Semua kode dalam proyek ini WAJIB mengikuti standar berikut tanpa pengecualian.

### Prinsip Utama

| Prinsip | Definisi |
|---|---|
| **Clean Code** | Kode mudah dibaca dan dipahami developer lain tanpa perlu penjelasan tambahan |
| **Maintainable** | Mudah diubah, diperbaiki, dan dikembangkan tanpa merusak bagian lain dari sistem |
| **Scalable** | Arsitektur tetap performa dan terstruktur meskipun project membesar 10x |
| **Secure** | Tidak rentan terhadap serangan umum (injection, XSS, CSRF, unauthorized access) |
| **Consistent** | Semua developer mengikuti satu gaya penulisan yang sama di seluruh codebase |

### Aturan Wajib — Kode

- **Single Responsibility** — Setiap function/class hanya memiliki 1 tanggung jawab. Jika sebuah function melakukan lebih dari satu hal, pecah menjadi function terpisah.
- **Maksimal 3 Level Nesting** — Jangan menulis kondisi atau loop yang bersarang lebih dari 3 level. Gunakan early return atau extract function.
- **No Magic Number/String** — Semua nilai literal wajib didefinisikan sebagai named constant. Contoh: \`const MAX_RETRY = 3\` bukan langsung menulis \`3\`.
- **API Validation Wajib** — Setiap endpoint API wajib memvalidasi input (type, required fields, format) sebelum diproses. Gunakan schema validator (Zod, Joi, dll).
- **Async Error Handling** — Setiap operasi async (fetch, DB query, file I/O) wajib dibungkus try/catch atau menggunakan .catch(). Tidak boleh ada unhandled promise rejection.

### Aturan Wajib — Kolaborasi & Deployment

- **PR Review Minimum 1 Developer** — Setiap Pull Request wajib direview dan diapprove oleh minimal 1 developer lain sebelum dapat di-merge.
- **Dilarang Push Langsung ke Production Branch** — Branch \`main\`/\`production\` wajib dilindungi. Semua perubahan harus melalui PR dan review.
- **Environment Secret di .env** — Semua konfigurasi sensitif (API key, DB password, JWT secret) wajib disimpan di file \`.env\`. Dilarang hardcode di source code atau commit ke repository.

### Contoh Penerapan

\`\`\`typescript
// ❌ SALAH — magic number, no validation, no error handling
async function getUser(id) {
  if (users.length > 100) { ... }  // magic number
  return await db.query('SELECT * FROM users WHERE id = ' + id)  // SQL injection
}

// ✅ BENAR — clean, safe, validated
const MAX_USERS_PER_PAGE = 100

async function getUserById(userId: string): Promise<User | null> {
  if (!userId || typeof userId !== 'string') {
    throw new ValidationError('userId harus berupa string yang valid')
  }
  try {
    return await db.users.findUnique({ where: { id: userId } })
  } catch (error) {
    logger.error('Gagal mengambil data user', { userId, error })
    throw new DatabaseError('Gagal mengambil data user')
  }
}
\`\`\`
`

function buildSystemPrompts(mode: PRDMode) {
  const base = `Kamu adalah Senior Product Manager dan Software Architect kelas dunia yang menulis dokumentasi dalam BAHASA INDONESIA yang baku, jelas, dan profesional. ATURAN KETAT: 1) TIDAK ADA pembuka seperti "Tentu!" atau "Baik!". 2) Langsung output Markdown. 3) Gunakan terminologi teknis yang tepat. 4) Setiap section harus detail dan actionable. 5) SELALU sertakan section "## CODING RULES & ENGINEERING STANDARDS" di setiap dokumen PRD yang dihasilkan — gunakan konten dari CODING_RULES yang sudah didefinisikan.`

  const conceptSys = base + `\n\nTugas: Transformasikan ide mentah menjadi Product Concept yang solid dengan struktur:\n## Elevator Pitch\n## Target Pengguna & Persona\n## Masalah yang Diselesaikan\n## Nilai Unik (USP)\n## Scope & Batasan MVP\n\nPastikan realistis dan spesifik.`

  const archSys = base + `\n\nTugas: Berikan rekomendasi tech stack dalam format JSON STRICT:\n{"categories":[{"id":"frontend","name":"Frontend Framework","options":[{"name":"Next.js 14","description":"App Router, SSR/SSG, TypeScript native. Ideal untuk aplikasi web modern dengan SEO.","badge":"Paling Populer"},...]},{"id":"backend","name":"Backend & API"},{"id":"database","name":"Database & Storage"},{"id":"infra","name":"Infrastructure & DevOps"}]}\nSetiap kategori 3-4 pilihan. Badge: "Paling Populer", "Paling Hemat", "Enterprise", "Tercepat".`

  if (mode === 'standar') {
    return {
      concept: conceptSys,
      arch: archSys,
      prd1: base + `\n\nTugas: Buat PRD lengkap dalam BAHASA INDONESIA. Struktur wajib:\n# [Nama Produk] — Product Requirements Document\n## Ringkasan Eksekutif\n## 1. Latar Belakang & Problem Statement\n## 2. Tujuan Produk & Success Metrics (KPI)\n## 3. Pengguna Target & Persona\n## 4. Fitur Utama & Prioritas (MoSCoW)\n## 5. User Stories\n## 6. Alur Pengguna (User Flow)\n## 7. Arsitektur Sistem\n## 8. Skema Database & ERD\n## 9. Spesifikasi API Endpoint\n## 10. Analisis Risiko & Mitigasi\n## 11. Timeline & Roadmap\n## CODING RULES & ENGINEERING STANDARDS\n## Checklist Implementasi`,
      prd2: base + `\n\nTugas: Lanjutkan PRD dengan section teknis detail:\n## 12. Wireframe ASCII (3 layar utama)\n## 13. Kebutuhan Non-Fungsional (performa, keamanan, skalabilitas)\n## 14. Dependensi & Integrasi Eksternal\n## Ringkasan Eksekutif (versi singkat 1 paragraf untuk stakeholder non-teknis)`,
      prd3: null,
      prd4: null,
      prd5: null,
    }
  }

  if (mode === 'lengkap') {
    return {
      concept: conceptSys,
      arch: archSys,
      prd1: base + `\n\nTugas: Buat bagian 1 PRD LENGKAP dalam BAHASA INDONESIA:\n# [Nama Produk] — Product Requirements Document\n## Ringkasan Eksekutif (untuk CEO/Investor)\n## 1. Latar Belakang & Problem Statement\n## 2. Tujuan Produk & OKR\n## 3. Target Pasar & Segmentasi\n## 4. Persona Pengguna (minimal 3 persona detail dengan nama, demografi, goals, pain points)\n## 5. User Journey Map (per persona, per touchpoint)`,
      prd2: base + `\n\nTugas: Buat bagian 2 PRD:\n## 6. Analisis Kompetitor (tabel perbandingan fitur vs 3 kompetitor utama)\n## 7. Fitur Utama & Backlog (MoSCoW prioritas dengan estimasi story points)\n## 8. User Stories (format: Sebagai [persona], saya ingin [aksi], agar [nilai])\n## 9. Acceptance Criteria per fitur utama`,
      prd3: base + `\n\nTugas: Buat bagian 3 PRD:\n## 10. Arsitektur Sistem (diagram ASCII + penjelasan komponen)\n## 11. Skema Database & ERD (Mermaid erDiagram)\n## 12. Spesifikasi API Endpoint (method, path, request/response JSON)\n## 13. Desain Keamanan & Autentikasi`,
      prd4: base + `\n\nTugas: Buat bagian 4 PRD:\n## 14. Wireframe ASCII (5 layar utama)\n## 15. Estimasi Biaya Infrastruktur (bulanan, dalam Rupiah)\n## 16. Estimasi Tim & Durasi (role, jumlah, durasi sprint)\n## 17. Analisis Risiko & Matriks Mitigasi\n## 18. Timeline & Roadmap (3 fase: MVP, Growth, Scale)\n## CODING RULES & ENGINEERING STANDARDS\n## Checklist Implementasi Developer\n## Ringkasan Eksekutif (1 halaman, Bahasa Indonesia formal)`,
      prd5: null,
    }
  }

  // enterprise
  return {
    concept: conceptSys,
    arch: archSys,
    prd1: base + `\n\nTugas: Buat bagian 1 PRD ENTERPRISE dalam BAHASA INDONESIA:\n# [Nama Produk] — Enterprise Product Requirements Document\n## Ringkasan Eksekutif (CEO/Board level)\n## 1. Konteks Bisnis & Strategic Fit\n## 2. Problem Statement & Root Cause Analysis\n## 3. Business Objectives & OKR\n## 4. Market Analysis & Total Addressable Market (TAM/SAM/SOM)\n## 5. Persona Pengguna (5 persona detail: internal & eksternal)`,
    prd2: base + `\n\nTugas: Buat bagian 2 PRD Enterprise:\n## 6. Analisis Kompetitor Mendalam (SWOT per kompetitor, 5 kompetitor)\n## 7. User Journey Map Lengkap (semua touchpoint, emotion curve)\n## 8. Fitur Backlog Lengkap (Epic > Feature > User Story > Task)\n## 9. Acceptance Criteria & Definition of Done\n## 10. Compliance & Regulasi (PDPA Indonesia, ISO 27001 jika relevan)`,
    prd3: base + `\n\nTugas: Buat bagian 3 PRD Enterprise:\n## 11. Arsitektur Sistem Enterprise (microservices/monolith analysis)\n## 12. Skema Database Lengkap & ERD (Mermaid)\n## 13. API Specification Lengkap (semua endpoint, auth, rate limit, versioning)\n## 14. Strategi Keamanan & Autentikasi (OAuth2, JWT, RBAC)\n## 15. SLA & Non-Functional Requirements`,
    prd4: base + `\n\nTugas: Buat bagian 4 PRD Enterprise:\n## 16. UI/UX Specification & Design System Tokens\n## 17. Wireframe ASCII (7 layar kritis)\n## 18. Estimasi Biaya Total (infrastruktur, SDM, lisensi — dalam Rupiah)\n## 19. Struktur Tim & RACI Matrix\n## 20. Analisis Risiko Enterprise & Business Continuity Plan`,
    prd5: base + `\n\nTugas: Buat bagian 5 PRD Enterprise + STRUKTUR FOLDER CLEAN CODE:\n## 21. Timeline & Roadmap 12 Bulan (Gantt chart ASCII)\n## 22. KPI & Metrics Dashboard\n## 23. Go-to-Market Strategy\n\n## STRUKTUR FOLDER PROYEK (Clean Architecture)\nBuat struktur folder lengkap dan clean untuk tech stack yang dipilih dalam format tree:\n\`\`\`\nproject-name/\n├── src/\n│   ├── ...\n├── ...\n\`\`\`\nSertakan penjelasan singkat tiap folder.\n\n## CODING RULES & ENGINEERING STANDARDS\n(Tabel prinsip + semua aturan wajib kode dan deployment yang HARUS diikuti seluruh tim)\n\n## CHECKLIST IMPLEMENTASI DEVELOPER\n(Checklist lengkap dari setup hingga deployment)\n\n## RINGKASAN EKSEKUTIF FINAL\n(1 halaman formal untuk presentasi ke stakeholder)`,
  }
}

// ─── Folder Structure Generator ───────────────────────────────────────────────
function buildFolderStructurePrompt(concept: string, stack: string): string {
  return `Berdasarkan konsep produk dan tech stack berikut, buat struktur folder proyek yang CLEAN, SCALABLE, dan mengikuti best practices industri 2025.

KONSEP: ${concept}
TECH STACK: ${stack}

Output dalam format:
1. Struktur folder lengkap (tree format dalam code block)
2. Penjelasan singkat setiap folder/file kritis
3. File konfigurasi yang dibutuhkan (package.json, tsconfig, dll)
4. Environment variables yang diperlukan (.env.example)
5. Perintah setup awal (step by step dalam Bahasa Indonesia)

Pastikan mengikuti prinsip: Separation of Concerns, DRY, SOLID.`
}

// ─── Claude Code Instructions Generator ──────────────────────────────────────
function buildClaudeCodePrompt(prd: string, stack: string): string {
  return `Berdasarkan PRD berikut, buat INSTRUKSI LENGKAP untuk Claude Code (AI coding assistant) agar dapat mengimplementasikan proyek dari awal hingga siap deploy.

PRD SINGKAT: ${prd.slice(0, 2000)}...
TECH STACK: ${stack}

Buat dalam format BAHASA INDONESIA:

# CLAUDE CODE — PROJECT IMPLEMENTATION GUIDE

## Perintah Awal (Jalankan Pertama)
(Setup repo, install dependencies, konfigurasi)

## Fase 1: Foundation
(Perintah dan instruksi untuk setup dasar)

## Fase 2: Core Features
(Implementasi fitur utama satu per satu)

## Fase 3: Integration & Testing
(Integrasi API, testing)

## Fase 4: Deployment
(CI/CD, deployment ke production)

## Prompt Template untuk Claude Code
(Template prompt yang bisa langsung dipakai di Claude Code untuk setiap fase)

Setiap fase berisi: deskripsi, file yang dibuat/diubah, dan perintah terminal.`
}

// ─── ZIP Generator ────────────────────────────────────────────────────────────
async function generateZip(prd: string, folderStructure: string, claudeCode: string, projectName: string) {
  // Dynamic import JSZip
  const JSZip = (await import('jszip')).default
  const zip = new JSZip()

  // PRD Document
  zip.file('docs/PRD.md', prd)

  // Folder structure guide
  if (folderStructure) zip.file('docs/FOLDER-STRUCTURE.md', folderStructure)

  // Claude Code instructions
  if (claudeCode) zip.file('docs/CLAUDE-CODE-GUIDE.md', claudeCode)

  // README
  zip.file('README.md', `# ${projectName}\n\n> Dokumen ini digenerate oleh RAM Tools PRD Generator\n\n## Isi Paket\n\n- \`docs/PRD.md\` — Product Requirements Document lengkap\n- \`docs/FOLDER-STRUCTURE.md\` — Panduan struktur folder clean code\n- \`docs/CLAUDE-CODE-GUIDE.md\` — Panduan implementasi dengan Claude Code\n\n## Cara Menggunakan dengan Claude Code\n\n1. Buka \`docs/CLAUDE-CODE-GUIDE.md\`\n2. Salin prompt dari setiap fase\n3. Jalankan di Claude Code terminal\n\n---\n*Generated by RAM Tools — ${new Date().toLocaleDateString('id-ID')}*\n`)

  // Generate ZIP
  const blob = await zip.generateAsync({ type: 'blob' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${projectName.toLowerCase().replace(/\s+/g, '-')}-prd.zip`
  a.click()
  URL.revokeObjectURL(url)
}

// ─── Simple Markdown Renderer ─────────────────────────────────────────────────
function renderMarkdown(text: string): string {
  if (!text) return ''
  return text
    .replace(/^#### (.+)$/gm, '<h4 style="font-size:14px;font-weight:700;color:var(--body-strong);margin:16px 0 8px;text-transform:uppercase;letter-spacing:0.5px">$1</h4>')
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre><code>$2</code></pre>')
    .replace(/^\| (.+) \|$/gm, (m) => {
      const cells = m.split('|').filter(c => c.trim() !== '').map(c => `<td>${c.trim()}</td>`).join('')
      return `<tr>${cells}</tr>`
    })
    .replace(/(<tr>.*<\/tr>\n?)+/g, (m) => `<table>${m}</table>`)
    .replace(/^- \[ \] (.+)$/gm, '<li style="list-style:none;padding-left:0"><label style="display:flex;gap:8px;align-items:flex-start"><input type="checkbox" style="margin-top:3px;accent-color:var(--m-blue-dark)"><span>$1</span></label></li>')
    .replace(/^- \[x\] (.+)$/gm, '<li style="list-style:none;padding-left:0"><label style="display:flex;gap:8px;align-items:flex-start;opacity:0.6"><input type="checkbox" checked style="margin-top:3px;accent-color:var(--m-blue-dark)"><span><s>$1</s></span></label></li>')
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    .replace(/^\d+\. (.+)$/gm, '<li>$1</li>')
    .replace(/^---$/gm, '<hr style="border:none;border-top:1px solid var(--hairline);margin:24px 0">')
    .replace(/\n\n/g, '\n')
}

// ─── Loading Messages per Mode ────────────────────────────────────────────────
const LOADING_MESSAGES: Record<PRDMode, string[]> = {
  standar: [
    'Menganalisis konsep produk...',
    'Menyusun struktur PRD...',
    'Merancang arsitektur & API...',
  ],
  lengkap: [
    'Menganalisis konsep & pasar...',
    'Menyusun analisis kompetitor...',
    'Merancang arsitektur sistem...',
    'Membuat estimasi tim & biaya...',
    'Finalisasi dokumen...',
  ],
  enterprise: [
    'Menganalisis konteks bisnis & pasar...',
    'Menyusun analisis kompetitor enterprise...',
    'Merancang arsitektur sistem enterprise...',
    'Membuat spesifikasi UI & estimasi biaya...',
    'Menyusun struktur folder clean code...',
    'Generating Claude Code guide...',
    'Finalisasi dokumen enterprise...',
  ],
}

// ─── AI Prompt Generator ──────────────────────────────────────────────────────
type PromptTarget = 'web' | 'mobile' | 'api' | 'fullstack' | 'claude-code'

interface GeneratedPrompt {
  target: PromptTarget
  label: string
  icon: LucideIcon
  color: string
  description: string
  prompt: string
}

function buildAIPrompts(prd: string, stack: string, projectName: string): GeneratedPrompt[] {
  const shortPRD = prd.slice(0, 3000)
  const name = projectName || 'proyek ini'

  // Extract key sections from PRD for context
  const featuresMatch = prd.match(/## (?:4\.|Fitur|Core Features|Fitur Utama)([\s\S]{0,1500})(?=\n##)/i)
  const techMatch = prd.match(/## (?:7\.|Arsitektur|Architecture|Tech Stack)([\s\S]{0,800})(?=\n##)/i)
  const apiMatch = prd.match(/## (?:9\.|API|Endpoint)([\s\S]{0,800})(?=\n##)/i)

  const featuresContext = featuresMatch?.[1]?.trim() || ''
  const techContext = techMatch?.[1]?.trim() || stack || ''
  const apiContext = apiMatch?.[1]?.trim() || ''

  return [
    {
      target: 'claude-code',
      label: 'Claude Code',
      icon: Terminal,
      color: 'var(--m-red)',
      description: 'Prompt lengkap untuk Claude Code — langsung build dari terminal',
      prompt: `Kamu adalah senior full-stack engineer. Saya ingin kamu membangun ${name} dari awal berdasarkan PRD berikut.

## TECH STACK
${techContext || stack}

## RINGKASAN PRD
${shortPRD}

## INSTRUKSI
1. Mulai dengan setup project structure yang clean sesuai best practices
2. Implementasikan setiap fitur satu per satu, mulai dari yang paling core
3. Gunakan TypeScript strict mode
4. Setiap file harus ada komentar singkat di atas menjelaskan fungsinya
5. Ikuti coding rules: single responsibility, max 3 level nesting, no magic number, semua API harus ada validation, semua async harus handle error
6. Buat .env.example untuk semua environment variables yang dibutuhkan
7. Setelah selesai, tunjukkan cara menjalankan project secara lokal

Mulai dari setup folder structure dan file utama terlebih dahulu, lalu tanya konfirmasi sebelum melanjutkan ke implementasi fitur.`,
    },
    {
      target: 'fullstack',
      label: 'Full Stack App',
      icon: Layers,
      color: 'var(--m-blue-dark)',
      description: 'Prompt untuk build web app lengkap (frontend + backend + database)',
      prompt: `Bantu saya membangun aplikasi web full-stack untuk ${name}.

## KONTEKS PRODUK
${shortPRD}

## TECH STACK YANG DIGUNAKAN
${techContext || stack}

## YANG PERLU DIBANGUN
${featuresContext ? `Fitur-fitur utama:\n${featuresContext}` : 'Semua fitur sesuai PRD di atas'}

## CODING STANDARDS WAJIB
- Clean Code: kode mudah dibaca, nama variabel deskriptif
- Single Responsibility: setiap function hanya 1 tugas
- Tidak ada magic number — gunakan konstanta bernama
- Semua endpoint API wajib validasi input (gunakan Zod atau library serupa)
- Semua operasi async wajib try/catch
- Environment variables di .env, tidak boleh hardcode

## OUTPUT YANG DIHARAPKAN
1. Struktur folder project yang clean
2. Setup konfigurasi awal (package.json, tsconfig, env)
3. Implementasi fitur core satu per satu
4. Penjelasan singkat setiap keputusan teknis yang diambil

Mulai dari mana yang paling masuk akal untuk dikerjakan pertama.`,
    },
    {
      target: 'web',
      label: 'Frontend / UI',
      icon: Zap,
      color: 'var(--m-blue-light)',
      description: 'Fokus pada UI/UX, komponen, dan halaman frontend',
      prompt: `Bantu saya membuat frontend untuk ${name}.

## RINGKASAN PRODUK
${shortPRD.slice(0, 1500)}

## TECH STACK FRONTEND
${techContext || 'Next.js 14, TypeScript, Tailwind CSS'}

## FITUR UI YANG DIBUTUHKAN
${featuresContext || 'Semua fitur sesuai PRD'}

## STANDAR KODE
- Komponen kecil dan reusable (Single Responsibility)
- Tidak ada inline style berlebihan — gunakan class atau CSS variables
- Semua form harus ada validasi client-side
- Loading state dan error state harus di-handle untuk setiap fetch
- Responsive mobile-first
- Aksesibilitas dasar (aria-label, semantic HTML)

## OUTPUT YANG DIHARAPKAN
1. Struktur folder komponen yang clean
2. Komponen UI utama (layout, navbar, halaman kritis)
3. Integrasi dengan API backend (gunakan placeholder jika backend belum ada)
4. Kode siap production dengan TypeScript strict

Mulai dari layout utama dan halaman yang paling sering dikunjungi user.`,
    },
    {
      target: 'api',
      label: 'Backend / API',
      icon: Code2,
      color: 'var(--m-blue-dark)',
      description: 'Fokus pada REST API, database, dan business logic',
      prompt: `Bantu saya membangun backend API untuk ${name}.

## RINGKASAN PRODUK
${shortPRD.slice(0, 1500)}

## TECH STACK BACKEND
${techContext || 'Node.js, Express/Fastify/Hono, TypeScript, Prisma'}

## ENDPOINT API YANG DIBUTUHKAN
${apiContext || 'Semua endpoint sesuai PRD di atas'}

## STANDAR KODE BACKEND
- Setiap endpoint WAJIB validasi input (Zod schema)
- Semua operasi database wajib try/catch dengan error yang informatif
- Gunakan HTTP status code yang tepat (200, 201, 400, 401, 403, 404, 500)
- Semua secret di environment variable — tidak boleh hardcode
- Autentikasi menggunakan JWT atau OAuth sesuai kebutuhan
- Rate limiting untuk endpoint publik
- Logging untuk setiap request dan error

## OUTPUT YANG DIHARAPKAN
1. Setup project backend dengan struktur folder clean (routes, controllers, services, models)
2. Implementasi endpoint per fitur
3. Database schema dan migration
4. Middleware autentikasi dan validasi
5. .env.example dengan semua variabel yang dibutuhkan

Mulai dari setup project dan endpoint autentikasi terlebih dahulu.`,
    },
    {
      target: 'mobile',
      label: 'Mobile App',
      icon: MessageSquare,
      color: 'var(--success)',
      description: 'Prompt untuk React Native atau Flutter',
      prompt: `Bantu saya membangun aplikasi mobile untuk ${name}.

## RINGKASAN PRODUK
${shortPRD.slice(0, 1500)}

## TECH STACK MOBILE
React Native (Expo) dengan TypeScript — atau sesuaikan dengan preferensi

## FITUR MOBILE YANG DIBUTUHKAN
${featuresContext || 'Semua fitur sesuai PRD'}

## STANDAR KODE
- Komponen kecil dan reusable
- Navigation menggunakan React Navigation
- State management: Zustand atau Redux Toolkit
- Semua API call harus handle loading, success, dan error state
- Offline-first: data penting di-cache dengan AsyncStorage
- Push notification untuk fitur yang relevan
- Responsive untuk berbagai ukuran layar (iPhone SE hingga iPad)

## OUTPUT YANG DIHARAPKAN
1. Struktur project Expo yang clean
2. Navigation setup (Tab + Stack navigator)
3. Screen utama sesuai fitur core
4. Integrasi API dengan error handling
5. Komponen reusable (Button, Input, Card, dll)

Mulai dari setup project dan navigation structure terlebih dahulu.`,
    },
  ]
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function PRDTool({ lang }: { lang: Lang }) {
  const [S, setS] = useState<State>({
    step: 1, mode: 'standar', outputTool: 'markdown',
    userInput: '', concept: '', categories: [], research: '',
    prd: '', isGenerating: false, loadingText: '', loadingPhase: 0, totalPhases: 3,
  })
  const [selStack, setSelStack] = useState<Record<string, string>>({})
  const [copied, setCopied] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [userNote, setUserNote] = useState('')
  const [revInput, setRevInput] = useState('')
  const [folderStructure, setFolderStructure] = useState('')
  const [claudeGuide, setClaudeGuide] = useState('')
  const [generatingZip, setGeneratingZip] = useState(false)
  const [projectName, setProjectName] = useState('')
  const [activePromptTarget, setActivePromptTarget] = useState<PromptTarget>('claude-code')
  const [copiedPrompt, setCopiedPrompt] = useState(false)

  const set = useCallback((partial: Partial<State>) => setS(p => ({ ...p, ...partial })), [])

  const reset = () => {
    setS({ step: 1, mode: 'standar', outputTool: 'markdown', userInput: '', concept: '', categories: [], research: '', prd: '', isGenerating: false, loadingText: '', loadingPhase: 0, totalPhases: 3 })
    setSelStack({}); setError(''); setLoading(false); setUserNote(''); setRevInput('')
    setFolderStructure(''); setClaudeGuide(''); setProjectName('')
  }

  const refineConcept = async (input: string) => {
    setLoading(true); setError('')
    try {
      const prompts = buildSystemPrompts(S.mode)
      const d = await apiCall({ message: 'IDE PRODUK:\n' + input, system: prompts.concept, engine: 'gpt' })
      set({ concept: d.content })
    } catch (e: unknown) {
      const errMsg = e instanceof Error ? e.message : String(e)
      setError(errMsg)
    }
    setLoading(false)
  }

  const startPlanning = async () => {
    set({ step: 2 }); setLoading(true); setError('')
    try {
      const prompts = buildSystemPrompts(S.mode)
      const [pRes, rRes] = await Promise.all([
        apiCall({ message: 'KONSEP PRODUK:\n' + S.concept, system: prompts.arch, engine: 'gpt' }),
        apiCall({
          message: `Riset tren teknologi dan arsitektur 2025-2026 yang relevan untuk: ${S.concept}. Fokus pada: tech stack populer, tools terbaru, best practices. Jawab dalam Bahasa Indonesia.`,
          engine: 'sonar',
        }),
      ])
      let raw = pRes.content
      const m = raw.match(/\{[\s\S]*\}/)
      if (m) raw = m[0]
      const parsed = JSON.parse(raw)
      set({ categories: parsed.categories, research: rRes.content || '', step: 2 })
    } catch (e: unknown) {
      const errMsg = e instanceof Error ? e.message : String(e)
      setError(errMsg)
    }
    setLoading(false)
  }

  const generatePRD = async () => {
    if (Object.keys(selStack).length < S.categories.length) {
      setError('Pilih satu opsi untuk setiap kategori tech stack.'); return
    }
    setError('')
    const stackSelection = Object.entries(selStack).map(([catId, val]) => {
      const catName = S.categories.find(c => c.id === catId)?.name || catId
      return `- ${catName}: ${val}`
    }).join('\n')

    const prompts = buildSystemPrompts(S.mode)
    const messages = LOADING_MESSAGES[S.mode]
    const totalPhases = S.mode === 'standar' ? 2 : S.mode === 'lengkap' ? 4 : 5

    set({ step: 3, prd: '', isGenerating: true, loadingText: messages[0], loadingPhase: 1, totalPhases })

    const baseContext = `KONSEP PRODUK:\n${S.concept}\n\nTECH STACK DIPILIH:\n${stackSelection}\n\nCATATAN TAMBAHAN:\n${userNote || 'Tidak ada'}\n\nCODING RULES WAJIB DISERTAKAN DI DOKUMEN:\n- Clean Code: kode mudah dibaca developer lain\n- Maintainable: mudah diubah tanpa merusak sistem\n- Scalable: tetap bagus walau project membesar\n- Secure: tidak mudah diserang\n- Consistent: semua developer punya style sama\n- Function hanya 1 responsibility\n- Jangan nested lebih dari 3 level\n- Jangan gunakan magic number\n- Semua API wajib punya validation\n- Semua async wajib handle error\n- Semua PR wajib direview minimal 1 developer\n- Dilarang push langsung ke production branch\n- Semua environment secret wajib di .env\n\n`

    try {
      // Phase 1
      set({ loadingText: messages[0], loadingPhase: 1 })
      let apiDocsResearch = ''
      try {
        const sonarQ = `Cari integrasi API eksternal yang dibutuhkan untuk: ${S.concept}. Berikan endpoint konkret, format JSON, dan dokumentasi resmi. Bahasa Indonesia. Jika tidak ada, balas "Tidak ada integrasi eksternal yang dibutuhkan."`
        const rRes = await apiCall({ message: sonarQ, engine: 'sonar' })
        apiDocsResearch = rRes.content || ''
      } catch { apiDocsResearch = '(Riset API tidak tersedia. Gunakan pengetahuan terbaik.)' }

      const d1 = await apiCall({
        message: baseContext + 'RISET API EKSTERNAL:\n' + apiDocsResearch + '\n\nTulis bagian 1 PRD.',
        system: prompts.prd1!, engine: 'gpt',
      })
      set({ prd: d1.content })

      // Phase 2
      await new Promise(r => setTimeout(r, 3000))
      set({ loadingText: messages[1] || messages[0], loadingPhase: 2 })
      const d2 = await apiCall({
        message: baseContext + 'PRD SEBELUMNYA:\n' + d1.content + '\n\nTulis bagian 2.',
        system: prompts.prd2!, engine: 'gpt',
      })
      setS(p => ({ ...p, prd: p.prd + '\n\n---\n\n' + d2.content }))

      // Phase 3 (lengkap & enterprise)
      if (prompts.prd3) {
        await new Promise(r => setTimeout(r, 3000))
        set({ loadingText: messages[2] || messages[0], loadingPhase: 3 })
        const d3 = await apiCall({
          message: baseContext + 'Tulis bagian 3.',
          system: prompts.prd3, engine: 'gpt',
        })
        setS(p => ({ ...p, prd: p.prd + '\n\n---\n\n' + d3.content }))
      }

      // Phase 4 (enterprise only)
      if (prompts.prd4) {
        await new Promise(r => setTimeout(r, 3000))
        set({ loadingText: messages[3] || messages[0], loadingPhase: 4 })
        const d4 = await apiCall({
          message: baseContext + 'Tulis bagian 4.',
          system: prompts.prd4, engine: 'gpt',
        })
        setS(p => ({ ...p, prd: p.prd + '\n\n---\n\n' + d4.content }))
      }

      // Phase 5 (enterprise only)
      if (prompts.prd5) {
        await new Promise(r => setTimeout(r, 3000))
        set({ loadingText: messages[4] || messages[0], loadingPhase: 5 })
        const d5 = await apiCall({
          message: baseContext + 'Tulis bagian 5 terakhir.',
          system: prompts.prd5, engine: 'gpt',
        })
        setS(p => ({ ...p, prd: p.prd + '\n\n---\n\n' + d5.content }))
      }

      // Enterprise: Generate folder structure & Claude Code guide
      if (S.mode === 'enterprise') {
        await new Promise(r => setTimeout(r, 3000))
        set({ loadingText: 'Generating struktur folder clean code...', loadingPhase: 6 })
        const fsRes = await apiCall({
          message: buildFolderStructurePrompt(S.concept, stackSelection),
          engine: 'gpt',
        })
        setFolderStructure(fsRes.content)

        if (S.outputTool === 'claude-code') {
          await new Promise(r => setTimeout(r, 2000))
          set({ loadingText: 'Generating Claude Code guide...', loadingPhase: 7 })
          setS(p => {
            const ccRes_promise = apiCall({
              message: buildClaudeCodePrompt(p.prd, stackSelection),
              engine: 'gpt',
            })
            ccRes_promise.then(r => setClaudeGuide(r.content)).catch(() => {})
            return p
          })
        }
      }

      set({ isGenerating: false })
    } catch (e: unknown) {
      const errMsg = e instanceof Error ? e.message : String(e)
      set({ isGenerating: false })
      setError(errMsg)
    }
  }

  const handleDownloadZip = async () => {
    setGeneratingZip(true)
    try {
      await generateZip(S.prd, folderStructure, claudeGuide, projectName || 'my-project')
    } catch (e: unknown) {
      const errMsg = e instanceof Error ? e.message : String(e)
      setError('Gagal membuat ZIP: ' + errMsg)
    }
    setGeneratingZip(false)
  }

  const copyPRD = () => {
    navigator.clipboard.writeText(S.prd)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Extract project name from PRD
  const getProjectName = () => {
    const match = S.prd.match(/^# (.+?)(?:\s*—|\s*-)/m)
    return match?.[1]?.trim() || 'my-project'
  }

  return (
    <div style={{ minHeight: '100vh', paddingTop: 80, paddingBottom: 64, background: 'var(--canvas)' }}>
      <div className="max-w-[1200px] mx-auto px-6 lg:px-12">

        {/* ── Header ── */}
        <div className="flex items-center justify-between mb-10 pt-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="m-stripe" style={{ width: 24, height: 3 }} />
              <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '2px', color: 'var(--muted)', textTransform: 'uppercase' }}>
                PRD GENERATOR
              </span>
            </div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700, color: 'var(--ink)', textTransform: 'uppercase', letterSpacing: 0 }}>
              BUAT PRODUCT REQUIREMENTS DOCUMENT
            </h1>
          </div>
          <button onClick={reset} className="flex items-center gap-2"
            style={{ fontSize: 12, fontWeight: 700, letterSpacing: '1px', color: 'var(--muted)', textTransform: 'uppercase', background: 'none', border: 'none', cursor: 'pointer' }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--ink)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--muted)')}>
            <RotateCcw size={13} /> RESET
          </button>
        </div>

        {/* ── Step Indicator ── */}
        <div className="flex items-center gap-3 mb-10 pb-6" style={{ borderBottom: '1px solid var(--hairline)' }}>
          {['MODE', 'KONSEP', 'ARSITEKTUR', 'DOKUMEN'].map((label, i) => {
            const step = (i + 1) as Step
            const isActive = S.step === step
            const isDone = S.step > step
            return (
              <div key={label} className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <div style={{
                    width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 11, fontWeight: 700,
                    background: isDone ? 'var(--m-blue-dark)' : isActive ? 'rgba(28,105,212,0.12)' : 'var(--surface-card)',
                    border: `1px solid ${isDone ? 'var(--m-blue-dark)' : isActive ? 'var(--m-blue-dark)' : 'var(--hairline)'}`,
                    color: isDone || isActive ? 'var(--ink)' : 'var(--muted)',
                  }}>
                    {isDone ? <Check size={12} /> : step}
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '1px', color: isActive ? 'var(--ink)' : 'var(--muted)' }} className="hidden sm:block">
                    {label}
                  </span>
                </div>
                {i < 3 && <ChevronRight size={12} style={{ color: 'var(--hairline)' }} />}
              </div>
            )
          })}
        </div>

        {/* ── Error ── */}
        {error && (
          <div className="flex items-start gap-3 mb-6 p-4" style={{ background: 'rgba(226,39,24,0.06)', border: '1px solid rgba(226,39,24,0.3)' }}>
            <AlertTriangle size={16} style={{ color: 'var(--m-red)', flexShrink: 0, marginTop: 2 }} />
            <p style={{ fontSize: 13, color: 'var(--m-red)' }}>{error}</p>
          </div>
        )}

        {/* ════════════════════════════════════════
            STEP 1A — Pilih Mode & Output Tool
            ════════════════════════════════════════ */}
        {S.step === 1 && !S.concept && !loading && (
          <div>
            {/* Mode Selection */}
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '2px', color: 'var(--muted)', textTransform: 'uppercase', marginBottom: 16 }}>
              01 — PILIH MODE PRD
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-px mb-10" style={{ border: '1px solid var(--hairline)' }}>
              {(Object.entries(PRD_MODES) as [PRDMode, typeof PRD_MODES['standar']][]).map(([key, cfg]) => {
                const Icon = cfg.icon
                const isSelected = S.mode === key
                return (
                  <button key={key} onClick={() => set({ mode: key })}
                    className="text-left p-6 transition-all"
                    style={{
                      background: isSelected ? 'var(--surface-elevated)' : 'var(--surface-card)',
                      borderRight: '1px solid var(--hairline)',
                      borderLeft: isSelected ? `3px solid ${cfg.color}` : '3px solid transparent',
                      cursor: 'pointer',
                    }}
                    onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = 'var(--surface-elevated)' }}
                    onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = 'var(--surface-card)' }}>
                    <div className="flex items-center justify-between mb-4">
                      <Icon size={20} style={{ color: cfg.color }} />
                      <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '1.5px', padding: '3px 8px', background: cfg.color, color: 'var(--ink)', textTransform: 'uppercase' }}>
                        {cfg.badge}
                      </span>
                    </div>
                    <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, color: 'var(--ink)', marginBottom: 4 }}>
                      {cfg.label}
                    </h3>
                    <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '1px', color: cfg.color, marginBottom: 10 }}>
                      {cfg.sublabel} · {cfg.phases} FASE
                    </p>
                    <p style={{ fontSize: 13, fontWeight: 300, color: 'var(--body)', lineHeight: 1.6 }}>
                      {cfg.desc}
                    </p>
                    {isSelected && (
                      <div className="flex items-center gap-2 mt-4" style={{ fontSize: 11, fontWeight: 700, color: cfg.color, letterSpacing: '1px' }}>
                        <Check size={12} /> DIPILIH
                      </div>
                    )}
                  </button>
                )
              })}
            </div>

            {/* Output Tool Selection (Enterprise) */}
            {S.mode === 'enterprise' && (
              <>
                <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '2px', color: 'var(--muted)', textTransform: 'uppercase', marginBottom: 16 }}>
                  02 — OUTPUT FORMAT
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-px mb-10" style={{ border: '1px solid var(--hairline)' }}>
                  {([
                    { id: 'markdown' as OutputTool, icon: BookOpen, label: 'MARKDOWN + ZIP', desc: 'PRD lengkap, struktur folder clean, dan panduan implementasi dalam satu file ZIP.' },
                    { id: 'claude-code' as OutputTool, icon: Terminal, label: 'CLAUDE CODE READY', desc: 'Semua di atas + instruksi siap pakai untuk Claude Code. Langsung coding dari dokumentasi.' },
                  ]).map(opt => {
                    const Icon = opt.icon
                    const isSelected = S.outputTool === opt.id
                    return (
                      <button key={opt.id} onClick={() => set({ outputTool: opt.id })}
                        className="text-left p-6 transition-all"
                        style={{
                          background: isSelected ? 'var(--surface-elevated)' : 'var(--surface-card)',
                          borderRight: '1px solid var(--hairline)',
                          borderLeft: isSelected ? '3px solid var(--m-red)' : '3px solid transparent',
                          cursor: 'pointer',
                        }}
                        onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = 'var(--surface-elevated)' }}
                        onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = 'var(--surface-card)' }}>
                        <Icon size={20} style={{ color: isSelected ? 'var(--m-red)' : 'var(--muted)', marginBottom: 12 }} />
                        <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--ink)', marginBottom: 8 }}>{opt.label}</h3>
                        <p style={{ fontSize: 13, fontWeight: 300, color: 'var(--body)', lineHeight: 1.6 }}>{opt.desc}</p>
                        {isSelected && <div className="flex items-center gap-2 mt-3" style={{ fontSize: 11, fontWeight: 700, color: 'var(--m-red)', letterSpacing: '1px' }}><Check size={12} /> DIPILIH</div>}
                      </button>
                    )
                  })}
                </div>
              </>
            )}

            {/* Coding Rules Info */}
            <div className="mb-8 p-5" style={{ background: 'rgba(28,105,212,0.05)', border: '1px solid rgba(28,105,212,0.2)' }}>
              <div className="flex items-center gap-2 mb-4">
                <Shield size={14} style={{ color: 'var(--m-blue-light)', flexShrink: 0 }} />
                <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '2px', color: 'var(--m-blue-light)', textTransform: 'uppercase' }}>CODING RULES — OTOMATIS DISERTAKAN</span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-px" style={{ border: '1px solid var(--hairline)', marginBottom: 16 }}>
                {[
                  { label: 'CLEAN CODE', desc: 'Mudah dibaca developer lain' },
                  { label: 'MAINTAINABLE', desc: 'Mudah diubah tanpa merusak sistem' },
                  { label: 'SCALABLE', desc: 'Tetap bagus walau project membesar' },
                  { label: 'SECURE', desc: 'Tidak mudah diserang' },
                  { label: 'CONSISTENT', desc: 'Semua developer punya style sama' },
                ].map(r => (
                  <div key={r.label} style={{ background: 'var(--surface-card)', padding: '10px 14px', borderRight: '1px solid var(--hairline)' }}>
                    <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: '1.5px', color: 'var(--m-blue-dark)', textTransform: 'uppercase', marginBottom: 4 }}>{r.label}</p>
                    <p style={{ fontSize: 11, fontWeight: 300, color: 'var(--muted)', lineHeight: 1.4 }}>{r.desc}</p>
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap gap-2">
                {[
                  '1 responsibility per function',
                  'Maks. 3 level nesting',
                  'No magic number',
                  'API wajib validation',
                  'Async wajib error handling',
                  'PR wajib review ≥1 developer',
                  'No direct push ke production',
                  'Secret wajib di .env',
                ].map(rule => (
                  <span key={rule} style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.5px', padding: '3px 10px', border: '1px solid var(--hairline)', color: 'var(--body)', background: 'var(--surface-card)', textTransform: 'uppercase' }}>
                    {rule}
                  </span>
                ))}
              </div>
            </div>

            {/* Input */}
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '2px', color: 'var(--muted)', textTransform: 'uppercase', marginBottom: 16 }}>
              {S.mode === 'enterprise' ? '03' : '02'} — DESKRIPSI PRODUK
            </p>
            <div style={{ background: 'var(--surface-card)', border: '1px solid var(--hairline)', padding: 24, marginBottom: 24 }}>
              <textarea
                rows={5}
                value={S.userInput}
                onChange={e => set({ userInput: e.target.value })}
                placeholder="Deskripsikan ide produk kamu secara detail. Semakin detail input, semakin baik dokumen yang dihasilkan. Contoh: Platform marketplace untuk UMKM kuliner lokal yang menghubungkan penjual dengan pembeli di radius 5km, dengan fitur order real-time, pembayaran digital, dan review sistem..."
                className="input-base resize-none"
                style={{ height: 140, marginBottom: 16 }}
              />
              <button
                disabled={!S.userInput.trim() || loading}
                onClick={() => refineConcept(S.userInput)}
                className="btn-m-accent flex items-center gap-2"
                style={{ opacity: !S.userInput.trim() || loading ? 0.5 : 1 }}>
                {loading ? <Loader2 size={15} className="animate-spin" /> : <ArrowRight size={15} />}
                ANALISIS KONSEP
              </button>
            </div>
          </div>
        )}

        {/* ── Loading Concept ── */}
        {S.step === 1 && loading && (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="m-stripe mb-8" style={{ width: 60 }} />
            <Loader2 size={32} className="animate-spin mb-4" style={{ color: 'var(--m-blue-light)' }} />
            <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--ink)', letterSpacing: '1px', textTransform: 'uppercase' }}>MENGANALISIS KONSEP...</p>
          </div>
        )}

        {/* ── Step 1B: Concept Review ── */}
        {S.step === 1 && S.concept && !loading && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2" style={{ background: 'var(--surface-card)', border: '1px solid var(--hairline)', padding: 32 }}>
              <div className="flex items-center gap-2 mb-6">
                <div className="m-stripe" style={{ width: 20, height: 3 }} />
                <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '2px', color: 'var(--muted)', textTransform: 'uppercase' }}>HASIL ANALISIS KONSEP</span>
              </div>
              <div className="prd-content" dangerouslySetInnerHTML={{ __html: renderMarkdown(S.concept) }} />
            </div>
            <div className="space-y-4">
              <div style={{ background: 'var(--surface-card)', border: '1px solid var(--hairline)', padding: 20 }}>
                <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '1.5px', color: 'var(--muted)', textTransform: 'uppercase', marginBottom: 12 }}>REVISI / FEEDBACK</p>
                <textarea rows={4} value={revInput} onChange={e => setRevInput(e.target.value)}
                  className="input-base resize-none" style={{ marginBottom: 12 }}
                  placeholder="Ada yang perlu diubah? Ketik di sini..." />
                <button onClick={() => { refineConcept(S.concept + '\n\nRevisi dari user: ' + revInput); setRevInput('') }}
                  disabled={!revInput.trim() || loading}
                  style={{ width: '100%', height: 40, background: 'none', border: '1px solid var(--hairline)', color: 'var(--body)', fontSize: 12, fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', cursor: 'pointer', opacity: !revInput.trim() ? 0.5 : 1 }}>
                  PERBARUI KONSEP
                </button>
              </div>
              <div style={{ background: 'var(--surface-card)', border: '1px solid var(--hairline)', padding: 20 }}>
                <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '1.5px', color: 'var(--muted)', textTransform: 'uppercase', marginBottom: 8 }}>
                  MODE AKTIF
                </p>
                <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--ink)' }}>{PRD_MODES[S.mode].label}</p>
                <p style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 16 }}>{PRD_MODES[S.mode].sublabel}</p>
              </div>
              <button onClick={startPlanning} className="btn-m-accent w-full flex items-center justify-center gap-2">
                LANJUT KE ARSITEKTUR <ArrowRight size={14} />
              </button>
            </div>
          </div>
        )}

        {/* ── Step 2: Loading ── */}
        {S.step === 2 && loading && (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="m-stripe mb-8" style={{ width: 60 }} />
            <Loader2 size={32} className="animate-spin mb-4" style={{ color: 'var(--m-blue-light)' }} />
            <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--ink)', letterSpacing: '1px', textTransform: 'uppercase' }}>MENGANALISIS ARSITEKTUR...</p>
            <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 8 }}>Memproses Sonar + GPT secara paralel</p>
          </div>
        )}

        {/* ── Step 2: Tech Stack Selection ── */}
        {S.step === 2 && !loading && S.categories.length > 0 && (
          <div>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '2px', color: 'var(--muted)', textTransform: 'uppercase', marginBottom: 6 }}>
              LANGKAH 2 — PILIH TECH STACK
            </p>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, color: 'var(--ink)', textTransform: 'uppercase', marginBottom: 24 }}>
              PILIH TEKNOLOGI UNTUK SETIAP LAPISAN
            </h2>

            {/* Sonar Research */}
            {S.research && (
              <div className="mb-8 p-5" style={{ background: 'rgba(28,105,212,0.06)', border: '1px solid rgba(28,105,212,0.25)' }}>
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp size={13} style={{ color: 'var(--m-blue-light)' }} />
                  <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '1.5px', color: 'var(--m-blue-light)', textTransform: 'uppercase' }}>SONAR RESEARCH — TREN 2025–2026</span>
                </div>
                <div className="prd-content text-sm" dangerouslySetInnerHTML={{ __html: renderMarkdown(S.research) }} />
              </div>
            )}

            {/* Category Grids */}
            {S.categories.map(cat => (
              <div key={cat.id} className="mb-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="m-stripe" style={{ width: 4, height: 20 }} />
                  <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--ink)', textTransform: 'uppercase', letterSpacing: '1px' }}>{cat.name}</h3>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-px" style={{ border: '1px solid var(--hairline)' }}>
                  {cat.options.map(opt => {
                    const isSelected = selStack[cat.id] === opt.name
                    return (
                      <label key={opt.name} className="cursor-pointer block">
                        <input type="radio" name={`cat_${cat.id}`} value={opt.name} className="hidden"
                          onChange={() => setSelStack(p => ({ ...p, [cat.id]: opt.name }))} />
                        <div className="p-4 h-full transition-all relative" style={{
                          background: isSelected ? 'rgba(28,105,212,0.10)' : 'var(--surface-card)',
                          borderRight: '1px solid var(--hairline)',
                          borderLeft: isSelected ? '3px solid var(--m-blue-dark)' : '3px solid transparent',
                          minHeight: 100,
                        }}>
                          {opt.badge && (
                            <span style={{ fontSize: 8, fontWeight: 700, letterSpacing: '1px', padding: '2px 6px', background: 'var(--m-blue-dark)', color: 'var(--ink)', textTransform: 'uppercase', display: 'inline-block', marginBottom: 8 }}>
                              {opt.badge}
                            </span>
                          )}
                          {isSelected && (
                            <div style={{ position: 'absolute', top: 8, right: 8, width: 16, height: 16, background: 'var(--m-blue-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <Check size={9} style={{ color: 'var(--ink)' }} />
                            </div>
                          )}
                          <h4 style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink)', marginBottom: 6 }}>{opt.name}</h4>
                          <p style={{ fontSize: 11, fontWeight: 300, color: 'var(--muted)', lineHeight: 1.5 }}>{opt.description}</p>
                        </div>
                      </label>
                    )
                  })}
                </div>
              </div>
            ))}

            {/* Notes + Generate */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6" style={{ border: '1px solid var(--hairline)', padding: 20, background: 'var(--surface-card)' }}>
              <div className="md:col-span-2">
                <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '1px', color: 'var(--muted)', textTransform: 'uppercase', marginBottom: 8 }}>CATATAN TAMBAHAN (OPSIONAL)</p>
                <input type="text" value={userNote} onChange={e => setUserNote(e.target.value)}
                  className="input-base"
                  placeholder="cth: Timeline 2 bulan, budget infrastruktur < Rp500rb/bulan, prioritas fitur pembayaran..." />
              </div>
              <div className="flex items-end">
                <button onClick={generatePRD} className="btn-m-accent w-full flex items-center justify-center gap-2">
                  GENERATE PRD <ArrowRight size={14} />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Step 3: PRD Generating & Output ── */}
        {S.step === 3 && (
          <div>
            {/* Progress Bar */}
            {S.isGenerating && (
              <div className="mb-8">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <Loader2 size={16} className="animate-spin" style={{ color: 'var(--m-blue-light)' }} />
                    <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: '1px', color: 'var(--ink)', textTransform: 'uppercase' }}>
                      {S.loadingText}
                    </span>
                  </div>
                  <span style={{ fontSize: 11, color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>
                    FASE {S.loadingPhase}/{S.totalPhases}
                  </span>
                </div>
                <div style={{ height: 3, background: 'var(--surface-elevated)' }}>
                  <div className="m-stripe" style={{ width: `${(S.loadingPhase / S.totalPhases) * 100}%`, height: 3, transition: 'width 0.5s ease' }} />
                </div>
              </div>
            )}

            {/* PRD Output */}
            {S.prd && (
              <>
                {/* Toolbar */}
                <div className="flex flex-wrap items-center justify-between gap-3 mb-6 pb-5" style={{ borderBottom: '1px solid var(--hairline)' }}>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '2px', color: S.isGenerating ? 'var(--warning)' : 'var(--success)', textTransform: 'uppercase' }}>
                        ● {S.isGenerating ? 'SEDANG DIBUAT...' : 'DOKUMEN SELESAI'}
                      </span>
                    </div>
                    <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, color: 'var(--ink)', textTransform: 'uppercase' }}>
                      PRODUCT REQUIREMENTS DOCUMENT
                    </h2>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <button onClick={copyPRD} className="btn-m flex items-center gap-2">
                      {copied ? <Check size={13} /> : <Copy size={13} />}
                      {copied ? 'TERSALIN!' : 'COPY MARKDOWN'}
                    </button>
                    {!S.isGenerating && (
                      <button
                        onClick={handleDownloadZip}
                        disabled={generatingZip}
                        className="btn-m-accent flex items-center gap-2"
                        style={{ opacity: generatingZip ? 0.7 : 1 }}>
                        {generatingZip ? <Loader2 size={13} className="animate-spin" /> : <Download size={13} />}
                        {generatingZip ? 'MEMBUAT ZIP...' : 'DOWNLOAD ZIP'}
                      </button>
                    )}
                  </div>
                </div>

                {/* PRD Content */}
                <div style={{ background: 'var(--surface-card)', border: '1px solid var(--hairline)', padding: 40 }}
                  className="prd-content"
                  dangerouslySetInnerHTML={{ __html: renderMarkdown(S.prd) }} />

                {/* Folder Structure (Enterprise) */}
                {folderStructure && !S.isGenerating && (
                  <div style={{ background: 'var(--surface-card)', border: '1px solid var(--hairline)', padding: 32, marginTop: 4 }}>
                    <div className="flex items-center gap-2 mb-6">
                      <FolderTree size={16} style={{ color: 'var(--m-blue-light)' }} />
                      <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '2px', color: 'var(--muted)', textTransform: 'uppercase' }}>STRUKTUR FOLDER — CLEAN CODE</span>
                    </div>
                    <div className="prd-content" dangerouslySetInnerHTML={{ __html: renderMarkdown(folderStructure) }} />
                  </div>
                )}

                {/* Claude Code Guide (Enterprise + claude-code mode) */}
                {claudeGuide && !S.isGenerating && (
                  <div style={{ background: 'rgba(226,39,24,0.04)', border: '1px solid rgba(226,39,24,0.25)', padding: 32, marginTop: 4 }}>
                    <div className="flex items-center gap-2 mb-6">
                      <Terminal size={16} style={{ color: 'var(--m-red)' }} />
                      <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '2px', color: 'var(--m-red)', textTransform: 'uppercase' }}>CLAUDE CODE — IMPLEMENTATION GUIDE</span>
                    </div>
                    <div className="prd-content" dangerouslySetInnerHTML={{ __html: renderMarkdown(claudeGuide) }} />
                  </div>
                )}

                {/* Download CTA setelah selesai */}
                {!S.isGenerating && (
                  <div className="mt-6 p-6 flex flex-wrap items-center justify-between gap-4" style={{ background: 'var(--surface-card)', border: '1px solid var(--hairline)' }}>
                    <div>
                      <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink)', marginBottom: 4 }}>DOKUMEN SIAP DIUNDUH</p>
                      <p style={{ fontSize: 12, fontWeight: 300, color: 'var(--muted)' }}>
                        ZIP berisi PRD.md{folderStructure ? ', FOLDER-STRUCTURE.md' : ''}{claudeGuide ? ', CLAUDE-CODE-GUIDE.md' : ''}, dan README.md
                      </p>
                    </div>
                    <div className="flex gap-3 items-center flex-wrap">
                      <input
                        type="text"
                        placeholder="Nama project (opsional)"
                        value={projectName}
                        onChange={e => setProjectName(e.target.value)}
                        className="input-base"
                        style={{ width: 200, height: 40, fontSize: 12 }}
                        onFocus={e => { if (!projectName) setProjectName(getProjectName()) }}
                      />
                      <button onClick={handleDownloadZip} disabled={generatingZip} className="btn-m-accent flex items-center gap-2">
                        {generatingZip ? <Loader2 size={13} className="animate-spin" /> : <Package size={13} />}
                        {generatingZip ? 'MEMBUAT ZIP...' : 'DOWNLOAD ZIP'}
                      </button>
                    </div>
                  </div>
                )}

                {/* ── AI PROMPT PANEL ── */}
                {!S.isGenerating && (() => {
                  const stackStr = Object.entries(selStack).map(([k,v]) => `${k}: ${v}`).join(', ')
                  const pName = projectName || getProjectName()
                  const prompts = buildAIPrompts(S.prd, stackStr, pName)
                  const active = prompts.find(p => p.target === activePromptTarget) || prompts[0]
                  const copyPrompt = () => {
                    navigator.clipboard.writeText(active.prompt)
                    setCopiedPrompt(true)
                    setTimeout(() => setCopiedPrompt(false), 2500)
                  }

                  return (
                    <div className="mt-4" style={{ border: '1px solid var(--hairline)' }}>
                      {/* Panel Header */}
                      <div className="flex items-center gap-3 px-6 py-4" style={{ background: 'var(--surface-elevated)', borderBottom: '1px solid var(--hairline)' }}>
                        <Sparkles size={16} style={{ color: 'var(--m-blue-light)', flexShrink: 0 }} />
                        <div className="flex-1">
                          <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink)', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
                            PROMPT SIAP PAKAI — BUILD DENGAN AI
                          </p>
                          <p style={{ fontSize: 11, fontWeight: 300, color: 'var(--muted)', marginTop: 2 }}>
                            Salin prompt di bawah dan paste ke Claude, ChatGPT, Cursor, atau Claude Code untuk langsung mulai coding
                          </p>
                        </div>
                      </div>

                      {/* Target Selector Tabs */}
                      <div className="flex overflow-x-auto" style={{ borderBottom: '1px solid var(--hairline)', background: 'var(--surface-card)' }}>
                        {prompts.map(p => {
                          const Icon = p.icon
                          const isActive = activePromptTarget === p.target
                          return (
                            <button
                              key={p.target}
                              onClick={() => setActivePromptTarget(p.target)}
                              className="flex items-center gap-2 px-5 py-3 whitespace-nowrap transition-all flex-shrink-0"
                              style={{
                                background: isActive ? 'var(--surface-elevated)' : 'transparent',
                                borderBottom: isActive ? `2px solid ${p.color}` : '2px solid transparent',
                                borderRight: '1px solid var(--hairline)',
                                cursor: 'pointer',
                              }}
                            >
                              <Icon size={13} style={{ color: isActive ? p.color : 'var(--muted)' }} />
                              <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', color: isActive ? 'var(--ink)' : 'var(--muted)' }}>
                                {p.label}
                              </span>
                            </button>
                          )
                        })}
                      </div>

                      {/* Active Prompt Content */}
                      <div style={{ background: 'var(--surface-card)' }}>
                        {/* Description bar */}
                        <div className="flex items-center justify-between px-6 py-3" style={{ borderBottom: '1px solid var(--hairline)', background: 'var(--surface-soft)' }}>
                          <p style={{ fontSize: 12, fontWeight: 300, color: 'var(--body)' }}>
                            {active.description}
                          </p>
                          <button
                            onClick={copyPrompt}
                            className="flex items-center gap-2 flex-shrink-0 ml-4"
                            style={{
                              padding: '8px 20px',
                              background: copiedPrompt ? 'var(--success)' : active.color,
                              border: 'none',
                              color: 'var(--ink)',
                              fontSize: 11,
                              fontWeight: 700,
                              letterSpacing: '1.5px',
                              textTransform: 'uppercase',
                              cursor: 'pointer',
                              transition: 'background 0.2s',
                              display: 'flex',
                              alignItems: 'center',
                              gap: 8,
                            }}
                          >
                            {copiedPrompt ? <Check size={12} /> : <Copy size={12} />}
                            {copiedPrompt ? 'TERSALIN!' : 'SALIN PROMPT'}
                          </button>
                        </div>

                        {/* Prompt text area */}
                        <div style={{ position: 'relative' }}>
                          <pre style={{
                            padding: '24px 28px',
                            fontFamily: 'var(--font-mono)',
                            fontSize: 12,
                            lineHeight: 1.7,
                            color: 'var(--body)',
                            whiteSpace: 'pre-wrap',
                            wordBreak: 'break-word',
                            maxHeight: 400,
                            overflowY: 'auto',
                            background: 'var(--canvas)',
                            margin: 0,
                            borderTop: `3px solid ${active.color}`,
                          }}>
                            {active.prompt}
                          </pre>
                          {/* Copy overlay button */}
                          <button
                            onClick={copyPrompt}
                            style={{
                              position: 'absolute',
                              top: 12,
                              right: 16,
                              background: 'var(--surface-elevated)',
                              border: '1px solid var(--hairline)',
                              color: copiedPrompt ? 'var(--success)' : 'var(--muted)',
                              padding: '4px 10px',
                              fontSize: 10,
                              fontWeight: 700,
                              letterSpacing: '1px',
                              textTransform: 'uppercase',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: 6,
                            }}
                          >
                            {copiedPrompt ? <Check size={10} /> : <Copy size={10} />}
                            {copiedPrompt ? 'COPIED' : 'COPY'}
                          </button>
                        </div>

                        {/* Usage hint */}
                        <div className="flex flex-wrap items-center gap-3 px-6 py-3" style={{ borderTop: '1px solid var(--hairline)', background: 'var(--surface-soft)' }}>
                          <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '1px', color: 'var(--muted)', textTransform: 'uppercase' }}>PASTE KE:</p>
                          {[
                            { label: 'Claude.ai', href: 'https://claude.ai' },
                            { label: 'Claude Code', href: 'https://claude.ai/code' },
                            { label: 'ChatGPT', href: 'https://chatgpt.com' },
                            { label: 'Cursor', href: 'https://cursor.sh' },
                            { label: 'Windsurf', href: 'https://codeium.com/windsurf' },
                          ].map(tool => (
                            <a key={tool.label} href={tool.href} target="_blank" rel="noopener noreferrer"
                              style={{ fontSize: 10, fontWeight: 700, letterSpacing: '1px', padding: '3px 10px', border: '1px solid var(--hairline)', color: 'var(--body)', background: 'var(--surface-card)', textTransform: 'uppercase', textDecoration: 'none', transition: 'border-color 0.15s' }}
                              onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--m-blue-dark)')}
                              onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--hairline)')}>
                              {tool.label}
                            </a>
                          ))}
                        </div>
                      </div>
                    </div>
                  )
                })()}
              </>
            )}

            {/* Loading state (no prd yet) */}
            {!S.prd && S.isGenerating && (
              <div className="flex flex-col items-center justify-center py-24">
                <div className="m-stripe mb-8" style={{ width: 80 }} />
                <Loader2 size={32} className="animate-spin mb-4" style={{ color: 'var(--m-blue-light)' }} />
                <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--ink)', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 8 }}>
                  {S.loadingText}
                </p>
                <p style={{ fontSize: 12, color: 'var(--muted)' }}>
                  Mode {PRD_MODES[S.mode].label} — {PRD_MODES[S.mode].sublabel}
                </p>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  )
}
