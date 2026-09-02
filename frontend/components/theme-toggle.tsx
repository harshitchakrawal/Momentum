'use client'

import { useEffect, useState } from 'react'
import { MoonIcon, SunIcon } from '@radix-ui/react-icons'

type Theme = 'light' | 'dark'

function apply(theme: Theme) {
  document.documentElement.classList.toggle('dark', theme === 'dark')
  try {
    localStorage.setItem('theme', theme)
  } catch {
    // Private mode / blocked storage — the toggle still works for this visit.
  }
}

const NAV_STYLE =
  'grid h-9 w-9 shrink-0 place-items-center rounded-full text-invert-ink-2 transition-colors hover:bg-invert-ink/10 hover:text-invert-ink'

export default function ThemeToggle({ className = NAV_STYLE }: { className?: string }) {
  // Starts null so the first render matches the server HTML, which cannot know
  // the visitor's stored choice. The real value lands in the effect below.
  const [theme, setTheme] = useState<Theme | null>(null)

  useEffect(() => {
    const isDark = document.documentElement.classList.contains('dark')
    setTheme(isDark ? 'dark' : 'light')
  }, [])

  function toggle() {
    const next: Theme = theme === 'dark' ? 'light' : 'dark'
    setTheme(next)
    apply(next)
  }

  return (
    <button
      type="button"
      onClick={toggle}
      // Label is only meaningful once we know the current theme.
      aria-label={theme ? `Switch to ${theme === 'dark' ? 'light' : 'dark'} theme` : 'Switch theme'}
      className={className}
    >
      {/* Both render until the theme is known; the placeholder keeps layout stable. */}
      {theme === 'dark' ? (
        <SunIcon className="h-4 w-4" />
      ) : theme === 'light' ? (
        <MoonIcon className="h-4 w-4" />
      ) : (
        <span className="h-4 w-4" />
      )}
    </button>
  )
}
