import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/")({
  component: Index,
});

// Clock face geometry (SVG viewBox units)
const SIZE = 200;
const CENTER = SIZE / 2;
const RADIUS = 90;
const HAND_LENGTHS = { hour: 44, minute: 66, second: 76 };

function polar(angleDeg: number, length: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: CENTER + length * Math.cos(rad), y: CENTER + length * Math.sin(rad) };
}

function Hand({
  angle,
  length,
  stroke,
  width,
  tail = 0,
}: {
  angle: number;
  length: number;
  stroke: string;
  width: number;
  tail?: number;
}) {
  const tip = polar(angle, length);
  const tailEnd = polar(angle + 180, tail);
  return (
    <g>
      {tail > 0 && (
        <line
          x1={CENTER}
          y1={CENTER}
          x2={tailEnd.x}
          y2={tailEnd.y}
          stroke={stroke}
          strokeWidth={width}
          strokeLinecap="round"
        />
      )}
      <line
        x1={CENTER}
        y1={CENTER}
        x2={tip.x}
        y2={tip.y}
        stroke={stroke}
        strokeWidth={width}
        strokeLinecap="round"
      />
    </g>
  );
}

function Index() {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const tick = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(tick);
  }, []);

  const minutes = now.getMinutes();
  const seconds = now.getSeconds();

  const secAngle = seconds * 6;
  const minAngle = minutes * 6 + seconds * 0.1;
  const hrAngle = (now.getHours() % 12) * 30 + minutes * 0.5;

  const dateLabel = now.toLocaleDateString(undefined, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center gap-10 overflow-hidden bg-[#fcfbf8]">
      {/* Soft ambient glows */}
      <div className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-orange-100 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-sky-100 blur-3xl" />

      {/* Analog clock */}
      <div className="relative rounded-full border border-stone-200 bg-white shadow-[0_20px_60px_-15px_rgba(0,0,0,0.2)]">
        <svg
          width="340"
          height="340"
          viewBox={`0 0 ${SIZE} ${SIZE}`}
          className="drop-shadow-sm"
          role="img"
          aria-label={`Analog clock showing ${minutes} minutes past ${now.getHours() % 12 === 0 ? 12 : now.getHours() % 12}`}
        >
          {/* Face ring */}
          <circle cx={CENTER} cy={CENTER} r={RADIUS + 6} fill="#ffffff" stroke="#e7e5e4" strokeWidth="2" />
          <circle cx={CENTER} cy={CENTER} r={RADIUS} fill="#fafaf9" />

          {/* Minute ticks */}
          {Array.from({ length: 60 }).map((_, i) => {
            const major = i % 5 === 0;
            const outer = polar(i * 6, RADIUS - 2);
            const inner = polar(i * 6, RADIUS - (major ? 12 : 6));
            return (
              <line
                key={i}
                x1={outer.x}
                y1={outer.y}
                x2={inner.x}
                y2={inner.y}
                stroke={major ? "#57534e" : "#d6d3d1"}
                strokeWidth={major ? 3 : 1.5}
                strokeLinecap="round"
              />
            );
          })}

          {/* Hour numerals */}
          {Array.from({ length: 12 }).map((_, i) => {
            const num = i + 1;
            const pos = polar(num * 30, RADIUS - 24);
            return (
              <text
                key={num}
                x={pos.x}
                y={pos.y}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={15}
                fontWeight={600}
                fill={num % 3 === 0 ? "#ea580c" : "#44403c"}
                fontFamily="'Inter', ui-sans-serif, system-ui, sans-serif"
              >
                {num}
              </text>
            );
          })}

          {/* Brand-style accent dot near center (covered by the pin) */}
          <circle cx={CENTER} cy={CENTER} r={7} fill="#ea580c" />

          {/* Hands */}
          <Hand angle={hrAngle} length={HAND_LENGTHS.hour} stroke="#292524" width={6.5} />
          <Hand angle={minAngle} length={HAND_LENGTHS.minute} stroke="#57534e" width={4.5} />
          <Hand angle={secAngle} length={HAND_LENGTHS.second} stroke="#ea580c" width={2.5} tail={18} />

          {/* Center pin */}
          <circle cx={CENTER} cy={CENTER} r={4} fill="#ffffff" stroke="#292524" strokeWidth={2} />
        </svg>
      </div>

      {/* Date caption */}
      <div className="rounded-full border border-stone-200 bg-white/80 px-5 py-2 text-sm font-medium tracking-wide text-stone-600 shadow-sm">
        {dateLabel}
      </div>
    </div>
  );
}
