'use client'
import { useState, useRef, useCallback } from 'react'
import { GitBranch, Trash2, Download, ZoomIn, ZoomOut, Maximize2, MousePointer, ArrowRight as ArrowIcon, Plus, Type } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Lang } from '@/lib/i18n'

type ShapeType =
  | 'process'      // Rectangle — Process
  | 'decision'     // Diamond — Decision
  | 'terminal'     // Rounded rect — Start/End
  | 'io'           // Parallelogram — Input/Output
  | 'connector'    // Circle — Connector
  | 'document'     // Document shape
  | 'database'     // Cylinder — Database
  | 'predefined'   // Rectangle with double lines — Predefined Process
  | 'manual'       // Trapezoid — Manual Operation
  | 'delay'        // D-shape — Delay
  | 'annotation'   // Bracket — Annotation
  | 'display'      // Pentagon-ish — Display

interface FlowNode {
  id: string
  type: ShapeType
  x: number
  y: number
  label: string
  w: number
  h: number
}

interface FlowArrow {
  id: string
  from: string
  to: string
  label: string
}

const SHAPES: Array<{ type: ShapeType; label: { id: string; en: string }; desc: { id: string; en: string } }> = [
  { type: 'terminal',    label: { id: 'Terminator',        en: 'Terminator' },         desc: { id: 'Mulai / Selesai',        en: 'Start / End' } },
  { type: 'process',     label: { id: 'Proses',            en: 'Process' },            desc: { id: 'Langkah/Operasi',        en: 'Process Step' } },
  { type: 'decision',    label: { id: 'Keputusan',         en: 'Decision' },           desc: { id: 'Ya / Tidak',             en: 'Yes / No' } },
  { type: 'io',          label: { id: 'Input/Output',      en: 'Input/Output' },       desc: { id: 'Data masuk/keluar',      en: 'Data in/out' } },
  { type: 'predefined',  label: { id: 'Proses Terdefinisi',en: 'Predefined Process' }, desc: { id: 'Sub-routine/Fungsi',     en: 'Sub-routine/Function' } },
  { type: 'connector',   label: { id: 'Konektor',          en: 'Connector' },          desc: { id: 'Titik sambung',          en: 'Connection point' } },
  { type: 'database',    label: { id: 'Database',          en: 'Database' },           desc: { id: 'Penyimpanan data',       en: 'Data storage' } },
  { type: 'document',    label: { id: 'Dokumen',           en: 'Document' },           desc: { id: 'Output dokumen',         en: 'Document output' } },
  { type: 'manual',      label: { id: 'Operasi Manual',    en: 'Manual Operation' },   desc: { id: 'Input manusia',          en: 'Human input' } },
  { type: 'delay',       label: { id: 'Penundaan',         en: 'Delay' },              desc: { id: 'Waktu tunggu',           en: 'Wait time' } },
  { type: 'display',     label: { id: 'Tampilan',          en: 'Display' },            desc: { id: 'Output tampilan',        en: 'Display output' } },
  { type: 'annotation',  label: { id: 'Anotasi',           en: 'Annotation' },         desc: { id: 'Komentar/Catatan',       en: 'Comment/Note' } },
]

const DEFAULT_SIZE: Record<ShapeType, { w: number; h: number }> = {
  process:    { w: 140, h: 60 },
  decision:   { w: 130, h: 90 },
  terminal:   { w: 140, h: 55 },
  io:         { w: 140, h: 60 },
  connector:  { w: 55,  h: 55 },
  document:   { w: 140, h: 70 },
  database:   { w: 100, h: 80 },
  predefined: { w: 140, h: 60 },
  manual:     { w: 140, h: 65 },
  delay:      { w: 140, h: 60 },
  annotation: { w: 130, h: 60 },
  display:    { w: 140, h: 60 },
}

const GOLD = '#d4a017'
const GOLD_DARK = '#78350f'

function renderShape(node: FlowNode, selected: boolean) {
  const { type, w, h } = node
  const fill = selected ? '#fef3c7' : 'var(--surface-card)'
  const stroke = selected ? GOLD : 'rgba(28,105,212,0.30)'
  const sw = selected ? 2 : 1.5

  const props = { fill, stroke, strokeWidth: sw }

  switch (type) {
    case 'terminal':
      return <rect x={0} y={0} width={w} height={h} rx={h / 2} {...props} />
    case 'process':
      return <rect x={0} y={0} width={w} height={h} rx={6} {...props} />
    case 'predefined':
      return <>
        <rect x={0} y={0} width={w} height={h} rx={6} {...props} />
        <line x1={14} y1={0} x2={14} y2={h} stroke={stroke} strokeWidth={sw} />
        <line x1={w - 14} y1={0} x2={w - 14} y2={h} stroke={stroke} strokeWidth={sw} />
      </>
    case 'decision': {
      const mx = w / 2, my = h / 2
      return <polygon points={`${mx},0 ${w},${my} ${mx},${h} 0,${my}`} {...props} />
    }
    case 'io': {
      const off = 18
      return <polygon points={`${off},0 ${w},0 ${w - off},${h} 0,${h}`} {...props} />
    }
    case 'connector':
      return <ellipse cx={w / 2} cy={h / 2} rx={w / 2} ry={h / 2} {...props} />
    case 'database': {
      const ry = 10
      return <>
        <rect x={0} y={ry} width={w} height={h - ry * 2} {...props} />
        <ellipse cx={w / 2} cy={ry} rx={w / 2} ry={ry} {...props} />
        <ellipse cx={w / 2} cy={h - ry} rx={w / 2} ry={ry} {...props} />
      </>
    }
    case 'document': {
      const wave = h * 0.2
      return <path d={`M0,0 H${w} V${h - wave} Q${w * 0.75},${h + wave * 0.5} ${w / 2},${h - wave} Q${w * 0.25},${h - wave * 2.5} 0,${h - wave} Z`} {...props} />
    }
    case 'manual': {
      const off = 14
      return <polygon points={`${off},0 ${w},0 ${w - off},${h} 0,${h}`} {...props} />
    }
    case 'delay': {
      const r = h / 2
      return <path d={`M0,0 H${w - r} A${r},${r} 0 0 1 ${w - r},${h} H0 Z`} {...props} />
    }
    case 'display': {
      const bx = 20
      return <path d={`M${bx},0 H${w - 10} Q${w + 5},${h / 2} ${w - 10},${h} H${bx} L0,${h / 2} Z`} {...props} />
    }
    case 'annotation':
      return <>
        <rect x={0} y={0} width={w} height={h} rx={4} fill={fill} stroke="transparent" />
        <path d={`M16,6 H6 V${h - 6} H16`} fill="none" stroke={stroke} strokeWidth={sw} />
      </>
    default:
      return <rect x={0} y={0} width={w} height={h} rx={6} {...props} />
  }
}

let idCount = 0
const uid = () => `f${++idCount}_${Date.now()}`

export default function FlowchartTool({ lang }: { lang: Lang }) {
  const svgRef = useRef<SVGSVGElement>(null)
  const [nodes, setNodes] = useState<FlowNode[]>([])
  const [arrows, setArrows] = useState<FlowArrow[]>([])
  const [selected, setSelected] = useState<string | null>(null)
  const [tool, setTool] = useState<'select' | 'arrow'>('select')
  const [arrowFrom, setArrowFrom] = useState<string | null>(null)
  const [dragging, setDragging] = useState<{ id: string; ox: number; oy: number } | null>(null)
  const [editLabel, setEditLabel] = useState<{ id: string; isArrow: boolean } | null>(null)
  const [labelVal, setLabelVal] = useState('')
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 40, y: 40 })
  const [isPanning, setIsPanning] = useState(false)
  const panStart = useRef({ px: 0, py: 0 })

  const addNode = (type: ShapeType, label: string) => {
    const sz = DEFAULT_SIZE[type]
    setNodes(p => [...p, {
      id: uid(), type,
      x: 80 + Math.random() * 300,
      y: 80 + Math.random() * 200,
      label,
      ...sz,
    }])
  }

  const onNodeMouseDown = (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    if (tool === 'arrow') {
      if (!arrowFrom) { setArrowFrom(id) }
      else if (arrowFrom !== id) {
        setArrows(p => [...p, { id: uid(), from: arrowFrom, to: id, label: '' }])
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
    if (e.altKey) {
      setIsPanning(true)
      panStart.current = { px: e.clientX - pan.x, py: e.clientY - pan.y }
    } else { setSelected(null); setArrowFrom(null) }
  }

  const getCenter = (id: string) => {
    const n = nodes.find(n => n.id === id)
    if (!n) return { x: 0, y: 0 }
    return { x: n.x + n.w / 2, y: n.y + n.h / 2 }
  }

  const exportPNG = async () => {
    const svg = svgRef.current; if (!svg) return
    const s = new XMLSerializer()
    const svgStr = s.serializeToString(svg)
    const img = new Image()
    const blob = new Blob([svgStr], { type: 'image/svg+xml' })
    const url = URL.createObjectURL(blob)
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = svg.clientWidth * 2; canvas.height = svg.clientHeight * 2
      const ctx = canvas.getContext('2d')!
      ctx.scale(2, 2); ctx.drawImage(img, 0, 0)
      canvas.toBlob(b => {
        const a = document.createElement('a'); a.href = URL.createObjectURL(b!); a.download = 'flowchart.png'; a.click()
      })
      URL.revokeObjectURL(url)
    }
    img.src = url
  }

  const startEdit = (id: string, isArrow: boolean, current: string) => {
    setEditLabel({ id, isArrow }); setLabelVal(current)
  }

  const submitLabel = () => {
    if (!editLabel) return
    if (editLabel.isArrow) setArrows(p => p.map(a => a.id === editLabel.id ? { ...a, label: labelVal } : a))
    else setNodes(p => p.map(n => n.id === editLabel.id ? { ...n, label: labelVal } : n))
    setEditLabel(null)
  }

  const deleteSelected = () => {
    if (!selected) return
    setNodes(p => p.filter(n => n.id !== selected))
    setArrows(p => p.filter(a => a.from !== selected && a.to !== selected))
    setSelected(null)
  }

  return (
    <div className="min-h-screen pt-20 flex flex-col">
      {/* Toolbar */}
      <div className="border-b border-[var(--hairline)] bg-[var(--surface-card)] px-4 py-3 flex items-center gap-3 flex-wrap">
        <span className="flex items-center gap-2 text-sm font-semibold text-[var(--ink)] mr-2">
          <GitBranch size={16} className="text-[var(--m-blue-light)]" />
          {lang === 'id' ? 'Flowchart Builder' : 'Flowchart Builder'}
        </span>
        <div className="w-px h-5 bg-[var(--hairline)]" />

        {[{ id: 'select', icon: MousePointer, label: lang === 'id' ? 'Pilih' : 'Select' },
          { id: 'arrow', icon: ArrowIcon, label: lang === 'id' ? 'Panah' : 'Arrow' }].map(t => (
          <button key={t.id} onClick={() => setTool(t.id as any)}
            className={cn('flex items-center gap-1.5 px-3 py-1.5 rounded-none text-xs font-medium transition-all', tool === t.id ? 'bg-[rgba(28,105,212,0.08)] text-[var(--m-blue-light)] border border-[rgba(28,105,212,0.30)]' : 'text-[var(--muted)] hover:text-[var(--ink)] hover:bg-[var(--surface-soft)]')}>
            <t.icon size={13} />{t.label}
          </button>
        ))}

        <div className="w-px h-5 bg-[var(--hairline)]" />
        <button onClick={() => setZoom(z => Math.min(z + 0.15, 2))} className="p-1.5 rounded-none text-[var(--muted)] hover:bg-[var(--surface-soft)]"><ZoomIn size={14} /></button>
        <span className="text-xs font-mono text-[var(--muted)] w-10 text-center">{Math.round(zoom * 100)}%</span>
        <button onClick={() => setZoom(z => Math.max(z - 0.15, 0.3))} className="p-1.5 rounded-none text-[var(--muted)] hover:bg-[var(--surface-soft)]"><ZoomOut size={14} /></button>
        <button onClick={() => { setZoom(1); setPan({ x: 40, y: 40 }) }} className="p-1.5 rounded-none text-[var(--muted)] hover:bg-[var(--surface-soft)]"><Maximize2 size={14} /></button>

        <div className="w-px h-5 bg-[var(--hairline)]" />
        {selected && <button onClick={deleteSelected} className="flex items-center gap-1.5 px-3 py-1.5 rounded-none text-xs text-red-500 hover:bg-red-500/10"><Trash2 size={13} />{lang === 'id' ? 'Hapus' : 'Delete'}</button>}

        <div className="flex items-center gap-2 ml-auto">
          <button onClick={exportPNG} className="btn-gold text-xs flex items-center gap-1.5 px-3 py-1.5">
            <Download size={12} />PNG
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="w-52 flex-shrink-0 border-r border-[var(--hairline)] bg-[var(--surface-card)] overflow-y-auto">
          <div className="p-3">
            <p className="text-[10px] font-mono font-bold uppercase tracking-widest text-[var(--muted)] mb-3">
              {lang === 'id' ? 'Simbol Flowchart' : 'Flowchart Symbols'}
            </p>
            <div className="space-y-1">
              {SHAPES.map(shape => (
                <button
                  key={shape.type}
                  onClick={() => addNode(shape.type, shape.label[lang])}
                  className="w-full flex items-start gap-2.5 px-2 py-2 rounded-none text-left hover:bg-[var(--surface-soft)] transition-all group"
                >
                  <div className="flex-shrink-0 mt-0.5">
                    <MiniShape type={shape.type} />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-[var(--body)] group-hover:text-[var(--ink)]">{shape.label[lang]}</p>
                    <p className="text-[10px] text-[var(--muted)]">{shape.desc[lang]}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Canvas */}
        <div className="flex-1 relative overflow-hidden bg-[var(--surface-soft)]"
          style={{ backgroundImage: 'radial-gradient(var(--hairline) 1px, transparent 1px)', backgroundSize: '20px 20px' }}>

          {tool === 'arrow' && (
            <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10 bg-[rgba(28,105,212,0.08)] border border-[rgba(28,105,212,0.30)] text-[var(--m-blue-light)] text-xs font-medium px-3 py-1.5 rounded-none">
              {arrowFrom ? (lang === 'id' ? 'Klik node tujuan' : 'Click target node') : (lang === 'id' ? 'Klik node asal' : 'Click source node')}
            </div>
          )}

          {nodes.length === 0 && (
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
              <GitBranch size={40} className="text-[var(--hairline)] mb-3" />
              <p className="text-sm font-medium text-[var(--muted)]">
                {lang === 'id' ? 'Klik simbol di sidebar untuk menambahkan' : 'Click a symbol in the sidebar to add it'}
              </p>
              <p className="text-xs text-[var(--hairline)] mt-1">
                {lang === 'id' ? 'Double-click node untuk edit label' : 'Double-click node to edit label'}
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
              <marker id="fc-arrow" markerWidth="9" markerHeight="9" refX="7" refY="3.5" orient="auto">
                <polygon points="0 0, 9 3.5, 0 7" fill={GOLD} />
              </marker>
              <marker id="fc-arrow-sel" markerWidth="9" markerHeight="9" refX="7" refY="3.5" orient="auto">
                <polygon points="0 0, 9 3.5, 0 7" fill="#f59e0b" />
              </marker>
            </defs>

            <g transform={`translate(${pan.x},${pan.y}) scale(${zoom})`}>
              {arrows.map(arrow => {
                const from = getCenter(arrow.from)
                const to   = getCenter(arrow.to)
                const mx   = (from.x + to.x) / 2
                const my   = (from.y + to.y) / 2
                const isSel = selected === arrow.id
                return (
                  <g key={arrow.id} onClick={() => setSelected(arrow.id)} className="cursor-pointer">
                    <line
                      x1={from.x} y1={from.y} x2={to.x} y2={to.y}
                      stroke={isSel ? '#f59e0b' : GOLD} strokeWidth={isSel ? 2.5 : 1.8}
                      markerEnd={`url(#${isSel ? 'fc-arrow-sel' : 'fc-arrow'})`}
                    />
                    <line x1={from.x} y1={from.y} x2={to.x} y2={to.y} stroke="transparent" strokeWidth={12} />
                    {arrow.label && (
                      <text x={mx} y={my - 6} textAnchor="middle" fontSize={11} fill="var(--body)" fontFamily="var(--font-body)">
                        {arrow.label}
                      </text>
                    )}
                    <circle cx={mx} cy={my} r={5} fill="rgba(28,105,212,0.08)" stroke="rgba(28,105,212,0.30)" strokeWidth={1}
                      className="opacity-0 hover:opacity-100 cursor-pointer transition-opacity"
                      onClick={() => startEdit(arrow.id, true, arrow.label)} />
                  </g>
                )
              })}

              {nodes.map(node => {
                const isSel = selected === node.id
                const isArrowSrc = arrowFrom === node.id
                const cy = node.type === 'decision' ? node.h / 2 + 3 : (node.type === 'database' ? node.h / 2 + 8 : node.h / 2 + 5)
                const shortLabel = node.label.length > 16 ? node.label.slice(0, 15) + '…' : node.label
                return (
                  <g key={node.id} transform={`translate(${node.x},${node.y})`}
                    onMouseDown={e => onNodeMouseDown(e, node.id)}
                    onDoubleClick={() => startEdit(node.id, false, node.label)}
                    className="cursor-pointer"
                    style={{ filter: isArrowSrc ? 'drop-shadow(0 0 6px #d4a017)' : undefined }}
                  >
                    {renderShape(node, isSel)}
                    <text
                      x={node.w / 2} y={cy}
                      textAnchor="middle" dominantBaseline="middle"
                      fontSize={12} fontWeight="500"
                      fill={isSel ? GOLD_DARK : 'var(--ink)'}
                      fontFamily="var(--font-body)"
                    >
                      {shortLabel}
                    </text>
                  </g>
                )
              })}
            </g>
          </svg>

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
                />
                <div className="flex gap-2 justify-end">
                  <button onClick={() => setEditLabel(null)} className="px-3 py-1.5 text-xs text-[var(--muted)] border border-[var(--hairline)] rounded-none">
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

function MiniShape({ type }: { type: ShapeType }) {
  const w = 30, h = 20
  const props = { fill: 'rgba(28,105,212,0.08)', stroke: 'var(--m-blue-light)', strokeWidth: 1.2 }
  switch (type) {
    case 'terminal':    return <svg width={w} height={h}><rect x={0} y={2} width={w} height={h - 4} rx={8} {...props} /></svg>
    case 'process':     return <svg width={w} height={h}><rect x={0} y={2} width={w} height={h - 4} rx={3} {...props} /></svg>
    case 'decision':    return <svg width={w} height={h}><polygon points={`${w/2},0 ${w},${h/2} ${w/2},${h} 0,${h/2}`} {...props} /></svg>
    case 'io':          return <svg width={w} height={h}><polygon points={`5,0 ${w},0 ${w-5},${h} 0,${h}`} {...props} /></svg>
    case 'predefined':  return <svg width={w} height={h}><rect x={0} y={2} width={w} height={h - 4} rx={2} {...props} /><line x1={5} y1={2} x2={5} y2={h - 2} stroke="var(--m-blue-light)" strokeWidth={1.2} /><line x1={w-5} y1={2} x2={w-5} y2={h - 2} stroke="var(--m-blue-light)" strokeWidth={1.2} /></svg>
    case 'connector':   return <svg width={h} height={h}><circle cx={h/2} cy={h/2} r={h/2 - 1} {...props} /></svg>
    case 'database':    return <svg width={w} height={h}><ellipse cx={w/2} cy={4} rx={w/2} ry={3} {...props} /><rect x={0} y={4} width={w} height={h - 8} fill="rgba(28,105,212,0.08)" stroke="var(--m-blue-light)" strokeWidth={1.2} /><ellipse cx={w/2} cy={h - 4} rx={w/2} ry={3} {...props} /></svg>
    case 'document':    return <svg width={w} height={h}><path d={`M0,0 H${w} V${h-4} Q${w*0.7},${h+3} ${w/2},${h-4} Q${w*0.3},${h-8} 0,${h-4} Z`} {...props} /></svg>
    case 'manual':      return <svg width={w} height={h}><polygon points={`6,0 ${w},0 ${w-6},${h} 0,${h}`} {...props} /></svg>
    case 'delay':       return <svg width={w} height={h}><path d={`M0,0 H${w-8} A${8},${h/2} 0 0 1 ${w-8},${h} H0 Z`} {...props} /></svg>
    case 'display':     return <svg width={w} height={h}><path d={`M8,0 H${w-5} Q${w+3},${h/2} ${w-5},${h} H8 L0,${h/2} Z`} {...props} /></svg>
    case 'annotation':  return <svg width={w} height={h}><path d={`M8,2 H2 V${h-2} H8`} fill="none" stroke="var(--m-blue-light)" strokeWidth={1.2} /><rect x={8} y={2} width={w-8} height={h - 4} rx={2} fill="rgba(28,105,212,0.08)" stroke="none" /></svg>
    default:            return <svg width={w} height={h}><rect x={0} y={2} width={w} height={h - 4} rx={3} {...props} /></svg>
  }
}
