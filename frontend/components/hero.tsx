'use client'

import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'

/** Shared entrance: same curve as the rest of the page, staggered by index. */
const rise = (i: number) => ({
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] as const, delay: 0.08 * i },
})

export default function Hero() {
  return (
    <section className="relative min-h-screen overflow-hidden bg-page">
      {/* Two cuts of the same photo, one per theme — the dark one inverts the
          ground to black. Both are rendered and CSS picks the visible one (the
          approach next/image documents for theme detection); we key off the
          `.dark` class rather than prefers-color-scheme so it follows the
          toggle, not the OS. Neither gets a scrim or filter. */}
      <Image
        src="/hero4.png"
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover object-center dark:hidden"
      />
      <Image
        src="/darkhero5.png"
        alt=""
        fill
        priority
        sizes="100vw"
        className="hidden object-cover object-center dark:block"
      />

      {/* Copy sits in the empty band at the top of the photo — white in the
          light cut, black in the dark one — so the text just follows --ink. */}
      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-3xl flex-col items-center justify-start px-6 pt-24 text-center">
        <motion.h1
          {...rise(1)}
          className="text-[clamp(2.75rem,6.5vw,4.75rem)] font-normal leading-[0.90] mt-5 tracking-normal text-ink"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          track your code
          <br />
          own your code
        </motion.h1>

        <motion.p
          {...rise(2)}
          className="mt-2 max-w-xl text-[17px] leading-relaxed text-ink-2"
        >
          Your commits, your hours, your streaks — all in one place. Stop guessing
          how productive you are. Start proving it.
        </motion.p>

        <motion.div
          {...rise(3)}
          className="mt-5 flex flex-wrap items-center justify-center gap-3"
        >
          <Link
            href="/signup"
            className="rounded-full bg-invert px-6 py-3.5 text-sm font-semibold text-invert-ink transition-colors hover:bg-invert/90"
          >
            Start tracking free
          </Link>
          <Link
            href="#features"
            className="rounded-full border border-ink/20 px-6 py-3.5 text-sm font-medium text-ink transition-colors hover:bg-ink/5"
          >
            See how it works
          </Link> 
        </motion.div>
      </div>
    </section>
  )
}
