"use client";

import { useMemo, useRef, useState } from "react";
import type { DailyViewPoint } from "@/lib/data";

const WIDTH = 720;
const HEIGHT = 220;
const PAD_LEFT = 36;
const PAD_RIGHT = 12;
const PAD_TOP = 16;
const PAD_BOTTOM = 28;

export function DailyViewsChart({ data }: { data: DailyViewPoint[] }) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const { points, path, areaPath, yTicks } = useMemo(() => {
    const innerWidth = WIDTH - PAD_LEFT - PAD_RIGHT;
    const innerHeight = HEIGHT - PAD_TOP - PAD_BOTTOM;
    const max = Math.max(1, ...data.map((d) => d.count));
    const niceMax = Math.ceil(max / 5) * 5 || 5;

    const pts = data.map((d, i) => {
      const x = PAD_LEFT + (data.length === 1 ? innerWidth / 2 : (i / (data.length - 1)) * innerWidth);
      const y = PAD_TOP + innerHeight - (d.count / niceMax) * innerHeight;
      return { x, y, ...d };
    });

    const linePath = pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" ");
    const baseline = PAD_TOP + innerHeight;
    const area =
      pts.length > 0
        ? `M ${pts[0].x.toFixed(1)} ${baseline} ` +
          pts.map((p) => `L ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" ") +
          ` L ${pts[pts.length - 1].x.toFixed(1)} ${baseline} Z`
        : "";

    const ticks = [0, 0.5, 1].map((f) => ({
      value: Math.round(niceMax * f),
      y: PAD_TOP + innerHeight - f * innerHeight,
    }));

    return { points: pts, path: linePath, areaPath: area, yTicks: ticks };
  }, [data]);

  const handleMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!svgRef.current || points.length === 0) return;
    const rect = svgRef.current.getBoundingClientRect();
    const scaleX = WIDTH / rect.width;
    const localX = (e.clientX - rect.left) * scaleX;
    let nearest = 0;
    let nearestDist = Infinity;
    points.forEach((p, i) => {
      const dist = Math.abs(p.x - localX);
      if (dist < nearestDist) {
        nearestDist = dist;
        nearest = i;
      }
    });
    setHoverIndex(nearest);
  };

  const hovered = hoverIndex != null ? points[hoverIndex] : null;
  const formatDate = (iso: string) =>
    new Date(iso + "T00:00:00").toLocaleDateString("en-PH", { month: "short", day: "numeric" });

  const labelEvery = Math.ceil(points.length / 6);

  return (
    <div className="relative">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="w-full touch-none"
        role="img"
        aria-label="Daily views for the last 30 days"
        onPointerMove={handleMove}
        onPointerLeave={() => setHoverIndex(null)}
      >
        {yTicks.map((t) => (
          <g key={t.value}>
            <line
              x1={PAD_LEFT}
              x2={WIDTH - PAD_RIGHT}
              y1={t.y}
              y2={t.y}
              stroke="var(--border)"
              strokeWidth={1}
              shapeRendering="crispEdges"
            />
            <text x={PAD_LEFT - 8} y={t.y} textAnchor="end" dominantBaseline="middle" className="fill-foreground/40 text-[9px]">
              {t.value.toLocaleString("en-PH")}
            </text>
          </g>
        ))}

        {points.map((p, i) =>
          i % labelEvery === 0 || i === points.length - 1 ? (
            <text key={p.date} x={p.x} y={HEIGHT - 8} textAnchor="middle" className="fill-foreground/40 text-[9px]">
              {formatDate(p.date)}
            </text>
          ) : null
        )}

        {areaPath && <path d={areaPath} fill="var(--accent)" opacity={0.1} />}
        {path && <path d={path} fill="none" stroke="var(--accent)" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />}

        {hovered && (
          <line
            x1={hovered.x}
            x2={hovered.x}
            y1={PAD_TOP}
            y2={HEIGHT - PAD_BOTTOM}
            stroke="var(--accent)"
            strokeWidth={1}
            strokeDasharray="3 3"
            opacity={0.5}
          />
        )}

        {points.length > 0 && (
          <>
            <circle cx={points[points.length - 1].x} cy={points[points.length - 1].y} r={4} fill="var(--accent)" stroke="var(--card, #fff)" strokeWidth={2} />
            {hovered && hoverIndex !== points.length - 1 && (
              <circle cx={hovered.x} cy={hovered.y} r={4} fill="var(--accent)" stroke="var(--card, #fff)" strokeWidth={2} />
            )}
          </>
        )}
      </svg>

      {hovered && (
        <div
          className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full rounded-lg border border-border bg-white px-3 py-2 text-xs shadow-md"
          style={{
            left: `${(hovered.x / WIDTH) * 100}%`,
            top: `${(hovered.y / HEIGHT) * 100 - 4}%`,
          }}
        >
          <p className="font-semibold text-foreground">{hovered.count.toLocaleString("en-PH")} views</p>
          <p className="text-foreground/50">{formatDate(hovered.date)}</p>
        </div>
      )}

      <table className="sr-only">
        <caption>Daily views, last 30 days</caption>
        <thead>
          <tr>
            <th>Date</th>
            <th>Views</th>
          </tr>
        </thead>
        <tbody>
          {data.map((d) => (
            <tr key={d.date}>
              <td>{d.date}</td>
              <td>{d.count}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
