import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useCivic } from "@/lib/civic/store";
import { categoryLabel } from "@/lib/civic/data";
import { DemoNote, PageHeader, Panel, RiskBadge, riskColorVar } from "@/components/civic/ui";

export const Route = createFileRoute("/map")({
  head: () => ({
    meta: [
      { title: "Community Risk Map — CivicShield AI" },
      { name: "description", content: "Interactive map-style view of civic locations colored by predicted risk." },
      { property: "og:title", content: "Community Risk Map — CivicShield AI" },
      { property: "og:description", content: "See risk hotspots across the city." },
    ],
  }),
  component: MapPage,
});

function MapPage() {
  const { risks } = useCivic();
  const [sel, setSel] = useState<string>(risks[0]?.location.id ?? "");
  const r = risks.find((x) => x.location.id === sel) ?? risks[0];

  return (
    <>
      <PageHeader title="Community Risk Map" subtitle="Schematic map of Demo City. Click a marker to inspect its risk profile." />
      <div className="grid gap-6 lg:grid-cols-3">
        <Panel className="lg:col-span-2 p-2">
          <svg viewBox="0 0 800 500" className="h-auto w-full rounded-lg bg-secondary/60" role="img" aria-label="Risk map">
            <path d="M0 60 C 150 90, 200 200, 120 260 S 60 420, 0 470" fill="none" stroke="var(--chart-3)" strokeOpacity={0.35} strokeWidth={26} />
            <path d="M560 0 C 600 120, 760 200, 740 500" fill="none" stroke="var(--chart-3)" strokeOpacity={0.25} strokeWidth={14} />
            <ellipse cx="660" cy="110" rx="70" ry="40" fill="var(--chart-3)" fillOpacity={0.2} />
            <rect x="80" y="290" width="140" height="80" rx="12" fill="var(--risk-low)" fillOpacity={0.15} />
            {[[0, 250, 800, 250], [400, 0, 400, 500], [0, 380, 800, 380], [250, 0, 250, 500], [600, 0, 600, 500], [0, 140, 800, 140]].map(([a, b, c, d], i) => (
              <line key={i} x1={a} y1={b} x2={c} y2={d} stroke="var(--border)" strokeWidth={i < 2 ? 8 : 4} />
            ))}
            {risks.map((x) => {
              const active = x.location.id === r?.location.id;
              const rad = 10 + x.score / 8;
              return (
                <g key={x.location.id} onClick={() => setSel(x.location.id)} className="cursor-pointer">
                  <circle cx={x.location.x} cy={x.location.y} r={rad + 10} fill={riskColorVar[x.level]} fillOpacity={0.18} />
                  <circle cx={x.location.x} cy={x.location.y} r={rad} fill={riskColorVar[x.level]} stroke={active ? "var(--navy)" : "var(--card)"} strokeWidth={active ? 4 : 2} />
                  <text x={x.location.x} y={x.location.y + 4} textAnchor="middle" fontSize={11} fontWeight={700} fill="var(--card)">{x.score}</text>
                  <text x={x.location.x} y={x.location.y + rad + 18} textAnchor="middle" fontSize={12} fontWeight={600} fill="var(--foreground)">{x.location.name}</text>
                </g>
              );
            })}
          </svg>
          <div className="flex flex-wrap gap-4 px-3 py-3 text-xs">
            {(["Low", "Medium", "High", "Critical"] as const).map((l) => (
              <span key={l} className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-full" style={{ background: riskColorVar[l] }} />{l}</span>
            ))}
          </div>
        </Panel>
        {r && (
          <Panel title={r.location.name} subtitle={`${r.location.area} zone`} right={<RiskBadge level={r.level} score={r.score} />}>
            <p className="text-sm text-muted-foreground">{r.complaints.length} complaints · {r.unresolved} unresolved</p>
            {r.dominantCategory && <p className="mt-1 text-sm">Main issue: <b>{categoryLabel(r.dominantCategory)}</b></p>}
            <ul className="mt-4 list-disc space-y-1.5 pl-5 text-sm">{r.explanation.map((e) => <li key={e}>{e}</li>)}</ul>
            <Link to="/risk" className="mt-4 inline-block text-sm font-medium text-teal hover:underline">Full risk breakdown →</Link>
          </Panel>
        )}
      </div>
      <div className="mt-6"><DemoNote>Schematic map with demonstration locations — not real geographic coordinates.</DemoNote></div>
    </>
  );
}
