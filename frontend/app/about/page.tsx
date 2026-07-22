import Nav from '@/components/nav'
import Footer from '@/components/footer'
import Link from 'next/link'

const values = [
  {
    label: 'Radical Transparency',
    body: 'Every hour you code, every streak you build — made visible, not hidden behind vague summaries.',
  },
  {
    label: 'Developer-First',
    body: 'Built by developers who got tired of productivity tools that feel like surveillance. This one feels like a mirror.',
  },
  {
    label: 'Data Stays Yours',
    body: 'We don\'t sell your coding activity. We don\'t train on it. We just show it back to you.',
  },
]

const timeline = [
  { year: '2024', event: 'Got frustrated tracking WakaTime + GitHub in separate tabs. Decided to build the missing layer.' },
  { year: 'Early 2025', event: 'First version shipped. Commit graph, coding hours, streaks — all in one dashboard.' },
  { year: 'Mid 2025', event: 'Added VS Code integration and real-time sync. Crossed the first 500 users.' },
  { year: 'Now', event: 'Building toward goal tracking, team insights, and deeper IDE integrations.' },
]

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-[#0a0a0a] text-[#e5e5e5] flex flex-col">
      <Nav />

      {/* Hero */}
      <section className="mx-auto w-full max-w-[1500px] px-6 pt-24 pb-20">
        <p className="text-[10px] font-mono text-[#444] uppercase tracking-[0.18em] mb-6">
          About
        </p>
        <h1
          className="text-[64px] md:text-[80px] font-normal leading-[1.05] tracking-tight text-white max-w-3xl"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          built for people
          <br />
          who ship things
        </h1>
        <p className="mt-6 text-[17px] leading-relaxed text-[#a0a0a0] max-w-xl">
          Momentum is a developer productivity dashboard that connects your GitHub commits, WakaTime sessions, and daily coding streaks into one honest view of your work.
        </p>
      </section>

      {/* Divider */}
      <div className="border-t border-[#1a1a1a] mx-6 md:mx-20" />

      {/* Mission */}
      <section className="mx-auto w-full max-w-[1500px] px-6 py-20">
        <div className="grid md:grid-cols-2 gap-16 items-start">
          <div>
            <p className="text-[10px] font-mono text-[#444] uppercase tracking-[0.18em] mb-5">
              Mission
            </p>
            <h2
              className="text-4xl font-normal text-white leading-snug"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              make your output undeniable
            </h2>
          </div>
          <div className="space-y-5 text-[15px] leading-relaxed text-[#888]">
            <p>
              Most developers don't have a clear picture of how they spend their time — not because they're not working, but because the data is scattered across a dozen tools that don't talk to each other.
            </p>
            <p>
              Momentum pulls it all into one place. Not to judge you, not to gamify you — just to give you the clarity you need to understand your own patterns and keep moving.
            </p>
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="border-t border-[#1a1a1a] mx-6 md:mx-20" />

      {/* Values */}
      <section className="mx-auto w-full max-w-[1500px] px-6 py-20">
        <p className="text-[10px] font-mono text-[#444] uppercase tracking-[0.18em] mb-12">
          Values
        </p>
        <div className="grid md:grid-cols-3 gap-px bg-[#1a1a1a]">
          {values.map((v) => (
            <div key={v.label} className="bg-[#0a0a0a] p-8">
              <p className="text-white text-sm font-semibold mb-3">{v.label}</p>
              <p className="text-[#666] text-sm leading-relaxed">{v.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Divider */}
      <div className="border-t border-[#1a1a1a] mx-6 md:mx-20" />

      {/* Timeline */}
      <section className="mx-auto w-full max-w-[1500px] px-6 py-20">
        <p className="text-[10px] font-mono text-[#444] uppercase tracking-[0.18em] mb-12">
          Story
        </p>
        <div className="space-y-0">
          {timeline.map((item, i) => (
            <div
              key={i}
              className="grid md:grid-cols-[160px_1fr] gap-4 border-t border-[#1a1a1a] py-7"
            >
              <p className="text-[#444] font-mono text-sm pt-0.5">{item.year}</p>
              <p className="text-[#888] text-sm leading-relaxed">{item.event}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Divider */}
      <div className="border-t border-[#1a1a1a] mx-6 md:mx-20" />

      {/* CTA */}
      <section className="mx-auto w-full max-w-[1500px] px-6 py-24">
        <h2
          className="text-4xl md:text-5xl font-normal text-white leading-snug mb-8"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          ready to see your momentum?
        </h2>
        <div className="flex items-center gap-4">
          <Link
            href="/signup"
            className="bg-white text-[#0a0a0a] text-sm font-semibold px-5 py-2.5 rounded-md hover:bg-[#e5e5e5] transition-colors"
          >
            Get started free
          </Link>
          <Link
            href="/"
            className="text-sm text-[#555] hover:text-[#ccc] transition-colors"
          >
            See the product →
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  )
}
