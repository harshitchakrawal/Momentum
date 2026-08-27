'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'

export default function CtaSection() {
  return (
    <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden border-t border-line bg-page px-6 text-center">
      {/* Same faint grid as the hero, features and AI sections — static CSS,
          no canvas. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            'linear-gradient(to right, var(--line-strong) 1px, transparent 1px), linear-gradient(to bottom, var(--line-strong) 1px, transparent 1px)',
          backgroundSize: '88px 88px',
          maskImage:
            'radial-gradient(ellipse 70% 60% at 50% 50%, #000 25%, transparent 100%)',
          WebkitMaskImage:
            'radial-gradient(ellipse 70% 60% at 50% 50%, #000 25%, transparent 100%)',
        }}
      />

      <motion.h1
        initial={{ opacity: 0, y: 36 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 1.0, ease: 'easeOut' }}
        className="relative z-10 text-[clamp(2.8rem,4.5vw,6.5rem)] font-normal leading-[1] text-ink max-w-5xl"
        style={{ fontFamily: 'var(--font-display)' }}
      >
        Know where your time goes.
        <br />
        Build what matters.
      </motion.h1>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
        className="relative z-10 flex items-center gap-4 mt-12"
      >
        <Link
          href="/signup"
          className="bg-invert text-invert-ink text-sm font-semibold px-5 py-3 rounded-full hover:bg-invert/90 transition-colors"
        >
          Get started free
        </Link>
        <Link
          href="#features"
          className="text-sm text-ink-3 border border-line-strong px-5 py-3 rounded-full hover:border-ink-3 hover:text-ink-2 transition-colors"
        >
          See how it works
        </Link>
      </motion.div>
    </section>
  )
}
