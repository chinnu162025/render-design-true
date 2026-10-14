import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { RiskLevel } from "@/lib/civic/risk";
import type { Status } from "@/lib/civic/data";

export function PageHeader({ title, subtitle, actions }: { title: string; subtitle?: string; actions?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold text-foreground sm:text-3xl">{title}</h1>
        {subtitle && <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      {actions}
    </div>
  );
}

export function Panel({ title, subtitle, children, className, right }: { title?: string; subtitle?: string; children: ReactNode; className?: string; right?: ReactNode }) {
  return (
    <section className={cn("rounded-xl border bg-card p-5 shadow-card", className)}>
      {title && (
        <div className="mb-4 flex items-start justify-between gap-2">
          <div>
            <h2 className="text-base font-semibold">{title}</h2>
            {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
          </div>
          {right}
        </div>
      )}
      {children}
    </section>
  );
}

export function StatCard({ label, value, icon: Icon, hint, tone = "default" }: { label: string; value: ReactNode; icon: LucideIcon; hint?: string; tone?: "default" | "teal" | "danger" | "success" }) {
  const toneCls = {
    default: "bg-secondary text-foreground",
    teal: "bg-teal/15 text-teal",
    danger: "bg-risk-critical/12 text-risk-critical",
    success: "bg-risk-low/15 text-risk-low",
  }[tone];
  return (
    <div className="rounded-xl border bg-card p-5 shadow-card">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">{label}</span>
        <span className={cn("rounded-lg p-2", toneCls)}><Icon className="h-4 w-4" /></span>
      </div>
      <div className="mt-3 font-display text-3xl font-bold">{value}</div>
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

export const riskColorVar: Record<RiskLevel, string> = {
  Low: "var(--risk-low)",
  Medium: "var(--risk-medium)",
  High: "var(--risk-high)",
  Critical: "var(--risk-critical)",
};

export function RiskBadge({ level, score }: { level: RiskLevel; score?: number }) {
  const cls = {
    Low: "bg-risk-low/15 text-risk-low border-risk-low/30",
    Medium: "bg-risk-medium/20 text-foreground border-risk-medium/40",
    High: "bg-risk-high/15 text-risk-high border-risk-high/30",
    Critical: "bg-risk-critical/12 text-risk-critical border-risk-critical/30",
  }[level];
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-semibold", cls)}>
      {score !== undefined && <span className="tabular-nums">{score}</span>}
      {level}
    </span>
  );
}

export function StatusBadge({ status }: { status: Status }) {
  const cls = {
    Reported: "bg-secondary text-foreground",
    "In Progress": "bg-teal/15 text-foreground",
    Resolved: "bg-risk-low/15 text-risk-low",
  }[status];
  return <span className={cn("inline-flex rounded-full px-2 py-0.5 text-xs font-medium", cls)}>{status}</span>;
}

export function ScoreBar({ value, color = "var(--teal)" }: { value: number; color?: string }) {
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
      <div className="h-full rounded-full transition-all" style={{ width: `${value}%`, background: color }} />
    </div>
  );
}

export function DemoNote({ children }: { children?: ReactNode }) {
  return (
    <p className="rounded-lg border border-dashed bg-secondary/60 px-3 py-2 text-xs text-muted-foreground">
      {children ?? "Demonstration data. Scores come from a transparent rule-based risk engine — not a trained ML model, live weather feed, or government database."}
    </p>
  );
}

export function EmptyState({ title, text }: { title: string; text?: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-10 text-center">
      <p className="font-medium">{title}</p>
      {text && <p className="mt-1 text-sm text-muted-foreground">{text}</p>}
    </div>
  );
}

export const chartColors = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)"];
export const fmtDate = (iso: string) => new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
