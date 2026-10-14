import { type Category, type CivicLocation, type Complaint, categoryLabel, LOCATIONS, DEMO_ANCHOR } from "./data";

export type RiskLevel = "Low" | "Medium" | "High" | "Critical";
export const WEIGHTS = { recurrence: 0.3, severity: 0.25, volume: 0.2, environment: 0.15, duration: 0.1 } as const;
export const FACTOR_LABELS: Record<keyof typeof WEIGHTS, string> = {
  recurrence: "Complaint recurrence",
  severity: "Issue severity",
  volume: "Recent complaint volume",
  environment: "Environmental risk",
  duration: "Unresolved duration",
};

export interface LocationRisk {
  location: CivicLocation;
  score: number;
  level: RiskLevel;
  factors: Record<keyof typeof WEIGHTS, number>;
  dominantCategory: Category | null;
  complaints: Complaint[];
  unresolved: number;
  explanation: string[];
  actions: string[];
}

const DAY = 86400000;
const clamp = (n: number) => Math.max(0, Math.min(100, Math.round(n)));

export const levelFor = (s: number): RiskLevel => (s >= 75 ? "Critical" : s >= 50 ? "High" : s >= 25 ? "Medium" : "Low");

export const ACTIONS: Record<Category, string[]> = {
  waterlogging: ["Schedule pre-monsoon drain cleaning and de-silting", "Inspect storm drain capacity and outlet blockages"],
  garbage: ["Increase waste collection frequency to daily", "Place additional covered bins at hotspots"],
  pothole: ["Schedule pothole patching before damage spreads", "Assess road surface for full resurfacing"],
  streetlight: ["Run a full streetlight inspection on the stretch", "Replace faulty fixtures and check wiring/timers"],
  water_leak: ["Dispatch a water-leak investigation team", "Pressure-test the local pipeline segment"],
};

/** Reference "now": the fixed demo anchor, or later if newer complaints exist. */
export function referenceTime(complaints: Complaint[]) {
  const latest = complaints.reduce((m, c) => Math.max(m, new Date(c.createdAt).getTime()), 0);
  return Math.max(DEMO_ANCHOR, latest);
}

export function computeLocationRisk(location: CivicLocation, all: Complaint[], now: number): LocationRisk {
  const complaints = all.filter((c) => c.locationId === location.id);
  const open = complaints.filter((c) => c.status !== "Resolved");
  const last90 = complaints.filter((c) => now - new Date(c.createdAt).getTime() <= 90 * DAY);
  const last30 = complaints.filter((c) => now - new Date(c.createdAt).getTime() <= 30 * DAY);

  const catCounts = new Map<Category, number>();
  last90.forEach((c) => catCounts.set(c.category, (catCounts.get(c.category) ?? 0) + 1));
  let dominantCategory: Category | null = null;
  let maxSame = 0;
  catCounts.forEach((n, cat) => { if (n > maxSame) { maxSame = n; dominantCategory = cat; } });

  const recurrence = clamp(Math.max(0, maxSame - 1) * 25);
  const sevBase = open.length ? open : complaints;
  const avgSev = sevBase.length ? sevBase.reduce((s, c) => s + c.severity, 0) / sevBase.length : 1;
  const severity = clamp(((avgSev - 1) / 3) * 100 * (open.length ? 1 : 0.4));
  const volume = clamp(last30.length * 20);
  const environment = clamp(location.envRisk);
  const avgOpenDays = open.length ? open.reduce((s, c) => s + (now - new Date(c.createdAt).getTime()) / DAY, 0) / open.length : 0;
  const duration = clamp((avgOpenDays / 30) * 100);

  const factors = { recurrence, severity, volume, environment, duration };
  const score = clamp(
    (Object.keys(WEIGHTS) as (keyof typeof WEIGHTS)[]).reduce((s, k) => s + factors[k] * WEIGHTS[k], 0),
  );

  const explanation: string[] = [];
  if (dominantCategory && maxSame >= 2)
    explanation.push(`${categoryLabel(dominantCategory)} has been reported ${maxSame} times here in the last 90 days, indicating a recurring problem.`);
  if (open.length) explanation.push(`${open.length} complaint${open.length > 1 ? "s remain" : " remains"} unresolved with an average severity of ${avgSev.toFixed(1)} / 4.`);
  if (last30.length >= 2) explanation.push(`${last30.length} new complaints in the last 30 days show rising activity.`);
  if (environment >= 50) explanation.push(`Environmental exposure is elevated: ${location.envNote}.`);
  if (avgOpenDays >= 10) explanation.push(`Open issues have been waiting an average of ${Math.round(avgOpenDays)} days.`);
  if (!explanation.length) explanation.push("Few recent or unresolved complaints and low environmental exposure keep this location at low risk.");

  const cats = new Set<Category>(open.map((c) => c.category));
  if (dominantCategory) cats.add(dominantCategory);
  if (location.envRisk >= 70) cats.add("waterlogging");
  const actions = score >= 25 ? [...cats].flatMap((c) => ACTIONS[c]).slice(0, 4) : ["Continue routine monitoring"];

  return { location, score, level: levelFor(score), factors, dominantCategory, complaints, unresolved: open.length, explanation, actions };
}

export function computeAllRisks(complaints: Complaint[]): LocationRisk[] {
  const now = referenceTime(complaints);
  return LOCATIONS.map((l) => computeLocationRisk(l, complaints, now)).sort((a, b) => b.score - a.score);
}
