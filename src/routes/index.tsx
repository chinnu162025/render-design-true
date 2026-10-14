import { createFileRoute, Link } from "@tanstack/react-router";
import { AlertTriangle, CheckCircle2, ClipboardList, MapPin, Lightbulb } from "lucide-react";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useCivic } from "@/lib/civic/store";
import { categoryLabel, locationById } from "@/lib/civic/data";
import { categoryCounts, weeklyTrend } from "@/lib/civic/stats";
import { DemoNote, PageHeader, Panel, RiskBadge, StatCard, StatusBadge, chartColors, fmtDate } from "@/components/civic/ui";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard — CivicShield AI" },
      { name: "description", content: "Overview of civic complaints, risk hotspots and insights." },
      { property: "og:title", content: "CivicShield AI Dashboard" },
      { property: "og:description", content: "Complaints, trends and highest-risk locations at a glance." },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const { complaints, risks } = useCivic();
  const unresolved = complaints.filter((c) => c.status !== "Resolved").length;
  const resolved = complaints.length - unresolved;
  const highRisk = risks.filter((r) => r.score >= 50);
  const trend = weeklyTrend(complaints);
  const cats = categoryCounts(complaints).sort((a, b) => b.value - a.value);
  const recent = [...complaints].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 6);
  const top = risks[0];
  const topCat = cats[0];

  const insights = [
    top && `${top.location.name} has the highest risk score (${top.score}) driven by ${top.dominantCategory ? categoryLabel(top.dominantCategory).toLowerCase() : "multiple issues"}.`,
    topCat && `${topCat.name} is the most reported category with ${topCat.value} complaints.`,
    `${highRisk.length} of ${risks.length} monitored locations are at High or Critical risk.`,
    `Resolution rate stands at ${complaints.length ? Math.round((resolved / complaints.length) * 100) : 0}%.`,
  ].filter(Boolean) as string[];

  return (
    <>
      <PageHeader title="Dashboard" subtitle="Live overview of community issues and predicted risk hotspots." />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Total complaints" value={complaints.length} icon={ClipboardList} />
        <StatCard label="Unresolved" value={unresolved} icon={AlertTriangle} tone="teal" />
        <StatCard label="High-risk locations" value={highRisk.length} icon={MapPin} tone="danger" hint="Score ≥ 50" />
        <StatCard label="Resolved" value={resolved} icon={CheckCircle2} tone="success" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Panel title="Complaint trend" subtitle="Weekly reported vs resolved" className="lg:col-span-2">
          <div className="h-64">
            <ResponsiveContainer>
              <AreaChart data={trend}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="week" fontSize={11} stroke="var(--muted-foreground)" />
                <YAxis allowDecimals={false} fontSize={11} stroke="var(--muted-foreground)" />
                <Tooltip />
                <Area type="monotone" dataKey="reported" stroke="var(--chart-2)" fill="var(--chart-2)" fillOpacity={0.12} strokeWidth={2} />
                <Area type="monotone" dataKey="resolved" stroke="var(--chart-1)" fill="var(--chart-1)" fillOpacity={0.25} strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Panel>
        <Panel title="By category">
          <div className="h-64">
            <ResponsiveContainer>
              <BarChart data={cats} layout="vertical" margin={{ left: 10 }}>
                <XAxis type="number" hide allowDecimals={false} />
                <YAxis type="category" dataKey="name" width={110} fontSize={11} stroke="var(--muted-foreground)" />
                <Tooltip />
                <Bar dataKey="value" radius={[0, 6, 6, 0]}>
                  {cats.map((_, i) => <Cell key={i} fill={chartColors[i % 5]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Panel title="Recent complaints" className="lg:col-span-2" right={<Link to="/complaints" className="text-xs font-medium text-teal hover:underline">View all</Link>}>
          <ul className="divide-y">
            {recent.map((c) => (
              <li key={c.id} className="flex items-center justify-between gap-3 py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{c.title}</p>
                  <p className="text-xs text-muted-foreground">{c.id} · {locationById(c.locationId)?.name} · {fmtDate(c.createdAt)}</p>
                </div>
                <StatusBadge status={c.status} />
              </li>
            ))}
          </ul>
        </Panel>
        <Panel title="Highest-risk locations" right={<Link to="/risk" className="text-xs font-medium text-teal hover:underline">Details</Link>}>
          <ul className="space-y-3">
            {risks.slice(0, 5).map((r) => (
              <li key={r.location.id} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">{r.location.name}</p>
                  <p className="text-xs text-muted-foreground">{r.location.area} · {r.unresolved} open</p>
                </div>
                <RiskBadge level={r.level} score={r.score} />
              </li>
            ))}
          </ul>
        </Panel>
      </div>

      <Panel title="Insights" subtitle="Generated from demonstration data" className="mt-6">
        <ul className="grid gap-3 sm:grid-cols-2">
          {insights.map((t) => (
            <li key={t} className="flex gap-3 rounded-lg bg-secondary/60 p-3 text-sm">
              <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-teal" />{t}
            </li>
          ))}
        </ul>
        <div className="mt-4"><DemoNote /></div>
      </Panel>
    </>
  );
}
