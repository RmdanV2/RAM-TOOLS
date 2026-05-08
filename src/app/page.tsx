'use client'
import { useState } from 'react'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import HomePage from '@/components/tools/HomePage'
import PRDTool from '@/components/tools/PRDTool'
import DiagramTool from '@/components/tools/DiagramTool'
import FlowchartTool from '@/components/tools/FlowchartTool'
import DocsPage from '@/components/tools/DocsPage'
import CVGenerator from '@/components/tools/CVGenerator'
import type { Lang } from '@/lib/i18n'

type Tool = 'home' | 'prd' | 'diagram' | 'flowchart' | 'docs' | 'cv'

export default function App() {
  const [lang, setLang] = useState<Lang>('id')
  const [activeTool, setActiveTool] = useState<Tool>('home')

  const handleToolChange = (tool: string) => {
    setActiveTool(tool as Tool)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar lang={lang} onLangChange={setLang} activeTool={activeTool} onToolChange={handleToolChange} />

      <main className="flex-1">
        {activeTool === 'home'      && <HomePage lang={lang} onToolChange={handleToolChange} />}
        {activeTool === 'prd'       && <PRDTool lang={lang} />}
        {activeTool === 'diagram'   && <DiagramTool lang={lang} />}
        {activeTool === 'flowchart' && <FlowchartTool lang={lang} />}
        {activeTool === 'docs'      && <DocsPage lang={lang} />}
        {activeTool === 'cv'        && <CVGenerator lang={lang} />}
      </main>

      {(activeTool === 'home' || activeTool === 'docs') && <Footer />}
    </div>
  )
}
