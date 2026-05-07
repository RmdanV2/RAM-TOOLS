export default function Footer() {
  return (
    <footer style={{ background: 'var(--canvas)', borderTop: '1px solid var(--hairline)', padding: '64px 0 32px' }}>
      <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
        {/* M stripe */}
        <div className="m-stripe mb-12" />

        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          {/* Brand col */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-6 overflow-hidden">
                <div style={{ width: 7, background: 'var(--m-blue-light)' }} />
                <div style={{ width: 7, background: 'var(--m-blue-dark)' }} />
                <div style={{ width: 7, background: 'var(--m-red)' }} />
              </div>
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--ink)' }}>
                RAM<span style={{ color: 'var(--m-blue-light)' }}>M</span>
              </span>
            </div>
            <p style={{ fontSize: 14, fontWeight: 300, color: 'var(--muted)', lineHeight: 1.6, maxWidth: 320 }}>
              Platform dokumentasi IT profesional. Dirancang untuk kecepatan, presisi, dan efisiensi tingkat enterprise.
            </p>
          </div>

          {/* Tools */}
          <div>
            <p className="label-uppercase mb-4" style={{ color: 'var(--muted)' }}>TOOLS</p>
            {['PRD Generator', 'System Diagram', 'Flowchart Builder', 'Documentation'].map(t => (
              <p key={t} style={{ fontSize: 13, fontWeight: 300, color: 'var(--body)', marginBottom: 8 }}>{t}</p>
            ))}
          </div>

          {/* Info */}
          <div>
            <p className="label-uppercase mb-4" style={{ color: 'var(--muted)' }}>INFO</p>
            {['Changelog', 'API Reference', 'GitHub'].map(t => (
              <p key={t} style={{ fontSize: 13, fontWeight: 300, color: 'var(--body)', marginBottom: 8 }}>{t}</p>
            ))}
          </div>
        </div>

        <div className="divider" style={{ margin: 0, marginBottom: 24 }} />
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <p style={{ fontSize: 12, color: 'var(--muted)', letterSpacing: '0.5px' }}>
            © {new Date().getFullYear()} RAM TOOLS. ALL RIGHTS RESERVED.
          </p>
          <p style={{ fontSize: 12, color: 'var(--muted)', letterSpacing: '0.5px' }}>
            ENGINEERED BY <span style={{ color: 'var(--ink)', fontWeight: 700 }}>RAMDAN</span>
          </p>
        </div>
      </div>
    </footer>
  )
}
