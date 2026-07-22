'use client'

import { createContext, useCallback, useContext, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { gsap } from 'gsap'

type Ctx = { navigate: (href: string) => void }
const TransitionContext = createContext<Ctx>({ navigate: () => {} })

export function usePageTransition() {
  return useContext(TransitionContext)
}

export function TransitionProvider({ children }: { children: React.ReactNode }) {
  const overlayRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const busy = useRef(false)

  const navigate = useCallback(
    async (href: string) => {
      if (busy.current) return
      busy.current = true

      const el = overlayRef.current
      if (!el) {
        router.push(href)
        busy.current = false
        return
      }

      // Fade out current page
      await gsap.to(el, { opacity: 1, duration: 0.4, ease: 'power1.inOut' })

      router.push(href)
      await new Promise<void>((r) => setTimeout(r, 50))

      // Fade in new page
      await gsap.to(el, { opacity: 0, duration: 0.4, ease: 'power1.inOut' })

      busy.current = false
    },
    [router],
  )

  return (
    <TransitionContext.Provider value={{ navigate }}>
      {children}
      <div
        ref={overlayRef}
        aria-hidden="true"
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: '#0a0a0a',
          zIndex: 9999,
          opacity: 0,
          pointerEvents: 'none',
        }}
      />
    </TransitionContext.Provider>
  )
}
