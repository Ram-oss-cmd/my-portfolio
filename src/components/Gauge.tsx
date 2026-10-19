import type { CSSProperties } from "react";

type GaugeProps = {
  label: string;
  code?: string;
  /** 0..1 of the sweep */
  fraction: number;
  readout: string;
  unit?: string;
  status?: string;
  className?: string;
  style?: CSSProperties;
};

const CIRCUMFERENCE = 2 * Math.PI * 70;
const ARC = CIRCUMFERENCE * 0.75;

/** A 270-degree control-room gauge. Pure SVG, safe in server components. */
export function Gauge({
  label,
  code,
  fraction,
  readout,
  unit,
  status,
  className,
  style,
}: GaugeProps) {
  const clamped = Math.max(0, Math.min(1, fraction));
  const angle = -135 + clamped * 270;

  return (
    <figure className={`gauge ${className ?? ""}`} style={style}>
      <svg viewBox="0 0 200 170" role="img" aria-label={`${label}: ${readout}${unit ? ` ${unit}` : ""}`}>
        <g transform="rotate(135 100 100)">
          <circle
            cx="100"
            cy="100"
            r="70"
            fill="none"
            stroke="var(--line-strong)"
            strokeWidth="1.5"
            strokeDasharray={`${ARC} ${CIRCUMFERENCE}`}
          />
          <circle
            cx="100"
            cy="100"
            r="70"
            fill="none"
            stroke="var(--cyan)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray={`${ARC * clamped} ${CIRCUMFERENCE}`}
            className="gauge__arc"
          />
        </g>
        <g className="gauge__ticks" aria-hidden="true">
          {Array.from({ length: 19 }, (_, index) => {
            const tickAngle = -135 + (index / 18) * 270;
            const major = index % 3 === 0;
            return (
              <line
                key={index}
                x1="100"
                y1={major ? 24 : 27}
                x2="100"
                y2="33"
                transform={`rotate(${tickAngle} 100 100)`}
                stroke={major ? "var(--bone-dim)" : "var(--line-strong)"}
                strokeWidth={major ? 1.4 : 1}
              />
            );
          })}
        </g>
        <line
          x1="100"
          y1="100"
          x2="100"
          y2="46"
          transform={`rotate(${angle} 100 100)`}
          stroke="var(--amber)"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <circle cx="100" cy="100" r="4" fill="var(--amber)" />
        <circle cx="100" cy="100" r="9" fill="none" stroke="var(--line-strong)" />
        <text x="100" y="120" textAnchor="middle" className="gauge__readout">
          {readout}
          {unit ? <tspan className="gauge__unit"> {unit}</tspan> : null}
        </text>
        {status ? (
          <text x="100" y="138" textAnchor="middle" className="gauge__status">
            {status}
          </text>
        ) : null}
      </svg>
      <figcaption className="gauge__caption">
        {code ? <span className="gauge__code">{code}</span> : null}
        <span>{label}</span>
      </figcaption>
    </figure>
  );
}
