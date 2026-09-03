const VARIANTS = [
  {
    main: 'M2.5 5.6C24 2.9 58 3.9 92 2.6C102 2.8 110 3.7 117.5 5',
    echo: 'M9 8.4C33 7 68 7.6 101 6.6',
  },
  {
    main: 'M2 4.4C26 3.2 62 2.4 96 3.4C104 3.7 111 4.6 118 5.8',
    echo: 'M7 7.6C36 6.3 72 6.9 104 7.5',
  },
  {
    main: 'M3 5.2C28 2.5 64 3.6 94 2.2C104 2.7 111 3.5 117 4.6',
    echo: 'M10 8.1C34 7.5 70 6.8 100 7.9',
  },
] as const

export default function MarkerUnderline({
  className = '',
  variant = 0,
}: {
  className?: string
  variant?: number
}) {
  const { main, echo } = VARIANTS[variant % VARIANTS.length]

  return (
    <svg
      viewBox="0 0 120 10"
      preserveAspectRatio="none"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      aria-hidden="true"
      className={className}
    >
      <path d={main} strokeWidth="3.2" vectorEffect="non-scaling-stroke" />
      <path
        d={echo}
        strokeWidth="1.8"
        strokeOpacity="0.55"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  )
}
