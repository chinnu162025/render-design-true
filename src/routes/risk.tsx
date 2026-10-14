import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { useCivic } from "@/lib/civic/store";
import { FACTOR_LABELS, WEIGHTS, type RiskLevel } from "@/lib/civic/risk";
import { CATEGORIES, STATUSES, categoryLabel, type Category, type Status } from "@/lib/civic/data";
import { DemoNote, EmptyState, PageHeader, Panel, RiskBadge, ScoreBar, riskColorVar } from "@/components/civic/ui";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/risk")({
  head: () => ({
    meta: [
      { title: "AI Risk Intelligence — CivicShield AI" },
      { name: "description", content: "Explainable 0–100 risk scores, factor breakdowns and preventive recommendations per location." },
      { property: "og:title", content: "AI Risk Intelligence — CivicShield AI" },
      { property: "og:description", content: "Transparent risk scoring for civic locations." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: RiskPage,
});

const LEVELS: RiskLevel[] = ["Critical", "High", "Medium", "Low"];
const selectCls = "rounded-lg border bg-background px-3 py-2 text-sm";

function RiskPage() {
  const { risks } = useCivic();
  const [sel, setSel] = useState<string | null>(null);
  const [level, setLevel] = useState<RiskLevel | "all">("all");
  const [cat, setCat] = useState<Category | "all">("all");
  const [status, setStatus] = useState<Status | "all">("all");
  const keys = Object.keys(WEIGHTS) as (keyof typeof WEIGHTS)[];

  const filtered = risks.filter((x) =>
    (level === "all" || x.level === level) &&
    (cat === "all" || x.dominantCategory === cat || x.complaints.some((c) => c.category === cat)) &&
    (status === "all" || x.complaints.some((c) => c.status === status && (cat === "all" || c.category === cat))),
  );
  const r = filtered.find((x) => x.location.id === sel) ?? filtered[0];

  return (
    <>
      <PageHeader title="AI Risk Intelligence" subtitle="A deterministic, explainable rule-based engine scores every location from 0 to 100 and recommends preventive work. No trained machine-learning model or live data feed is used." />
      <Panel className="mb-6" title="How the score works">
        <div className="grid gap-3 sm:grid-cols-5">
          {keys.map((k) => (
            <div key={k} className="rounded-lg bg-secondary/60 p-3">
              <div className="font-display text-xl font-bold">{WEIGHTS[k] * 100}%</div>
              <div className="text-xs text-muted-foreground">{FACTOR_LABELS[k]}{k === "environment" && " (simulated)"}</div>
            </div>
          ))}
        </div>
        <p className="mt-3 text-xs text-muted-foreground">Levels: 0–24 Low · 25–49 Medium · 50–74 High · 75–100 Critical. Each factor is normalized to 0–100. Environmental risk values are simulated demonstration data.</p>
      </Panel>

      <div className="mb-6 flex flex-wrap gap-3">
        <select aria-label="Risk level" className={selectCls} value={level} onChange={(e) => setLevel(e.target.value as RiskLevel | "all")}>
          <option value="all">All risk levels</option>
          {LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
        </select>
        <select aria-label="Issue category" className={selectCls} value={cat} onChange={(e) => setCat(e.target.value as Category | "all")}>
          <option value="all">All categories</option>
          {CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
        </select>
        <select aria-label="Complaint status" className={selectCls} value={status} onChange={(e) => setStatus(e.target.value as Status | "all")}>
          <option value="all">All statuses</option>
          {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <span className="self-center text-xs text-muted-foreground">{filtered.length} of {risks.length} locations</span>
      </div>

      {!r ? (
        <Panel><EmptyState title="No locations match" text="Try changing the filters." /></Panel>
      ) : (
      <div className="grid gap-6 lg:grid-cols-5">
        <Panel title="Prioritized locations" className="lg:col-span-2">
          <ol className="space-y-2">
            {filtered.map((x) => (
              <li key={x.location.id}>
                <button
                  onClick={() => setSel(x.location.id)}
                  className={cn("w-full rounded-lg border p-3 text-left transition-colors hover:bg-secondary/60", x.location.id === r.location.id && "border-teal bg-teal/5")}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-medium">#{risks.indexOf(x) + 1} {x.location.name}</span>
                    <RiskBadge level={x.level} score={x.score} />
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">{x.complaints.length} complaints · {x.dominantCategory ? categoryLabel(x.dominantCategory) : "No dominant issue"}</p>
                  <div className="mt-2"><ScoreBar value={x.score} color={riskColorVar[x.level]} /></div>
                </button>
              </li>
            ))}
          </ol>
        </Panel>

        <div className="space-y-6 lg:col-span-3">
          <Panel>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-bold">{r.location.name}</h2>
                <p className="text-sm text-muted-foreground">{r.location.area} zone · {r.complaints.length} complaints · {r.unresolved} unresolved</p>
                <p className="mt-1 text-sm">Main issue: <span className="font-medium">{r.dominantCategory ? categoryLabel(r.dominantCategory) : "None"}</span></p>
              </div>
              <div className="text-right">
                <div className="font-display text-4xl font-bold" style={{ color: riskColorVar[r.level] }}>{r.score}</div>
                <RiskBadge level={r.level} />
              </div>
            </div>
            <h3 className="mt-6 mb-3 text-sm font-semibold">Risk factor breakdown</h3>
            <div className="space-y-3">
              {keys.map((k) => (
                <div key={k}>
                  <div className="mb-1 flex justify-between text-xs">
                    <span>{FACTOR_LABELS[k]} <span className="text-muted-foreground">({WEIGHTS[k] * 100}%{k === "environment" ? ", simulated" : ""})</span></span>
                    <span className="tabular-nums text-muted-foreground">{r.factors[k]} → +{(r.factors[k] * WEIGHTS[k]).toFixed(1)}</span>
                  </div>
                  <ScoreBar value={r.factors[k]} />
                </div>
              ))}
            </div>
          </Panel>
          <Panel title="Why this location is at risk">
            <ul className="list-disc space-y-2 pl-5 text-sm">{r.explanation.map((e) => <li key={e}>{e}</li>)}</ul>
          </Panel>
          <Panel title="Recommended preventive actions">
            <ul className="space-y-2">
              {r.actions.map((a) => (
                <li key={a} className="flex gap-2 text-sm"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-teal" />{a}</li>
              ))}
            </ul>
          </Panel>
          <DemoNote />
        </div>
      </div>
      )}
    </>
  );
}
