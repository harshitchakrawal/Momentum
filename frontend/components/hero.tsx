'use client'

import { motion } from 'framer-motion'
import DashboardPreview from '@/components/dashboard-preview'

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-[#0a0a0a]">
      <div className="relative z-10 mx-auto w-full max-w-[1500px] px-6 pt-20 pb-20">

        <div
          className="relative top-0.5 -left-5 border-[#2a2a2a] px-10 py-7 mb-6 max-w-2xl"
          style={{ boxShadow: 'inset 0 0 0 4px #0a0a0a' }}
        >
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.0, ease: 'easeOut', delay: 0.1 }}
            className="text-[72px] font-normal leading-18 tracking-normal text-white"
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
            className="mt-4 text-[17px] leading-relaxed text-[#a0a0a0] max-w-2xl"
          >
            Your commits, your hours, your streaks — all in one place. Stop guessing how productive you are. Start proving it.
          </motion.p>
        </div>

        <DashboardPreview />
      </div>
    </section>
  )
}
