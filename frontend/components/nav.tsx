'use client'

import { motion } from 'framer-motion'

import Link from 'next/link'
import TransitionLink from '@/components/transition-link'

const links = [
  { label: 'Home', href: '/' },
  { label: 'About', href: '/about' },
  { label: 'Blog', href: '#' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'Changelog', href: '/changelog' },
]

export default function Nav() {
  return (
    <motion.nav
    initial={{ opacity: 0, y: -8 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.7, ease: 'easeOut', delay: 0.05 }}
    className="flex items-center justify-between px-6 md:px-30 h-14 border-b border-[#1a1a1a] sticky top-0 z-50 bg-[#0a0a0a]">
      <Link href="/" className="text-sm font-semibold tracking-tight text-white">
        Momentum
      </Link>
      <div className="hidden md:flex items-center gap-7">
        {links.map(({ label, href }) => {
          const cls = 'text-sm text-[#555] hover:text-[#ccc] transition-colors'
          if (label === 'Home' || label === 'About') {
            return (
              <TransitionLink key={label} href={href} className={cls}>
                {label}
              </TransitionLink>
            )
          }
          return (
            <Link key={label} href={href} className={cls}>
              {label}
            </Link>
          )
        })}
      </div>
      <Link
        href="/signup"
        className="bg-white text-[#0a0a0a] text-sm font-semibold px-4 py-2 rounded-md hover:bg-[#e5e5e5] transition-colors"
      >
        Try Momentum
      </Link>
    </motion.nav>
  )
}
