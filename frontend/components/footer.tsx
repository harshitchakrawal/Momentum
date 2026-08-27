import Link from 'next/link'

const columns: { heading: string; links: { label: string; href: string }[] }[] = [
  {
    heading: 'Product',
    links: [
      { label: 'Features', href: '/features' },
      { label: 'Changelog', href: '/changelog' },
      { label: 'Pricing', href: '/pricing' },
      { label: 'Roadmap', href: '#' },
    ],
  },
  {
    heading: 'Integrations',
    links: [
      { label: 'GitHub', href: '#' },
      { label: 'WakaTime', href: '#' },
      { label: 'VS Code', href: '#' },
    ],
  },
  {
    heading: 'Resources',
    links: [
      { label: 'Docs', href: '#' },
      { label: 'Guides', href: '#' },
      { label: 'Status', href: '#' },
      { label: 'Support', href: '#' },
    ],
  },
  {
    heading: 'Company',
    links: [
      { label: 'About', href: '/about' },
      { label: 'Privacy', href: '#' },
      { label: 'Terms', href: '#' },
    ],
  },
  {
    heading: 'Social',
    links: [
      { label: 'GitHub', href: '#' },
      { label: 'Twitter', href: '#' },
      { label: 'Discord', href: '#' },
    ],
  },
]

export default function Footer() {
  return (
    <footer className="bg-page px-6 md:px-20 pt-20 pb-0 overflow-hidden">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-10 mb-20">
        {columns.map((col) => (
          <div key={col.heading}>
            <p className="text-[10px] font-mono text-ink-4 uppercase tracking-[0.18em] mb-5">
              {col.heading}
            </p>
            <ul className="space-y-3.5">
              {col.links.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-ink-3 hover:text-ink-2 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Bottom — watermark + status */}
      <div className="relative flex items-end justify-between">
        <p
          className="text-[clamp(5rem,18vw,14rem)] font-bold leading-none tracking-tight text-line select-none pointer-events-none"
          style={{ fontFamily: 'var(--font-ranade)' }}
          aria-hidden
        >
          Momentum
        </p>

        <div className="absolute bottom-6 right-0 flex items-center gap-2 pb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
          <span className="text-[11px] font-mono text-ink-4">All systems operational</span>
        </div>
      </div>
    </footer>
  )
}
