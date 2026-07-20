export function VerificationSeal({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 96 96"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      <circle
        cx="48"
        cy="48"
        r="44"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeDasharray="3 7"
        strokeLinecap="round"
      />
      <circle
        cx="48"
        cy="48"
        r="32"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path
        d="M34 49l10 10 19-22"
        fill="none"
        stroke="currentColor"
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
