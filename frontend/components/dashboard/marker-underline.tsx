export default function MarkerUnderline({
  className = '',
}: {
  className?: string
}) {
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
      <path
        d="M2.5 5.6C24 2.9 58 3.9 92 2.6C102 2.8 110 3.7 117.5 5"
        strokeWidth="3.2"
        vectorEffect="non-scaling-stroke"
      />
      <path
        d="M9 8.4C33 7 68 7.6 101 6.6"
        strokeWidth="1.8"
        strokeOpacity="0.55"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  )
}
