interface ProgressRingProps {
  percent: number;
  size?: number;
  stroke?: number;
  className?: string;
}

export default function ProgressRing({
  percent,
  size = 32,
  stroke = 3,
  className = "",
}: ProgressRingProps) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (Math.min(percent, 100) / 100) * circ;

  return (
    <svg
      width={size}
      height={size}
      className={`progress-ring ${className}`}
      aria-label={`${percent}% complete`}
    >
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="var(--border-subtle)"
        strokeWidth={stroke}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={percent >= 100 ? "var(--ok)" : "var(--accent)"}
        strokeWidth={stroke}
        strokeDasharray={circ}
        strokeDashoffset={offset}
        strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        className="progress-ring-fill"
      />
      {percent >= 100 && (
        <text
          x="50%"
          y="50%"
          dominantBaseline="central"
          textAnchor="middle"
          className="progress-ring-check"
        >
          ✓
        </text>
      )}
    </svg>
  );
}