'use client'
import { useState } from 'react'
import {
  User, Briefcase, GraduationCap, Award, Code2, Globe,
  Plus, Trash2, Download, Eye, ArrowLeft, ArrowRight, Check,
  Sparkles, Star, Loader2, FileText, Palette, MoveUp, MoveDown,
  Settings2, type LucideIcon,
} from 'lucide-react'
import type { Lang } from '@/lib/i18n'

type CVLang = 'id' | 'en'

const L = {
  id: {
    sectionLabels: { template: 'Template', personal: 'Data Diri', experience: 'Pengalaman', education: 'Pendidikan', skills: 'Keahlian', projects: 'Proyek', certifications: 'Sertifikasi', languages: 'Bahasa', preview: 'Preview & Unduh' },
    headings: { experience: 'PENGALAMAN KERJA', education: 'PENDIDIKAN', skills: 'KEAHLIAN', projects: 'PROYEK', certifications: 'SERTIFIKASI', languages: 'BAHASA', summary: 'RINGKASAN PROFESIONAL', achievements: 'PENCAPAIAN' },
    present: 'Sekarang', gpa: 'IPK', contact: 'KONTAK',
    downloadPDF: 'UNDUH PDF', downloadHTML: 'UNDUH HTML', print: 'CETAK',
    addExp: 'TAMBAH PENGALAMAN', addEdu: 'TAMBAH PENDIDIKAN', addSkill: 'TAMBAH KELOMPOK SKILL',
    addProject: 'TAMBAH PROYEK', addCert: 'TAMBAH SERTIFIKASI', addLang: 'TAMBAH BAHASA',
    addBullet: 'TAMBAH PENCAPAIAN', aiEnhance: 'AI ENHANCE', aiSuggest: 'AI SUGGEST SKILLS',
    stillWorking: 'Masih bekerja di sini', stillStudying: 'Masih kuliah', livePreview: 'LIVE PREVIEW',
    selected: 'DIPILIH', prev: 'SEBELUMNYA', next: 'SELANJUTNYA',
    cvOptions: 'OPSI CV', cvLangLabel: 'BAHASA CV', iconsLabel: 'IKON KONTAK', accentLabel: 'WARNA AKSEN', fontSizeLabel: 'UKURAN FONT',
    withIcons: '✦ DENGAN IKON', noIcons: '— TANPA IKON', small: 'KECIL', normal: 'NORMAL', large: 'BESAR',
    previewTitle: 'PREVIEW & UNDUH', previewDesc: 'Pastikan semua informasi sudah benar sebelum mengunduh.',
    atsScore: 'SKOR ATS', atsReady: '✓ Siap dikirim!', atsWarn: '⚠ Perlu perbaikan', atsFail: '✗ Lengkapi CV',
    checks: ['Nama lengkap diisi','Email diisi','Nomor telepon diisi','Ringkasan ≥ 50 karakter','Minimal 1 pengalaman','Deskripsi pengalaman diisi','Minimal 1 pendidikan','Minimal 3 skill','LinkedIn / Website diisi','Template ATS-friendly'],
  },
  en: {
    sectionLabels: { template: 'Template', personal: 'Personal Info', experience: 'Experience', education: 'Education', skills: 'Skills', projects: 'Projects', certifications: 'Certifications', languages: 'Languages', preview: 'Preview & Download' },
    headings: { experience: 'WORK EXPERIENCE', education: 'EDUCATION', skills: 'SKILLS', projects: 'PROJECTS', certifications: 'CERTIFICATIONS', languages: 'LANGUAGES', summary: 'PROFESSIONAL SUMMARY', achievements: 'ACHIEVEMENTS' },
    present: 'Present', gpa: 'GPA', contact: 'CONTACT',
    downloadPDF: 'DOWNLOAD PDF', downloadHTML: 'DOWNLOAD HTML', print: 'PRINT',
    addExp: 'ADD EXPERIENCE', addEdu: 'ADD EDUCATION', addSkill: 'ADD SKILL GROUP',
    addProject: 'ADD PROJECT', addCert: 'ADD CERTIFICATION', addLang: 'ADD LANGUAGE',
    addBullet: 'ADD ACHIEVEMENT', aiEnhance: 'AI ENHANCE', aiSuggest: 'AI SUGGEST SKILLS',
    stillWorking: 'Currently working here', stillStudying: 'Currently studying', livePreview: 'LIVE PREVIEW',
    selected: 'SELECTED', prev: 'PREVIOUS', next: 'NEXT',
    cvOptions: 'CV OPTIONS', cvLangLabel: 'CV LANGUAGE', iconsLabel: 'CONTACT ICONS', accentLabel: 'ACCENT COLOR', fontSizeLabel: 'FONT SIZE',
    withIcons: '✦ WITH ICONS', noIcons: '— NO ICONS', small: 'SMALL', normal: 'NORMAL', large: 'LARGE',
    previewTitle: 'PREVIEW & DOWNLOAD', previewDesc: 'Make sure all information is correct before downloading.',
    atsScore: 'ATS SCORE', atsReady: '✓ Ready to send!', atsWarn: '⚠ Needs improvement', atsFail: '✗ Complete your CV',
    checks: ['Full name filled in','Email filled in','Phone number filled in','Summary ≥ 50 chars','At least 1 experience','Experience descriptions filled','At least 1 education','At least 3 skills','LinkedIn / Website filled','ATS-friendly template'],
  },
}

interface CVData {
  personal: { name: string; title: string; email: string; phone: string; location: string; website: string; linkedin: string; github: string; summary: string }
  experience: WorkExp[]
  education: Education[]
  skills: SkillGroup[]
  projects: Project[]
  certifications: Certification[]
  languages: LangItem[]
}
interface WorkExp { id: string; company: string; role: string; startDate: string; endDate: string; current: boolean; location: string; description: string; achievements: string[] }
interface Education { id: string; institution: string; degree: string; field: string; startDate: string; endDate: string; current: boolean; gpa: string; honors: string }
interface SkillGroup { id: string; category: string; items: string[] }
interface Project { id: string; name: string; description: string; tech: string; url: string; startDate: string; endDate: string }
interface Certification { id: string; name: string; issuer: string; date: string; credentialId: string; url: string }
interface LangItem { id: string; language: string; level: string }
interface CVOptions { cvLang: CVLang; useIcons: boolean; accentColor: string; fontSize: 'small' | 'normal' | 'large' }

type TemplateId = 'ats' | 'classic' | 'modern' | 'executive' | 'minimal' | 'creative'
interface Template { id: TemplateId; name: string; desc: { id: string; en: string }; badge: string; badgeColor: string; accent: string; atsScore: number }

const TEMPLATES: Template[] = [
  { id: 'ats',       name: 'ATS OPTIMIZER', desc: { id: 'Dirancang melewati ATS. Format bersih, terstruktur sempurna.', en: 'Engineered to pass ATS. Clean, perfectly structured.' },      badge: '98% ATS', badgeColor: '#0fa336', accent: '#1c69d4', atsScore: 98 },
  { id: 'classic',   name: 'CLASSIC',        desc: { id: 'Hitam putih elegan. Cocok untuk perbankan, hukum, finance.',   en: 'Elegant black & white. Ideal for banking, law, finance.' },    badge: 'POPULER', badgeColor: '#1c69d4', accent: '#1a1a1a', atsScore: 95 },
  { id: 'modern',    name: 'MODERN TECH',    desc: { id: 'Aksen biru profesional. Ideal untuk software engineer, PM.',   en: 'Professional blue accent. Ideal for engineers & PMs.' },       badge: 'TECH',    badgeColor: '#0066b1', accent: '#0066b1', atsScore: 92 },
  { id: 'executive', name: 'EXECUTIVE',      desc: { id: 'Header bold premium. Untuk C-level, VP, Director.',           en: 'Premium bold header. For C-level, VP, Director.' },            badge: 'SENIOR',  badgeColor: '#b8860b', accent: '#b8860b', atsScore: 88 },
  { id: 'minimal',   name: 'MINIMAL',        desc: { id: 'Tipografi bersih, banyak whitespace. Untuk desainer.',        en: 'Clean typography, ample whitespace. For designers.' },          badge: 'CLEAN',   badgeColor: '#555',   accent: '#333333', atsScore: 85 },
  { id: 'creative',  name: 'CREATIVE',       desc: { id: 'Sidebar gelap dengan aksen. Untuk UX/UI & marketing.',        en: 'Dark sidebar with accent. For UX/UI & marketing.' },            badge: 'KREATIF', badgeColor: '#e22718', accent: '#e22718', atsScore: 80 },
]

const ACCENT_COLORS = [
  { label: 'Navy', value: '#1c3d6e' }, { label: 'Blue', value: '#1c69d4' },
  { label: 'Sky', value: '#0066b1' },  { label: 'Teal', value: '#0d7377' },
  { label: 'Black', value: '#1a1a1a' },{ label: 'Gold', value: '#b8860b' },
  { label: 'Red', value: '#c0392b' },  { label: 'Purple', value: '#6c3483' },
]

const FS = {
  small:  { base: 9.5,  h1: 22, h3: 10 },
  normal: { base: 10.5, h1: 26, h3: 11 },
  large:  { base: 11.5, h1: 30, h3: 12 },
}

type Section = 'template' | 'personal' | 'experience' | 'education' | 'skills' | 'projects' | 'certifications' | 'languages' | 'preview'
const SECTIONS: { id: Section; icon: LucideIcon }[] = [
  { id: 'template', icon: Palette }, { id: 'personal', icon: User },
  { id: 'experience', icon: Briefcase }, { id: 'education', icon: GraduationCap },
  { id: 'skills', icon: Code2 }, { id: 'projects', icon: Star },
  { id: 'certifications', icon: Award }, { id: 'languages', icon: Globe },
  { id: 'preview', icon: Eye },
]

const uid = () => Math.random().toString(36).slice(2, 9)
const blankCV = (): CVData => ({ personal: { name:'', title:'', email:'', phone:'', location:'', website:'', linkedin:'', github:'', summary:'' }, experience:[], education:[], skills:[], projects:[], certifications:[], languages:[] })
const defaultOpts = (): CVOptions => ({ cvLang: 'id', useIcons: true, accentColor: '#1c69d4', fontSize: 'normal' })

async function apiCall(payload: { message: string; system?: string; engine: 'gpt' | 'sonar' }) {
  const res = await fetch('/api/prd-chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const data = await res.json()
  if (data.error) throw new Error(data.error)
  return data as { content: string }
}

// ─── CV Section Block ─────────────────────────────────────────────────────────
function CVBlock({ title, accent, useIcons, iconName, children, noMargin }: { title: string; accent: string; useIcons: boolean; iconName?: IconKey; children: React.ReactNode; noMargin?: boolean }) {
  return (
    <div style={{ marginBottom: noMargin ? 0 : 18 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 5 }}>
        {useIcons && iconName && <SvgIcon name={iconName} size={10} color={accent} />}
        <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '2px', color: accent, textTransform: 'uppercase' }}>{title}</span>
      </div>
      <div style={{ height: 1.5, background: `linear-gradient(to right, ${accent}, ${accent}44, transparent)`, marginBottom: 10 }} />
      {children}
    </div>
  )
}

// ─── Inline SVG Icons (render correctly inside CV output / html2canvas) ───────
type IconKey = 'mail' | 'phone' | 'mappin' | 'linkedin' | 'github' | 'globe' | 'link'

const SVG_PATHS: Record<IconKey, React.ReactNode> = {
  mail: <><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></>,
  phone: <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.4 2 2 0 0 1 3.6 1.22h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 8.91a16 16 0 0 0 6 6l.77-.77a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>,
  mappin: <><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></>,
  linkedin: <><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/></>,
  github: <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/>,
  globe: <><circle cx="12" cy="12" r="10"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/><path d="M2 12h20"/></>,
  link: <><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></>,
}

function SvgIcon({ name, size = 8, color = 'currentColor' }: { name: IconKey; size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', flexShrink: 0, verticalAlign: 'middle' }}>
      {SVG_PATHS[name]}
    </svg>
  )
}

// ─── Contact Item — uses inline SVG for correct rendering ────────────────────
function CI({ iconName, value, useIcons, color }: { iconName: IconKey; value: string; useIcons: boolean; color?: string }) {
  if (!value) return null
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
      {useIcons && <SvgIcon name={iconName} size={8.5} color={color || 'currentColor'} />}
      {value}
    </span>
  )
}


// ─── ATS TEMPLATE ─────────────────────────────────────────────────────────────
type TP = { cv: CVData; opt: CVOptions; accent: string; fs: typeof FS['normal']; t: typeof L['id'] }

function ATSTemplate({ cv, opt, accent, fs, t }: TP) {
  return (
    <div style={{ fontFamily: "'Arial','Helvetica',sans-serif", fontSize: fs.base, color: '#111', background: '#fff', padding: '36px 44px', lineHeight: 1.55 }}>
      <div style={{ borderBottom: `2.5px solid ${accent}`, paddingBottom: 16, marginBottom: 18 }}>
        <h1 style={{ fontSize: fs.h1, fontWeight: 700, color: '#0a0a0a', margin: '0 0 3px', letterSpacing: 0.3 }}>{cv.personal.name || 'Full Name'}</h1>
        <p style={{ fontSize: fs.h3, color: accent, fontWeight: 600, margin: '0 0 12px' }}>{cv.personal.title}</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 18px', fontSize: 9, color: '#555' }}>
          <CI iconName="mail" value={cv.personal.email} useIcons={opt.useIcons} />
          <CI iconName="phone" value={cv.personal.phone} useIcons={opt.useIcons} />
          <CI iconName="mappin" value={cv.personal.location} useIcons={opt.useIcons} />
          <CI iconName="linkedin" value={cv.personal.linkedin} useIcons={opt.useIcons} />
          <CI iconName="github" value={cv.personal.github} useIcons={opt.useIcons} />
          <CI iconName="link" value={cv.personal.website} useIcons={opt.useIcons} />
        </div>
      </div>
      {cv.personal.summary && <CVBlock title={t.headings.summary} accent={accent} useIcons={opt.useIcons} iconName="mail"><p style={{ fontSize: fs.base, color: '#444', lineHeight: 1.65, margin: 0 }}>{cv.personal.summary}</p></CVBlock>}
      {cv.experience.length > 0 && (
        <CVBlock title={t.headings.experience} accent={accent} useIcons={opt.useIcons} iconName="link">
          {cv.experience.map((e, i) => (
            <div key={e.id} style={{ marginBottom: i < cv.experience.length-1 ? 13 : 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <p style={{ fontWeight: 700, fontSize: fs.h3, color: '#0a0a0a', margin: 0 }}>{e.role}</p>
                  <p style={{ color: accent, fontSize: fs.base, fontWeight: 600, margin: '2px 0' }}>{e.company}{e.location && ` · ${e.location}`}</p>
                </div>
                <p style={{ fontSize: 9, color: '#999', whiteSpace: 'nowrap', marginLeft: 10 }}>{e.startDate}{e.startDate&&' – '}{e.current ? t.present : e.endDate}</p>
              </div>
              {e.description && <p style={{ fontSize: fs.base, color: '#555', margin: '4px 0', lineHeight: 1.55 }}>{e.description}</p>}
              {e.achievements.filter(Boolean).length > 0 && <ul style={{ margin: '3px 0 0', paddingLeft: 14 }}>{e.achievements.filter(Boolean).map((a,ai) => <li key={ai} style={{ fontSize: fs.base, color: '#555', lineHeight: 1.55, marginBottom: 2 }}>{a}</li>)}</ul>}
            </div>
          ))}
        </CVBlock>
      )}
      {cv.education.length > 0 && (
        <CVBlock title={t.headings.education} accent={accent} useIcons={opt.useIcons} iconName="globe">
          {cv.education.map(e => (
            <div key={e.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
              <div>
                <p style={{ fontWeight: 700, fontSize: fs.h3, color: '#0a0a0a', margin: 0 }}>{e.degree}{e.field && ` — ${e.field}`}</p>
                <p style={{ color: accent, fontSize: fs.base, fontWeight: 600, margin: '2px 0 0' }}>{e.institution}{e.gpa && ` · ${t.gpa}: ${e.gpa}`}{e.honors && ` · ${e.honors}`}</p>
              </div>
              <p style={{ fontSize: 9, color: '#999', whiteSpace: 'nowrap', marginLeft: 10 }}>{e.startDate}{e.startDate&&' – '}{e.current ? t.present : e.endDate}</p>
            </div>
          ))}
        </CVBlock>
      )}
      {cv.skills.length > 0 && (
        <CVBlock title={t.headings.skills} accent={accent} useIcons={opt.useIcons} iconName="link">
          {cv.skills.map(sg => sg.items.length > 0 && (
            <div key={sg.id} style={{ display: 'flex', flexWrap: 'wrap', gap: '0 6px', marginBottom: 5, alignItems: 'baseline' }}>
              {sg.category && <span style={{ fontSize: 9.5, fontWeight: 700, color: '#111', minWidth: 90 }}>{sg.category}:</span>}
              <span style={{ fontSize: fs.base, color: '#555' }}>{sg.items.join(' · ')}</span>
            </div>
          ))}
        </CVBlock>
      )}
      {cv.projects.length > 0 && (
        <CVBlock title={t.headings.projects} accent={accent} useIcons={opt.useIcons} iconName="link">
          {cv.projects.map(p => (
            <div key={p.id} style={{ marginBottom: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <p style={{ fontWeight: 700, fontSize: fs.h3, color: '#0a0a0a', margin: 0 }}>{p.name}{p.url && <span style={{ fontWeight: 400, color: accent, fontSize: 9, marginLeft: 5 }}>{p.url}</span>}</p>
                {p.startDate && <p style={{ fontSize: 9, color: '#999', marginLeft: 10 }}>{p.startDate}{p.endDate && ` – ${p.endDate}`}</p>}
              </div>
              {p.tech && <p style={{ fontSize: 9.5, color: accent, fontWeight: 600, margin: '2px 0' }}>{p.tech}</p>}
              {p.description && <p style={{ fontSize: fs.base, color: '#555', lineHeight: 1.55, margin: 0 }}>{p.description}</p>}
            </div>
          ))}
        </CVBlock>
      )}
      {(cv.certifications.length > 0 || cv.languages.length > 0) && (
        <div style={{ display: 'grid', gridTemplateColumns: cv.certifications.length > 0 && cv.languages.length > 0 ? '1fr 1fr' : '1fr', gap: 20 }}>
          {cv.certifications.length > 0 && (
            <CVBlock title={t.headings.certifications} accent={accent} useIcons={opt.useIcons} iconName="link" noMargin>
              {cv.certifications.map(c => <div key={c.id} style={{ marginBottom: 7 }}><p style={{ fontWeight: 700, fontSize: fs.base, color: '#111', margin: 0 }}>{c.name}</p><p style={{ fontSize: 9, color: '#888', margin: '1px 0 0' }}>{c.issuer}{c.date && ` · ${c.date}`}</p></div>)}
            </CVBlock>
          )}
          {cv.languages.length > 0 && (
            <CVBlock title={t.headings.languages} accent={accent} useIcons={opt.useIcons} iconName="globe" noMargin>
              {cv.languages.map(l => <p key={l.id} style={{ fontSize: fs.base, color: '#555', margin: '0 0 5px' }}><strong style={{ color: '#111' }}>{l.language}</strong>{l.level && ` — ${l.level}`}</p>)}
            </CVBlock>
          )}
        </div>
      )}
    </div>
  )
}

// ─── CLASSIC TEMPLATE ─────────────────────────────────────────────────────────
function ClassicTemplate({ cv, opt, accent, fs, t }: TP) {
  return (
    <div style={{ fontFamily: "'Georgia','Times New Roman',serif", fontSize: fs.base, color: '#111', background: '#fff', padding: '40px 48px', lineHeight: 1.6 }}>
      <div style={{ textAlign: 'center', paddingBottom: 18, marginBottom: 20, borderBottom: `1px solid ${accent}` }}>
        <div style={{ height: 3, background: accent, marginBottom: 14 }} />
        <h1 style={{ fontSize: fs.h1, fontWeight: 700, letterSpacing: 3, textTransform: 'uppercase', color: '#0a0a0a', margin: '0 0 6px' }}>{cv.personal.name || 'FULL NAME'}</h1>
        {cv.personal.title && <p style={{ fontSize: fs.h3, color: accent, letterSpacing: 2, textTransform: 'uppercase', margin: '0 0 12px', fontWeight: 600 }}>{cv.personal.title}</p>}
        <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '4px 14px', fontSize: 9, color: '#666' }}>
          <CI iconName="mail" value={cv.personal.email} useIcons={opt.useIcons} />
          <CI iconName="phone" value={cv.personal.phone} useIcons={opt.useIcons} />
          <CI iconName="mappin" value={cv.personal.location} useIcons={opt.useIcons} />
          <CI iconName="linkedin" value={cv.personal.linkedin} useIcons={opt.useIcons} />
          <CI iconName="link" value={cv.personal.website} useIcons={opt.useIcons} />
        </div>
        <div style={{ height: 3, background: accent, marginTop: 14 }} />
      </div>
      {cv.personal.summary && <div style={{ marginBottom: 20, textAlign: 'center' }}><p style={{ fontSize: fs.base, color: '#555', lineHeight: 1.7, fontStyle: 'italic', maxWidth: 560, margin: '0 auto' }}>{cv.personal.summary}</p></div>}
      {cv.experience.length > 0 && (
        <CVBlock title={t.headings.experience} accent={accent} useIcons={opt.useIcons} iconName="link">
          {cv.experience.map((e, i) => (
            <div key={e.id} style={{ marginBottom: i < cv.experience.length-1 ? 14 : 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <p style={{ fontWeight: 700, fontSize: fs.h3, margin: 0 }}>{e.role}</p>
                <p style={{ fontSize: 9, color: '#999' }}>{e.startDate}{e.startDate&&' – '}{e.current ? t.present : e.endDate}</p>
              </div>
              <p style={{ color: accent, fontSize: fs.base, fontWeight: 700, margin: '1px 0 4px', fontStyle: 'italic' }}>{e.company}{e.location && `, ${e.location}`}</p>
              {e.description && <p style={{ fontSize: fs.base, color: '#555', lineHeight: 1.6, margin: '0 0 4px' }}>{e.description}</p>}
              {e.achievements.filter(Boolean).map((a,ai) => <p key={ai} style={{ fontSize: fs.base, color: '#555', margin: '2px 0', paddingLeft: 12, borderLeft: `2px solid ${accent}44` }}>• {a}</p>)}
            </div>
          ))}
        </CVBlock>
      )}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        <div>
          {cv.education.length > 0 && (
            <CVBlock title={t.headings.education} accent={accent} useIcons={opt.useIcons} iconName="globe">
              {cv.education.map(e => (
                <div key={e.id} style={{ marginBottom: 10 }}>
                  <p style={{ fontWeight: 700, fontSize: fs.h3, margin: 0 }}>{e.degree}</p>
                  {e.field && <p style={{ fontSize: fs.base, color: '#666', margin: '1px 0', fontStyle: 'italic' }}>{e.field}</p>}
                  <p style={{ color: accent, fontSize: fs.base, fontWeight: 600, margin: '1px 0' }}>{e.institution}</p>
                  <p style={{ fontSize: 9, color: '#999' }}>{e.startDate}{e.startDate&&' – '}{e.current ? t.present : e.endDate}{e.gpa && ` · ${t.gpa}: ${e.gpa}`}</p>
                </div>
              ))}
            </CVBlock>
          )}
        </div>
        <div>
          {cv.skills.length > 0 && (
            <CVBlock title={t.headings.skills} accent={accent} useIcons={opt.useIcons} iconName="link">
              {cv.skills.map(sg => sg.items.length > 0 && (
                <div key={sg.id} style={{ marginBottom: 7 }}>
                  {sg.category && <p style={{ fontSize: 9.5, fontWeight: 700, color: accent, margin: '0 0 2px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{sg.category}</p>}
                  <p style={{ fontSize: fs.base, color: '#555', margin: 0 }}>{sg.items.join(', ')}</p>
                </div>
              ))}
            </CVBlock>
          )}
          {cv.languages.length > 0 && (
            <CVBlock title={t.headings.languages} accent={accent} useIcons={opt.useIcons} iconName="globe">
              {cv.languages.map(l => <p key={l.id} style={{ fontSize: fs.base, color: '#555', margin: '0 0 4px' }}><strong>{l.language}</strong>{l.level && ` — ${l.level}`}</p>)}
            </CVBlock>
          )}
          {cv.certifications.length > 0 && (
            <CVBlock title={t.headings.certifications} accent={accent} useIcons={opt.useIcons} iconName="link">
              {cv.certifications.map(c => <div key={c.id} style={{ marginBottom: 6 }}><p style={{ fontSize: fs.base, color: '#111', fontWeight: 700, margin: 0 }}>{c.name}</p><p style={{ fontSize: 9, color: '#999', margin: '1px 0 0' }}>{c.issuer}{c.date && ` · ${c.date}`}</p></div>)}
            </CVBlock>
          )}
        </div>
      </div>
      {cv.projects.length > 0 && (
        <CVBlock title={t.headings.projects} accent={accent} useIcons={opt.useIcons} iconName="link">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 24px' }}>
            {cv.projects.map(p => (
              <div key={p.id} style={{ marginBottom: 10 }}>
                <p style={{ fontWeight: 700, fontSize: fs.h3, margin: 0 }}>{p.name}</p>
                {p.tech && <p style={{ fontSize: 9.5, color: accent, fontWeight: 600, margin: '2px 0' }}>{p.tech}</p>}
                {p.description && <p style={{ fontSize: fs.base, color: '#555', lineHeight: 1.5, margin: 0 }}>{p.description}</p>}
              </div>
            ))}
          </div>
        </CVBlock>
      )}
    </div>
  )
}

// ─── MODERN TEMPLATE ──────────────────────────────────────────────────────────
function ModernTemplate({ cv, opt, accent, fs, t }: TP) {
  return (
    <div style={{ fontFamily: "'Arial','Helvetica',sans-serif", fontSize: fs.base, color: '#111', background: '#fff', lineHeight: 1.55 }}>
      <div style={{ background: accent, padding: '28px 44px 24px', color: '#fff' }}>
        <h1 style={{ fontSize: fs.h1, fontWeight: 700, margin: '0 0 4px', color: '#fff' }}>{cv.personal.name || 'Full Name'}</h1>
        <p style={{ fontSize: fs.h3, fontWeight: 400, margin: '0 0 14px', opacity: 0.9, color: '#fff' }}>{cv.personal.title}</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 18px', fontSize: 9, opacity: 0.92, color: '#fff' }}>
          <CI iconName="mail" value={cv.personal.email} useIcons={opt.useIcons} />
          <CI iconName="phone" value={cv.personal.phone} useIcons={opt.useIcons} />
          <CI iconName="mappin" value={cv.personal.location} useIcons={opt.useIcons} />
          <CI iconName="linkedin" value={cv.personal.linkedin} useIcons={opt.useIcons} />
          <CI iconName="github" value={cv.personal.github} useIcons={opt.useIcons} />
          <CI iconName="link" value={cv.personal.website} useIcons={opt.useIcons} />
        </div>
      </div>
      <div style={{ padding: '24px 44px' }}>
        {cv.personal.summary && <div style={{ marginBottom: 18, padding: '12px 16px', background: `${accent}0d`, borderLeft: `4px solid ${accent}` }}><p style={{ fontSize: fs.base, color: '#444', lineHeight: 1.65, margin: 0 }}>{cv.personal.summary}</p></div>}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 230px', gap: 26 }}>
          <div>
            {cv.experience.length > 0 && (
              <CVBlock title={t.headings.experience} accent={accent} useIcons={opt.useIcons} iconName="link">
                {cv.experience.map((e, i) => (
                  <div key={e.id} style={{ marginBottom: i < cv.experience.length-1 ? 14 : 0, paddingLeft: 10, borderLeft: `2px solid ${accent}22` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <p style={{ fontWeight: 700, fontSize: fs.h3, color: '#0a0a0a', margin: 0 }}>{e.role}</p>
                      <p style={{ fontSize: 9, color: '#999', marginLeft: 10, whiteSpace: 'nowrap' }}>{e.startDate}{e.startDate&&' – '}{e.current ? t.present : e.endDate}</p>
                    </div>
                    <div style={{ display: 'flex', gap: 6, margin: '2px 0 5px' }}>
                      <p style={{ color: accent, fontSize: fs.base, fontWeight: 600, margin: 0 }}>{e.company}</p>
                      {e.location && <span style={{ fontSize: 9, color: '#bbb' }}>· {e.location}</span>}
                    </div>
                    {e.description && <p style={{ fontSize: fs.base, color: '#555', lineHeight: 1.55, margin: '0 0 4px' }}>{e.description}</p>}
                    {e.achievements.filter(Boolean).map((a,ai) => <div key={ai} style={{ display: 'flex', gap: 6, margin: '2px 0' }}><span style={{ color: accent, fontWeight: 700, fontSize: 10, flexShrink: 0 }}>›</span><p style={{ fontSize: fs.base, color: '#555', margin: 0, lineHeight: 1.5 }}>{a}</p></div>)}
                  </div>
                ))}
              </CVBlock>
            )}
            {cv.projects.length > 0 && (
              <CVBlock title={t.headings.projects} accent={accent} useIcons={opt.useIcons} iconName="link">
                {cv.projects.map(p => (
                  <div key={p.id} style={{ marginBottom: 10, paddingLeft: 10, borderLeft: `2px solid ${accent}22` }}>
                    <p style={{ fontWeight: 700, fontSize: fs.h3, margin: 0 }}>{p.name}{p.url && <span style={{ fontWeight: 400, color: accent, fontSize: 9, marginLeft: 5 }}>{p.url}</span>}</p>
                    {p.tech && <p style={{ fontSize: 9.5, color: accent, fontWeight: 600, margin: '2px 0' }}>{p.tech}</p>}
                    {p.description && <p style={{ fontSize: fs.base, color: '#555', lineHeight: 1.5, margin: 0 }}>{p.description}</p>}
                  </div>
                ))}
              </CVBlock>
            )}
          </div>
          <div>
            {cv.education.length > 0 && (
              <CVBlock title={t.headings.education} accent={accent} useIcons={opt.useIcons} iconName="globe">
                {cv.education.map(e => (
                  <div key={e.id} style={{ marginBottom: 10, padding: '8px 10px', background: '#f8f8f8', borderTop: `2px solid ${accent}` }}>
                    <p style={{ fontWeight: 700, fontSize: fs.base, margin: 0 }}>{e.degree}</p>
                    {e.field && <p style={{ fontSize: 9, color: '#777', margin: '1px 0' }}>{e.field}</p>}
                    <p style={{ color: accent, fontSize: 9.5, fontWeight: 600, margin: '2px 0' }}>{e.institution}</p>
                    <p style={{ fontSize: 9, color: '#aaa', margin: 0 }}>{e.startDate}{e.startDate&&' – '}{e.current ? t.present : e.endDate}{e.gpa && ` · ${t.gpa} ${e.gpa}`}</p>
                  </div>
                ))}
              </CVBlock>
            )}
            {cv.skills.length > 0 && (
              <CVBlock title={t.headings.skills} accent={accent} useIcons={opt.useIcons} iconName="link">
                {cv.skills.map(sg => sg.items.length > 0 && (
                  <div key={sg.id} style={{ marginBottom: 8 }}>
                    {sg.category && <p style={{ fontSize: 9.5, fontWeight: 700, color: '#111', margin: '0 0 4px' }}>{sg.category}</p>}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                      {sg.items.map((item,i) => <span key={i} style={{ fontSize: 8.5, padding: '2px 7px', background: `${accent}18`, color: accent, fontWeight: 600 }}>{item}</span>)}
                    </div>
                  </div>
                ))}
              </CVBlock>
            )}
            {cv.certifications.length > 0 && (
              <CVBlock title={t.headings.certifications} accent={accent} useIcons={opt.useIcons} iconName="link">
                {cv.certifications.map(c => <div key={c.id} style={{ marginBottom: 6 }}><p style={{ fontWeight: 700, fontSize: fs.base, margin: 0 }}>{c.name}</p><p style={{ fontSize: 9, color: '#999', margin: '1px 0 0' }}>{c.issuer}{c.date && ` · ${c.date}`}</p></div>)}
              </CVBlock>
            )}
            {cv.languages.length > 0 && (
              <CVBlock title={t.headings.languages} accent={accent} useIcons={opt.useIcons} iconName="globe">
                {cv.languages.map(l => <p key={l.id} style={{ fontSize: fs.base, color: '#555', margin: '0 0 4px' }}><strong>{l.language}</strong>{l.level && ` — ${l.level}`}</p>)}
              </CVBlock>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── EXECUTIVE TEMPLATE ───────────────────────────────────────────────────────
function ExecutiveTemplate({ cv, opt, accent, fs, t }: TP) {
  return (
    <div style={{ fontFamily: "'Georgia','Times New Roman',serif", fontSize: fs.base, color: '#111', background: '#fff', lineHeight: 1.6 }}>
      <div style={{ background: '#111', padding: '32px 48px 28px', color: '#fff' }}>
        <div style={{ height: 3, background: accent, marginBottom: 18 }} />
        <h1 style={{ fontSize: fs.h1+4, fontWeight: 700, margin: '0 0 4px', letterSpacing: 2, color: '#fff', textTransform: 'uppercase' }}>{cv.personal.name || 'FULL NAME'}</h1>
        <p style={{ fontSize: fs.h3+1, color: accent, fontWeight: 600, margin: '0 0 16px', letterSpacing: 1.5 }}>{cv.personal.title}</p>
        <div style={{ height: 1, background: '#333', marginBottom: 14 }} />
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 22px', fontSize: 9, color: '#bbb' }}>
          <CI iconName="mail" value={cv.personal.email} useIcons={opt.useIcons} />
          <CI iconName="phone" value={cv.personal.phone} useIcons={opt.useIcons} />
          <CI iconName="mappin" value={cv.personal.location} useIcons={opt.useIcons} />
          <CI iconName="linkedin" value={cv.personal.linkedin} useIcons={opt.useIcons} />
        </div>
      </div>
      <div style={{ padding: '28px 48px' }}>
        {cv.personal.summary && <div style={{ marginBottom: 22, padding: '14px 20px', borderLeft: `5px solid ${accent}`, background: '#fafafa' }}><p style={{ fontSize: fs.base+0.5, color: '#444', lineHeight: 1.7, margin: 0, fontStyle: 'italic' }}>{cv.personal.summary}</p></div>}
        {cv.experience.length > 0 && (
          <CVBlock title={t.headings.experience} accent={accent} useIcons={opt.useIcons} iconName="link">
            {cv.experience.map((e, i) => (
              <div key={e.id} style={{ marginBottom: i < cv.experience.length-1 ? 16 : 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <p style={{ fontWeight: 700, fontSize: fs.h3+0.5, margin: 0 }}>{e.role}</p>
                  <p style={{ fontSize: 9, color: '#aaa', fontFamily: 'Arial,sans-serif' }}>{e.startDate}{e.startDate&&' – '}{e.current ? t.present : e.endDate}</p>
                </div>
                <p style={{ color: accent, fontWeight: 700, fontSize: fs.base+0.5, margin: '2px 0 5px', fontStyle: 'italic' }}>{e.company}{e.location && ` · ${e.location}`}</p>
                {e.description && <p style={{ fontSize: fs.base, color: '#555', lineHeight: 1.6, margin: '0 0 5px' }}>{e.description}</p>}
                {e.achievements.filter(Boolean).map((a,ai) => <div key={ai} style={{ display: 'flex', gap: 8, margin: '3px 0' }}><span style={{ color: accent, fontWeight: 700 }}>▪</span><p style={{ fontSize: fs.base, color: '#555', margin: 0, lineHeight: 1.55 }}>{a}</p></div>)}
              </div>
            ))}
          </CVBlock>
        )}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 28 }}>
          <div>
            {cv.education.length > 0 && (
              <CVBlock title={t.headings.education} accent={accent} useIcons={opt.useIcons} iconName="globe">
                {cv.education.map(e => (
                  <div key={e.id} style={{ marginBottom: 10 }}>
                    <p style={{ fontWeight: 700, fontSize: fs.h3, margin: 0 }}>{e.degree}{e.field && ` — ${e.field}`}</p>
                    <p style={{ color: accent, fontWeight: 600, fontSize: fs.base, margin: '1px 0', fontStyle: 'italic' }}>{e.institution}</p>
                    <p style={{ fontSize: 9, color: '#aaa', fontFamily: 'Arial,sans-serif', margin: 0 }}>{e.startDate}{e.startDate&&' – '}{e.current ? t.present : e.endDate}{e.gpa && ` · ${t.gpa}: ${e.gpa}`}</p>
                  </div>
                ))}
              </CVBlock>
            )}
            {cv.certifications.length > 0 && (
              <CVBlock title={t.headings.certifications} accent={accent} useIcons={opt.useIcons} iconName="link">
                {cv.certifications.map(c => <div key={c.id} style={{ marginBottom: 7 }}><p style={{ fontWeight: 700, fontSize: fs.base, margin: 0 }}>{c.name}</p><p style={{ fontSize: 9, color: '#aaa', fontFamily: 'Arial,sans-serif', margin: '1px 0 0' }}>{c.issuer}{c.date && ` · ${c.date}`}</p></div>)}
              </CVBlock>
            )}
          </div>
          <div>
            {cv.skills.length > 0 && (
              <CVBlock title={t.headings.skills} accent={accent} useIcons={opt.useIcons} iconName="link">
                {cv.skills.map(sg => sg.items.length > 0 && (
                  <div key={sg.id} style={{ marginBottom: 8 }}>
                    {sg.category && <p style={{ fontSize: 9.5, fontWeight: 700, color: '#111', margin: '0 0 3px', textTransform: 'uppercase', letterSpacing: '0.5px', fontFamily: 'Arial,sans-serif' }}>{sg.category}</p>}
                    <p style={{ fontSize: fs.base, color: '#555', margin: 0 }}>{sg.items.join(' · ')}</p>
                  </div>
                ))}
              </CVBlock>
            )}
            {cv.languages.length > 0 && (
              <CVBlock title={t.headings.languages} accent={accent} useIcons={opt.useIcons} iconName="globe">
                {cv.languages.map(l => <p key={l.id} style={{ fontSize: fs.base, margin: '0 0 4px', color: '#555' }}><strong style={{ color: '#111' }}>{l.language}</strong>{l.level && ` — ${l.level}`}</p>)}
              </CVBlock>
            )}
          </div>
        </div>
        {cv.projects.length > 0 && (
          <CVBlock title={t.headings.projects} accent={accent} useIcons={opt.useIcons} iconName="link">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 28px' }}>
              {cv.projects.map(p => (
                <div key={p.id} style={{ marginBottom: 10 }}>
                  <p style={{ fontWeight: 700, fontSize: fs.h3, margin: 0 }}>{p.name}</p>
                  {p.tech && <p style={{ fontSize: 9.5, color: accent, fontWeight: 600, margin: '2px 0', fontStyle: 'italic' }}>{p.tech}</p>}
                  {p.description && <p style={{ fontSize: fs.base, color: '#555', lineHeight: 1.55, margin: 0 }}>{p.description}</p>}
                </div>
              ))}
            </div>
          </CVBlock>
        )}
      </div>
    </div>
  )
}

// ─── MINIMAL TEMPLATE ─────────────────────────────────────────────────────────
function MinimalTemplate({ cv, opt, accent, fs, t }: TP) {
  return (
    <div style={{ fontFamily: "'Helvetica Neue','Helvetica','Arial',sans-serif", fontSize: fs.base, color: '#222', background: '#fafafa', padding: '48px 56px', lineHeight: 1.6 }}>
      <div style={{ marginBottom: 30 }}>
        <h1 style={{ fontSize: fs.h1, fontWeight: 300, letterSpacing: 4, textTransform: 'uppercase', margin: '0 0 6px', color: '#111' }}>{cv.personal.name || 'Full Name'}</h1>
        {cv.personal.title && <p style={{ fontSize: fs.h3-0.5, color: '#999', fontWeight: 400, margin: '0 0 14px', letterSpacing: 2, textTransform: 'uppercase' }}>{cv.personal.title}</p>}
        <div style={{ width: 48, height: 2, background: accent, marginBottom: 14 }} />
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 18px', fontSize: 9, color: '#888' }}>
          <CI iconName="mail" value={cv.personal.email} useIcons={opt.useIcons} />
          <CI iconName="phone" value={cv.personal.phone} useIcons={opt.useIcons} />
          <CI iconName="mappin" value={cv.personal.location} useIcons={opt.useIcons} />
          <CI iconName="linkedin" value={cv.personal.linkedin} useIcons={opt.useIcons} />
          <CI iconName="link" value={cv.personal.website} useIcons={opt.useIcons} />
        </div>
      </div>
      {cv.personal.summary && <p style={{ fontSize: fs.base+0.5, lineHeight: 1.75, color: '#666', marginBottom: 28, fontWeight: 300, borderBottom: '1px solid #e0e0e0', paddingBottom: 22 }}>{cv.personal.summary}</p>}
      {cv.experience.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <p style={{ fontSize: 8.5, fontWeight: 700, letterSpacing: '2.5px', textTransform: 'uppercase', color: accent, marginBottom: 14, borderBottom: '1px solid #e8e8e8', paddingBottom: 6 }}>{t.headings.experience}</p>
          {cv.experience.map(e => (
            <div key={e.id} style={{ display: 'grid', gridTemplateColumns: '100px 1fr', gap: '0 22px', marginBottom: 16 }}>
              <div style={{ paddingTop: 2, textAlign: 'right', color: '#bbb', fontSize: 9, lineHeight: 1.5 }}>{e.startDate}<br />{e.current ? t.present : e.endDate}</div>
              <div>
                <p style={{ fontWeight: 600, fontSize: fs.h3-0.5, margin: 0 }}>{e.role}</p>
                <p style={{ fontSize: fs.base, color: '#888', margin: '2px 0 5px' }}>{e.company}{e.location && `, ${e.location}`}</p>
                {e.description && <p style={{ fontSize: fs.base-0.5, color: '#777', lineHeight: 1.6, margin: '0 0 4px' }}>{e.description}</p>}
                {e.achievements.filter(Boolean).map((a,ai) => <p key={ai} style={{ fontSize: fs.base-0.5, color: '#777', margin: '2px 0', paddingLeft: 10 }}>— {a}</p>)}
              </div>
            </div>
          ))}
        </div>
      )}
      <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr', gap: '0 22px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {cv.skills.length > 0 && (
            <div>
              <p style={{ fontSize: 8.5, fontWeight: 700, letterSpacing: '2.5px', textTransform: 'uppercase', color: accent, marginBottom: 8, textAlign: 'right' }}>{t.headings.skills}</p>
              {cv.skills.map(sg => sg.items.length > 0 && <p key={sg.id} style={{ fontSize: 9, color: '#888', textAlign: 'right', margin: '0 0 3px', lineHeight: 1.5 }}>{sg.items.join(', ')}</p>)}
            </div>
          )}
          {cv.languages.length > 0 && (
            <div>
              <p style={{ fontSize: 8.5, fontWeight: 700, letterSpacing: '2.5px', textTransform: 'uppercase', color: accent, marginBottom: 8, textAlign: 'right' }}>{t.headings.languages}</p>
              {cv.languages.map(l => <p key={l.id} style={{ fontSize: 9, color: '#888', textAlign: 'right', margin: '0 0 3px' }}>{l.language}</p>)}
            </div>
          )}
        </div>
        <div style={{ borderLeft: '1px solid #e0e0e0', paddingLeft: 22 }}>
          {cv.education.length > 0 && (
            <div style={{ marginBottom: 18 }}>
              <p style={{ fontSize: 8.5, fontWeight: 700, letterSpacing: '2.5px', textTransform: 'uppercase', color: accent, marginBottom: 10 }}>{t.headings.education}</p>
              {cv.education.map(e => (
                <div key={e.id} style={{ marginBottom: 10 }}>
                  <p style={{ fontWeight: 600, fontSize: fs.base-0.5, margin: 0 }}>{e.degree}{e.field && ` — ${e.field}`}</p>
                  <p style={{ fontSize: 9, color: '#888', margin: '2px 0' }}>{e.institution} · {e.startDate}{e.startDate&&' – '}{e.current ? t.present : e.endDate}{e.gpa && ` · ${t.gpa} ${e.gpa}`}</p>
                </div>
              ))}
            </div>
          )}
          {cv.projects.length > 0 && (
            <div style={{ marginBottom: 18 }}>
              <p style={{ fontSize: 8.5, fontWeight: 700, letterSpacing: '2.5px', textTransform: 'uppercase', color: accent, marginBottom: 10 }}>{t.headings.projects}</p>
              {cv.projects.map(p => <div key={p.id} style={{ marginBottom: 8 }}><p style={{ fontWeight: 600, fontSize: fs.base-0.5, margin: 0 }}>{p.name}{p.tech && <span style={{ fontSize: 9, color: accent, fontWeight: 400, marginLeft: 5 }}>{p.tech}</span>}</p>{p.description && <p style={{ fontSize: 9, color: '#888', margin: '1px 0 0' }}>{p.description}</p>}</div>)}
            </div>
          )}
          {cv.certifications.length > 0 && (
            <div>
              <p style={{ fontSize: 8.5, fontWeight: 700, letterSpacing: '2.5px', textTransform: 'uppercase', color: accent, marginBottom: 10 }}>{t.headings.certifications}</p>
              {cv.certifications.map(c => <p key={c.id} style={{ fontSize: 9, color: '#888', margin: '0 0 4px' }}>{c.name} · {c.issuer}</p>)}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── CREATIVE TEMPLATE ────────────────────────────────────────────────────────
function CreativeTemplate({ cv, opt, accent, fs, t }: TP) {
  return (
    <div style={{ fontFamily: "'Arial','Helvetica',sans-serif", fontSize: fs.base, background: '#fff', lineHeight: 1.55, display: 'grid', gridTemplateColumns: '200px 1fr', minHeight: 900 }}>
      <div style={{ background: '#111', color: '#fff', padding: '30px 20px', display: 'flex', flexDirection: 'column', gap: 18 }}>
        <div>
          <h1 style={{ fontSize: fs.h1-4, fontWeight: 700, color: '#fff', margin: '0 0 8px', lineHeight: 1.2 }}>{cv.personal.name || 'Name'}</h1>
          <div style={{ height: 3, background: accent, margin: '0 0 10px' }} />
          <p style={{ fontSize: 9.5, color: accent, fontWeight: 700, margin: 0, textTransform: 'uppercase', letterSpacing: 1 }}>{cv.personal.title}</p>
        </div>
        <div>
          <p style={{ fontSize: 8, fontWeight: 700, letterSpacing: '2px', color: accent, textTransform: 'uppercase', marginBottom: 10, borderBottom: '1px solid #2a2a2a', paddingBottom: 5 }}>{t.contact}</p>
          {cv.personal.email && <div style={{ display: 'flex', gap: 7, marginBottom: 6, alignItems: 'flex-start' }}>{opt.useIcons && <SvgIcon name="mail" size={8.5} color={accent} />}<span style={{ fontSize: 9, color: '#ccc', wordBreak: 'break-all' }}>{cv.personal.email}</span></div>}
          {cv.personal.phone && <div style={{ display: 'flex', gap: 7, marginBottom: 6, alignItems: 'center' }}>{opt.useIcons && <SvgIcon name="phone" size={8.5} color={accent} />}<span style={{ fontSize: 9, color: '#ccc' }}>{cv.personal.phone}</span></div>}
          {cv.personal.location && <div style={{ display: 'flex', gap: 7, marginBottom: 6, alignItems: 'center' }}>{opt.useIcons && <SvgIcon name="mappin" size={8.5} color={accent} />}<span style={{ fontSize: 9, color: '#ccc' }}>{cv.personal.location}</span></div>}
          {cv.personal.linkedin && <div style={{ display: 'flex', gap: 7, marginBottom: 6, alignItems: 'flex-start' }}>{opt.useIcons && <SvgIcon name="linkedin" size={8.5} color={accent} />}<span style={{ fontSize: 9, color: '#ccc', wordBreak: 'break-all' }}>{cv.personal.linkedin}</span></div>}
          {cv.personal.github && <div style={{ display: 'flex', gap: 7, marginBottom: 6, alignItems: 'center' }}>{opt.useIcons && <SvgIcon name="github" size={8.5} color={accent} />}<span style={{ fontSize: 9, color: '#ccc' }}>{cv.personal.github}</span></div>}
          {cv.personal.website && <div style={{ display: 'flex', gap: 7, marginBottom: 6, alignItems: 'flex-start' }}>{opt.useIcons && <SvgIcon name="link" size={8.5} color={accent} />}<span style={{ fontSize: 9, color: '#ccc', wordBreak: 'break-all' }}>{cv.personal.website}</span></div>}
        </div>
        {cv.skills.length > 0 && (
          <div>
            <p style={{ fontSize: 8, fontWeight: 700, letterSpacing: '2px', color: accent, textTransform: 'uppercase', marginBottom: 10, borderBottom: '1px solid #2a2a2a', paddingBottom: 5 }}>{t.headings.skills}</p>
            {cv.skills.map(sg => sg.items.length > 0 && (
              <div key={sg.id} style={{ marginBottom: 10 }}>
                {sg.category && <p style={{ fontSize: 9, fontWeight: 700, color: '#ddd', margin: '0 0 5px' }}>{sg.category}</p>}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                  {sg.items.map((item,i) => <span key={i} style={{ fontSize: 8, background: '#1e1e1e', color: '#bbb', padding: '2px 6px', border: `1px solid ${accent}44` }}>{item}</span>)}
                </div>
              </div>
            ))}
          </div>
        )}
        {cv.languages.length > 0 && (
          <div>
            <p style={{ fontSize: 8, fontWeight: 700, letterSpacing: '2px', color: accent, textTransform: 'uppercase', marginBottom: 10, borderBottom: '1px solid #2a2a2a', paddingBottom: 5 }}>{t.headings.languages}</p>
            {cv.languages.map(l => <p key={l.id} style={{ fontSize: 9, color: '#ccc', margin: '0 0 5px' }}><strong style={{ color: '#fff' }}>{l.language}</strong>{l.level && ` · ${l.level}`}</p>)}
          </div>
        )}
        {cv.certifications.length > 0 && (
          <div>
            <p style={{ fontSize: 8, fontWeight: 700, letterSpacing: '2px', color: accent, textTransform: 'uppercase', marginBottom: 10, borderBottom: '1px solid #2a2a2a', paddingBottom: 5 }}>{t.headings.certifications}</p>
            {cv.certifications.map(c => <div key={c.id} style={{ marginBottom: 7 }}><p style={{ fontSize: 9, fontWeight: 700, color: '#fff', margin: 0 }}>{c.name}</p><p style={{ fontSize: 8.5, color: '#aaa', margin: '1px 0 0' }}>{c.issuer}{c.date && ` · ${c.date}`}</p></div>)}
          </div>
        )}
      </div>
      <div style={{ padding: '30px 28px', color: '#111' }}>
        {cv.personal.summary && <div style={{ marginBottom: 20, paddingBottom: 18, borderBottom: `2px solid ${accent}` }}><p style={{ fontSize: fs.base+0.5, color: '#555', lineHeight: 1.7, margin: 0 }}>{cv.personal.summary}</p></div>}
        {cv.experience.length > 0 && (
          <CVBlock title={t.headings.experience} accent={accent} useIcons={opt.useIcons} iconName="link">
            {cv.experience.map((e, i) => (
              <div key={e.id} style={{ marginBottom: i < cv.experience.length-1 ? 14 : 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <p style={{ fontWeight: 700, fontSize: fs.h3, margin: 0 }}>{e.role}</p>
                  <span style={{ fontSize: 8.5, color: '#fff', background: accent, padding: '2px 8px', whiteSpace: 'nowrap', marginLeft: 10, flexShrink: 0 }}>{e.startDate}{e.startDate&&' – '}{e.current ? t.present : e.endDate}</span>
                </div>
                <p style={{ color: accent, fontWeight: 700, fontSize: fs.base, margin: '2px 0 5px' }}>{e.company}{e.location && ` · ${e.location}`}</p>
                {e.description && <p style={{ fontSize: fs.base, color: '#555', lineHeight: 1.55, margin: '0 0 4px' }}>{e.description}</p>}
                {e.achievements.filter(Boolean).map((a,ai) => <p key={ai} style={{ fontSize: fs.base, color: '#555', margin: '2px 0', paddingLeft: 10, borderLeft: `2px solid ${accent}` }}>• {a}</p>)}
              </div>
            ))}
          </CVBlock>
        )}
        {cv.education.length > 0 && (
          <CVBlock title={t.headings.education} accent={accent} useIcons={opt.useIcons} iconName="globe">
            {cv.education.map(e => (
              <div key={e.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                <div>
                  <p style={{ fontWeight: 700, fontSize: fs.h3, margin: 0 }}>{e.degree}{e.field && ` — ${e.field}`}</p>
                  <p style={{ color: accent, fontWeight: 600, fontSize: fs.base, margin: '2px 0 0' }}>{e.institution}{e.gpa && ` · ${t.gpa}: ${e.gpa}`}</p>
                </div>
                <p style={{ fontSize: 9, color: '#999', marginLeft: 10, whiteSpace: 'nowrap' }}>{e.startDate}{e.startDate&&' – '}{e.current ? t.present : e.endDate}</p>
              </div>
            ))}
          </CVBlock>
        )}
        {cv.projects.length > 0 && (
          <CVBlock title={t.headings.projects} accent={accent} useIcons={opt.useIcons} iconName="link">
            {cv.projects.map(p => (
              <div key={p.id} style={{ marginBottom: 10 }}>
                <p style={{ fontWeight: 700, fontSize: fs.h3, margin: 0 }}>{p.name}{p.url && <span style={{ fontWeight: 400, fontSize: 9, color: accent, marginLeft: 5 }}>{p.url}</span>}</p>
                {p.tech && <p style={{ fontSize: 9.5, color: accent, fontWeight: 600, margin: '2px 0' }}>{p.tech}</p>}
                {p.description && <p style={{ fontSize: fs.base, color: '#555', lineHeight: 1.5, margin: 0 }}>{p.description}</p>}
              </div>
            ))}
          </CVBlock>
        )}
      </div>
    </div>
  )
}

// ─── CV PREVIEW ROUTER ────────────────────────────────────────────────────────
function CVPreview({ cv, template, opt }: { cv: CVData; template: Template; opt: CVOptions }) {
  const accent = opt.accentColor || template.accent
  const fs = FS[opt.fontSize]
  const t = L[opt.cvLang]
  const p = { cv, opt, accent, fs, t }
  if (template.id === 'classic')   return <ClassicTemplate {...p} />
  if (template.id === 'modern')    return <ModernTemplate {...p} />
  if (template.id === 'executive') return <ExecutiveTemplate {...p} />
  if (template.id === 'minimal')   return <MinimalTemplate {...p} />
  if (template.id === 'creative')  return <CreativeTemplate {...p} />
  return <ATSTemplate {...p} />
}


// ─── ATS SCORE PANEL ─────────────────────────────────────────────────────────
function ATSScorePanel({ cv, template, t }: { cv: CVData; template: Template; t: typeof L['id'] }) {
  const passes = [
    !!cv.personal.name,
    !!cv.personal.email,
    !!cv.personal.phone,
    cv.personal.summary.length >= 50,
    cv.experience.length >= 1,
    cv.experience.length > 0 && cv.experience.every(e => e.description.length > 20),
    cv.education.length >= 1,
    cv.skills.flatMap(s => s.items).length >= 3,
    !!(cv.personal.linkedin || cv.personal.website),
    template.atsScore >= 90,
  ]
  const score = Math.round((passes.filter(Boolean).length / passes.length) * 100)
  const color = score >= 80 ? '#0fa336' : score >= 60 ? '#f4b400' : '#e22718'
  return (
    <div style={{ background: 'var(--surface-card)', border: '1px solid var(--hairline)', padding: 20, marginBottom: 16 }}>
      <div className="flex items-center justify-between mb-3">
        <div>
          <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '1.5px', color: 'var(--muted)', textTransform: 'uppercase', marginBottom: 2 }}>{t.atsScore}</p>
          <p style={{ fontSize: 30, fontWeight: 700, color, lineHeight: 1 }}>{score}<span style={{ fontSize: 14 }}>%</span></p>
        </div>
        <p style={{ fontSize: 11, color: 'var(--body)', fontWeight: 300, textAlign: 'right' }}>{score >= 80 ? t.atsReady : score >= 60 ? t.atsWarn : t.atsFail}</p>
      </div>
      <div style={{ height: 4, background: 'var(--surface-elevated)', marginBottom: 14 }}>
        <div style={{ height: 4, background: color, width: `${score}%`, transition: 'width 0.5s' }} />
      </div>
      <div className="grid grid-cols-1 gap-1.5">
        {t.checks.map((label, i) => (
          <div key={i} className="flex items-center gap-2">
            <div style={{ width: 14, height: 14, background: passes[i] ? '#0fa336' : 'var(--surface-elevated)', border: `1px solid ${passes[i] ? '#0fa336' : 'var(--hairline)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              {passes[i] && <Check size={9} style={{ color: '#fff' }} />}
            </div>
            <p style={{ fontSize: 11, color: passes[i] ? 'var(--body)' : 'var(--muted)', margin: 0 }}>{label}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── FORM HELPERS ─────────────────────────────────────────────────────────────
function Field({ label, value, onChange, placeholder, type = 'text', required }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string; required?: boolean }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: 'block', fontSize: 10, fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 5 }}>
        {label}{required && <span style={{ color: 'var(--m-red)', marginLeft: 4 }}>*</span>}
      </label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} className="input-base" style={{ height: 40, fontSize: 13 }} />
    </div>
  )
}

function SH({ title, desc }: { title: string; desc: string }) {
  return (
    <div style={{ marginBottom: 20, paddingBottom: 14, borderBottom: '1px solid var(--hairline)' }}>
      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 700, color: 'var(--ink)', textTransform: 'uppercase', marginBottom: 3 }}>{title}</h2>
      <p style={{ fontSize: 12, fontWeight: 300, color: 'var(--muted)', lineHeight: 1.5 }}>{desc}</p>
    </div>
  )
}

function AddBtn({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className="flex items-center gap-2"
      style={{ width: '100%', height: 42, background: 'var(--surface-card)', border: '1px dashed var(--hairline)', color: 'var(--muted)', fontSize: 11, fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', cursor: 'pointer', justifyContent: 'center' }}>
      <Plus size={13} /> {label}
    </button>
  )
}


// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function CVGenerator({ lang }: { lang: Lang }) {
  const [cv, setCV] = useState<CVData>(blankCV())
  const [opt, setOpt] = useState<CVOptions>(defaultOpts())
  const [template, setTemplate] = useState<Template>(TEMPLATES[0])
  const [section, setSection] = useState<Section>('template')
  const [aiLoading, setAiLoading] = useState('')
  const [aiError, setAiError] = useState('')
  const [downloading, setDownloading] = useState(false)
  const [skillInput, setSkillInput] = useState<Record<string, string>>({})

  const t = L[opt.cvLang]
  const sIdx = SECTIONS.findIndex(s => s.id === section)
  const setOp = (k: keyof CVOptions, v: unknown) => setOpt(p => ({ ...p, [k]: v }))
  const upP = (k: keyof CVData['personal'], v: string) => setCV(p => ({ ...p, personal: { ...p.personal, [k]: v } }))

  // ── AI ──
  const aiSummary = async () => {
    setAiLoading('summary'); setAiError('')
    try {
      const r = await apiCall({
        message: `Name: ${cv.personal.name}\nTitle: ${cv.personal.title}\nExp: ${cv.experience.map(e => `${e.role} at ${e.company}`).join(', ')}\nSkills: ${cv.skills.flatMap(s => s.items).join(', ')}`,
        system: opt.cvLang === 'id'
          ? 'Expert CV writer. Buat professional summary dalam BAHASA INDONESIA yang kuat, impactful, ATS-friendly. Maks 3-4 kalimat. Gunakan action verbs. Langsung tulis teksnya saja.'
          : 'Expert CV writer. Write a strong, impactful, ATS-friendly professional summary in ENGLISH. Max 3-4 sentences. Use action verbs. Write only the text.',
        engine: 'gpt',
      })
      upP('summary', r.content.trim())
    } catch (e: unknown) { setAiError(e instanceof Error ? e.message : 'Error') }
    setAiLoading('')
  }

  const aiExp = async (id: string) => {
    const exp = cv.experience.find(e => e.id === id)
    if (!exp) return
    setAiLoading('exp-' + id); setAiError('')
    try {
      const r = await apiCall({
        message: `Role: ${exp.role}\nCompany: ${exp.company}\nDesc: ${exp.description}`,
        system: opt.cvLang === 'id'
          ? 'Expert CV writer. Tulis ulang dalam BAHASA INDONESIA lebih kuat, action verbs, metrik. Maks 2 kalimat. Langsung tulis.'
          : 'Expert CV writer. Rewrite in ENGLISH stronger, action verbs, metrics. Max 2 sentences. Write directly.',
        engine: 'gpt',
      })
      setCV(p => ({ ...p, experience: p.experience.map(e => e.id === id ? { ...e, description: r.content.trim() } : e) }))
    } catch (e: unknown) { setAiError(e instanceof Error ? e.message : 'Error') }
    setAiLoading('')
  }

  const aiSkills = async () => {
    setAiLoading('skills'); setAiError('')
    try {
      const r = await apiCall({
        message: `Title: ${cv.personal.title}\nExp: ${cv.experience.map(e => e.role + ' at ' + e.company).join(', ')}`,
        system: opt.cvLang === 'id'
          ? 'Expert CV writer. 15-20 skill relevan BAHASA INDONESIA. Format:\nTechnical Skills: skill1, skill2\nSoft Skills: skill1, skill2\nTools & Software: tool1, tool2\nHanya format ini.'
          : 'Expert CV writer. 15-20 relevant skills in ENGLISH. Format:\nTechnical Skills: skill1, skill2\nSoft Skills: skill1, skill2\nTools & Software: tool1, tool2\nOnly this format.',
        engine: 'gpt',
      })
      const skills = r.content.trim().split('\n').filter(l => l.includes(':')).map(line => {
        const [cat, items] = line.split(':')
        return { id: uid(), category: cat?.trim() || '', items: items?.split(',').map(s => s.trim()).filter(Boolean) || [] }
      }).filter(s => s.items.length > 0)
      if (skills.length > 0) setCV(p => ({ ...p, skills }))
    } catch (e: unknown) { setAiError(e instanceof Error ? e.message : 'Error') }
    setAiLoading('')
  }

  // ── Download ──
  const downloadPDF = async () => {
    setDownloading(true)
    try {
      const el = document.getElementById('cv-render')
      if (!el) throw new Error('Preview not found')
      const html2canvas = (await import('html2canvas')).default
      const { jsPDF } = await import('jspdf')
      const canvas = await html2canvas(el, { scale: 2.5, useCORS: true, backgroundColor: '#ffffff', logging: false })
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
      const w = pdf.internal.pageSize.getWidth()
      pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, w, (canvas.height * w) / canvas.width)
      pdf.save(`${cv.personal.name || 'CV'}-${template.id}.pdf`)
    } catch (e: unknown) { setAiError('PDF: ' + (e instanceof Error ? e.message : String(e))) }
    setDownloading(false)
  }

  const downloadHTML = () => {
    const el = document.getElementById('cv-render')
    if (!el) return
    const blob = new Blob([`<!DOCTYPE html><html><head><meta charset="UTF-8"><title>CV</title><style>*{box-sizing:border-box;margin:0;padding:0}body{background:#eee;display:flex;justify-content:center;padding:20px}#cv{width:794px;background:#fff}</style></head><body><div id="cv">${el.innerHTML}</div></body></html>`], { type: 'text/html' })
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `${cv.personal.name || 'CV'}.html`; a.click()
  }

  // ── Render section ──
  const renderSection = () => {
    // ── TEMPLATE ──
    if (section === 'template') return (
      <div>
        <SH title={t.selectTemplate} desc={opt.cvLang === 'id' ? 'Template menentukan tampilan dan peluang lolos ATS.' : 'Template determines appearance and ATS pass rate.'} />
        <div className="grid grid-cols-2 md:grid-cols-3 gap-px mb-6" style={{ border: '1px solid var(--hairline)' }}>
          {TEMPLATES.map(tmpl => {
            const isActive = template.id === tmpl.id
            const a = tmpl.accent
            return (
              <button key={tmpl.id} onClick={() => { setTemplate(tmpl); setOp('accentColor', tmpl.accent) }}
                className="text-left p-4 transition-all"
                style={{ background: isActive ? 'var(--surface-elevated)' : 'var(--surface-card)', borderRight: '1px solid var(--hairline)', borderBottom: '1px solid var(--hairline)', borderTop: isActive ? `3px solid ${a}` : '3px solid transparent', cursor: 'pointer' }}
                onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'var(--surface-elevated)' }}
                onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'var(--surface-card)' }}>
                {/* Mini preview */}
                <div style={{ width: '100%', height: 60, background: '#fff', border: '1px solid #ddd', marginBottom: 10, overflow: 'hidden', position: 'relative' }}>
                  {tmpl.id === 'creative' ? (
                    <div style={{ display: 'flex', height: '100%' }}>
                      <div style={{ width: '28%', background: '#111' }} />
                      <div style={{ flex: 1, padding: 7 }}>
                        <div style={{ height: 5, background: a, width: '65%', marginBottom: 4 }} />
                        <div style={{ height: 2.5, background: '#e0e0e0', width: '85%', marginBottom: 2.5 }} />
                        <div style={{ height: 2.5, background: '#e0e0e0', width: '70%', marginBottom: 2.5 }} />
                        <div style={{ height: 2.5, background: '#e0e0e0', width: '80%' }} />
                      </div>
                    </div>
                  ) : tmpl.id === 'modern' ? (
                    <div>
                      <div style={{ background: a, height: 22, padding: '4px 8px' }}><div style={{ height: 4, background: 'rgba(255,255,255,0.8)', width: '50%' }} /></div>
                      <div style={{ padding: 7 }}>
                        <div style={{ height: 2.5, background: '#e0e0e0', width: '85%', marginBottom: 2.5 }} />
                        <div style={{ height: 2.5, background: '#e0e0e0', width: '70%' }} />
                      </div>
                    </div>
                  ) : tmpl.id === 'executive' ? (
                    <div>
                      <div style={{ background: '#111', height: 26, padding: '5px 10px' }}>
                        <div style={{ height: 2, background: a, width: '100%', marginBottom: 4 }} />
                        <div style={{ height: 4, background: a, width: '50%', opacity: 0.9 }} />
                      </div>
                      <div style={{ padding: 7 }}><div style={{ height: 2.5, background: '#e0e0e0', width: '85%', marginBottom: 2.5 }} /><div style={{ height: 2.5, background: '#e0e0e0', width: '70%' }} /></div>
                    </div>
                  ) : tmpl.id === 'minimal' ? (
                    <div style={{ background: '#fafafa', padding: 9 }}>
                      <div style={{ height: 5, background: '#222', width: '55%', marginBottom: 4, fontWeight: 300 }} />
                      <div style={{ width: 20, height: 1.5, background: a, marginBottom: 6 }} />
                      <div style={{ height: 2, background: '#ddd', width: '85%', marginBottom: 2.5 }} />
                      <div style={{ height: 2, background: '#ddd', width: '70%' }} />
                    </div>
                  ) : tmpl.id === 'classic' ? (
                    <div style={{ padding: 9, textAlign: 'center' as const }}>
                      <div style={{ height: 2, background: a, marginBottom: 6 }} />
                      <div style={{ height: 6, background: '#111', width: '55%', margin: '0 auto 5px' }} />
                      <div style={{ height: 2, background: a, marginBottom: 5 }} />
                      <div style={{ height: 2, background: '#ddd', width: '85%', margin: '0 auto 2.5px' }} />
                      <div style={{ height: 2, background: '#ddd', width: '70%', margin: '0 auto' }} />
                    </div>
                  ) : (
                    <div style={{ padding: 9 }}>
                      <div style={{ height: 2, background: a, width: '100%', marginBottom: 6 }} />
                      <div style={{ height: 6, background: a, width: '55%', marginBottom: 4, opacity: 0.85 }} />
                      <div style={{ height: 2, background: '#ddd', width: '85%', marginBottom: 2.5 }} />
                      <div style={{ height: 2, background: '#ddd', width: '70%' }} />
                    </div>
                  )}
                </div>
                <div className="flex items-start justify-between gap-2 mb-1">
                  <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--ink)', margin: 0 }}>{tmpl.name}</p>
                  <span style={{ fontSize: 8, fontWeight: 700, padding: '2px 6px', background: tmpl.badgeColor, color: '#fff', flexShrink: 0 }}>{tmpl.badge}</span>
                </div>
                <p style={{ fontSize: 10, fontWeight: 300, color: 'var(--muted)', lineHeight: 1.5, margin: '0 0 7px' }}>{tmpl.desc[opt.cvLang]}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ height: 2, flex: 1, background: 'var(--surface-elevated)' }}><div style={{ height: 2, background: tmpl.badgeColor, width: `${tmpl.atsScore}%` }} /></div>
                  <span style={{ fontSize: 9, fontWeight: 700, color: 'var(--muted)' }}>ATS {tmpl.atsScore}%</span>
                </div>
                {isActive && <p style={{ fontSize: 10, fontWeight: 700, color: a, marginTop: 6, display: 'flex', alignItems: 'center', gap: 4 }}><Check size={11} /> {t.selected}</p>}
              </button>
            )
          })}
        </div>

        {/* CV Options */}
        <div style={{ background: 'var(--surface-card)', border: '1px solid var(--hairline)', padding: 20 }}>
          <div className="flex items-center gap-2 mb-5">
            <Settings2 size={13} style={{ color: 'var(--muted)' }} />
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '1.5px', color: 'var(--muted)', textTransform: 'uppercase' }}>{t.cvOptions}</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Language */}
            <div>
              <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '1.5px', color: 'var(--muted)', textTransform: 'uppercase', marginBottom: 8 }}>{t.cvLangLabel}</p>
              <div className="flex gap-2">
                {(['id', 'en'] as CVLang[]).map(l => (
                  <button key={l} onClick={() => setOp('cvLang', l)}
                    style={{ flex: 1, height: 38, background: opt.cvLang === l ? 'var(--m-blue-dark)' : 'var(--surface-elevated)', border: `1px solid ${opt.cvLang === l ? 'var(--m-blue-dark)' : 'var(--hairline)'}`, color: opt.cvLang === l ? '#fff' : 'var(--muted)', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                    {l === 'id' ? '🇮🇩 Indonesia' : '🇬🇧 English'}
                  </button>
                ))}
              </div>
            </div>
            {/* Icons toggle */}
            <div>
              <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '1.5px', color: 'var(--muted)', textTransform: 'uppercase', marginBottom: 8 }}>{t.iconsLabel}</p>
              <div className="flex gap-2">
                {[true, false].map(val => (
                  <button key={String(val)} onClick={() => setOp('useIcons', val)}
                    style={{ flex: 1, height: 38, background: opt.useIcons === val ? 'var(--m-blue-dark)' : 'var(--surface-elevated)', border: `1px solid ${opt.useIcons === val ? 'var(--m-blue-dark)' : 'var(--hairline)'}`, color: opt.useIcons === val ? '#fff' : 'var(--muted)', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>
                    {val ? t.withIcons : t.noIcons}
                  </button>
                ))}
              </div>
            </div>
            {/* Accent color */}
            <div>
              <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '1.5px', color: 'var(--muted)', textTransform: 'uppercase', marginBottom: 8 }}>{t.accentLabel}</p>
              <div className="flex flex-wrap gap-2">
                {ACCENT_COLORS.map(c => (
                  <button key={c.value} onClick={() => setOp('accentColor', c.value)} title={c.label}
                    style={{ width: 30, height: 30, background: c.value, border: opt.accentColor === c.value ? '3px solid var(--ink)' : '2px solid transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {opt.accentColor === c.value && <Check size={13} color="#fff" strokeWidth={3} />}
                  </button>
                ))}
              </div>
            </div>
            {/* Font size */}
            <div>
              <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '1.5px', color: 'var(--muted)', textTransform: 'uppercase', marginBottom: 8 }}>{t.fontSizeLabel}</p>
              <div className="flex gap-2">
                {(['small', 'normal', 'large'] as const).map(sz => (
                  <button key={sz} onClick={() => setOp('fontSize', sz)}
                    style={{ flex: 1, height: 38, background: opt.fontSize === sz ? 'var(--m-blue-dark)' : 'var(--surface-elevated)', border: `1px solid ${opt.fontSize === sz ? 'var(--m-blue-dark)' : 'var(--hairline)'}`, color: opt.fontSize === sz ? '#fff' : 'var(--muted)', fontSize: 11, fontWeight: 700, cursor: 'pointer', textTransform: 'uppercase' }}>
                    {sz === 'small' ? t.small : sz === 'normal' ? t.normal : t.large}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    )

    // ── PERSONAL ──
    if (section === 'personal') return (
      <div>
        <SH title={t.sectionLabels.personal.toUpperCase()} desc={opt.cvLang === 'id' ? 'Informasi kontak yang tampil di bagian atas CV.' : 'Contact information displayed at the top of your CV.'} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
          <Field label={opt.cvLang === 'id' ? 'Nama Lengkap' : 'Full Name'} value={cv.personal.name} onChange={v => upP('name', v)} placeholder="Budi Santoso" required />
          <Field label={opt.cvLang === 'id' ? 'Jabatan / Posisi' : 'Job Title'} value={cv.personal.title} onChange={v => upP('title', v)} placeholder="Senior Software Engineer" required />
          <Field label="Email" value={cv.personal.email} onChange={v => upP('email', v)} placeholder="budi@email.com" type="email" required />
          <Field label={opt.cvLang === 'id' ? 'Nomor Telepon' : 'Phone Number'} value={cv.personal.phone} onChange={v => upP('phone', v)} placeholder="+62 812 3456 7890" required />
          <Field label={opt.cvLang === 'id' ? 'Lokasi / Kota' : 'Location / City'} value={cv.personal.location} onChange={v => upP('location', v)} placeholder="Jakarta, Indonesia" />
          <Field label="LinkedIn" value={cv.personal.linkedin} onChange={v => upP('linkedin', v)} placeholder="linkedin.com/in/username" />
          <Field label="GitHub" value={cv.personal.github} onChange={v => upP('github', v)} placeholder="github.com/username" />
          <Field label={opt.cvLang === 'id' ? 'Website / Portfolio' : 'Website / Portfolio'} value={cv.personal.website} onChange={v => upP('website', v)} placeholder="portfolio.dev" />
        </div>
        <div style={{ marginBottom: 16 }}>
          <div className="flex items-center justify-between mb-2">
            <label style={{ fontSize: 10, fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--muted)' }}>{t.headings.summary}</label>
            <button onClick={aiSummary} disabled={!!aiLoading} className="flex items-center gap-1.5"
              style={{ fontSize: 10, fontWeight: 700, color: aiLoading === 'summary' ? 'var(--muted)' : 'var(--m-blue-light)', textTransform: 'uppercase', background: 'none', border: '1px solid var(--hairline)', padding: '4px 10px', cursor: 'pointer' }}>
              {aiLoading === 'summary' ? <Loader2 size={11} className="animate-spin" /> : <Sparkles size={11} />} {t.aiEnhance}
            </button>
          </div>
          <textarea value={cv.personal.summary} onChange={e => upP('summary', e.target.value)}
            placeholder={opt.cvLang === 'id' ? 'Profesional berpengalaman dengan 5+ tahun di bidang...' : 'Experienced professional with 5+ years in...'}
            rows={4} className="input-base" style={{ height: 'auto', resize: 'vertical', fontSize: 13, lineHeight: 1.6 }} />
          <p style={{ fontSize: 10, color: 'var(--muted)', marginTop: 4 }}>{cv.personal.summary.length} {opt.cvLang === 'id' ? 'karakter · Rekomendasi 150–300' : 'chars · Recommended 150–300'}</p>
        </div>
        <ATSScorePanel cv={cv} template={template} t={t} />
      </div>
    )

    // ── EXPERIENCE ──
    if (section === 'experience') return (
      <div>
        <SH title={t.sectionLabels.experience.toUpperCase()} desc={opt.cvLang === 'id' ? 'Urutkan dari yang terbaru. Gunakan action verbs dan metrik kuantitatif.' : 'Order from most recent. Use action verbs and quantifiable metrics.'} />
        {cv.experience.map((exp, idx) => (
          <div key={exp.id} style={{ background: 'var(--surface-soft)', border: '1px solid var(--hairline)', marginBottom: 12 }}>
            <div className="flex items-center justify-between p-3" style={{ borderBottom: '1px solid var(--hairline)' }}>
              <div>
                <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--ink)', margin: 0 }}>{exp.role || (opt.cvLang === 'id' ? `Pengalaman ${idx+1}` : `Experience ${idx+1}`)}</p>
                {exp.company && <p style={{ fontSize: 11, color: 'var(--muted)', margin: '1px 0 0' }}>{exp.company}</p>}
              </div>
              <div className="flex items-center gap-1">
                {idx > 0 && <button onClick={() => setCV(p => { const a=[...p.experience]; [a[idx],a[idx-1]]=[a[idx-1],a[idx]]; return {...p,experience:a} })} style={{ background:'none',border:'none',cursor:'pointer',color:'var(--muted)',padding:3 }}><MoveUp size={12}/></button>}
                {idx < cv.experience.length-1 && <button onClick={() => setCV(p => { const a=[...p.experience]; [a[idx],a[idx+1]]=[a[idx+1],a[idx]]; return {...p,experience:a} })} style={{ background:'none',border:'none',cursor:'pointer',color:'var(--muted)',padding:3 }}><MoveDown size={12}/></button>}
                <button onClick={() => setCV(p => ({...p,experience:p.experience.filter(e=>e.id!==exp.id)}))} style={{ background:'none',border:'none',cursor:'pointer',color:'var(--m-red)',padding:3 }}><Trash2 size={13}/></button>
              </div>
            </div>
            <div style={{ padding: '14px 14px 10px' }}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-5">
                <Field label={opt.cvLang==='id'?'Jabatan':'Job Title'} value={exp.role} onChange={v=>setCV(p=>({...p,experience:p.experience.map(e=>e.id===exp.id?{...e,role:v}:e)}))} placeholder="Software Engineer" required />
                <Field label={opt.cvLang==='id'?'Perusahaan':'Company'} value={exp.company} onChange={v=>setCV(p=>({...p,experience:p.experience.map(e=>e.id===exp.id?{...e,company:v}:e)}))} placeholder="PT Teknologi Maju" required />
                <Field label={opt.cvLang==='id'?'Tanggal Mulai':'Start Date'} value={exp.startDate} onChange={v=>setCV(p=>({...p,experience:p.experience.map(e=>e.id===exp.id?{...e,startDate:v}:e)}))} placeholder="Jan 2022" />
                <Field label={opt.cvLang==='id'?'Tanggal Selesai':'End Date'} value={exp.endDate} onChange={v=>setCV(p=>({...p,experience:p.experience.map(e=>e.id===exp.id?{...e,endDate:v}:e)}))} placeholder="Des 2024" />
                <Field label={opt.cvLang==='id'?'Lokasi':'Location'} value={exp.location} onChange={v=>setCV(p=>({...p,experience:p.experience.map(e=>e.id===exp.id?{...e,location:v}:e)}))} placeholder="Jakarta / Remote" />
              </div>
              <div className="flex items-center gap-2 mb-3" style={{ marginTop:-8 }}>
                <input type="checkbox" checked={exp.current} onChange={e=>setCV(p=>({...p,experience:p.experience.map(ex=>ex.id===exp.id?{...ex,current:e.target.checked}:ex)}))} style={{ accentColor:'var(--m-blue-dark)' }} />
                <label style={{ fontSize:12,color:'var(--body)',cursor:'pointer' }}>{t.stillWorking}</label>
              </div>
              <div style={{ marginBottom:12 }}>
                <div className="flex items-center justify-between mb-2">
                  <label style={{ fontSize:10,fontWeight:700,letterSpacing:'1.5px',textTransform:'uppercase',color:'var(--muted)' }}>{opt.cvLang==='id'?'DESKRIPSI':'DESCRIPTION'}</label>
                  <button onClick={()=>aiExp(exp.id)} disabled={!!aiLoading} style={{ fontSize:9,fontWeight:700,color:aiLoading==='exp-'+exp.id?'var(--muted)':'var(--m-blue-light)',textTransform:'uppercase',background:'none',border:'1px solid var(--hairline)',padding:'3px 8px',cursor:'pointer',display:'flex',alignItems:'center',gap:5 }}>
                    {aiLoading==='exp-'+exp.id?<Loader2 size={10} className="animate-spin"/>:<Sparkles size={10}/>} {t.aiEnhance}
                  </button>
                </div>
                <textarea value={exp.description} onChange={e=>setCV(p=>({...p,experience:p.experience.map(ex=>ex.id===exp.id?{...ex,description:e.target.value}:ex)}))}
                  placeholder={opt.cvLang==='id'?'Tanggung jawab dan pencapaian utama...':'Key responsibilities and achievements...'}
                  rows={3} className="input-base" style={{ height:'auto',resize:'vertical',fontSize:13,lineHeight:1.6 }} />
              </div>
              <div>
                <label style={{ fontSize:10,fontWeight:700,letterSpacing:'1.5px',textTransform:'uppercase',color:'var(--muted)',display:'block',marginBottom:7 }}>{t.headings.achievements}</label>
                {exp.achievements.map((ach,ai) => (
                  <div key={ai} className="flex items-center gap-2 mb-2">
                    <span style={{ fontSize:12,color:'var(--m-blue-light)',flexShrink:0 }}>›</span>
                    <input value={ach} onChange={e=>{const arr=[...exp.achievements];arr[ai]=e.target.value;setCV(p=>({...p,experience:p.experience.map(ex=>ex.id===exp.id?{...ex,achievements:arr}:ex)}))}}
                      placeholder={opt.cvLang==='id'?'Meningkatkan performa 40% dengan optimasi database...':'Improved performance by 40% through database optimization...'}
                      className="input-base" style={{ height:38,fontSize:12,flex:1 }} />
                    <button onClick={()=>{const arr=exp.achievements.filter((_,i)=>i!==ai);setCV(p=>({...p,experience:p.experience.map(ex=>ex.id===exp.id?{...ex,achievements:arr}:ex)}))}} style={{ background:'none',border:'none',cursor:'pointer',color:'var(--muted)',flexShrink:0 }}><Trash2 size={12}/></button>
                  </div>
                ))}
                <button onClick={()=>setCV(p=>({...p,experience:p.experience.map(e=>e.id===exp.id?{...e,achievements:[...e.achievements,'']}:e)}))} style={{ fontSize:10,fontWeight:700,color:'var(--m-blue-light)',letterSpacing:'1px',textTransform:'uppercase',background:'none',border:'none',cursor:'pointer',display:'flex',alignItems:'center',gap:5 }}>
                  <Plus size={11}/> {t.addBullet}
                </button>
              </div>
            </div>
          </div>
        ))}
        <AddBtn label={t.addExp} onClick={()=>setCV(p=>({...p,experience:[...p.experience,{id:uid(),company:'',role:'',startDate:'',endDate:'',current:false,location:'',description:'',achievements:['']}]}))} />
      </div>
    )

    // ── EDUCATION ──
    if (section === 'education') return (
      <div>
        <SH title={t.sectionLabels.education.toUpperCase()} desc={opt.cvLang==='id'?'Cantumkan pendidikan formal dari yang terbaru.':'List formal education from most recent.'} />
        {cv.education.map((edu,idx) => (
          <div key={edu.id} style={{ background:'var(--surface-soft)',border:'1px solid var(--hairline)',marginBottom:12,padding:14 }}>
            <div className="flex justify-between items-start mb-3">
              <p style={{ fontSize:12,fontWeight:700,color:'var(--ink)',margin:0 }}>{edu.degree||(opt.cvLang==='id'?`Pendidikan ${idx+1}`:`Education ${idx+1}`)}</p>
              <button onClick={()=>setCV(p=>({...p,education:p.education.filter(e=>e.id!==edu.id)}))} style={{ background:'none',border:'none',cursor:'pointer',color:'var(--m-red)' }}><Trash2 size={13}/></button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-5">
              <Field label={opt.cvLang==='id'?'Nama Institusi':'Institution'} value={edu.institution} onChange={v=>setCV(p=>({...p,education:p.education.map(e=>e.id===edu.id?{...e,institution:v}:e)}))} placeholder="Universitas Indonesia" required />
              <Field label={opt.cvLang==='id'?'Gelar':'Degree'} value={edu.degree} onChange={v=>setCV(p=>({...p,education:p.education.map(e=>e.id===edu.id?{...e,degree:v}:e)}))} placeholder="S1 / Bachelor" required />
              <Field label={opt.cvLang==='id'?'Jurusan':'Field of Study'} value={edu.field} onChange={v=>setCV(p=>({...p,education:p.education.map(e=>e.id===edu.id?{...e,field:v}:e)}))} placeholder="Teknik Informatika" />
              <Field label={opt.cvLang==='id'?'IPK':'GPA'} value={edu.gpa} onChange={v=>setCV(p=>({...p,education:p.education.map(e=>e.id===edu.id?{...e,gpa:v}:e)}))} placeholder="3.75" />
              <Field label={opt.cvLang==='id'?'Tahun Mulai':'Start Year'} value={edu.startDate} onChange={v=>setCV(p=>({...p,education:p.education.map(e=>e.id===edu.id?{...e,startDate:v}:e)}))} placeholder="2019" />
              <Field label={opt.cvLang==='id'?'Tahun Lulus':'Graduation Year'} value={edu.endDate} onChange={v=>setCV(p=>({...p,education:p.education.map(e=>e.id===edu.id?{...e,endDate:v}:e)}))} placeholder="2023" />
              <Field label={opt.cvLang==='id'?'Penghargaan':'Honors/Awards'} value={edu.honors} onChange={v=>setCV(p=>({...p,education:p.education.map(e=>e.id===edu.id?{...e,honors:v}:e)}))} placeholder="Cumlaude / Dean's List" />
            </div>
            <div className="flex items-center gap-2" style={{ marginTop:-8 }}>
              <input type="checkbox" checked={edu.current} onChange={e=>setCV(p=>({...p,education:p.education.map(ed=>ed.id===edu.id?{...ed,current:e.target.checked}:ed)}))} style={{ accentColor:'var(--m-blue-dark)' }} />
              <label style={{ fontSize:12,color:'var(--body)',cursor:'pointer' }}>{t.stillStudying}</label>
            </div>
          </div>
        ))}
        <AddBtn label={t.addEdu} onClick={()=>setCV(p=>({...p,education:[...p.education,{id:uid(),institution:'',degree:'',field:'',startDate:'',endDate:'',current:false,gpa:'',honors:''}]}))} />
      </div>
    )

    // ── SKILLS ──
    if (section === 'skills') return (
      <div>
        <SH title={t.sectionLabels.skills.toUpperCase()} desc={opt.cvLang==='id'?'Kelompokkan skill per kategori. Sesuaikan dengan job description.':'Group skills by category. Match with the job description.'} />
        <div className="flex justify-end mb-4">
          <button onClick={aiSkills} disabled={!!aiLoading} className="flex items-center gap-2" style={{ fontSize:11,fontWeight:700,color:aiLoading==='skills'?'var(--muted)':'var(--m-blue-light)',textTransform:'uppercase',background:'none',border:'1px solid rgba(0,102,177,0.3)',padding:'7px 14px',cursor:'pointer' }}>
            {aiLoading==='skills'?<Loader2 size={12} className="animate-spin"/>:<Sparkles size={12}/>} {t.aiSuggest}
          </button>
        </div>
        {cv.skills.map(sg => (
          <div key={sg.id} style={{ background:'var(--surface-soft)',border:'1px solid var(--hairline)',padding:14,marginBottom:12 }}>
            <div className="flex items-start gap-3 mb-3">
              <input value={sg.category} onChange={e=>setCV(p=>({...p,skills:p.skills.map(s=>s.id===sg.id?{...s,category:e.target.value}:s)}))}
                placeholder={opt.cvLang==='id'?'Kategori (cth: Programming Languages)':'Category (e.g. Programming Languages)'}
                className="input-base" style={{ height:38,fontSize:12,flex:1 }} />
              <button onClick={()=>setCV(p=>({...p,skills:p.skills.filter(s=>s.id!==sg.id)}))} style={{ background:'none',border:'none',cursor:'pointer',color:'var(--m-red)',padding:4,flexShrink:0 }}><Trash2 size={13}/></button>
            </div>
            <div className="flex flex-wrap gap-2 mb-3">
              {sg.items.map((item,i) => (
                <span key={i} className="flex items-center gap-1" style={{ background:'var(--surface-elevated)',border:'1px solid var(--hairline)',padding:'3px 10px',fontSize:11,color:'var(--body)' }}>
                  {item}
                  <button onClick={()=>setCV(p=>({...p,skills:p.skills.map(s=>s.id===sg.id?{...s,items:s.items.filter((_,idx)=>idx!==i)}:s)}))} style={{ background:'none',border:'none',cursor:'pointer',color:'var(--muted)',padding:'0 0 0 4px' }}>✕</button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input value={skillInput[sg.id]||''} onChange={e=>setSkillInput(p=>({...p,[sg.id]:e.target.value}))}
                onKeyDown={e=>{if((e.key==='Enter'||e.key===',')&&(skillInput[sg.id]||'').trim()){setCV(p=>({...p,skills:p.skills.map(s=>s.id===sg.id?{...s,items:[...s.items,(skillInput[sg.id]||'').trim()]}:s)}));setSkillInput(p=>({...p,[sg.id]:''}));e.preventDefault()}}}
                placeholder={opt.cvLang==='id'?'Ketik skill lalu Enter...':'Type skill then Enter...'}
                className="input-base" style={{ height:36,fontSize:12,flex:1 }} />
              <button onClick={()=>{const v=(skillInput[sg.id]||'').trim();if(v){setCV(p=>({...p,skills:p.skills.map(s=>s.id===sg.id?{...s,items:[...s.items,v]}:s)}));setSkillInput(p=>({...p,[sg.id]:''}));}}} style={{ height:36,padding:'0 14px',background:'var(--m-blue-dark)',border:'none',color:'#fff',fontSize:11,fontWeight:700,cursor:'pointer' }}><Plus size={13}/></button>
            </div>
          </div>
        ))}
        <AddBtn label={t.addSkill} onClick={()=>setCV(p=>({...p,skills:[...p.skills,{id:uid(),category:'',items:[]}]}))} />
      </div>
    )

    // ── PROJECTS ──
    if (section === 'projects') return (
      <div>
        <SH title={t.sectionLabels.projects.toUpperCase()} desc={opt.cvLang==='id'?'Cantumkan proyek yang relevan dengan posisi yang dilamar.':'List projects relevant to the position you are applying for.'} />
        {cv.projects.map(proj => (
          <div key={proj.id} style={{ background:'var(--surface-soft)',border:'1px solid var(--hairline)',marginBottom:12,padding:14 }}>
            <div className="flex justify-between items-start mb-3">
              <p style={{ fontSize:12,fontWeight:700,color:'var(--ink)',margin:0 }}>{proj.name||(opt.cvLang==='id'?'Proyek Baru':'New Project')}</p>
              <button onClick={()=>setCV(p=>({...p,projects:p.projects.filter(pr=>pr.id!==proj.id)}))} style={{ background:'none',border:'none',cursor:'pointer',color:'var(--m-red)' }}><Trash2 size={13}/></button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-5">
              <Field label={opt.cvLang==='id'?'Nama Proyek':'Project Name'} value={proj.name} onChange={v=>setCV(p=>({...p,projects:p.projects.map(pr=>pr.id===proj.id?{...pr,name:v}:pr)}))} required />
              <Field label={opt.cvLang==='id'?'Teknologi':'Tech Stack'} value={proj.tech} onChange={v=>setCV(p=>({...p,projects:p.projects.map(pr=>pr.id===proj.id?{...pr,tech:v}:pr)}))} placeholder="Next.js, Node.js, PostgreSQL" />
              <Field label="URL / Link" value={proj.url} onChange={v=>setCV(p=>({...p,projects:p.projects.map(pr=>pr.id===proj.id?{...pr,url:v}:pr)}))} placeholder="github.com/user/project" />
              <Field label={opt.cvLang==='id'?'Periode':'Period'} value={proj.startDate} onChange={v=>setCV(p=>({...p,projects:p.projects.map(pr=>pr.id===proj.id?{...pr,startDate:v}:pr)}))} placeholder="Jan 2024 – Mar 2024" />
            </div>
            <div>
              <label style={{ display:'block',fontSize:10,fontWeight:700,letterSpacing:'1.5px',textTransform:'uppercase',color:'var(--muted)',marginBottom:5 }}>{opt.cvLang==='id'?'DESKRIPSI':'DESCRIPTION'}</label>
              <textarea value={proj.description} onChange={e=>setCV(p=>({...p,projects:p.projects.map(pr=>pr.id===proj.id?{...pr,description:e.target.value}:pr)}))}
                placeholder={opt.cvLang==='id'?'Konteks, peran, dan hasil yang dicapai...':'Context, your role, and outcomes achieved...'}
                rows={3} className="input-base" style={{ height:'auto',resize:'vertical',fontSize:13,lineHeight:1.6 }} />
            </div>
          </div>
        ))}
        <AddBtn label={t.addProject} onClick={()=>setCV(p=>({...p,projects:[...p.projects,{id:uid(),name:'',description:'',tech:'',url:'',startDate:'',endDate:''}]}))} />
      </div>
    )

    // ── CERTIFICATIONS ──
    if (section === 'certifications') return (
      <div>
        <SH title={t.sectionLabels.certifications.toUpperCase()} desc={opt.cvLang==='id'?'Sertifikasi dari platform terkemuka meningkatkan peluang diterima.':'Certifications from reputable platforms increase your chances.'} />
        {cv.certifications.map(cert => (
          <div key={cert.id} style={{ background:'var(--surface-soft)',border:'1px solid var(--hairline)',padding:14,marginBottom:12 }}>
            <div className="flex justify-end mb-2"><button onClick={()=>setCV(p=>({...p,certifications:p.certifications.filter(c=>c.id!==cert.id)}))} style={{ background:'none',border:'none',cursor:'pointer',color:'var(--m-red)' }}><Trash2 size={13}/></button></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-5">
              <Field label={opt.cvLang==='id'?'Nama Sertifikasi':'Certification Name'} value={cert.name} onChange={v=>setCV(p=>({...p,certifications:p.certifications.map(c=>c.id===cert.id?{...c,name:v}:c)}))} required />
              <Field label={opt.cvLang==='id'?'Penerbit':'Issuer'} value={cert.issuer} onChange={v=>setCV(p=>({...p,certifications:p.certifications.map(c=>c.id===cert.id?{...c,issuer:v}:c)}))} placeholder="Amazon Web Services" required />
              <Field label={opt.cvLang==='id'?'Tanggal':'Date'} value={cert.date} onChange={v=>setCV(p=>({...p,certifications:p.certifications.map(c=>c.id===cert.id?{...c,date:v}:c)}))} placeholder="Nov 2024" />
              <Field label="Credential ID" value={cert.credentialId} onChange={v=>setCV(p=>({...p,certifications:p.certifications.map(c=>c.id===cert.id?{...c,credentialId:v}:c)}))} placeholder="ABC123XYZ" />
            </div>
          </div>
        ))}
        <AddBtn label={t.addCert} onClick={()=>setCV(p=>({...p,certifications:[...p.certifications,{id:uid(),name:'',issuer:'',date:'',credentialId:'',url:''}]}))} />
      </div>
    )

    // ── LANGUAGES ──
    if (section === 'languages') return (
      <div>
        <SH title={t.sectionLabels.languages.toUpperCase()} desc={opt.cvLang==='id'?'Kemampuan bahasa asing (terutama Inggris) sangat dinilai.':'Foreign language skills (especially English) are highly valued.'} />
        {cv.languages.map(l => (
          <div key={l.id} style={{ background:'var(--surface-soft)',border:'1px solid var(--hairline)',padding:14,marginBottom:12 }}>
            <div className="grid grid-cols-2 gap-4">
              <Field label={opt.cvLang==='id'?'Bahasa':'Language'} value={l.language} onChange={v=>setCV(p=>({...p,languages:p.languages.map(x=>x.id===l.id?{...x,language:v}:x)}))} placeholder={opt.cvLang==='id'?'Bahasa Inggris':'English'} required />
              <div style={{ marginBottom:14 }}>
                <label style={{ display:'block',fontSize:10,fontWeight:700,letterSpacing:'1.5px',textTransform:'uppercase',color:'var(--muted)',marginBottom:5 }}>{opt.cvLang==='id'?'TINGKAT':'LEVEL'}</label>
                <select value={l.level} onChange={e=>setCV(p=>({...p,languages:p.languages.map(x=>x.id===l.id?{...x,level:e.target.value}:x)}))} className="input-base" style={{ height:40,fontSize:13 }}>
                  <option value="">{t.selectLevel}</option>
                  <option value="Native / Bahasa Ibu">Native / Bahasa Ibu</option>
                  <option value="Full Professional Proficiency">Full Professional Proficiency (C2)</option>
                  <option value="Professional Working Proficiency">Professional Working Proficiency (C1)</option>
                  <option value="Limited Working Proficiency">Limited Working Proficiency (B2)</option>
                  <option value="Elementary">Elementary / Dasar (A2)</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end" style={{ marginTop:-8 }}><button onClick={()=>setCV(p=>({...p,languages:p.languages.filter(x=>x.id!==l.id)}))} style={{ background:'none',border:'none',cursor:'pointer',color:'var(--m-red)' }}><Trash2 size={13}/></button></div>
          </div>
        ))}
        <AddBtn label={t.addLang} onClick={()=>setCV(p=>({...p,languages:[...p.languages,{id:uid(),language:'',level:''}]}))} />
      </div>
    )

    // ── PREVIEW ──
    if (section === 'preview') return (
      <div>
        <SH title={t.previewTitle} desc={t.previewDesc} />
        <ATSScorePanel cv={cv} template={template} t={t} />
        <div className="flex flex-wrap gap-3 mb-6">
          <button onClick={downloadPDF} disabled={downloading} className="btn-m-accent flex items-center gap-2">
            {downloading?<Loader2 size={14} className="animate-spin"/>:<Download size={14}/>}
            {downloading?(opt.cvLang==='id'?'MEMBUAT PDF...':'CREATING PDF...'):t.downloadPDF}
          </button>
          <button onClick={downloadHTML} className="btn-m flex items-center gap-2"><FileText size={14}/> {t.downloadHTML}</button>
          <button onClick={()=>window.print()} className="btn-m flex items-center gap-2"><Eye size={14}/> {t.print}</button>
        </div>
        <div style={{ border:'1px solid var(--hairline)',overflow:'auto',background:'#e0e0e0',padding:20 }}>
          <div id="cv-render"><CVPreview cv={cv} template={template} opt={opt}/></div>
        </div>
      </div>
    )
  }

  // ── Render ──
  return (
    <div style={{ minHeight:'100vh',paddingTop:80,background:'var(--canvas)' }}>
      <div className="max-w-[1440px] mx-auto px-4 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="m-stripe" style={{ width:24,height:3 }} />
              <span style={{ fontSize:11,fontWeight:700,letterSpacing:'2px',color:'var(--muted)',textTransform:'uppercase' }}>CV GENERATOR</span>
            </div>
            <h1 style={{ fontFamily:'var(--font-display)',fontSize:24,fontWeight:700,color:'var(--ink)',textTransform:'uppercase' }}>
              {opt.cvLang==='id'?'BUAT CV PROFESIONAL':'CREATE PROFESSIONAL CV'}
            </h1>
          </div>
          <span style={{ fontSize:11,fontWeight:700,color:template.accent,textTransform:'uppercase' }}>{template.name}</span>
        </div>

        {aiError && (
          <div className="flex items-center gap-2 mb-4 p-3" style={{ background:'rgba(226,39,24,0.06)',border:'1px solid rgba(226,39,24,0.3)' }}>
            <span style={{ fontSize:12,color:'var(--m-red)',flex:1 }}>{aiError}</span>
            <button onClick={()=>setAiError('')} style={{ color:'var(--muted)',background:'none',border:'none',cursor:'pointer',fontSize:14 }}>✕</button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-[190px_1fr_310px] gap-4">
          {/* Sidebar */}
          <nav style={{ background:'var(--surface-card)',border:'1px solid var(--hairline)',height:'fit-content',position:'sticky',top:80 }}>
            {SECTIONS.map(s => {
              const Icon = s.icon
              const isActive = section === s.id
              return (
                <button key={s.id} onClick={()=>setSection(s.id)} className="w-full flex items-center gap-3 transition-all"
                  style={{ padding:'11px 14px',background:isActive?'var(--surface-elevated)':'transparent',borderLeft:isActive?'3px solid var(--m-blue-dark)':'3px solid transparent',borderBottom:'1px solid var(--hairline)',cursor:'pointer',textAlign:'left' }}>
                  <Icon size={13} style={{ color:isActive?'var(--m-blue-light)':'var(--muted)',flexShrink:0 }} />
                  <span style={{ fontSize:11,fontWeight:700,letterSpacing:'0.5px',textTransform:'uppercase',color:isActive?'var(--ink)':'var(--muted)' }}>{t.sectionLabels[s.id]}</span>
                </button>
              )
            })}
          </nav>

          {/* Form */}
          <div>
            <div style={{ background:'var(--surface-card)',border:'1px solid var(--hairline)',padding:22,marginBottom:8 }}>
              {renderSection()}
            </div>
            <div className="flex justify-between">
              <button onClick={()=>setSection(SECTIONS[sIdx-1]?.id)} disabled={sIdx===0}
                className="flex items-center gap-2" style={{ height:40,padding:'0 18px',background:'var(--surface-card)',border:'1px solid var(--hairline)',color:sIdx>0?'var(--body)':'var(--muted)',fontSize:11,fontWeight:700,letterSpacing:'1px',textTransform:'uppercase',cursor:sIdx>0?'pointer':'default' }}>
                <ArrowLeft size={13}/> {t.prev}
              </button>
              <button onClick={()=>setSection(SECTIONS[sIdx+1]?.id)} disabled={sIdx===SECTIONS.length-1}
                className="flex items-center gap-2" style={{ height:40,padding:'0 18px',background:sIdx<SECTIONS.length-1?'var(--m-blue-dark)':'var(--surface-card)',border:'1px solid var(--hairline)',color:sIdx<SECTIONS.length-1?'#fff':'var(--muted)',fontSize:11,fontWeight:700,letterSpacing:'1px',textTransform:'uppercase',cursor:sIdx<SECTIONS.length-1?'pointer':'default' }}>
                {t.next} <ArrowRight size={13}/>
              </button>
            </div>
          </div>

          {/* Live Preview */}
          <div style={{ position:'sticky',top:80,height:'fit-content',maxHeight:'calc(100vh - 100px)',overflow:'hidden' }}>
            <div style={{ background:'var(--surface-elevated)',border:'1px solid var(--hairline)',padding:'8px 12px',marginBottom:4,display:'flex',alignItems:'center',justifyContent:'space-between' }}>
              <span style={{ fontSize:10,fontWeight:700,letterSpacing:'1.5px',color:'var(--muted)',textTransform:'uppercase' }}>{t.livePreview}</span>
              <button onClick={downloadPDF} disabled={downloading} style={{ fontSize:10,fontWeight:700,color:'var(--m-blue-light)',textTransform:'uppercase',background:'none',border:'none',cursor:'pointer',display:'flex',alignItems:'center',gap:5 }}>
                {downloading?<Loader2 size={11} className="animate-spin"/>:<Download size={11}/>} PDF
              </button>
            </div>
            <div style={{ background:'#e0e0e0',padding:8,overflow:'hidden' }}>
              <div style={{ transform:'scale(0.38)',transformOrigin:'top left',width:'263%',pointerEvents:'none' }}>
                <CVPreview cv={cv} template={template} opt={opt}/>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
