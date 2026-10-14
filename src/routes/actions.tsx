import { createFileRoute } from "@tanstack/react-router";
import { Droplets, Trash2, Construction, Lightbulb, Waves } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useCivic } from "@/lib/civic/store";
import { ACTIONS } from "@/lib/civic/risk";
import { CATEGORIES, type Category } from "@/lib/civic/data";
import { DemoNote, EmptyState, PageHeader, Panel, RiskBadge } from "@/components/civic/ui";

export const Route = createFileRoute("/actions")({
  head: () => ({
    meta: [
      { title: "Preventive Actions — CivicShield AI" },
      { name: "description", content: "Recommended drain cleaning, waste scheduling, pothole repair, streetlight and leak inspections by risk." },
      { property: "og:title", content: "Preventive Actions — CivicShield AI" },
      { property: "og:description", content: "Act before civic problems escalate." },
    ],
  }),
  component: ActionsPage,
});

const META: Record<Category, { title: string; icon: LucideIcon }> = {
  waterlogging: { title: "Drain cleaning", icon: Waves },
  garbage: { title: "Waste collection scheduling", icon: Trash2 },
  pothole: { title: "Pothole repairs", icon: Construction },
  streetlight: { title: "Streetlight inspections", icon: Lightbulb },
  water_leak: { title: "Water-leak investigations", icon: Droplets },
};

function ActionsPage() {
  const { risks } = useCivic();
  return (
    <>
      <PageHeader title="Preventive Actions" subtitle="Work orders recommended by the risk engine, ordered by location priority." />
      <div className="grid gap-6 md:grid-cols-2">
        {CATEGORIES.map(({ id }) => {
          const { title, icon: Icon } = META[id];
          const targets = risks.filter((r) => r.score >= 25 && (r.dominantCategory === id || r.complaints.some((c) => c.category === id && c.status !== "Resolved") || (id === "waterlogging" && r.location.envRisk >= 70)));
          return (
            <Panel key={id} title={title} subtitle={ACTIONS[id].join(" · ")} right={<span className="rounded-lg bg-teal/15 p-2 text-teal"><Icon className="h-4 w-4" /></span>}>
              {targets.length === 0 ? (
                <EmptyState title="No action needed right now" text="No Medium-or-higher risk locations for this issue." />
              ) : (
                <ul className="divide-y">
                  {targets.map((r, i) => {
                    const open = r.complaints.filter((c) => c.category === id && c.status !== "Resolved").length;
                    return (
                      <li key={r.location.id} className="flex items-center justify-between gap-3 py-2.5">
                        <div>
                          <p className="text-sm font-medium">{i === 0 ? "Priority: " : ""}{r.location.name}</p>
                          <p className="text-xs text-muted-foreground">{open} open {open === 1 ? "report" : "reports"} · {r.location.area} zone</p>
                        </div>
                        <RiskBadge level={r.level} score={r.score} />
                      </li>
                    );
                  })}
                </ul>
              )}
            </Panel>
          );
        })}
      </div>
      <div className="mt-6"><DemoNote /></div>
    </>
  );
}
