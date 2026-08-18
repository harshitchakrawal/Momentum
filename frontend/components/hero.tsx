'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'
// import DashboardPreview from '@/components/dashboard-preview'

export default function Hero() {
  return (
    <section className="relative min-h-screen overflow-hidden bg-[#0a0a0a]">
      {/* Background photo — `fill` needs the section to be positioned, which it is. */}
      <Image
        src="/background.png"
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover object-center"
      />

      {/* Scrim: the monitor in the middle of the photo is the brightest area,
          so the copy needs a wash behind it to stay readable. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a]/75 via-[#0a0a0a]/55 to-[#0a0a0a]"
      />

      <div className="relative z-10 mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center px-6 text-center">
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.0, ease: 'easeOut', delay: 0.1 }}
          className="text-[clamp(2.75rem,6.5vw,4.75rem)] font-normal leading-[1.05] tracking-normal text-white"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          track your code
          <br />
          own your code
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.0, ease: 'easeOut', delay: 0.25 }}
          className="mt-6 max-w-xl text-[17px] leading-relaxed text-[#b8b8b8]"
        >
          Your commits, your hours, your streaks — all in one place. Stop guessing
          how productive you are. Start proving it.
        </motion.p>
      </div>
    </section>
  )
}
