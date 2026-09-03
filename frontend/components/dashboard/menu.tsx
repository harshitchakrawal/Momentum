'use client'

import { useEffect, useRef } from 'react'
import { CheckIcon } from '@radix-ui/react-icons'

export function useDismiss(onDismiss: () => void) {
  const ref = useRef<HTMLDivElement>(null)
  const latest = useRef(onDismiss)
  latest.current = onDismiss

  useEffect(() => {
    function onPointerDown(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        latest.current()
      }
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') latest.current()
    }

    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [])

  return ref
}

export function Popover({
  onClose,
  align = 'left',
  children,
}: {
  onClose: () => void
  align?: 'left' | 'right'
  children: React.ReactNode
}) {
  const ref = useDismiss(onClose)

  return (
    <div
      ref={ref}
      className={`absolute top-full z-20 mt-1.5 min-w-52 rounded-lg border border-line-strong bg-raised p-1 shadow-[0_16px_40px_rgba(0,0,0,0.35)] ${
        align === 'right' ? 'right-0' : 'left-0'
      }`}
    >
      {children}
    </div>
  )
}

export function MenuItem({
  onClick,
  icon,
  children,
  checked,
}: {
  onClick: () => void
  icon?: React.ReactNode
  children: React.ReactNode
  checked?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-left text-[15px] text-ink-2 transition-colors hover:bg-ink/6 hover:text-ink"
    >
      {icon && <span className="shrink-0 text-ink-3">{icon}</span>}
      <span className="min-w-0 flex-1 truncate">{children}</span>
      {checked && <CheckIcon className="h-4 w-4 shrink-0 text-ink-3" />}
    </button>
  )
}
