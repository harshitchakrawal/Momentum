'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  GithubIcon,
  WakaTimeIcon,
  NotionIcon,
  VercelIcon,
  JiraIcon,
  ZoomIcon,
  TasksIcon,
  CalendarIcon,
  MeetIcon,
} from '@/components/brand-icons'

/* ─── Layout data ──────────────────────────────────────────────────────────
   Left rail sits at 8%–17%, right rail at 73%–81% — tucked close to the copy
   without touching it. Nothing sits below the text: the vertical spread runs
   down both flanks instead. `delay` alternates sides so they emerge in turn.
   ────────────────────────────────────────────────────────────────────────── */

// Every card is the same size — change it here and all nine follow.
const CARD_SIZE = 'h-16 w-16 md:h-20 md:w-20'

type Tool = {
  name: string
  Icon: () => React.JSX.Element
  left: string
  top: string
  rotate: number
  delay: number
  float: number
}

const TOOLS: Tool[] = [
  // Left rail — hugging the copy
  { name: 'GitHub',   Icon: GithubIcon,   left: '27%', top: '17%', rotate: -7, delay: 0.05, float: 14 },
  { name: 'Notion',   Icon: NotionIcon,   left: '19%', top: '28%', rotate: 6,  delay: 0.17, float: 10 },
  { name: 'Calendar', Icon: CalendarIcon, left: '27%', top: '51%', rotate: 5,  delay: 0.29, float: 16 },
  { name: 'Tasks',    Icon: TasksIcon,    left: '31%', top: '69%', rotate: -6, delay: 0.41, float: 11 },
  { name: 'WakaTime', Icon: WakaTimeIcon, left: '18%', top: '79%', rotate: 8,  delay: 0.53, float: 9  },

  // Right rail — mirrored to match
  { name: 'Jira',     Icon: JiraIcon,     left: '69%', top: '15%', rotate: 6,  delay: 0.11, float: 12 },
  { name: 'Vercel',   Icon: VercelIcon,   left: '72%', top: '35%', rotate: -5, delay: 0.23, float: 15 },
  { name: 'Meet',     Icon: MeetIcon,     left: '68%', top: '55%', rotate: -5, delay: 0.35, float: 13 },
  { name: 'Zoom',     Icon: ZoomIcon,     left: '74%', top: '75%', rotate: 7,  delay: 0.47, float: 10 },
]

/* ─── Section ──────────────────────────────────────────────────────────────── */

export default function Features() {
  return (
    <section
      id="features"
      className="relative min-h-screen overflow-hidden border-t border-line px-6 py-24 md:px-30"
    >
      {/* Faint grid, echoing the kinetic grid in the CTA */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            'linear-gradient(to right, var(--line-strong) 1px, transparent 1px), linear-gradient(to bottom, var(--line-strong) 1px, transparent 1px)',
          backgroundSize: '88px 88px',
          maskImage: 'radial-gradient(ellipse 75% 60% at 50% 50%, #000 40%, transparent 100%)',
          WebkitMaskImage: 'radial-gradient(ellipse 75% 60% at 50% 50%, #000 40%, transparent 100%)',
        }}
      />

      {/* Floating tool cards — desktop only, they'd crowd the copy on mobile */}
      {TOOLS.map((tool) => (
        <motion.div
          key={tool.name}
          // Starts stacked behind the headline (z-10 sits under the z-20 copy),
          // then travels out to its rail position as it scales up.
          initial={{
            opacity: 0,
            scale: 0.25,
            left: '50%',
            top: '46%',
            x: '-50%',
            y: '-50%',
            rotate: 0,
          }}
          whileInView={{
            opacity: 1,
            scale: 1,
            left: tool.left,
            top: tool.top,
            x: '0%',
            y: '0%',
            rotate: tool.rotate,
          }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{
            duration: 1,
            ease: [0.22, 1, 0.36, 1],
            delay: tool.delay,
            // Fade in slightly late so they read as emerging, not sliding.
            opacity: { duration: 0.45, delay: tool.delay + 0.15 },
          }}
          className="absolute z-10 hidden md:block"
        >
          {/* Separate element so the endless float doesn't fight the entrance */}
          <motion.div
            animate={{ y: [0, -tool.float, 0] }}
            transition={{
              duration: 5 + tool.float / 6,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: tool.delay,
            }}
            className="flex flex-col items-center gap-2.5"
          >
            <div
              className={`${CARD_SIZE} flex items-center justify-center rounded-2xl border border-line-strong bg-raised p-4 text-ink shadow-[0_18px_50px_rgba(0,0,0,0.65)]`}
            >
              <tool.Icon />
            </div>
            <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-3">
              {tool.name}
            </span>
          </motion.div>
        </motion.div>
      ))}

      {/* Centre column */}
      <div className="relative z-20 mx-auto flex min-h-[70vh] max-w-3xl flex-col items-center justify-center text-center">
        <motion.span
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="font-mono text-[11px] uppercase tracking-[0.22em] text-ink-3"
        >
          One timeline for your
        </motion.span>

        <h2
          className="mt-5 flex flex-col items-center gap-1 text-[clamp(2.6rem,7vw,5.5rem)] leading-[0.98] tracking-[-0.01em] text-ink"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          {['Developers', 'Focus'].map((word, i) => (
            <motion.span
              key={word}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.1 + i * 0.12 }}
            >
              {word}
            </motion.span>
          ))}

          <motion.span
            initial={{ opacity: 0, y: 30, scale: 0.94 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.34 }}
            className="mt-1 rounded-xl bg-invert px-5 pb-2 pt-1 text-invert-ink"
          >
            Momentum
          </motion.span>
        </h2>

        <motion.p
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.7, ease: 'easeOut', delay: 0.46 }}
          className="mt-8 max-w-md text-base leading-relaxed text-ink-3"
        >
          Momentum pulls GitHub, Jira, Meet, Calendar and WakaTime into one view —
          so you can see where your week actually went.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.7, ease: 'easeOut', delay: 0.56 }}
          className="mt-10"
        >
          <Link
            href="/signup"
            className="font-semibold inline-flex items-center gap-2.5 rounded-full bg-invert px-6 py-3.5 font-mono text-sm uppercase tracking-[0.14em] text-invert-ink transition-colors hover:bg-invert/90"
          >
            Connect your tools
            <span aria-hidden="true" className="transition-transform group-hover:translate-x-1">
              →
            </span>
          </Link>
        </motion.div>

        {/* Mobile fallback — the floating cards are hidden below md */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.7, delay: 0.66 }}
          className="mt-14 flex flex-wrap items-center justify-center gap-4 md:hidden"
        >
          {TOOLS.map((tool) => (
            <div
              key={tool.name}
              className="flex h-14 w-14 items-center justify-center rounded-xl border border-line-strong bg-raised p-3 text-ink"
            >
              <tool.Icon />
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
