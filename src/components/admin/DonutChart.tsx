const COLORS = ["var(--accent)", "#2563eb", "#059669", "#d97706", "#7c3aed", "#db2777"];

export interface DonutSlice {
  label: string;
  count: number;
}

export function DonutChart({ data }: { data: DonutSlice[] }) {
  const total = data.reduce((sum, d) => sum + d.count, 0);
  const size = 160;
  const strokeWidth = 22;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  if (total === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-6 text-center">
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="var(--muted)"
            strokeWidth={strokeWidth}
          />
        </svg>
        <p className="text-sm text-foreground/50">No data yet.</p>
      </div>
    );
  }

  const dashes = data.map((d) => (d.count / total) * circumference);
  const segments = data.map((d, i) => {
    const dash = dashes[i];
    const offset = dashes.slice(0, i).reduce((sum, x) => sum + x, 0);
    return {
      ...d,
      color: COLORS[i % COLORS.length],
      dashArray: `${dash} ${circumference - dash}`,
      dashOffset: -offset,
    };
  });

  return (
    <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-center sm:justify-center">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="shrink-0 -rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="var(--muted)" strokeWidth={strokeWidth} />
        {segments.map((s) => (
          <circle
            key={s.label}
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={s.color}
            strokeWidth={strokeWidth}
            strokeDasharray={s.dashArray}
            strokeDashoffset={s.dashOffset}
            strokeLinecap="butt"
          />
        ))}
      </svg>
      <ul className="flex w-full flex-col gap-2 sm:w-auto">
        {segments.map((s) => (
          <li key={s.label} className="flex items-center gap-2 text-xs text-foreground/70">
            <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: s.color }} />
            <span className="flex-1 truncate">{s.label}</span>
            <span className="font-medium text-foreground">{s.count}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
