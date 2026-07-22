'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'

export default function CtaSection() {
  return (
    <section className="flex flex-col items-center justify-center min-h-screen px-6 text-center border-t border-[#1a1a1a]">
      <motion.h1
        initial={{ opacity: 0, y: 36 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 1.0, ease: 'easeOut' }}
        className="text-[clamp(2.8rem,4.5vw,6.5rem)] font-normal leading-[1] text-white max-w-5xl"
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
        className="flex items-center gap-4 mt-12"
      >
        <Link
          href="/signup"
          className="bg-white text-[#0a0a0a] text-sm font-semibold px-5 py-3 rounded-full hover:bg-[#e5e5e5] transition-colors"
        >
          Get started free
        </Link>
        <Link
          href="#features"
          className="text-sm text-[#555] border border-[#cbcaca22] px-5 py-3 rounded-full hover:border-[#444] hover:text-[#999] transition-colors"
        >
          See how it works
        </Link>
      </motion.div>
    </section>
  )
}
