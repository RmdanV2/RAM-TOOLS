'use client'
import { useState, useRef, useCallback, useEffect } from 'react'
import {
  Network, Trash2, Download, ZoomIn, ZoomOut, Maximize2, Move, ArrowRight as ArrowRightIcon,
  MousePointer, Type, Plus,
  Server, Database, ShieldCheck, Globe, Monitor, Zap, MemoryStick, Mail, Scale, HardDrive, Boxes, Link2,
  type LucideIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Lang } from '@/lib/i18n'

type NodeType = 'server' | 'database' | 'firewall' | 'cdn' | 'client' | 'api' | 'cache' | 'queue' | 'loadbalancer' | 'storage' | 'microservice' | 'external'

interface DiagramNode {
  id: string
  type: NodeType
  x: number
  y: number
  label: string
  group?: string
}

interface DiagramArrow {
  id: string
  from: string
  to: string
  label: string
  animated: boolean
}

// Lucide icon SVG path data for use inside SVG canvas
const NODE_ICON_PATHS: Record<NodeType, string> = {
  server:       'M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2zm3 6h.01M12 12v.01',
  database:     'M12 2C6.48 2 2 4.24 2 7s4.48 5 10 5 10-2.24 10-5-4.48-5-10-5zM2 17c0 2.76 4.48 5 10 5s10-2.24 10-5M2 12c0 2.76 4.48 5 10 5s10-2.24 10-5',
  firewall:     'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10',
  cdn:          'M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 0c-1.5 2.5-2.5 5.5-2.5 10s1 7.5 2.5 10M12 2c1.5 2.5 2.5 5.5 2.5 10S13.5 19.5 12 22M2 12h20',
  client:       'M20 16V7a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v9m16 0H4m16 0 1.28 2.55a1 1 0 0 1-.9 1.45H3.62a1 1 0 0 1-.9-1.45L4 16',
  api:          'M13 2L3 14h9l-1 8 10-12h-9l1-8z',
  cache:        'M6 19v-3M10 19v-3M14 19v-3M18 19v-3M8 11V9m0 0a3 3 0 1 0 6 0A3 3 0 0 0 8 9zm8 0V9m0 0a3 3 0 1 0 6 0A3 3 0 0 0 16 9zM5 5h14a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1z',
  queue:        'M22 12h-4l-3 9L9 3l-3 9H2',
  loadbalancer: 'M16 3h5v5M4 20 21 3M21 16v5h-5M15 15l6 6M4 4l5 5',
  storage:      'M22 12H2M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z',
  microservice: 'M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2zM7 7h.01',
  external:     'M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71',
}

const NODE_DEFS: Record<NodeType, { color: string; bg: string; label: { id: string; en: string } }> = {
  server:       { color: '#d97706', bg: '#fef3c7', label: { id: 'Server',        en: 'Server' } },
  database:     { color: '#0284c7', bg: '#e0f2fe', label: { id: 'Database',      en: 'Database' } },
  firewall:     { color: '#dc2626', bg: '#fee2e2', label: { id: 'Firewall',      en: 'Firewall' } },
  cdn:          { color: '#7c3aed', bg: '#ede9fe', label: { id: 'CDN',            en: 'CDN' } },
  client:       { color: '#059669', bg: '#d1fae5', label: { id: 'Client',         en: 'Client' } },
  api:          { color: '#b45309', bg: '#fef3c7', label: { id: 'API Gateway',    en: 'API Gateway' } },
  cache:        { color: '#6d28d9', bg: '#ede9fe', label: { id: 'Cache',          en: 'Cache' } },
  queue:        { color: '#0891b2', bg: '#cffafe', label: { id: 'Message Queue',  en: 'Message Queue' } },
  loadbalancer: { color: '#d97706', bg: '#fef3c7', label: { id: 'Load Balancer',  en: 'Load Balancer' } },
  storage:      { color: '#2563eb', bg: '#dbeafe', label: { id: 'Storage',        en: 'Storage' } },
  microservice: { color: '#16a34a', bg: '#dcfce7', label: { id: 'Microservice',   en: 'Microservice' } },
  external:     { color: '#9333ea', bg: '#f3e8ff', label: { id: 'External API',   en: 'External API' } },
}

// Lucide React icon components for sidebar panel
const NODE_ICON_COMPONENTS: Record<NodeType, LucideIcon> = {
  server: Server, database: Database, firewall: ShieldCheck, cdn: Globe,
  client: Monitor, api: Zap, cache: MemoryStick, queue: Mail,
  loadbalancer: Scale, storage: HardDrive, microservice: Boxes, external: Link2,
}

const GROUPS = [
  { id: 'client',   label: { id: 'Client Layer',    en: 'Client Layer' },    types: ['client', 'cdn'] as NodeType[] },
  { id: 'edge',     label: { id: 'Edge / Security',  en: 'Edge / Security' }, types: ['firewall', 'loadbalancer'] as NodeType[] },
  { id: 'services', label: { id: 'Services',         en: 'Services' },        types: ['server', 'api', 'microservice', 'external'] as NodeType[] },
  { id: 'data',     label: { id: 'Data Layer',       en: 'Data Layer' },      types: ['database', 'cache', 'queue', 'storage'] as NodeType[] },
]

let idCount = 0
const uid = () => `n${++idCount}_${Date.now()}`

export default function DiagramTool({ lang }: { lang: Lang }) {
  const svgRef = useRef<SVGSVGElement>(null)
  const [nodes, setNodes] = useState<DiagramNode[]>([])
  const [arrows, setArrows] = useState<DiagramArrow[]>([])
  const [selected, setSelected] = useState<string | null>(null)
  const [tool, setTool] = useState<'select' | 'arrow' | 'text'>('select')
  const [dragging, setDragging] = useState<{ id: string; ox: number; oy: number } | null>(null)
  const [arrowFrom, setArrowFrom] = useState<string | null>(null)
  const [editLabel, setEditLabel] = useState<{ id: string; isArrow: boolean } | null>(null)
  const [labelVal, setLabelVal] = useState('')
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [isPanning, setIsPanning] = useState(false)
  const panStart = useRef({ x: 0, y: 0, px: 0, py: 0 })

  const addNode = (type: NodeType) => {
    const def = NODE_DEFS[type]
    setNodes(p => [...p, {
      id: uid(), type,
      x: 120 + Math.random() * 400,
      y: 100 + Math.random() * 300,
      label: def.label[lang],
    }])
  }

  const svgPt = (e: React.MouseEvent) => {
    const svg = svgRef.current!
    const rect = svg.getBoundingClientRect()
    return {
      x: (e.clientX - rect.left - pan.x) / zoom,
      y: (e.clientY - rect.top  - pan.y) / zoom,
    }
  }

  const onNodeMouseDown = (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    if (tool === 'arrow') {
      if (!arrowFrom) { setArrowFrom(id) }
      else if (arrowFrom !== id) {
        setArrows(p => [...p, { id: uid(), from: arrowFrom, to: id, label: '', animated: true }])
        setArrowFrom(null)
      }
      return
    }
    setSelected(id)
    const node = nodes.find(n => n.id === id)!
    setDragging({ id, ox: e.clientX - node.x * zoom - pan.x, oy: e.clientY - node.y * zoom - pan.y })
  }

  const onSvgMouseMove = (e: React.MouseEvent) => {
    if (dragging) {
      const x = (e.clientX - dragging.ox - pan.x) / zoom
      const y = (e.clientY - dragging.oy - pan.y) / zoom
      setNodes(p => p.map(n => n.id === dragging.id ? { ...n, x, y } : n))
    }
    if (isPanning) {
      setPan({ x: e.clientX - panStart.current.px, y: e.clientY - panStart.current.py })
    }
  }

  const onSvgMouseUp = () => { setDragging(null); setIsPanning(false) }
  const onSvgMouseDown = (e: React.MouseEvent) => {
    if (e.button === 1 || (e.altKey && e.button === 0)) {
      setIsPanning(true)
      panStart.current = { x: 0, y: 0, px: e.clientX - pan.x, py: e.clientY - pan.y }
    } else {
      setSelected(null); setArrowFrom(null)
    }
  }

  const deleteSelected = () => {
    if (!selected) return
    setNodes(p => p.filter(n => n.id !== selected))
    setArrows(p => p.filter(a => a.from !== selected && a.to !== selected))
    setSelected(null)
  }

  const getCenter = (id: string) => {
    const n = nodes.find(n => n.id === id)
    if (!n) return { x: 0, y: 0 }
    return { x: n.x + 60, y: n.y + 40 }
  }

  const exportSVG = () => {
    const svg = svgRef.current
    if (!svg) return
    const blob = new Blob([svg.outerHTML], { type: 'image/svg+xml' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = 'diagram.svg'; a.click()
    URL.revokeObjectURL(url)
  }

  const startEditLabel = (id: string, isArrow: boolean, current: string) => {
    setEditLabel({ id, isArrow }); setLabelVal(current)
  }

  const submitLabel = () => {
    if (!editLabel) return
    if (editLabel.isArrow) setArrows(p => p.map(a => a.id === editLabel.id ? { ...a, label: labelVal } : a))
    else setNodes(p => p.map(n => n.id === editLabel.id ? { ...n, label: labelVal } : n))
    setEditLabel(null)
  }

  return (
    <div className="min-h-screen pt-20 flex flex-col">
      {/* Toolbar */}
      <div className="border-b border-[var(--hairline)] bg-[var(--surface-card)] px-4 py-3 flex items-center gap-3 flex-wrap">
        <span className="flex items-center gap-2 text-sm font-semibold text-[var(--ink)] mr-2">
          <Network size={16} className="text-[var(--m-blue-light)]" />
          {lang === 'id' ? 'Diagram Sistem' : 'System Diagram'}
        </span>
        <div className="w-px h-5 bg-[var(--hairline)]" />

        {/* Tools */}
        {[
          { id: 'select', icon: MousePointer, label: lang === 'id' ? 'Pilih' : 'Select' },
          { id: 'arrow',  icon: ArrowRightIcon, label: lang === 'id' ? 'Panah' : 'Arrow' },
        ].map(t => (
          <button key={t.id} onClick={() => setTool(t.id as any)}
            className={cn('flex items-center gap-1.5 px-3 py-1.5 rounded-none text-xs font-medium transition-all', tool === t.id ? 'bg-[rgba(28,105,212,0.08)] text-[var(--m-blue-light)] border border-[rgba(28,105,212,0.30)]' : 'text-[var(--muted)] hover:text-[var(--ink)] hover:bg-[var(--surface-soft)]')}>
            <t.icon size={13} />{t.label}
          </button>
        ))}

        <div className="w-px h-5 bg-[var(--hairline)]" />

        {/* Zoom */}
        <button onClick={() => setZoom(z => Math.min(z + 0.1, 2))} className="p-1.5 rounded-none text-[var(--muted)] hover:text-[var(--ink)] hover:bg-[var(--surface-soft)]"><ZoomIn size={14} /></button>
        <span className="text-xs font-mono text-[var(--muted)] w-10 text-center">{Math.round(zoom * 100)}%</span>
        <button onClick={() => setZoom(z => Math.max(z - 0.1, 0.3))} className="p-1.5 rounded-none text-[var(--muted)] hover:text-[var(--ink)] hover:bg-[var(--surface-soft)]"><ZoomOut size={14} /></button>
        <button onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }) }} className="p-1.5 rounded-none text-[var(--muted)] hover:text-[var(--ink)] hover:bg-[var(--surface-soft)]"><Maximize2 size={14} /></button>

        <div className="w-px h-5 bg-[var(--hairline)]" />

        {selected && (
          <button onClick={deleteSelected} className="flex items-center gap-1.5 px-3 py-1.5 rounded-none text-xs font-medium text-red-500 hover:bg-red-500/10 transition-all">
            <Trash2 size={13} />{lang === 'id' ? 'Hapus' : 'Delete'}
          </button>
        )}
        <button onClick={exportSVG} className="flex items-center gap-1.5 px-3 py-1.5 rounded-none text-xs font-medium btn-gold ml-auto">
          <Download size={13} />SVG
        </button>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="w-56 flex-shrink-0 border-r border-[var(--hairline)] bg-[var(--surface-card)] overflow-y-auto">
          <div className="p-3">
            <p className="text-[10px] font-mono font-bold uppercase tracking-widest text-[var(--muted)] mb-3">
              {lang === 'id' ? 'Komponen' : 'Components'}
            </p>
            {GROUPS.map(group => (
              <div key={group.id} className="mb-4">
                <p className="text-[9px] font-semibold uppercase tracking-widest text-[var(--muted)] mb-1.5 px-1">{group.label[lang]}</p>
                <div className="space-y-1">
                  {group.types.map(type => {
                    const def = NODE_DEFS[type]
                    return (
                      <button
                        key={type}
                        onClick={() => addNode(type)}
                        className="w-full flex items-center gap-2 px-2 py-1.5 rounded-none text-left hover:bg-[var(--surface-soft)] transition-all group"
                      >
                        {(() => { const IconComp = NODE_ICON_COMPONENTS[type]; return <IconComp size={14} color={def.color} strokeWidth={2} /> })()}
                        <span className="text-xs font-medium text-[var(--body)] group-hover:text-[var(--ink)]">
                          {def.label[lang]}
                        </span>
                        <Plus size={10} className="ml-auto text-[var(--muted)] opacity-0 group-hover:opacity-100" />
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Canvas */}
        <div className="flex-1 relative overflow-hidden bg-[var(--surface-soft)]"
          style={{ backgroundImage: 'radial-gradient(var(--hairline) 1px, transparent 1px)', backgroundSize: '24px 24px' }}>

          {/* Arrow mode hint */}
          {tool === 'arrow' && (
            <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10 bg-[rgba(28,105,212,0.08)] border border-[rgba(28,105,212,0.30)] text-[var(--m-blue-light)] text-xs font-medium px-3 py-1.5 rounded-none">
              {arrowFrom
                ? (lang === 'id' ? 'Klik node tujuan' : 'Click target node')
                : (lang === 'id' ? 'Klik node asal panah' : 'Click source node')}
            </div>
          )}

          {nodes.length === 0 && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
              <Network size={40} className="text-[var(--hairline)] mb-3" />
              <p className="text-sm font-medium text-[var(--muted)]">
                {lang === 'id' ? 'Klik komponen di sidebar untuk menambahkan' : 'Click a component in the sidebar to add it'}
              </p>
              <p className="text-xs text-[var(--hairline)] mt-1">
                {lang === 'id' ? 'Geser untuk memindahkan • Alt+drag untuk pan' : 'Drag to move • Alt+drag to pan'}
              </p>
            </div>
          )}

          <svg
            ref={svgRef}
            className="w-full h-full"
            style={{ cursor: isPanning ? 'grabbing' : tool === 'arrow' ? 'crosshair' : 'default' }}
            onMouseMove={onSvgMouseMove}
            onMouseUp={onSvgMouseUp}
            onMouseDown={onSvgMouseDown}
          >
            <defs>
              <marker id="arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                <path d="M0,0 L0,6 L8,3 z" fill="var(--m-blue-light)" />
              </marker>
              <marker id="arrow-sel" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                <path d="M0,0 L0,6 L8,3 z" fill="#f59e0b" />
              </marker>
              <style>{`
                @keyframes dashMove { to { stroke-dashoffset: -20; } }
                .animated-dash { stroke-dasharray: 6 4; animation: dashMove 0.8s linear infinite; }
              `}</style>
            </defs>

            <g transform={`translate(${pan.x},${pan.y}) scale(${zoom})`}>
              {/* Arrows */}
              {arrows.map(arrow => {
                const from = getCenter(arrow.from)
                const to = getCenter(arrow.to)
                const mx = (from.x + to.x) / 2
                const my = (from.y + to.y) / 2
                const isSel = selected === arrow.id
                return (
                  <g key={arrow.id} onClick={() => setSelected(arrow.id)} className="cursor-pointer">
                    <line
                      x1={from.x} y1={from.y} x2={to.x} y2={to.y}
                      stroke={isSel ? '#f59e0b' : 'var(--m-blue-light)'}
                      strokeWidth={isSel ? 2.5 : 1.8}
                      markerEnd={`url(#${isSel ? 'arrow-sel' : 'arrow'})`}
                      className={arrow.animated ? 'animated-dash' : ''}
                      opacity={0.85}
                    />
                    {/* Invisible hit area */}
                    <line x1={from.x} y1={from.y} x2={to.x} y2={to.y} stroke="transparent" strokeWidth={12} />
                    {arrow.label && (
                      <text x={mx} y={my - 6} textAnchor="middle" fontSize={11} fill="var(--body)" fontFamily="var(--font-mono)">
                        {arrow.label}
                      </text>
                    )}
                    <circle cx={mx} cy={my} r={5} fill="rgba(28,105,212,0.08)" stroke="rgba(28,105,212,0.30)" strokeWidth={1}
                      className="cursor-pointer opacity-0 hover:opacity-100 transition-opacity"
                      onClick={() => startEditLabel(arrow.id, true, arrow.label)} />
                  </g>
                )
              })}

              {/* Nodes */}
              {nodes.map(node => {
                const def = NODE_DEFS[node.type]
                const isSel = selected === node.id
                const isArrowSrc = arrowFrom === node.id
                return (
                  <g key={node.id} transform={`translate(${node.x},${node.y})`}
                    onMouseDown={e => onNodeMouseDown(e, node.id)}
                    onDoubleClick={() => startEditLabel(node.id, false, node.label)}
                    className="cursor-pointer">
                    <rect
                      width={120} height={80} rx={10}
                      fill={def.bg} stroke={isSel ? '#f59e0b' : isArrowSrc ? '#d97706' : def.color}
                      strokeWidth={isSel ? 2.5 : 1.5}
                      filter={isSel ? 'drop-shadow(0 2px 8px rgba(217,119,6,0.3))' : undefined}
                    />
                    <svg x={48} y={14} width={24} height={24} viewBox="0 0 24 24" fill="none" stroke={def.color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d={NODE_ICON_PATHS[node.type]} />
                    </svg>
                    <text x={60} y={52} textAnchor="middle" fontSize={11} fontWeight="600" fill={def.color} fontFamily="var(--font-body)">
                      {node.label.length > 14 ? node.label.slice(0, 13) + '…' : node.label}
                    </text>
                    <text x={60} y={65} textAnchor="middle" fontSize={9} fill={def.color} opacity={0.6} fontFamily="var(--font-mono)">
                      {node.type}
                    </text>
                  </g>
                )
              })}
            </g>
          </svg>

          {/* Label Edit */}
          {editLabel && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-20">
              <div className="card bg-[var(--surface-card)] p-5 w-72 shadow-xl">
                <p className="text-sm font-semibold text-[var(--ink)] mb-3">
                  {lang === 'id' ? 'Edit Label' : 'Edit Label'}
                </p>
                <input
                  autoFocus value={labelVal} onChange={e => setLabelVal(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') submitLabel(); if (e.key === 'Escape') setEditLabel(null) }}
                  className="input-base mb-3"
                  placeholder={lang === 'id' ? 'Masukkan label...' : 'Enter label...'}
                />
                <div className="flex gap-2 justify-end">
                  <button onClick={() => setEditLabel(null)} className="px-3 py-1.5 text-xs text-[var(--muted)] hover:text-[var(--ink)] border border-[var(--hairline)] rounded-none">
                    {lang === 'id' ? 'Batal' : 'Cancel'}
                  </button>
                  <button onClick={submitLabel} className="btn-gold text-xs px-4 py-1.5">OK</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
