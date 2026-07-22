'use client'

import { motion } from 'framer-motion'

const BAR_H = 190
const SCALE = 130
const px = (min: number) => `${(min / SCALE) * BAR_H}px`

const activeData = [
  { d: 'Mon', active: 42, code: 42 },
  { d: 'Tue', active: 18, code: 48 },
  { d: 'Wed', active: 42, code: 48 },
  { d: 'Thu', active: 78, code: 42 },
  { d: 'Fri', active: 12, code: 72 },
  { d: 'Sat', active: 8, code: 4 },
  { d: 'Sun', active: 4, code: 2 },
]

const meetingData = [
  { d: 'Mon', meeting: 90, active: 60 },
  { d: 'Tue', meeting: 72, active: 96 },
  { d: 'Wed', meeting: 120, active: 54 },
  { d: 'Thu', meeting: 12, active: 114 },
  { d: 'Fri', meeting: 60, active: 120 },
  { d: 'Sat', meeting: 0, active: 30 },
  { d: 'Sun', meeting: 0, active: 0 },
]

function Stat({ label, value, note }: { label: string; value: string; note: string }) {
  return (
    <div className="px-6 first:pl-0">
      <p className="mb-2 text-[13px] font-medium text-[#888]">{label}</p>
      <p className="flex items-baseline gap-2">
        <span className="text-3xl font-bold text-white">{value}</span>
        <span className="text-[12px] text-[#666]">{note}</span>
      </p>
    </div>
  )
}

function Legend({ items }: { items: { color: string; label: string }[] }) {
  return (
    <div className="mt-3 flex items-center gap-4 text-[11px] text-[#888]">
      {items.map((i) => (
        <span key={i.label} className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm" style={{ background: i.color }} />
          {i.label}
        </span>
      ))}
    </div>
  )
}

function YAxis() {
  return (
    <div className="flex h-[190px] flex-col justify-between pr-1 text-[10px] text-[#666]">
      <span>2h</span>
      <span>1h</span>
      <span>0</span>
    </div>
  )
}

function NavItem({ label, active = false }: { label: string; active?: boolean }) {
  return (
    <div
      className={`flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-[13px] ${
        active ? 'bg-white/[0.07] font-medium text-white' : 'text-[#888]'
      }`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${active ? 'bg-blue-400' : 'bg-[#3a3a3a]'}`} />
      {label}
    </div>
  )
}

export default function DashboardPreview() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1.1, ease: 'easeOut', delay: 0.35 }}
      className="relative mx-auto w-full max-w-[1600px]"
    >
      {/* ambient glow */}
      <div className="pointer-events-none absolute -inset-x-16 -top-16 bottom-0 bg-[radial-gradient(ellipse_at_center,rgba(59,130,246,0.16),transparent_65%)]" />

      {/* app window */}
      <div className="relative overflow-hidden rounded-xl border border-white/10 bg-[#0c0c0e] shadow-2xl shadow-black/60">
        {/* title bar */}
        <div className="flex items-center gap-2 border-b border-white/[0.06] px-4 py-3">
          <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
          <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
          <span className="h-3 w-3 rounded-full bg-[#28c840]" />
          <span className="ml-3 font-mono text-[11px] text-[#555]">momentum — dashboard</span>
        </div>

        {/* sidebar + main */}
        <div className="grid grid-cols-1 md:grid-cols-[280px_1fr]">
          <aside className="hidden flex-col gap-1 border-r border-white/[0.06] p-4 md:flex">
            <div className="mb-4 flex items-center gap-2 px-1.5">
              <span className="grid h-6 w-6 place-items-center rounded-md bg-gradient-to-br from-blue-400 to-blue-600 text-[11px] font-bold text-white">
                M
              </span>
              <span className="text-[15px] font-semibold text-white">Momentum</span>
            </div>
            <NavItem label="Dashboard" active />
            <NavItem label="Projects" />
            <NavItem label="Leaderboards" />
            <NavItem label="Goals" />
            <NavItem label="Insights" />
            <p className="mt-5 mb-1 px-2.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#555]">
              Connections
            </p>
            <div className="flex items-center justify-between px-2.5 py-1.5 text-[13px] text-[#888]">
              <span>GitHub</span>
              <span className="text-green-400">✓</span>
            </div>
            <div className="flex items-center justify-between px-2.5 py-1.5 text-[13px] text-[#888]">
              <span>WakaTime</span>
              <span className="text-green-400">✓</span>
            </div>
          </aside>

          <div className="min-w-0">
            <div className="flex items-center gap-3 border-b border-white/[0.06] px-5 py-3.5">
              <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[13px] text-[#ccc]">
                <span className="text-[#666]">‹</span>
                <svg className="h-3.5 w-3.5 text-[#888]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" />
                  <path d="M16 2v4M8 2v4M3 10h18" />
                </svg>
                <span className="font-medium">Oct 7 – Oct 13</span>
                <span className="text-[#666]">›</span>
              </div>
              <div className="rounded-lg border border-white/10 bg-white/[0.04] px-3.5 py-1.5 text-[13px] font-medium text-[#ccc]">
                This week
              </div>
            </div>

            <div className="space-y-6 p-6">
              <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-7">
                <h3 className="text-[17px] font-semibold text-white">Weekly Summary</h3>
                <p className="mt-0.5 mb-5 text-[13px] text-[#666]">Last week (Oct 7 – Oct 13)</p>
                <div className="grid grid-cols-2 gap-y-6 sm:grid-cols-4 sm:gap-y-0 sm:divide-x sm:divide-white/10">
                  <Stat label="Code Time" value="4h 24m" note="in your editor" />
                  <Stat label="Active Code Time" value="3h 56m" note="writing code" />
                  <Stat label="Coding at work" value="80%" note="of coding during work hours" />
                  <Stat label="Meeting Time" value="51m" note="in meetings" />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-7">
                  <h3 className="text-[17px] font-semibold text-white">Active Code Time</h3>
                  <p className="text-[13px] text-[#666]">How many minutes did you spend coding per day?</p>
                  <Legend items={[{ color: '#2f7bf6', label: 'Active Code Time' }, { color: '#93c5fd', label: 'Code Time' }]} />
                  <div className="mt-5 flex gap-3">
                    <YAxis />
                    <div className="flex-1">
                      <div className="flex h-[190px] items-end justify-between gap-2 border-b border-white/10">
                        {activeData.map((b) => (
                          <div key={b.d} className="flex flex-1 flex-col justify-end" style={{ height: BAR_H }}>
                            <div className="rounded-t-[2px] bg-[#93c5fd]" style={{ height: px(b.code) }} />
                            <div className="bg-[#2f7bf6]" style={{ height: px(b.active) }} />
                          </div>
                        ))}
                      </div>
                      <div className="mt-2 flex justify-between gap-2 text-[10px] text-[#666]">
                        {activeData.map((b) => <span key={b.d} className="flex-1 text-center">{b.d}</span>)}
                      </div>
                    </div>
                  </div>
                  <p className="mt-4 text-[11px] leading-relaxed text-[#666]">
                    Active code time is time you spend actively editing code in your editor or IDE.{' '}
                    <span className="text-blue-400">Read more.</span>
                  </p>
                </div>

                <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-7">
                  <h3 className="text-[17px] font-semibold text-white">Meeting Time</h3>
                  <p className="text-[13px] text-[#666]">How many minutes did you spend in meetings per day?</p>
                  <Legend items={[{ color: '#4b5563', label: 'Meeting Time' }, { color: '#2f7bf6', label: 'Active Code Time' }]} />
                  <div className="mt-5 flex gap-3">
                    <YAxis />
                    <div className="flex-1">
                      <div className="flex h-[190px] items-end justify-between gap-2 border-b border-white/10">
                        {meetingData.map((b) => (
                          <div key={b.d} className="flex flex-1 items-end justify-center gap-1" style={{ height: BAR_H }}>
                            <div className="w-1/2 rounded-t-[2px] bg-[#4b5563]" style={{ height: px(b.meeting) }} />
                            <div className="w-1/2 rounded-t-[2px] bg-[#2f7bf6]" style={{ height: px(b.active) }} />
                          </div>
                        ))}
                      </div>
                      <div className="mt-2 flex justify-between gap-2 text-[10px] text-[#666]">
                        {meetingData.map((b) => <span key={b.d} className="flex-1 text-center">{b.d}</span>)}
                      </div>
                    </div>
                  </div>
                  <p className="mt-4 text-[11px] leading-relaxed text-[#666]">
                    Meetings that you accepted with more than 1 attendee.{' '}
                    <span className="text-blue-400">Read more.</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
