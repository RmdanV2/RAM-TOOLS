'use client'
import { useState, useRef, useCallback } from 'react'
import {
  User, Briefcase, GraduationCap, Award, Code2, Globe, Phone, Mail,
  MapPin, Plus, Trash2, ChevronDown, ChevronUp, Download, Eye,
  ArrowLeft, ArrowRight, Check, Sparkles, Star, Loader2,
  FileText, Palette, MoveUp, MoveDown, type LucideIcon,
} from 'lucide-react'
import type { Lang } from '@/lib/i18n'

// ─── Types ────────────────────────────────────────────────────────────────────
interface CVData {
  personal: {
    name: string
    title: string
    email: string
    phone: string
    location: string
    website: string
    linkedin: string
    github: string
    summary: string
    photo: string
  }
  experience: WorkExp[]
  education: Education[]
  skills: SkillGroup[]
  projects: Project[]
  certifications: Certification[]
  languages: LangItem[]
  achievements: Achievement[]
}

interface WorkExp {
  id: string
  company: string
  role: string
  startDate: string
  endDate: string
  current: boolean
  location: string
  description: string
  achievements: string[]
}

interface Education {
  id: string
  institution: string
  degree: string
  field: string
  startDate: string
  endDate: string
  current: boolean
  gpa: string
  honors: string
}

interface SkillGroup {
  id: string
  category: string
  items: string[]
  level?: 'beginner' | 'intermediate' | 'advanced' | 'expert'
}

interface Project {
  id: string
  name: string
  description: string
  tech: string
  url: string
  startDate: string
  endDate: string
}

interface Certification {
  id: string
  name: string
  issuer: string
  date: string
  credentialId: string
  url: string
}

interface LangItem {
  id: string
  language: string
  level: string
}

interface Achievement {
  id: string
  title: string
  description: string
  date: string
}

// ─── Templates ────────────────────────────────────────────────────────────────
type TemplateId = 'classic' | 'modern' | 'executive' | 'minimal' | 'creative' | 'ats'

interface Template {
  id: TemplateId
  name: string
  desc: string
  badge: string
  badgeColor: string
  preview: { bg: string; accent: string; text: string; secondary: string }
  atsScore: number
}

const TEMPLATES: Template[] = [
  {
    id: 'ats',
    name: 'ATS OPTIMIZER',
    desc: 'Dirancang khusus melewati Applicant Tracking System. Format plain, terstruktur.',
    badge: '90%+ ATS',
    badgeColor: '#0fa336',
    preview: { bg: '#ffffff', accent: '#1c69d4', text: '#0a0a0a', secondary: '#555555' },
    atsScore: 98,
  },
  {
    id: 'classic',
    name: 'CLASSIC PROFESSIONAL',
    desc: 'Hitam putih elegan. Cocok untuk perbankan, hukum, konsultan, finance.',
    badge: 'PALING POPULER',
    badgeColor: '#1c69d4',
    preview: { bg: '#ffffff', accent: '#1a1a1a', text: '#1a1a1a', secondary: '#666666' },
    atsScore: 95,
  },
  {
    id: 'modern',
    name: 'MODERN TECH',
    desc: 'Aksen biru profesional. Ideal untuk software engineer, product manager, data science.',
    badge: 'TECH',
    badgeColor: '#0066b1',
    preview: { bg: '#ffffff', accent: '#0066b1', text: '#1a1a1a', secondary: '#444444' },
    atsScore: 92,
  },
  {
    id: 'executive',
    name: 'EXECUTIVE',
    desc: 'Header bold dengan sidebar. Untuk posisi C-level, VP, Director, dan manajer senior.',
    badge: 'SENIOR',
    badgeColor: '#c9a227',
    preview: { bg: '#ffffff', accent: '#1a1a1a', text: '#1a1a1a', secondary: '#888888' },
    atsScore: 88,
  },
  {
    id: 'minimal',
    name: 'MINIMAL CLEAN',
    desc: 'Tipografi bersih, banyak whitespace. Untuk desainer, penulis, konsultan kreatif.',
    badge: 'MINIMAL',
    badgeColor: '#555555',
    preview: { bg: '#fafafa', accent: '#333333', text: '#222222', secondary: '#777777' },
    atsScore: 85,
  },
  {
    id: 'creative',
    name: 'CREATIVE PRO',
    desc: 'Sidebar warna gelap dengan highlight. Untuk UX/UI designer, marketing, creative director.',
    badge: 'KREATIF',
    badgeColor: '#e22718',
    preview: { bg: '#ffffff', accent: '#e22718', text: '#1a1a1a', secondary: '#555555' },
    atsScore: 80,
  },
]

// ─── Blank CV ─────────────────────────────────────────────────────────────────
const blankCV = (): CVData => ({
  personal: { name: '', title: '', email: '', phone: '', location: '', website: '', linkedin: '', github: '', summary: '', photo: '' },
  experience: [],
  education: [],
  skills: [],
  projects: [],
  certifications: [],
  languages: [],
  achievements: [],
})

const uid = () => Math.random().toString(36).slice(2, 9)

// ─── AI Helper ────────────────────────────────────────────────────────────────
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

// ─── Section Steps ────────────────────────────────────────────────────────────
type Section = 'template' | 'personal' | 'experience' | 'education' | 'skills' | 'projects' | 'certifications' | 'languages' | 'preview'

interface SectionDef {
  id: Section
  label: string
  icon: LucideIcon
}

const SECTIONS: SectionDef[] = [
  { id: 'template',      label: 'Template',      icon: Palette },
  { id: 'personal',      label: 'Data Diri',     icon: User },
  { id: 'experience',    label: 'Pengalaman',    icon: Briefcase },
  { id: 'education',     label: 'Pendidikan',    icon: GraduationCap },
  { id: 'skills',        label: 'Keahlian',      icon: Code2 },
  { id: 'projects',      label: 'Proyek',        icon: Star },
  { id: 'certifications',label: 'Sertifikasi',   icon: Award },
  { id: 'languages',     label: 'Bahasa',        icon: Globe },
  { id: 'preview',       label: 'Preview & Unduh', icon: Eye },
]

// ─── Input Component ──────────────────────────────────────────────────────────
function Field({ label, value, onChange, placeholder, type = 'text', required }: {
  label: string; value: string; onChange: (v: string) => void
  placeholder?: string; type?: string; required?: boolean
}) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: 'block', fontSize: 10, fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 6 }}>
        {label}{required && <span style={{ color: 'var(--m-red)', marginLeft: 4 }}>*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="input-base"
        style={{ height: 42, fontSize: 13 }}
      />
    </div>
  )
}

function TextArea({ label, value, onChange, placeholder, rows = 4 }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; rows?: number
}) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: 'block', fontSize: 10, fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 6 }}>
        {label}
      </label>
      <textarea
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className="input-base"
        style={{ height: 'auto', resize: 'vertical', fontSize: 13, lineHeight: 1.6 }}
      />
    </div>
  )
}

// ─── CV Preview Renderers ─────────────────────────────────────────────────────
function CVPreview({ cv, template }: { cv: CVData; template: Template }) {
  const t = template.preview
  const hasExp = cv.experience.length > 0
  const hasEdu = cv.education.length > 0
  const hasSkills = cv.skills.length > 0
  const hasCerts = cv.certifications.length > 0
  const hasProjects = cv.projects.length > 0
  const hasLangs = cv.languages.length > 0
  const hasAchievements = cv.achievements.length > 0

  if (template.id === 'creative') return <CreativeTemplate cv={cv} t={t} />
  if (template.id === 'executive') return <ExecutiveTemplate cv={cv} t={t} />
  if (template.id === 'minimal') return <MinimalTemplate cv={cv} t={t} />

  // Default: ATS / Classic / Modern share same layout
  const isAts = template.id === 'ats'
  const isModern = template.id === 'modern'

  return (
    <div id="cv-preview" style={{ background: t.bg, color: t.text, fontFamily: 'Arial, sans-serif', fontSize: 10.5, lineHeight: 1.5, maxWidth: 794, margin: '0 auto', padding: isAts ? '32px 40px' : '36px 44px' }}>
      {/* Header */}
      <div style={{ borderBottom: `${isAts ? 1 : 2}px solid ${t.accent}`, paddingBottom: 16, marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ flex: 1 }}>
            <h1 style={{ fontSize: isAts ? 22 : 26, fontWeight: 700, color: t.accent, margin: 0, letterSpacing: isAts ? 0 : 0.5, textTransform: isAts ? 'none' : 'uppercase' }}>
              {cv.personal.name || 'NAMA LENGKAP'}
            </h1>
            <p style={{ fontSize: 12, color: isModern ? t.accent : t.secondary, fontWeight: 600, margin: '4px 0 10px', letterSpacing: 0.3 }}>
              {cv.personal.title || 'Posisi / Jabatan'}
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 20px', fontSize: 9.5 }}>
              {cv.personal.email && <span>{cv.personal.email}</span>}
              {cv.personal.phone && <span>{cv.personal.phone}</span>}
              {cv.personal.location && <span>{cv.personal.location}</span>}
              {cv.personal.linkedin && <span>{cv.personal.linkedin}</span>}
              {cv.personal.github && <span>{cv.personal.github}</span>}
              {cv.personal.website && <span>{cv.personal.website}</span>}
            </div>
          </div>
        </div>
      </div>

      {/* Summary */}
      {cv.personal.summary && (
        <CVSection title="RINGKASAN PROFESIONAL" accent={t.accent} isAts={isAts}>
          <p style={{ color: t.secondary, fontSize: 10.5, lineHeight: 1.6, margin: 0 }}>{cv.personal.summary}</p>
        </CVSection>
      )}

      {/* Experience */}
      {hasExp && (
        <CVSection title="PENGALAMAN KERJA" accent={t.accent} isAts={isAts}>
          {cv.experience.map((e, i) => (
            <div key={e.id} style={{ marginBottom: i < cv.experience.length - 1 ? 14 : 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <p style={{ fontWeight: 700, fontSize: 11, color: t.text, margin: 0 }}>{e.role}</p>
                  <p style={{ color: t.accent, fontSize: 10.5, fontWeight: 600, margin: '2px 0' }}>{e.company}{e.location && ` · ${e.location}`}</p>
                </div>
                <p style={{ fontSize: 9.5, color: t.secondary, whiteSpace: 'nowrap', marginLeft: 12 }}>
                  {e.startDate} – {e.current ? 'Sekarang' : e.endDate}
                </p>
              </div>
              {e.description && <p style={{ fontSize: 10, color: t.secondary, margin: '4px 0 4px', lineHeight: 1.5 }}>{e.description}</p>}
              {e.achievements.filter(Boolean).length > 0 && (
                <ul style={{ margin: '4px 0 0', paddingLeft: 16 }}>
                  {e.achievements.filter(Boolean).map((a, ai) => (
                    <li key={ai} style={{ fontSize: 10, color: t.secondary, lineHeight: 1.5, marginBottom: 2 }}>{a}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </CVSection>
      )}

      {/* Education */}
      {hasEdu && (
        <CVSection title="PENDIDIKAN" accent={t.accent} isAts={isAts}>
          {cv.education.map((e, i) => (
            <div key={e.id} style={{ marginBottom: i < cv.education.length - 1 ? 10 : 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div>
                  <p style={{ fontWeight: 700, fontSize: 11, color: t.text, margin: 0 }}>{e.degree}{e.field && ` — ${e.field}`}</p>
                  <p style={{ color: t.accent, fontSize: 10.5, fontWeight: 600, margin: '2px 0' }}>{e.institution}</p>
                  {e.gpa && <p style={{ fontSize: 9.5, color: t.secondary, margin: 0 }}>IPK: {e.gpa}{e.honors && ` · ${e.honors}`}</p>}
                </div>
                <p style={{ fontSize: 9.5, color: t.secondary, whiteSpace: 'nowrap', marginLeft: 12 }}>
                  {e.startDate} – {e.current ? 'Sekarang' : e.endDate}
                </p>
              </div>
            </div>
          ))}
        </CVSection>
      )}

      {/* Skills */}
      {hasSkills && (
        <CVSection title="KEAHLIAN" accent={t.accent} isAts={isAts}>
          {cv.skills.map(sg => (
            <div key={sg.id} style={{ marginBottom: 6, display: 'flex', flexWrap: 'wrap', gap: 4 }}>
              {sg.category && <span style={{ fontSize: 10, fontWeight: 700, color: t.text, marginRight: 4 }}>{sg.category}:</span>}
              <span style={{ fontSize: 10, color: t.secondary }}>{sg.items.join(' · ')}</span>
            </div>
          ))}
        </CVSection>
      )}

      {/* Projects */}
      {hasProjects && (
        <CVSection title="PROYEK" accent={t.accent} isAts={isAts}>
          {cv.projects.map((p, i) => (
            <div key={p.id} style={{ marginBottom: i < cv.projects.length - 1 ? 10 : 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <p style={{ fontWeight: 700, fontSize: 11, color: t.text, margin: 0 }}>{p.name}{p.url && <span style={{ fontWeight: 400, color: t.accent, fontSize: 9.5 }}> · {p.url}</span>}</p>
                {(p.startDate || p.endDate) && <p style={{ fontSize: 9.5, color: t.secondary, marginLeft: 12, whiteSpace: 'nowrap' }}>{p.startDate}{p.endDate && ` – ${p.endDate}`}</p>}
              </div>
              {p.tech && <p style={{ fontSize: 9.5, color: t.accent, fontWeight: 600, margin: '2px 0' }}>{p.tech}</p>}
              {p.description && <p style={{ fontSize: 10, color: t.secondary, lineHeight: 1.5, margin: 0 }}>{p.description}</p>}
            </div>
          ))}
        </CVSection>
      )}

      {/* Two column row: Certs + Languages */}
      {(hasCerts || hasLangs || hasAchievements) && (
        <div style={{ display: 'grid', gridTemplateColumns: hasCerts && hasLangs ? '1fr 1fr' : '1fr', gap: 20, marginTop: 14 }}>
          {hasCerts && (
            <CVSection title="SERTIFIKASI" accent={t.accent} isAts={isAts} noMargin>
              {cv.certifications.map(c => (
                <div key={c.id} style={{ marginBottom: 6 }}>
                  <p style={{ fontWeight: 700, fontSize: 10.5, color: t.text, margin: 0 }}>{c.name}</p>
                  <p style={{ fontSize: 9.5, color: t.secondary, margin: '1px 0 0' }}>{c.issuer}{c.date && ` · ${c.date}`}</p>
                </div>
              ))}
            </CVSection>
          )}
          {hasLangs && (
            <CVSection title="BAHASA" accent={t.accent} isAts={isAts} noMargin>
              {cv.languages.map(l => (
                <p key={l.id} style={{ fontSize: 10.5, color: t.secondary, margin: '0 0 4px' }}>
                  <strong style={{ color: t.text }}>{l.language}</strong> — {l.level}
                </p>
              ))}
            </CVSection>
          )}
        </div>
      )}
    </div>
  )
}

function CVSection({ title, accent, children, isAts, noMargin }: { title: string; accent: string; children: React.ReactNode; isAts?: boolean; noMargin?: boolean }) {
  return (
    <div style={{ marginBottom: noMargin ? 0 : 14 }}>
      <h2 style={{ fontSize: 10, fontWeight: 700, letterSpacing: '1.5px', color: isAts ? accent : accent, textTransform: 'uppercase', borderBottom: `1px solid ${accent}`, paddingBottom: 3, marginBottom: 8, marginTop: 0 }}>
        {title}
      </h2>
      {children}
    </div>
  )
}

function ExecutiveTemplate({ cv, t }: { cv: CVData; t: Template['preview'] }) {
  return (
    <div id="cv-preview" style={{ background: t.bg, color: t.text, fontFamily: 'Georgia, serif', fontSize: 10.5, maxWidth: 794, margin: '0 auto' }}>
      {/* Gold header bar */}
      <div style={{ background: '#1a1a1a', color: '#fff', padding: '32px 44px 24px' }}>
        <h1 style={{ fontSize: 30, fontWeight: 700, margin: 0, letterSpacing: 1 }}>{cv.personal.name || 'NAMA LENGKAP'}</h1>
        <p style={{ fontSize: 13, color: '#c9a227', fontWeight: 600, margin: '6px 0 14px', letterSpacing: 0.5 }}>{cv.personal.title || 'Posisi Profesional'}</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 24px', fontSize: 9.5, color: '#ccc' }}>
          {cv.personal.email && <span>{cv.personal.email}</span>}
          {cv.personal.phone && <span>{cv.personal.phone}</span>}
          {cv.personal.location && <span>{cv.personal.location}</span>}
          {cv.personal.linkedin && <span>{cv.personal.linkedin}</span>}
        </div>
      </div>
      <div style={{ padding: '28px 44px' }}>
        {cv.personal.summary && (
          <div style={{ marginBottom: 20, borderLeft: '4px solid #c9a227', paddingLeft: 16 }}>
            <p style={{ fontSize: 11, lineHeight: 1.7, color: t.secondary, margin: 0, fontStyle: 'italic' }}>{cv.personal.summary}</p>
          </div>
        )}
        {cv.experience.length > 0 && (
          <CVSection title="PENGALAMAN PROFESIONAL" accent="#c9a227">
            {cv.experience.map((e, i) => (
              <div key={e.id} style={{ marginBottom: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <p style={{ fontWeight: 700, fontSize: 11.5, margin: 0 }}>{e.role}</p>
                  <p style={{ fontSize: 9.5, color: t.secondary }}>{e.startDate} – {e.current ? 'Sekarang' : e.endDate}</p>
                </div>
                <p style={{ color: '#c9a227', fontWeight: 700, fontSize: 10.5, margin: '2px 0 4px' }}>{e.company}</p>
                {e.description && <p style={{ fontSize: 10, color: t.secondary, lineHeight: 1.5 }}>{e.description}</p>}
                {e.achievements.filter(Boolean).map((a, ai) => <li key={ai} style={{ fontSize: 10, color: t.secondary, lineHeight: 1.5 }}>{a}</li>)}
              </div>
            ))}
          </CVSection>
        )}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
          <div>
            {cv.education.length > 0 && (
              <CVSection title="PENDIDIKAN" accent="#c9a227">
                {cv.education.map(e => (
                  <div key={e.id} style={{ marginBottom: 8 }}>
                    <p style={{ fontWeight: 700, fontSize: 10.5, margin: 0 }}>{e.degree}</p>
                    <p style={{ color: '#c9a227', fontSize: 10, margin: '1px 0' }}>{e.institution}</p>
                    <p style={{ fontSize: 9.5, color: t.secondary }}>{e.startDate} – {e.current ? 'Sekarang' : e.endDate}{e.gpa && ` · IPK ${e.gpa}`}</p>
                  </div>
                ))}
              </CVSection>
            )}
          </div>
          <div>
            {cv.skills.length > 0 && (
              <CVSection title="KEAHLIAN UTAMA" accent="#c9a227">
                {cv.skills.map(sg => (
                  <p key={sg.id} style={{ fontSize: 10, color: t.secondary, marginBottom: 4 }}>
                    {sg.category && <strong style={{ color: t.text }}>{sg.category}: </strong>}{sg.items.join(', ')}
                  </p>
                ))}
              </CVSection>
            )}
            {cv.certifications.length > 0 && (
              <CVSection title="SERTIFIKASI" accent="#c9a227">
                {cv.certifications.map(c => (
                  <p key={c.id} style={{ fontSize: 10, color: t.secondary, marginBottom: 4 }}>{c.name} · {c.issuer}</p>
                ))}
              </CVSection>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function MinimalTemplate({ cv, t }: { cv: CVData; t: Template['preview'] }) {
  return (
    <div id="cv-preview" style={{ background: t.bg, color: t.text, fontFamily: 'Helvetica, Arial, sans-serif', fontSize: 10.5, maxWidth: 794, margin: '0 auto', padding: '48px 56px' }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 28, fontWeight: 300, letterSpacing: 2, textTransform: 'uppercase', margin: 0, color: t.text }}>{cv.personal.name || 'NAMA LENGKAP'}</h1>
        <p style={{ fontSize: 11, color: t.secondary, fontWeight: 400, margin: '6px 0 12px', letterSpacing: 1 }}>{cv.personal.title}</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 20px', fontSize: 9.5, color: '#888' }}>
          {cv.personal.email && <span>{cv.personal.email}</span>}
          {cv.personal.phone && <span>{cv.personal.phone}</span>}
          {cv.personal.location && <span>{cv.personal.location}</span>}
          {cv.personal.linkedin && <span>{cv.personal.linkedin}</span>}
        </div>
      </div>
      {cv.personal.summary && <p style={{ fontSize: 10.5, lineHeight: 1.7, color: t.secondary, marginBottom: 24, borderTop: '1px solid #ddd', paddingTop: 20 }}>{cv.personal.summary}</p>}
      {cv.experience.length > 0 && (
        <MinSection title="Pengalaman">
          {cv.experience.map(e => (
            <div key={e.id} style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '0 20px', marginBottom: 14 }}>
              <p style={{ fontSize: 9.5, color: '#999', paddingTop: 2 }}>{e.startDate}<br />{e.current ? 'Sekarang' : e.endDate}</p>
              <div>
                <p style={{ fontWeight: 600, fontSize: 11, margin: 0 }}>{e.role}</p>
                <p style={{ fontSize: 10.5, color: t.secondary, margin: '2px 0 4px' }}>{e.company}</p>
                {e.description && <p style={{ fontSize: 10, color: '#888', lineHeight: 1.5 }}>{e.description}</p>}
              </div>
            </div>
          ))}
        </MinSection>
      )}
      {cv.education.length > 0 && (
        <MinSection title="Pendidikan">
          {cv.education.map(e => (
            <div key={e.id} style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '0 20px', marginBottom: 10 }}>
              <p style={{ fontSize: 9.5, color: '#999', paddingTop: 2 }}>{e.startDate}<br />{e.current ? 'Sekarang' : e.endDate}</p>
              <div>
                <p style={{ fontWeight: 600, fontSize: 11, margin: 0 }}>{e.degree}</p>
                <p style={{ fontSize: 10.5, color: t.secondary, margin: '2px 0' }}>{e.institution}{e.gpa && ` · IPK ${e.gpa}`}</p>
              </div>
            </div>
          ))}
        </MinSection>
      )}
      {cv.skills.length > 0 && (
        <MinSection title="Keahlian">
          {cv.skills.map(sg => (
            <p key={sg.id} style={{ fontSize: 10, color: t.secondary, margin: '0 0 4px' }}>
              {sg.category && <><strong>{sg.category}</strong> · </>}{sg.items.join(' · ')}
            </p>
          ))}
        </MinSection>
      )}
    </div>
  )
}

function MinSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: '#aaa', borderBottom: '1px solid #e5e5e5', paddingBottom: 6, marginBottom: 14 }}>{title}</p>
      {children}
    </div>
  )
}

function CreativeTemplate({ cv, t }: { cv: CVData; t: Template['preview'] }) {
  return (
    <div id="cv-preview" style={{ background: t.bg, fontFamily: 'Arial, sans-serif', fontSize: 10.5, maxWidth: 794, margin: '0 auto', display: 'grid', gridTemplateColumns: '220px 1fr' }}>
      {/* Sidebar */}
      <div style={{ background: '#1a1a1a', color: '#fff', padding: '36px 24px', minHeight: '100%' }}>
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: 18, fontWeight: 700, color: '#fff', margin: 0, lineHeight: 1.2 }}>{cv.personal.name || 'NAMA'}</h1>
          <p style={{ fontSize: 10, color: t.accent, fontWeight: 700, margin: '6px 0', textTransform: 'uppercase', letterSpacing: 1 }}>{cv.personal.title}</p>
        </div>
        <div style={{ borderTop: '1px solid #333', paddingTop: 16, marginBottom: 20 }}>
          <SideSection title="KONTAK" accent={t.accent}>
            {cv.personal.email && <p style={{ fontSize: 9.5, color: '#bbb', margin: '0 0 4px', wordBreak: 'break-all' }}>{cv.personal.email}</p>}
            {cv.personal.phone && <p style={{ fontSize: 9.5, color: '#bbb', margin: '0 0 4px' }}>{cv.personal.phone}</p>}
            {cv.personal.location && <p style={{ fontSize: 9.5, color: '#bbb', margin: '0 0 4px' }}>{cv.personal.location}</p>}
            {cv.personal.linkedin && <p style={{ fontSize: 9.5, color: '#bbb', margin: '0 0 4px', wordBreak: 'break-all' }}>{cv.personal.linkedin}</p>}
          </SideSection>
        </div>
        {cv.skills.length > 0 && (
          <SideSection title="KEAHLIAN" accent={t.accent}>
            {cv.skills.map(sg => (
              <div key={sg.id} style={{ marginBottom: 8 }}>
                {sg.category && <p style={{ fontSize: 9.5, fontWeight: 700, color: '#ddd', margin: '0 0 3px' }}>{sg.category}</p>}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                  {sg.items.map((item, i) => (
                    <span key={i} style={{ fontSize: 8.5, background: '#333', color: '#ccc', padding: '2px 6px', borderRadius: 2 }}>{item}</span>
                  ))}
                </div>
              </div>
            ))}
          </SideSection>
        )}
        {cv.languages.length > 0 && (
          <SideSection title="BAHASA" accent={t.accent}>
            {cv.languages.map(l => (
              <p key={l.id} style={{ fontSize: 9.5, color: '#bbb', margin: '0 0 4px' }}><strong style={{ color: '#fff' }}>{l.language}</strong> · {l.level}</p>
            ))}
          </SideSection>
        )}
        {cv.certifications.length > 0 && (
          <SideSection title="SERTIFIKASI" accent={t.accent}>
            {cv.certifications.map(c => (
              <p key={c.id} style={{ fontSize: 9.5, color: '#bbb', margin: '0 0 6px' }}><strong style={{ color: '#fff' }}>{c.name}</strong><br />{c.issuer}</p>
            ))}
          </SideSection>
        )}
      </div>

      {/* Main */}
      <div style={{ padding: '36px 32px', color: '#1a1a1a' }}>
        {cv.personal.summary && (
          <div style={{ marginBottom: 20, paddingBottom: 16, borderBottom: '2px solid ' + t.accent }}>
            <p style={{ fontSize: 10.5, lineHeight: 1.7, color: '#555', margin: 0 }}>{cv.personal.summary}</p>
          </div>
        )}
        {cv.experience.length > 0 && (
          <CVSection title="PENGALAMAN KERJA" accent={t.accent}>
            {cv.experience.map(e => (
              <div key={e.id} style={{ marginBottom: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <p style={{ fontWeight: 700, fontSize: 11, margin: 0 }}>{e.role}</p>
                  <p style={{ fontSize: 9.5, color: '#888' }}>{e.startDate} – {e.current ? 'Sekarang' : e.endDate}</p>
                </div>
                <p style={{ color: t.accent, fontWeight: 700, fontSize: 10.5, margin: '2px 0 4px' }}>{e.company}</p>
                {e.description && <p style={{ fontSize: 10, color: '#555', lineHeight: 1.5 }}>{e.description}</p>}
                {e.achievements.filter(Boolean).map((a, ai) => (
                  <p key={ai} style={{ fontSize: 10, color: '#555', margin: '2px 0', paddingLeft: 12, borderLeft: '2px solid ' + t.accent }}>• {a}</p>
                ))}
              </div>
            ))}
          </CVSection>
        )}
        {cv.education.length > 0 && (
          <CVSection title="PENDIDIKAN" accent={t.accent}>
            {cv.education.map(e => (
              <div key={e.id} style={{ marginBottom: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <p style={{ fontWeight: 700, fontSize: 11, margin: 0 }}>{e.degree}{e.field && ` · ${e.field}`}</p>
                  <p style={{ fontSize: 9.5, color: '#888' }}>{e.startDate} – {e.current ? 'Sekarang' : e.endDate}</p>
                </div>
                <p style={{ color: t.accent, fontWeight: 600, fontSize: 10.5, margin: '2px 0' }}>{e.institution}</p>
              </div>
            ))}
          </CVSection>
        )}
        {cv.projects.length > 0 && (
          <CVSection title="PROYEK" accent={t.accent}>
            {cv.projects.map(p => (
              <div key={p.id} style={{ marginBottom: 10 }}>
                <p style={{ fontWeight: 700, fontSize: 11, margin: 0 }}>{p.name}</p>
                {p.tech && <p style={{ fontSize: 9.5, color: t.accent, fontWeight: 600, margin: '2px 0' }}>{p.tech}</p>}
                {p.description && <p style={{ fontSize: 10, color: '#555', lineHeight: 1.5 }}>{p.description}</p>}
              </div>
            ))}
          </CVSection>
        )}
      </div>
    </div>
  )
}

function SideSection({ title, accent, children }: { title: string; accent: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: '1.5px', color: accent, textTransform: 'uppercase', marginBottom: 8, borderBottom: '1px solid #333', paddingBottom: 4 }}>{title}</p>
      {children}
    </div>
  )
}

// ─── ATS Score Widget ─────────────────────────────────────────────────────────
function ATSScore({ cv, template }: { cv: CVData; template: Template }) {
  const checks = [
    { label: 'Nama lengkap diisi',          pass: !!cv.personal.name },
    { label: 'Email diisi',                  pass: !!cv.personal.email },
    { label: 'Nomor telepon diisi',          pass: !!cv.personal.phone },
    { label: 'Ringkasan profesional diisi',  pass: cv.personal.summary.length > 50 },
    { label: 'Minimal 1 pengalaman kerja',   pass: cv.experience.length >= 1 },
    { label: 'Deskripsi pengalaman lengkap', pass: cv.experience.every(e => e.description.length > 30) },
    { label: 'Minimal 1 pendidikan',         pass: cv.education.length >= 1 },
    { label: 'Minimal 3 skill/keahlian',     pass: cv.skills.flatMap(s => s.items).length >= 3 },
    { label: 'LinkedIn / Website diisi',     pass: !!(cv.personal.linkedin || cv.personal.website) },
    { label: 'Template ATS-friendly',        pass: template.atsScore >= 90 },
  ]
  const passed = checks.filter(c => c.pass).length
  const score = Math.round((passed / checks.length) * 100)
  const color = score >= 80 ? 'var(--success)' : score >= 60 ? 'var(--warning)' : 'var(--m-red)'

  return (
    <div style={{ background: 'var(--surface-card)', border: '1px solid var(--hairline)', padding: 20, marginBottom: 16 }}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '1.5px', color: 'var(--muted)', textTransform: 'uppercase', marginBottom: 2 }}>SKOR ATS</p>
          <p style={{ fontSize: 28, fontWeight: 700, color, lineHeight: 1 }}>{score}<span style={{ fontSize: 14 }}>%</span></p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <p style={{ fontSize: 11, color: 'var(--body)', fontWeight: 300 }}>
            {score >= 80 ? '✓ Siap dikirim ke perusahaan' : score >= 60 ? '⚠ Masih perlu perbaikan' : '✗ Lengkapi CV terlebih dahulu'}
          </p>
          <p style={{ fontSize: 10, color: 'var(--muted)' }}>{passed}/{checks.length} kriteria terpenuhi</p>
        </div>
      </div>
      <div style={{ height: 4, background: 'var(--surface-elevated)', marginBottom: 16 }}>
        <div style={{ height: 4, background: color, width: `${score}%`, transition: 'width 0.5s' }} />
      </div>
      <div className="grid grid-cols-1 gap-1">
        {checks.map((c, i) => (
          <div key={i} className="flex items-center gap-2">
            <div style={{ width: 14, height: 14, background: c.pass ? 'var(--success)' : 'var(--surface-elevated)', border: `1px solid ${c.pass ? 'var(--success)' : 'var(--hairline)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              {c.pass && <Check size={9} style={{ color: '#fff' }} />}
            </div>
            <p style={{ fontSize: 10.5, color: c.pass ? 'var(--body)' : 'var(--muted)', margin: 0 }}>{c.label}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function CVGenerator({ lang }: { lang: Lang }) {
  const [cv, setCV] = useState<CVData>(blankCV())
  const [template, setTemplate] = useState<Template>(TEMPLATES[0])
  const [section, setSection] = useState<Section>('template')
  const [aiLoading, setAiLoading] = useState<string>('')
  const [aiError, setAiError] = useState('')
  const [downloading, setDownloading] = useState(false)
  const [showPreviewMobile, setShowPreviewMobile] = useState(false)
  const previewRef = useRef<HTMLDivElement>(null)

  const updatePersonal = (key: keyof CVData['personal'], val: string) =>
    setCV(p => ({ ...p, personal: { ...p.personal, [key]: val } }))

  const sectionIdx = SECTIONS.findIndex(s => s.id === section)
  const canGoBack = sectionIdx > 0
  const canGoNext = sectionIdx < SECTIONS.length - 1

  // ── AI Enhance ──
  const aiEnhanceSummary = async () => {
    if (!cv.personal.name && !cv.personal.title) { setAiError('Isi nama dan jabatan terlebih dahulu'); return }
    setAiLoading('summary'); setAiError('')
    try {
      const ctx = `Nama: ${cv.personal.name}\nJabatan: ${cv.personal.title}\nPengalaman: ${cv.experience.map(e => `${e.role} di ${e.company}`).join(', ')}\nKeahlian: ${cv.skills.flatMap(s => s.items).join(', ')}`
      const r = await apiCall({
        message: ctx,
        system: 'Kamu adalah expert CV writer. Buat ringkasan profesional (professional summary) dalam BAHASA INDONESIA yang kuat, impactful, dan ATS-friendly. Maksimal 4 kalimat. Gunakan action verbs. Sertakan metrik jika memungkinkan. Langsung tulis teks ringkasannya saja, tanpa label atau preamble.',
        engine: 'gpt',
      })
      updatePersonal('summary', r.content.trim())
    } catch (e: unknown) { setAiError(e instanceof Error ? e.message : 'Error') }
    setAiLoading('')
  }

  const aiEnhanceExp = async (id: string) => {
    const exp = cv.experience.find(e => e.id === id)
    if (!exp) return
    setAiLoading('exp-' + id); setAiError('')
    try {
      const r = await apiCall({
        message: `Role: ${exp.role}\nPerusahaan: ${exp.company}\nDeskripsi: ${exp.description || 'kosong'}`,
        system: 'Kamu adalah expert CV writer. Tulis ulang deskripsi pengalaman kerja ini dalam BAHASA INDONESIA yang lebih kuat dan ATS-friendly. Gunakan action verbs (memimpin, mengembangkan, meningkatkan, dll). Sertakan dampak dan metrik kuantitatif jika bisa. Maksimal 2 kalimat. Langsung tulis teksnya saja.',
        engine: 'gpt',
      })
      setCV(p => ({ ...p, experience: p.experience.map(e => e.id === id ? { ...e, description: r.content.trim() } : e) }))
    } catch (e: unknown) { setAiError(e instanceof Error ? e.message : 'Error') }
    setAiLoading('')
  }

  const aiSuggestSkills = async () => {
    if (!cv.personal.title && cv.experience.length === 0) { setAiError('Isi jabatan atau pengalaman kerja terlebih dahulu'); return }
    setAiLoading('skills'); setAiError('')
    try {
      const r = await apiCall({
        message: `Jabatan: ${cv.personal.title}\nPengalaman: ${cv.experience.map(e => e.role + ' di ' + e.company).join(', ')}`,
        system: 'Kamu adalah expert CV writer. Berikan rekomendasi 15-20 skill/keahlian yang relevan untuk profil ini dalam BAHASA INDONESIA, dikelompokkan menjadi: Technical Skills, Soft Skills, Tools & Software. Format: Technical Skills: skill1, skill2, skill3\nSoft Skills: skill1, skill2\nTools & Software: tool1, tool2. Langsung output formatnya saja.',
        engine: 'gpt',
      })
      const lines = r.content.trim().split('\n').filter(Boolean)
      const newSkills: SkillGroup[] = []
      lines.forEach(line => {
        const [cat, items] = line.split(':')
        if (cat && items) {
          newSkills.push({ id: uid(), category: cat.trim(), items: items.split(',').map(s => s.trim()).filter(Boolean) })
        }
      })
      if (newSkills.length > 0) setCV(p => ({ ...p, skills: newSkills }))
    } catch (e: unknown) { setAiError(e instanceof Error ? e.message : 'Error') }
    setAiLoading('')
  }

  // ── Download PDF ──
  const downloadPDF = async () => {
    setDownloading(true)
    try {
      const el = document.getElementById('cv-preview')
      if (!el) return
      const html2canvas = (await import('html2canvas')).default
      const { jsPDF } = await import('jspdf')
      const canvas = await html2canvas(el, { scale: 2, useCORS: true, backgroundColor: '#ffffff' })
      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
      const w = pdf.internal.pageSize.getWidth()
      const h = (canvas.height * w) / canvas.width
      pdf.addImage(imgData, 'PNG', 0, 0, w, h)
      pdf.save(`${cv.personal.name || 'CV'}-${template.id}.pdf`)
    } catch (e: unknown) { setAiError('Gagal download PDF: ' + (e instanceof Error ? e.message : String(e))) }
    setDownloading(false)
  }

  const downloadHTML = () => {
    const el = document.getElementById('cv-preview')
    if (!el) return
    const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>CV - ${cv.personal.name}</title><style>*{box-sizing:border-box}body{margin:0;padding:20px;background:#f5f5f5;display:flex;justify-content:center}#cv-preview{width:794px}</style></head><body>${el.outerHTML}</body></html>`
    const blob = new Blob([html], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = `${cv.personal.name || 'CV'}-${template.id}.html`; a.click()
    URL.revokeObjectURL(url)
  }

  // ─── Section Content ───────────────────────────────────────────────────────
  const renderSection = () => {
    if (section === 'template') return (
      <div>
        <SectionHeader title="PILIH TEMPLATE" desc="Template menentukan tampilan dan peluang lolos ATS (Applicant Tracking System)" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-px" style={{ border: '1px solid var(--hairline)' }}>
          {TEMPLATES.map(tmpl => {
            const isActive = template.id === tmpl.id
            const p = tmpl.preview
            return (
              <button key={tmpl.id} onClick={() => setTemplate(tmpl)} className="text-left transition-all"
                style={{ background: isActive ? 'var(--surface-elevated)' : 'var(--surface-card)', borderRight: '1px solid var(--hairline)', borderBottom: '1px solid var(--hairline)', borderLeft: isActive ? `3px solid ${tmpl.badgeColor}` : '3px solid transparent', padding: '16px 20px', cursor: 'pointer' }}
                onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'var(--surface-elevated)' }}
                onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'var(--surface-card)' }}>
                {/* Mini preview */}
                <div style={{ width: '100%', height: 72, background: p.bg, border: '1px solid #e0e0e0', marginBottom: 12, overflow: 'hidden', position: 'relative' }}>
                  <div style={{ position: 'absolute', inset: 0, padding: 8 }}>
                    <div style={{ height: 3, background: p.accent, marginBottom: 4, width: tmpl.id === 'creative' ? '30%' : '100%' }} />
                    <div style={{ display: 'flex', gap: 6 }}>
                      {tmpl.id === 'creative' && <div style={{ width: '28%', background: '#1a1a1a', height: 54 }} />}
                      <div style={{ flex: 1 }}>
                        <div style={{ height: 8, background: p.accent, width: '60%', marginBottom: 4, opacity: 0.8 }} />
                        <div style={{ height: 4, background: p.secondary, width: '40%', marginBottom: 6, opacity: 0.5 }} />
                        <div style={{ height: 2, background: '#e0e0e0', width: '90%', marginBottom: 3 }} />
                        <div style={{ height: 2, background: '#e0e0e0', width: '75%', marginBottom: 3 }} />
                        <div style={{ height: 2, background: '#e0e0e0', width: '80%' }} />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-start justify-between">
                  <div>
                    <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--ink)', margin: '0 0 3px' }}>{tmpl.name}</p>
                    <p style={{ fontSize: 11, fontWeight: 300, color: 'var(--muted)', lineHeight: 1.5, margin: 0 }}>{tmpl.desc}</p>
                  </div>
                  <span style={{ fontSize: 8, fontWeight: 700, padding: '2px 7px', background: tmpl.badgeColor, color: '#fff', letterSpacing: '0.5px', flexShrink: 0, marginLeft: 8 }}>{tmpl.badge}</span>
                </div>
                <div className="flex items-center gap-3 mt-2">
                  <div style={{ height: 2, flex: 1, background: 'var(--surface-elevated)' }}>
                    <div style={{ height: 2, background: tmpl.badgeColor, width: `${tmpl.atsScore}%` }} />
                  </div>
                  <span style={{ fontSize: 9, fontWeight: 700, color: 'var(--muted)' }}>ATS {tmpl.atsScore}%</span>
                </div>
                {isActive && <div className="flex items-center gap-2 mt-2" style={{ fontSize: 10, fontWeight: 700, color: tmpl.badgeColor, letterSpacing: '1px' }}><Check size={11} /> DIPILIH</div>}
              </button>
            )
          })}
        </div>
      </div>
    )

    if (section === 'personal') return (
      <div>
        <SectionHeader title="DATA DIRI" desc="Informasi kontak yang tampil di bagian atas CV" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
          <Field label="Nama Lengkap" value={cv.personal.name} onChange={v => updatePersonal('name', v)} placeholder="Budi Santoso" required />
          <Field label="Jabatan / Posisi" value={cv.personal.title} onChange={v => updatePersonal('title', v)} placeholder="Senior Software Engineer" required />
          <Field label="Email" value={cv.personal.email} onChange={v => updatePersonal('email', v)} placeholder="budi@email.com" type="email" required />
          <Field label="Nomor Telepon" value={cv.personal.phone} onChange={v => updatePersonal('phone', v)} placeholder="+62 812 3456 7890" required />
          <Field label="Lokasi / Kota" value={cv.personal.location} onChange={v => updatePersonal('location', v)} placeholder="Jakarta, Indonesia" />
          <Field label="LinkedIn" value={cv.personal.linkedin} onChange={v => updatePersonal('linkedin', v)} placeholder="linkedin.com/in/budisantoso" />
          <Field label="GitHub" value={cv.personal.github} onChange={v => updatePersonal('github', v)} placeholder="github.com/budisantoso" />
          <Field label="Website / Portfolio" value={cv.personal.website} onChange={v => updatePersonal('website', v)} placeholder="budisantoso.dev" />
        </div>
        <div style={{ marginBottom: 16 }}>
          <div className="flex items-center justify-between mb-2">
            <label style={{ fontSize: 10, fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--muted)' }}>RINGKASAN PROFESIONAL</label>
            <button onClick={aiEnhanceSummary} disabled={!!aiLoading} className="flex items-center gap-1.5"
              style={{ fontSize: 10, fontWeight: 700, letterSpacing: '1px', color: aiLoading === 'summary' ? 'var(--muted)' : 'var(--m-blue-light)', textTransform: 'uppercase', background: 'none', border: '1px solid var(--hairline)', padding: '4px 10px', cursor: 'pointer' }}>
              {aiLoading === 'summary' ? <Loader2 size={11} className="animate-spin" /> : <Sparkles size={11} />}
              AI ENHANCE
            </button>
          </div>
          <textarea value={cv.personal.summary} onChange={e => updatePersonal('summary', e.target.value)}
            placeholder="Profesional berpengalaman dengan 5+ tahun di bidang pengembangan software. Spesialisasi dalam..." rows={4}
            className="input-base" style={{ height: 'auto', resize: 'vertical', fontSize: 13, lineHeight: 1.6 }} />
          <p style={{ fontSize: 10, color: 'var(--muted)', marginTop: 4 }}>{cv.personal.summary.length}/500 karakter · Rekomendasikan 150–300 karakter</p>
        </div>
        <ATSScore cv={cv} template={template} />
      </div>
    )

    if (section === 'experience') return (
      <div>
        <SectionHeader title="PENGALAMAN KERJA" desc="Urutkan dari yang terbaru. Gunakan action verbs dan metrik kuantitatif untuk hasil terbaik." />
        {cv.experience.map((exp, idx) => (
          <ExpCard key={exp.id} exp={exp} idx={idx} total={cv.experience.length}
            onChange={updated => setCV(p => ({ ...p, experience: p.experience.map(e => e.id === exp.id ? updated : e) }))}
            onDelete={() => setCV(p => ({ ...p, experience: p.experience.filter(e => e.id !== exp.id) }))}
            onMove={(dir) => {
              setCV(p => {
                const arr = [...p.experience]
                const newIdx = dir === 'up' ? idx - 1 : idx + 1
                ;[arr[idx], arr[newIdx]] = [arr[newIdx], arr[idx]]
                return { ...p, experience: arr }
              })
            }}
            onAIEnhance={() => aiEnhanceExp(exp.id)}
            aiLoading={aiLoading === 'exp-' + exp.id}
          />
        ))}
        <button onClick={() => setCV(p => ({ ...p, experience: [...p.experience, { id: uid(), company: '', role: '', startDate: '', endDate: '', current: false, location: '', description: '', achievements: [''] }] }))}
          className="flex items-center gap-2" style={{ width: '100%', height: 44, background: 'var(--surface-card)', border: '1px dashed var(--hairline)', color: 'var(--muted)', fontSize: 12, fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', cursor: 'pointer', justifyContent: 'center' }}>
          <Plus size={14} /> TAMBAH PENGALAMAN
        </button>
      </div>
    )

    if (section === 'education') return (
      <div>
        <SectionHeader title="PENDIDIKAN" desc="Cantumkan pendidikan formal dari yang terbaru. IPK ≥ 3.0 direkomendasikan untuk dicantumkan." />
        {cv.education.map((edu, idx) => (
          <EduCard key={edu.id} edu={edu} idx={idx} total={cv.education.length}
            onChange={updated => setCV(p => ({ ...p, education: p.education.map(e => e.id === edu.id ? updated : e) }))}
            onDelete={() => setCV(p => ({ ...p, education: p.education.filter(e => e.id !== edu.id) }))}
          />
        ))}
        <button onClick={() => setCV(p => ({ ...p, education: [...p.education, { id: uid(), institution: '', degree: '', field: '', startDate: '', endDate: '', current: false, gpa: '', honors: '' }] }))}
          className="flex items-center gap-2" style={{ width: '100%', height: 44, background: 'var(--surface-card)', border: '1px dashed var(--hairline)', color: 'var(--muted)', fontSize: 12, fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', cursor: 'pointer', justifyContent: 'center' }}>
          <Plus size={14} /> TAMBAH PENDIDIKAN
        </button>
      </div>
    )

    if (section === 'skills') return (
      <div>
        <SectionHeader title="KEAHLIAN" desc="Kelompokkan skill berdasarkan kategori. Sesuaikan dengan job description yang dituju." />
        <div className="flex justify-end mb-4">
          <button onClick={aiSuggestSkills} disabled={!!aiLoading} className="flex items-center gap-2"
            style={{ fontSize: 11, fontWeight: 700, letterSpacing: '1px', color: aiLoading === 'skills' ? 'var(--muted)' : 'var(--m-blue-light)', textTransform: 'uppercase', background: 'none', border: '1px solid rgba(0,102,177,0.3)', padding: '7px 14px', cursor: 'pointer' }}>
            {aiLoading === 'skills' ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
            AI SUGGEST SKILLS
          </button>
        </div>
        {cv.skills.map((sg) => (
          <SkillCard key={sg.id} sg={sg}
            onChange={updated => setCV(p => ({ ...p, skills: p.skills.map(s => s.id === sg.id ? updated : s) }))}
            onDelete={() => setCV(p => ({ ...p, skills: p.skills.filter(s => s.id !== sg.id) }))}
          />
        ))}
        <button onClick={() => setCV(p => ({ ...p, skills: [...p.skills, { id: uid(), category: '', items: [] }] }))}
          className="flex items-center gap-2" style={{ width: '100%', height: 44, background: 'var(--surface-card)', border: '1px dashed var(--hairline)', color: 'var(--muted)', fontSize: 12, fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', cursor: 'pointer', justifyContent: 'center' }}>
          <Plus size={14} /> TAMBAH KELOMPOK SKILL
        </button>
      </div>
    )

    if (section === 'projects') return (
      <div>
        <SectionHeader title="PROYEK" desc="Cantumkan proyek yang relevan dengan posisi yang dilamar. Sertakan link dan teknologi yang digunakan." />
        {cv.projects.map(proj => (
          <ProjectCard key={proj.id} proj={proj}
            onChange={updated => setCV(p => ({ ...p, projects: p.projects.map(pr => pr.id === proj.id ? updated : pr) }))}
            onDelete={() => setCV(p => ({ ...p, projects: p.projects.filter(pr => pr.id !== proj.id) }))}
          />
        ))}
        <button onClick={() => setCV(p => ({ ...p, projects: [...p.projects, { id: uid(), name: '', description: '', tech: '', url: '', startDate: '', endDate: '' }] }))}
          className="flex items-center gap-2" style={{ width: '100%', height: 44, background: 'var(--surface-card)', border: '1px dashed var(--hairline)', color: 'var(--muted)', fontSize: 12, fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', cursor: 'pointer', justifyContent: 'center' }}>
          <Plus size={14} /> TAMBAH PROYEK
        </button>
      </div>
    )

    if (section === 'certifications') return (
      <div>
        <SectionHeader title="SERTIFIKASI & PENGHARGAAN" desc="Sertifikasi dari platform terkemuka (Google, AWS, Coursera, dll) meningkatkan peluang diterima." />
        {cv.certifications.map(cert => (
          <CertCard key={cert.id} cert={cert}
            onChange={updated => setCV(p => ({ ...p, certifications: p.certifications.map(c => c.id === cert.id ? updated : c) }))}
            onDelete={() => setCV(p => ({ ...p, certifications: p.certifications.filter(c => c.id !== cert.id) }))}
          />
        ))}
        <button onClick={() => setCV(p => ({ ...p, certifications: [...p.certifications, { id: uid(), name: '', issuer: '', date: '', credentialId: '', url: '' }] }))}
          className="flex items-center gap-2" style={{ width: '100%', height: 44, background: 'var(--surface-card)', border: '1px dashed var(--hairline)', color: 'var(--muted)', fontSize: 12, fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', cursor: 'pointer', justifyContent: 'center' }}>
          <Plus size={14} /> TAMBAH SERTIFIKASI
        </button>
      </div>
    )

    if (section === 'languages') return (
      <div>
        <SectionHeader title="BAHASA" desc="Kemampuan bahasa asing (terutama Inggris) sangat nilai di banyak perusahaan." />
        {cv.languages.map(l => (
          <LangCard key={l.id} lang={l}
            onChange={updated => setCV(p => ({ ...p, languages: p.languages.map(x => x.id === l.id ? updated : x) }))}
            onDelete={() => setCV(p => ({ ...p, languages: p.languages.filter(x => x.id !== l.id) }))}
          />
        ))}
        <button onClick={() => setCV(p => ({ ...p, languages: [...p.languages, { id: uid(), language: '', level: '' }] }))}
          className="flex items-center gap-2" style={{ width: '100%', height: 44, background: 'var(--surface-card)', border: '1px dashed var(--hairline)', color: 'var(--muted)', fontSize: 12, fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', cursor: 'pointer', justifyContent: 'center' }}>
          <Plus size={14} /> TAMBAH BAHASA
        </button>
      </div>
    )

    if (section === 'preview') return (
      <div>
        <SectionHeader title="PREVIEW & UNDUH" desc="Pastikan semua informasi sudah benar sebelum mengunduh." />
        <ATSScore cv={cv} template={template} />
        <div className="flex flex-wrap gap-3 mb-6">
          <button onClick={downloadPDF} disabled={downloading} className="btn-m-accent flex items-center gap-2">
            {downloading ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
            {downloading ? 'MEMBUAT PDF...' : 'DOWNLOAD PDF'}
          </button>
          <button onClick={downloadHTML} className="btn-m flex items-center gap-2">
            <FileText size={14} /> DOWNLOAD HTML
          </button>
          <button onClick={() => window.print()} className="btn-m flex items-center gap-2">
            <Eye size={14} /> PRINT / SAVE PDF
          </button>
        </div>
        <div style={{ border: '1px solid var(--hairline)', overflow: 'auto', background: '#f5f5f5', padding: 20 }}>
          <CVPreview cv={cv} template={template} />
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', paddingTop: 80, background: 'var(--canvas)' }}>
      <div className="max-w-[1400px] mx-auto px-4 lg:px-8 py-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="m-stripe" style={{ width: 24, height: 3 }} />
              <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '2px', color: 'var(--muted)', textTransform: 'uppercase' }}>CV GENERATOR</span>
            </div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 700, color: 'var(--ink)', textTransform: 'uppercase' }}>
              BUAT CV PROFESIONAL
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <span style={{ fontSize: 10, color: 'var(--muted)', fontWeight: 700, letterSpacing: '1px' }}>TEMPLATE:</span>
            <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--m-blue-light)', textTransform: 'uppercase' }}>{template.name}</span>
          </div>
        </div>

        {/* Error */}
        {aiError && (
          <div className="flex items-center gap-2 mb-4 p-3" style={{ background: 'rgba(226,39,24,0.06)', border: '1px solid rgba(226,39,24,0.3)' }}>
            <span style={{ fontSize: 12, color: 'var(--m-red)' }}>{aiError}</span>
            <button onClick={() => setAiError('')} style={{ marginLeft: 'auto', color: 'var(--muted)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 14 }}>✕</button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr_340px] gap-4">

          {/* Sidebar Nav */}
          <nav style={{ background: 'var(--surface-card)', border: '1px solid var(--hairline)', height: 'fit-content', position: 'sticky', top: 80 }}>
            {SECTIONS.map((s) => {
              const Icon = s.icon
              const isActive = section === s.id
              return (
                <button key={s.id} onClick={() => setSection(s.id)} className="w-full flex items-center gap-3 transition-all"
                  style={{ padding: '12px 16px', background: isActive ? 'var(--surface-elevated)' : 'transparent', borderLeft: isActive ? '3px solid var(--m-blue-dark)' : '3px solid transparent', borderBottom: '1px solid var(--hairline)', cursor: 'pointer', textAlign: 'left' }}>
                  <Icon size={14} style={{ color: isActive ? 'var(--m-blue-light)' : 'var(--muted)', flexShrink: 0 }} />
                  <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', color: isActive ? 'var(--ink)' : 'var(--muted)' }}>{s.label}</span>
                  {isActive && <ChevronDown size={11} style={{ color: 'var(--m-blue-light)', marginLeft: 'auto' }} />}
                </button>
              )
            })}
          </nav>

          {/* Form Area */}
          <div>
            <div style={{ background: 'var(--surface-card)', border: '1px solid var(--hairline)', padding: 28, marginBottom: 8 }}>
              {renderSection()}
            </div>
            {/* Nav Buttons */}
            <div className="flex justify-between">
              <button onClick={() => setSection(SECTIONS[sectionIdx - 1]?.id)} disabled={!canGoBack}
                className="flex items-center gap-2" style={{ height: 40, padding: '0 20px', background: 'var(--surface-card)', border: '1px solid var(--hairline)', color: canGoBack ? 'var(--body)' : 'var(--muted)', fontSize: 11, fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', cursor: canGoBack ? 'pointer' : 'default' }}>
                <ArrowLeft size={13} /> SEBELUMNYA
              </button>
              <button onClick={() => setSection(SECTIONS[sectionIdx + 1]?.id)} disabled={!canGoNext}
                className="flex items-center gap-2" style={{ height: 40, padding: '0 20px', background: canGoNext ? 'var(--m-blue-dark)' : 'var(--surface-card)', border: '1px solid var(--hairline)', color: canGoNext ? 'var(--ink)' : 'var(--muted)', fontSize: 11, fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', cursor: canGoNext ? 'pointer' : 'default' }}>
                SELANJUTNYA <ArrowRight size={13} />
              </button>
            </div>
          </div>

          {/* Live Preview */}
          <div style={{ position: 'sticky', top: 80, height: 'fit-content', maxHeight: 'calc(100vh - 100px)', overflow: 'auto' }}>
            <div style={{ background: 'var(--surface-elevated)', border: '1px solid var(--hairline)', padding: '8px 12px', marginBottom: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '1.5px', color: 'var(--muted)', textTransform: 'uppercase' }}>LIVE PREVIEW</span>
              <button onClick={downloadPDF} disabled={downloading} className="flex items-center gap-1.5"
                style={{ fontSize: 10, fontWeight: 700, letterSpacing: '1px', color: 'var(--m-blue-light)', textTransform: 'uppercase', background: 'none', border: 'none', cursor: 'pointer' }}>
                {downloading ? <Loader2 size={11} className="animate-spin" /> : <Download size={11} />}
                PDF
              </button>
            </div>
            <div style={{ transform: 'scale(0.42)', transformOrigin: 'top left', width: '238%', pointerEvents: 'none' }}>
              <CVPreview cv={cv} template={template} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function SectionHeader({ title, desc }: { title: string; desc: string }) {
  return (
    <div style={{ marginBottom: 24, paddingBottom: 16, borderBottom: '1px solid var(--hairline)' }}>
      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700, color: 'var(--ink)', textTransform: 'uppercase', marginBottom: 4 }}>{title}</h2>
      <p style={{ fontSize: 12, fontWeight: 300, color: 'var(--muted)', lineHeight: 1.5 }}>{desc}</p>
    </div>
  )
}

function ExpCard({ exp, idx, total, onChange, onDelete, onMove, onAIEnhance, aiLoading }: {
  exp: WorkExp; idx: number; total: number
  onChange: (e: WorkExp) => void; onDelete: () => void
  onMove: (dir: 'up' | 'down') => void; onAIEnhance: () => void; aiLoading: boolean
}) {
  const [open, setOpen] = useState(true)
  return (
    <div style={{ background: 'var(--surface-soft)', border: '1px solid var(--hairline)', marginBottom: 12 }}>
      <div className="flex items-center justify-between p-4 cursor-pointer" onClick={() => setOpen(!open)} style={{ borderBottom: open ? '1px solid var(--hairline)' : 'none' }}>
        <div>
          <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--ink)', margin: 0 }}>{exp.role || `Pengalaman ${idx + 1}`}</p>
          {exp.company && <p style={{ fontSize: 11, color: 'var(--muted)', margin: '2px 0 0' }}>{exp.company}</p>}
        </div>
        <div className="flex items-center gap-2">
          {idx > 0 && <button onClick={e => { e.stopPropagation(); onMove('up') }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', padding: 4 }}><MoveUp size={12} /></button>}
          {idx < total - 1 && <button onClick={e => { e.stopPropagation(); onMove('down') }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', padding: 4 }}><MoveDown size={12} /></button>}
          <button onClick={e => { e.stopPropagation(); onDelete() }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--m-red)', padding: 4 }}><Trash2 size={13} /></button>
          {open ? <ChevronUp size={14} style={{ color: 'var(--muted)' }} /> : <ChevronDown size={14} style={{ color: 'var(--muted)' }} />}
        </div>
      </div>
      {open && (
        <div style={{ padding: '16px 16px 12px' }}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
            <Field label="Jabatan / Role" value={exp.role} onChange={v => onChange({ ...exp, role: v })} placeholder="Software Engineer" required />
            <Field label="Nama Perusahaan" value={exp.company} onChange={v => onChange({ ...exp, company: v })} placeholder="PT Teknologi Maju" required />
            <Field label="Tanggal Mulai" value={exp.startDate} onChange={v => onChange({ ...exp, startDate: v })} placeholder="Jan 2022" />
            <Field label="Tanggal Selesai" value={exp.endDate} onChange={v => onChange({ ...exp, endDate: v })} placeholder="Des 2024 (kosongkan jika masih aktif)" />
            <Field label="Lokasi" value={exp.location} onChange={v => onChange({ ...exp, location: v })} placeholder="Jakarta / Remote" />
          </div>
          <div className="flex items-center gap-2 mb-3" style={{ marginTop: -8 }}>
            <input type="checkbox" checked={exp.current} onChange={e => onChange({ ...exp, current: e.target.checked })} id={`current-${exp.id}`} style={{ accentColor: 'var(--m-blue-dark)' }} />
            <label htmlFor={`current-${exp.id}`} style={{ fontSize: 12, color: 'var(--body)', cursor: 'pointer' }}>Masih bekerja di sini</label>
          </div>
          <div style={{ marginBottom: 12 }}>
            <div className="flex items-center justify-between mb-2">
              <label style={{ fontSize: 10, fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--muted)' }}>DESKRIPSI PEKERJAAN</label>
              <button onClick={onAIEnhance} disabled={aiLoading} className="flex items-center gap-1.5"
                style={{ fontSize: 9, fontWeight: 700, letterSpacing: '1px', color: aiLoading ? 'var(--muted)' : 'var(--m-blue-light)', textTransform: 'uppercase', background: 'none', border: '1px solid var(--hairline)', padding: '3px 8px', cursor: 'pointer' }}>
                {aiLoading ? <Loader2 size={10} className="animate-spin" /> : <Sparkles size={10} />} AI ENHANCE
              </button>
            </div>
            <textarea value={exp.description} onChange={e => onChange({ ...exp, description: e.target.value })}
              placeholder="Deskripsikan tanggung jawab dan pencapaian utama kamu..." rows={3}
              className="input-base" style={{ height: 'auto', resize: 'vertical', fontSize: 13, lineHeight: 1.6 }} />
          </div>
          <div>
            <label style={{ fontSize: 10, fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--muted)', display: 'block', marginBottom: 8 }}>PENCAPAIAN (BULLETS)</label>
            {exp.achievements.map((ach, ai) => (
              <div key={ai} className="flex items-center gap-2 mb-2">
                <span style={{ fontSize: 12, color: 'var(--m-blue-light)', flexShrink: 0 }}>•</span>
                <input value={ach} onChange={e => { const arr = [...exp.achievements]; arr[ai] = e.target.value; onChange({ ...exp, achievements: arr }) }}
                  placeholder="Meningkatkan performa aplikasi sebesar 40% dengan optimasi query database"
                  className="input-base" style={{ height: 38, fontSize: 12, flex: 1 }} />
                <button onClick={() => { const arr = exp.achievements.filter((_, i) => i !== ai); onChange({ ...exp, achievements: arr }) }}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', flexShrink: 0 }}><Trash2 size={12} /></button>
              </div>
            ))}
            <button onClick={() => onChange({ ...exp, achievements: [...exp.achievements, ''] })}
              style={{ fontSize: 10, fontWeight: 700, color: 'var(--m-blue-light)', letterSpacing: '1px', textTransform: 'uppercase', background: 'none', border: 'none', cursor: 'pointer', padding: '4px 0', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Plus size={11} /> TAMBAH PENCAPAIAN
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function EduCard({ edu, idx, onChange, onDelete }: { edu: Education; idx: number; total: number; onChange: (e: Education) => void; onDelete: () => void }) {
  const [open, setOpen] = useState(true)
  return (
    <div style={{ background: 'var(--surface-soft)', border: '1px solid var(--hairline)', marginBottom: 12 }}>
      <div className="flex items-center justify-between p-4 cursor-pointer" onClick={() => setOpen(!open)} style={{ borderBottom: open ? '1px solid var(--hairline)' : 'none' }}>
        <div>
          <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--ink)', margin: 0 }}>{edu.degree || `Pendidikan ${idx + 1}`}</p>
          {edu.institution && <p style={{ fontSize: 11, color: 'var(--muted)', margin: '2px 0 0' }}>{edu.institution}</p>}
        </div>
        <div className="flex items-center gap-2">
          <button onClick={e => { e.stopPropagation(); onDelete() }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--m-red)', padding: 4 }}><Trash2 size={13} /></button>
          {open ? <ChevronUp size={14} style={{ color: 'var(--muted)' }} /> : <ChevronDown size={14} style={{ color: 'var(--muted)' }} />}
        </div>
      </div>
      {open && (
        <div style={{ padding: '16px 16px 12px' }}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
            <Field label="Nama Institusi" value={edu.institution} onChange={v => onChange({ ...edu, institution: v })} placeholder="Universitas Indonesia" required />
            <Field label="Gelar" value={edu.degree} onChange={v => onChange({ ...edu, degree: v })} placeholder="S1 / S2 / D3 / SMA" required />
            <Field label="Jurusan / Program Studi" value={edu.field} onChange={v => onChange({ ...edu, field: v })} placeholder="Teknik Informatika" />
            <Field label="IPK" value={edu.gpa} onChange={v => onChange({ ...edu, gpa: v })} placeholder="3.75 (opsional)" />
            <Field label="Tahun Mulai" value={edu.startDate} onChange={v => onChange({ ...edu, startDate: v })} placeholder="2019" />
            <Field label="Tahun Lulus" value={edu.endDate} onChange={v => onChange({ ...edu, endDate: v })} placeholder="2023 (kosongkan jika masih aktif)" />
            <Field label="Penghargaan / Predikat" value={edu.honors} onChange={v => onChange({ ...edu, honors: v })} placeholder="Cumlaude / Dean's List" />
          </div>
          <div className="flex items-center gap-2" style={{ marginTop: -8 }}>
            <input type="checkbox" checked={edu.current} onChange={e => onChange({ ...edu, current: e.target.checked })} id={`edu-current-${edu.id}`} style={{ accentColor: 'var(--m-blue-dark)' }} />
            <label htmlFor={`edu-current-${edu.id}`} style={{ fontSize: 12, color: 'var(--body)', cursor: 'pointer' }}>Masih kuliah</label>
          </div>
        </div>
      )}
    </div>
  )
}

function SkillCard({ sg, onChange, onDelete }: { sg: SkillGroup; onChange: (s: SkillGroup) => void; onDelete: () => void }) {
  const [input, setInput] = useState('')
  return (
    <div style={{ background: 'var(--surface-soft)', border: '1px solid var(--hairline)', padding: 16, marginBottom: 12 }}>
      <div className="flex items-start justify-between gap-4 mb-3">
        <input value={sg.category} onChange={e => onChange({ ...sg, category: e.target.value })}
          placeholder="Kategori (cth: Programming Languages)"
          className="input-base" style={{ height: 38, fontSize: 12, flex: 1 }} />
        <button onClick={onDelete} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--m-red)', padding: 4, flexShrink: 0 }}><Trash2 size={13} /></button>
      </div>
      <div className="flex flex-wrap gap-2 mb-3">
        {sg.items.map((item, i) => (
          <span key={i} className="flex items-center gap-1" style={{ background: 'var(--surface-elevated)', border: '1px solid var(--hairline)', padding: '3px 10px', fontSize: 11, color: 'var(--body)' }}>
            {item}
            <button onClick={() => onChange({ ...sg, items: sg.items.filter((_, idx) => idx !== i) })} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', padding: '0 0 0 4px', lineHeight: 1 }}>✕</button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <input value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if ((e.key === 'Enter' || e.key === ',') && input.trim()) { onChange({ ...sg, items: [...sg.items, input.trim()] }); setInput('') } }}
          placeholder="Ketik skill lalu Enter..." className="input-base" style={{ height: 36, fontSize: 12, flex: 1 }} />
        <button onClick={() => { if (input.trim()) { onChange({ ...sg, items: [...sg.items, input.trim()] }); setInput('') } }}
          style={{ height: 36, padding: '0 14px', background: 'var(--m-blue-dark)', border: 'none', color: '#fff', fontSize: 11, fontWeight: 700, letterSpacing: '1px', cursor: 'pointer' }}>
          <Plus size={13} />
        </button>
      </div>
      <p style={{ fontSize: 10, color: 'var(--muted)', marginTop: 6 }}>Tekan Enter atau koma untuk menambahkan skill</p>
    </div>
  )
}

function ProjectCard({ proj, onChange, onDelete }: { proj: Project; onChange: (p: Project) => void; onDelete: () => void }) {
  const [open, setOpen] = useState(true)
  return (
    <div style={{ background: 'var(--surface-soft)', border: '1px solid var(--hairline)', marginBottom: 12 }}>
      <div className="flex items-center justify-between p-4 cursor-pointer" onClick={() => setOpen(!open)} style={{ borderBottom: open ? '1px solid var(--hairline)' : 'none' }}>
        <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--ink)', margin: 0 }}>{proj.name || 'Proyek Baru'}</p>
        <div className="flex items-center gap-2">
          <button onClick={e => { e.stopPropagation(); onDelete() }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--m-red)', padding: 4 }}><Trash2 size={13} /></button>
          {open ? <ChevronUp size={14} style={{ color: 'var(--muted)' }} /> : <ChevronDown size={14} style={{ color: 'var(--muted)' }} />}
        </div>
      </div>
      {open && (
        <div style={{ padding: '16px 16px 12px' }}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
            <Field label="Nama Proyek" value={proj.name} onChange={v => onChange({ ...proj, name: v })} placeholder="E-Commerce Platform" required />
            <Field label="Teknologi" value={proj.tech} onChange={v => onChange({ ...proj, tech: v })} placeholder="Next.js, Node.js, PostgreSQL" />
            <Field label="URL / Link" value={proj.url} onChange={v => onChange({ ...proj, url: v })} placeholder="github.com/user/project" />
            <Field label="Periode" value={proj.startDate} onChange={v => onChange({ ...proj, startDate: v })} placeholder="Jan 2024 – Mar 2024" />
          </div>
          <TextArea label="Deskripsi Proyek" value={proj.description} onChange={v => onChange({ ...proj, description: v })} placeholder="Jelaskan konteks, peran kamu, dan hasil yang dicapai..." rows={3} />
        </div>
      )}
    </div>
  )
}

function CertCard({ cert, onChange, onDelete }: { cert: Certification; onChange: (c: Certification) => void; onDelete: () => void }) {
  return (
    <div style={{ background: 'var(--surface-soft)', border: '1px solid var(--hairline)', padding: 16, marginBottom: 12 }}>
      <div className="flex justify-end mb-2">
        <button onClick={onDelete} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--m-red)' }}><Trash2 size={13} /></button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
        <Field label="Nama Sertifikasi" value={cert.name} onChange={v => onChange({ ...cert, name: v })} placeholder="AWS Certified Developer" required />
        <Field label="Penerbit" value={cert.issuer} onChange={v => onChange({ ...cert, issuer: v })} placeholder="Amazon Web Services" required />
        <Field label="Tanggal" value={cert.date} onChange={v => onChange({ ...cert, date: v })} placeholder="Nov 2024" />
        <Field label="Credential ID" value={cert.credentialId} onChange={v => onChange({ ...cert, credentialId: v })} placeholder="ABC123XYZ" />
        <Field label="URL Verifikasi" value={cert.url} onChange={v => onChange({ ...cert, url: v })} placeholder="credly.com/..." />
      </div>
    </div>
  )
}

function LangCard({ lang, onChange, onDelete }: { lang: LangItem; onChange: (l: LangItem) => void; onDelete: () => void }) {
  return (
    <div style={{ background: 'var(--surface-soft)', border: '1px solid var(--hairline)', padding: 16, marginBottom: 12 }}>
      <div className="grid grid-cols-2 gap-4 items-end">
        <Field label="Bahasa" value={lang.language} onChange={v => onChange({ ...lang, language: v })} placeholder="Bahasa Inggris" required />
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', fontSize: 10, fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 6 }}>TINGKAT KEMAMPUAN</label>
          <select value={lang.level} onChange={e => onChange({ ...lang, level: e.target.value })}
            className="input-base" style={{ height: 42, fontSize: 13 }}>
            <option value="">Pilih tingkat...</option>
            <option value="Native / Bahasa Ibu">Native / Bahasa Ibu</option>
            <option value="Professional Working Proficiency">Professional Working Proficiency</option>
            <option value="Full Professional Proficiency">Full Professional Proficiency</option>
            <option value="Limited Working Proficiency">Limited Working Proficiency</option>
            <option value="Elementary">Elementary / Dasar</option>
          </select>
        </div>
        <div style={{ gridColumn: '2', display: 'flex', justifyContent: 'flex-end', marginTop: -16 }}>
          <button onClick={onDelete} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--m-red)' }}><Trash2 size={13} /></button>
        </div>
      </div>
    </div>
  )
}
