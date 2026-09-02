export default function HandCheckbox({
  checked,
  className = '',
  style,
}: {
  checked: boolean
  className?: string
  style?: React.CSSProperties
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
      style={style}
    >
      <g strokeWidth="1.7">
        <path d="M4.2 5.6C8.5 4.8 14.4 5.3 19.6 4.5" />
        <path d="M19.3 4.9C20.1 9.4 19.5 14.7 19.9 19.4" />
        <path d="M19.8 19.1C14.7 19.9 9.1 19.2 4.1 19.8" />
        <path d="M4.5 19.6C3.9 15.1 4.5 9.7 4 5.1" />
      </g>

      {checked && (
        <path
          d="M6.9 12.4C8.4 14.1 9.7 15.9 11.3 17.8C14.2 12.3 18.5 6.1 22.9 1.9"
          strokeWidth="2.4"
        />
      )}
    </svg>
  )
}
