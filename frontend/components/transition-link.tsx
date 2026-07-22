'use client'

import { usePageTransition } from './transition-provider'

interface Props {
  href: string
  className?: string
  children: React.ReactNode
}

export default function TransitionLink({ href, className, children }: Props) {
  const { navigate } = usePageTransition()

  return (
    <a
      href={href}
      className={className}
      onClick={(e) => {
        e.preventDefault()
        navigate(href)
      }}
    >
      {children}
    </a>
  )
}
