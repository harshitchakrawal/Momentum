'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

import Image from 'next/image'
import Link from 'next/link'
import TransitionLink from '@/components/transition-link'
import { api } from '@/lib/api'

const links = [
  { label: 'Home', href: '/' },
  { label: 'About', href: '/about' },
  { label: 'Blog', href: '#' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'Changelog', href: '/changelog' },
]

export default function Nav() {
  // null = still checking, false = signed out, string = username.
  // Undecided renders nothing, so the CTA never flips after paint.
  const [username, setUsername] = useState<string | null | false>(null)

  useEffect(() => {
    // skipAuthRefresh: a 401 here means "not signed in", which is a normal
    // answer on a public page — it must not bounce visitors to /login.
    api.get('/auth/me/', { skipAuthRefresh: true })
      .then((res) => setUsername(res.data.username))
      .catch(() => setUsername(false))
  }, [])

  return (
    <div className="sticky top-0 z-50 px-4 pt-4 md:px-8 md:pt-6">
      <motion.nav
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: 'easeOut', delay: 0.05 }}
        className="mx-auto flex h-16 w-full max-w-5xl items-center justify-between gap-2 rounded-full bg-white pl-4 pr-2 shadow-[0_10px_40px_rgba(0,0,0,0.45)] md:h-[62px] md:pl-6 md:pr-3"
      >
        <Link href="/" aria-label="Momentum home" className="flex items-center gap-3 shrink-0">
          <Image
            src="/momentum_logo.jpg"
            alt="Momentum"
            width={40}
            height={40}
            priority
            className="h-10 w-10 rounded-full object-cover"
          />
          <span className="font-mono text-[18px] font-semibold uppercase tracking-[0.1em] text-[#0a0a0a]">
            Momentum
          </span>
        </Link>

          
        <div className="hidden md:flex items-center gap-8">
          {links.map(({ label, href }) => {
            const cls =
              'font-mono text-[15px] text-[#3d3d3d] hover:text-[#0a0a0a] transition-colors'
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

        {username ? (
          <Link
            href="/dashboard"
            title={`Signed in as ${username}`}
            className="font-mono flex shrink-0 items-center gap-2 bg-[#0a0a0a] text-white text-md font-medium px-4 md:px-5 py-2.5 rounded-full hover:bg-[#262626] transition-colors"
          >
            <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-white/15 text-[11px] font-semibold uppercase">
              {username.slice(0, 1)}
            </span>
            <span className="max-w-32 truncate">{username}</span>
          </Link>
        ) : username === false ? (
          <Link
            href="/signup"
            className="font-mono shrink-0 bg-[#0a0a0a] text-white text-md font-medium px-5 md:px-6 py-3 rounded-full hover:bg-[#262626] transition-colors"
          >
            Try Momentum
          </Link>
        ) : (
          // Placeholder while the session check is in flight, so the pill does
          // not visibly swap once the answer arrives.
          <span aria-hidden className="h-12 w-36 shrink-0 rounded-full bg-[#0a0a0a]/30" />
        )}
      </motion.nav>
    </div>
  )
}
