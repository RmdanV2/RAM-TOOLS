# RAM Tools — All-in-One IT Project Suite

> Platform tools profesional untuk kebutuhan Coding & Project IT.  
> Tiga tools terintegrasi dalam satu antarmuka yang bersih dan elegan.

---

## Daftar Isi

- [Gambaran Umum](#gambaran-umum)
- [Fitur](#fitur)
- [Tech Stack](#tech-stack)
- [Struktur Folder](#struktur-folder)
- [Cara Instalasi](#cara-instalasi)
- [Konfigurasi Environment](#konfigurasi-environment)
- [Alur Penggunaan](#alur-penggunaan)
  - [PRD Generator](#1-prd-generator)
  - [Diagram Sistem](#2-diagram-sistem)
  - [Flowchart Builder](#3-flowchart-builder)
- [Deploy ke Vercel](#deploy-ke-vercel)
- [Kustomisasi](#kustomisasi)
- [Troubleshooting](#troubleshooting)
- [Kredit](#kredit)

---

## Gambaran Umum

**RAM Tools** adalah platform web all-in-one yang dirancang untuk membantu developer, product manager, dan arsitek sistem dalam:

- Membuat **Product Requirements Document (PRD)** secara otomatis dengan bantuan AI
- Merancang **arsitektur sistem** secara visual (server, database, CDN, firewall, dll.)
- Membangun **flowchart profesional** dengan semua simbol standar

Tersedia dalam dua bahasa: **Indonesia** dan **English**, dengan dukungan **Dark Mode** dan **Light Mode**.

---

## Fitur

### PRD Generator
- Input konsep produk → AI menyempurnakan dan menganalisis
- Pilih tech stack per layer (Frontend, Backend, Database, Infra)
- Generate PRD 3-fase: Dokumen → Arsitektur & BRD → UI/UX Wireframe ASCII
- Integrasi Sonar untuk riset API dan market insights terkini
- Copy markdown hasil ke clipboard

### Diagram Sistem
- Canvas drag-and-drop dengan 12 komponen sistem: Server, Database, Firewall, CDN, Client, API Gateway, Cache, Message Queue, Load Balancer, Storage, Microservice, External API
- Sambung komponen dengan panah berlabel dan animasi
- Pan dan zoom canvas
- Export diagram ke SVG
- Double-click node untuk edit label
- Hapus node/koneksi yang dipilih

### Flowchart Builder
- 12 simbol standar flowchart (referensi Flowdia):
  - Terminator (Start/End)
  - Process, Decision, Input/Output
  - Predefined Process, Connector, Database
  - Document, Manual Operation, Delay, Display, Annotation
- Drag, sambungkan dengan panah berlabel
- Pan dan zoom canvas
- Export ke PNG beresolusi tinggi
- Double-click untuk edit label

---

## Tech Stack

| Layer | Teknologi |
|-------|-----------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Animation | Anime.js + CSS Animations |
| Icons | Lucide React |
| Themes | next-themes (Dark/Light) |
| Markdown | marked.js |
| Diagram | Mermaid.js |
| Deploy | Vercel |
| Font | Playfair Display + DM Sans + JetBrains Mono |

---

## Struktur Folder

```
ram-tools/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── prd-chat/
│   │   │       └── route.ts          # API route proxy untuk PRD AI
│   │   ├── globals.css               # Global styles + CSS variables (gold theme)
│   │   ├── layout.tsx                # Root layout dengan ThemeProvider
│   │   └── page.tsx                  # Main page & tool router
│   │
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Navbar.tsx            # Navigasi utama + toggle bahasa/tema
│   │   │   ├── Footer.tsx            # Footer "By Ramdan"
│   │   │   └── ThemeProvider.tsx     # next-themes wrapper
│   │   │
│   │   └── tools/
│   │       ├── HomePage.tsx          # Landing page dengan card tools
│   │       ├── PRDTool.tsx           # PRD Generator (3-fase AI)
│   │       ├── DiagramTool.tsx       # System Diagram canvas
│   │       └── FlowchartTool.tsx     # Flowchart Builder canvas
│   │
│   └── lib/
│       ├── utils.ts                  # cn() helper (clsx + tailwind-merge)
│       └── i18n.ts                   # Teks terjemahan ID/EN
│
├── public/                           # Static assets
├── .env.local.example                # Template environment variables
├── .gitignore
├── next.config.js
├── postcss.config.js
├── tailwind.config.ts
├── tsconfig.json
├── package.json
└── README.md
```

---

## Cara Instalasi

### Prasyarat
- Node.js **18.x** atau lebih baru
- npm, yarn, atau pnpm

### Langkah-langkah

**1. Clone repositori**
```bash
git clone https://github.com/username/ram-tools.git
cd ram-tools
```

**2. Install dependensi**
```bash
npm install
# atau
yarn install
# atau
pnpm install
```

**3. Setup environment**
```bash
cp .env.local.example .env.local
```
Buka `.env.local` dan isi nilai yang diperlukan (lihat [Konfigurasi Environment](#konfigurasi-environment)).

**4. Jalankan development server**
```bash
npm run dev
```

Buka browser dan akses `http://localhost:3000`.

---

## Konfigurasi Environment

Salin `.env.local.example` menjadi `.env.local` dan sesuaikan:

```env
# URL upstream API untuk PRD Generator
# Wajib diisi jika ingin menggunakan fitur AI (PRD Generator)
UPSTREAM_URL=https://your-upstream-api.com

# Cookie autentikasi upstream
UPSTREAM_COOKIE=your_session_cookie_here
```

> **Catatan:** Jika `UPSTREAM_URL` kosong, PRD Generator akan berjalan dalam **Demo Mode** dan menampilkan pesan konfigurasi. Fitur Diagram Sistem dan Flowchart Builder tidak memerlukan konfigurasi ini dan berfungsi penuh secara offline.

### Mendapatkan `UPSTREAM_URL` dan `UPSTREAM_COOKIE`

PRD Generator menggunakan proxy API yang kompatibel dengan endpoint berikut:
- `/api/chat-message` — untuk GPT model
- `/api/perplexity-message` — untuk Sonar/Perplexity

Pastikan upstream API kamu mendukung format payload yang sesuai (lihat `src/app/api/prd-chat/route.ts` untuk detail struktur request/response).

---

## Alur Penggunaan

### 1. PRD Generator

```
Input Ide Produk
      ↓
AI Menyempurnakan Konsep (refineConcept)
      ↓
Review & Revisi (opsional)
      ↓
Konfirmasi → Lanjut ke Arsitektur
      ↓
AI Menganalisis Tech Stack (startPlanning)
  + Sonar Market Insights 2025
      ↓
Pilih Tech Stack per Kategori:
  - Frontend, Backend, Database, Infra
      ↓
Klik "Generate PRD"
      ↓
Fase 1: Struktur PRD (7 seksi)
  - Overview, Requirements, Core Features,
    User Flow, Architecture, Database Schema, Constraints
      ↓
Fase 2: BRD + Tech Stack + API Docs + ERD (Mermaid)
      ↓
Fase 3: UI/UX Structure + ASCII Wireframes
      ↓
Dokumen Selesai → Copy Markdown
```

**Tips:**
- Semakin detail deskripsi awal, semakin baik hasilnya
- Gunakan field "Catatan Tambahan" untuk spesifikasi khusus (timeline, prioritas fitur, dll.)
- Klik "Reset" kapan saja untuk memulai dari awal

---

### 2. Diagram Sistem

```
Pilih Komponen dari Sidebar (klik untuk menambahkan ke canvas)
      ↓
Atur Posisi dengan Drag
      ↓
Pilih Tool "Panah" → Klik node asal → Klik node tujuan
      ↓
Double-click Panah → Edit Label (misal: "HTTPS", "SQL Query")
      ↓
Double-click Node → Edit Label komponen
      ↓
Zoom In/Out dengan tombol toolbar
      ↓
Pan canvas dengan Alt + Drag
      ↓
Export → Unduh SVG
```

**Komponen tersedia:**
- Client Layer: Client, CDN
- Edge/Security: Firewall, Load Balancer
- Services: Server, API Gateway, Microservice, External API
- Data Layer: Database, Cache, Message Queue, Storage

---

### 3. Flowchart Builder

```
Pilih Simbol dari Sidebar (klik untuk menambahkan)
      ↓
Atur Posisi dengan Drag
      ↓
Pilih Tool "Panah" → Klik simbol asal → Klik simbol tujuan
      ↓
Double-click Panah → Edit Label (misal: "Ya", "Tidak")
      ↓
Double-click Simbol → Edit Label (misal: "Validasi Input")
      ↓
Klik simbol/panah → Delete untuk menghapus
      ↓
Export → Unduh PNG beresolusi tinggi
```

**Simbol tersedia (referensi Flowdia Diagram):**
| Simbol | Fungsi |
|--------|--------|
| Terminator | Start / End |
| Process | Langkah/Operasi |
| Decision | Percabangan Ya/Tidak |
| Input/Output | Data masuk/keluar |
| Predefined Process | Sub-routine/Fungsi |
| Connector | Titik sambung |
| Database | Penyimpanan data |
| Document | Output dokumen |
| Manual Operation | Input manusia |
| Delay | Waktu tunggu |
| Display | Output tampilan |
| Annotation | Komentar/Catatan |

---

## Deploy ke Vercel

**Metode 1: Via Vercel CLI**
```bash
npm install -g vercel
vercel login
vercel
```

**Metode 2: Via GitHub**
1. Push repo ke GitHub
2. Buka [vercel.com](https://vercel.com) → New Project
3. Import repo dari GitHub
4. Set Environment Variables di dashboard Vercel:
   - `UPSTREAM_URL`
   - `UPSTREAM_COOKIE`
5. Klik Deploy

**Metode 3: Via tombol deploy**

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/username/ram-tools)

---

## Kustomisasi

### Mengubah Warna Gold

Edit CSS variables di `src/app/globals.css`:

```css
:root {
  --gold-primary: #b8860b;  /* Gold utama (light mode) */
  --gold-accent:  #d4a017;  /* Gold aksen (light mode) */
}
.dark {
  --gold-primary: #d4a017;  /* Gold utama (dark mode) */
  --gold-accent:  #f0b429;  /* Gold aksen (dark mode) */
}
```

### Menambah Bahasa

Edit `src/lib/i18n.ts`:
```typescript
export type Lang = 'id' | 'en' | 'jp' // tambah kode bahasa

export const t = {
  home: {
    badge: { id: '...', en: '...', jp: '...' },
    // ...
  }
}
```

### Menambah Komponen Diagram

Edit array `NODE_DEFS` di `src/components/tools/DiagramTool.tsx`:
```typescript
const NODE_DEFS: Record<NodeType, ...> = {
  // tambah entry baru di sini
  kubernetes: { icon: '☸️', color: '#326ce5', bg: '#dbeafe', label: { id: 'Kubernetes', en: 'Kubernetes' } },
}
```

### Menambah Simbol Flowchart

Edit array `SHAPES` di `src/components/tools/FlowchartTool.tsx` dan tambahkan case baru di fungsi `renderShape()` dan `MiniShape`.

---

## Troubleshooting

**PRD Generator menampilkan "Demo Mode"**
- Pastikan `UPSTREAM_URL` sudah diisi di `.env.local`
- Restart development server setelah mengubah env

**Canvas tidak bisa di-scroll/pan**
- Gunakan **Alt + Drag** untuk pan canvas
- Gunakan tombol zoom di toolbar

**Export PNG kosong/putih**
- Pastikan ada node di canvas sebelum export
- Coba zoom ke 100% terlebih dahulu

**Build error TypeScript**
```bash
npm run lint      # cek lint errors
npx tsc --noEmit  # cek type errors
```

**Mermaid tidak render di PRD**
- Pastikan koneksi internet aktif (Mermaid diload dari CDN)
- Cek console browser untuk error parsing

---

## Kredit

Dibuat dengan ❤️ oleh **Ramdan**

- Framework: [Next.js](https://nextjs.org)
- Styling: [Tailwind CSS](https://tailwindcss.com)
- Icons: [Lucide React](https://lucide.dev)
- Themes: [next-themes](https://github.com/pacocoursey/next-themes)
- Fonts: [Google Fonts](https://fonts.google.com) (Playfair Display, DM Sans, JetBrains Mono)

---

*RAM Tools © 2024 — All rights reserved*
