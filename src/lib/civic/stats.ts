import { CATEGORIES, LOCATIONS, locationById, type Complaint } from "./data";
import { referenceTime, type LocationRisk } from "./risk";

const DAY = 86400000;

export function weeklyTrend(complaints: Complaint[], weeks = 10) {
  const now = referenceTime(complaints);
  return Array.from({ length: weeks }, (_, i) => {
    const end = now - (weeks - 1 - i) * 7 * DAY;
    const start = end - 7 * DAY;
    const inWeek = complaints.filter((c) => { const t = new Date(c.createdAt).getTime(); return t > start && t <= end; });
    return {
      week: new Date(end).toLocaleDateString("en-GB", { day: "2-digit", month: "short" }),
      reported: inWeek.length,
      resolved: inWeek.filter((c) => c.status === "Resolved").length,
    };
  });
}

export const categoryCounts = (complaints: Complaint[]) =>
  CATEGORIES.map((c) => ({ name: c.label, id: c.id, value: complaints.filter((x) => x.category === c.id).length }));

export function areaComparison(complaints: Complaint[], risks: LocationRisk[]) {
  const areas = [...new Set(LOCATIONS.map((l) => l.area))];
  return areas.map((area) => {
    const cs = complaints.filter((c) => locationById(c.locationId)?.area === area);
    const rs = risks.filter((r) => r.location.area === area);
    return {
      area,
      complaints: cs.length,
      unresolved: cs.filter((c) => c.status !== "Resolved").length,
      avgRisk: rs.length ? Math.round(rs.reduce((s, r) => s + r.score, 0) / rs.length) : 0,
    };
  });
}

export const riskDistribution = (risks: LocationRisk[]) =>
  (["Low", "Medium", "High", "Critical"] as const).map((level) => ({ level, count: risks.filter((r) => r.level === level).length }));
