export type Category = "waterlogging" | "garbage" | "pothole" | "streetlight" | "water_leak";
export type Status = "Reported" | "In Progress" | "Resolved";
export type Severity = 1 | 2 | 3 | 4;

export const CATEGORIES: { id: Category; label: string }[] = [
  { id: "waterlogging", label: "Waterlogging" },
  { id: "garbage", label: "Garbage accumulation" },
  { id: "pothole", label: "Pothole" },
  { id: "streetlight", label: "Streetlight failure" },
  { id: "water_leak", label: "Water leakage" },
];
export const categoryLabel = (c: Category) => CATEGORIES.find((x) => x.id === c)?.label ?? c;
export const SEVERITY_LABELS: Record<Severity, string> = { 1: "Low", 2: "Medium", 3: "High", 4: "Critical" };
export const STATUSES: Status[] = ["Reported", "In Progress", "Resolved"];

export interface CivicLocation {
  id: string;
  name: string;
  area: string;
  /** Demonstration environmental exposure (0–100), e.g. low-lying terrain, drainage age. */
  envRisk: number;
  envNote: string;
  x: number;
  y: number;
}

export interface Complaint {
  id: string;
  title: string;
  description: string;
  category: Category;
  locationId: string;
  severity: Severity;
  status: Status;
  createdAt: string;
  resolvedAt?: string | undefined;
  image?: string | undefined;
}

/** Fixed anchor date so demonstration data and scores stay consistent. */
export const DEMO_ANCHOR = new Date("2026-10-14T09:00:00Z").getTime();
const DAY = 86400000;

export const LOCATIONS: CivicLocation[] = [
  { id: "L1", name: "Riverside Lowlands", area: "North", envRisk: 85, envNote: "low-lying terrain next to the river with ageing storm drains", x: 180, y: 120 },
  { id: "L2", name: "Market Square", area: "Central", envRisk: 55, envNote: "heavy foot traffic and daily vendor waste", x: 400, y: 250 },
  { id: "L3", name: "Station Road", area: "Central", envRisk: 45, envNote: "heavy vehicle load on an older road surface", x: 470, y: 330 },
  { id: "L4", name: "Lakeview Colony", area: "East", envRisk: 75, envNote: "high water table near the lake", x: 640, y: 150 },
  { id: "L5", name: "Industrial Belt", area: "South", envRisk: 60, envNote: "truck traffic and old pipeline network", x: 520, y: 430 },
  { id: "L6", name: "Greenfield Park", area: "West", envRisk: 25, envNote: "open green area with good natural drainage", x: 150, y: 330 },
  { id: "L7", name: "Old Town Lane", area: "Central", envRisk: 50, envNote: "narrow lanes and decades-old wiring", x: 330, y: 170 },
  { id: "L8", name: "Hilltop Residency", area: "West", envRisk: 20, envNote: "elevated terrain with newer infrastructure", x: 90, y: 440 },
  { id: "L9", name: "Canal Street", area: "East", envRisk: 70, envNote: "runs alongside an open canal prone to overflow", x: 690, y: 330 },
  { id: "L10", name: "University Avenue", area: "North", envRisk: 30, envNote: "recently resurfaced arterial road", x: 400, y: 70 },
];
export const locationById = (id: string) => LOCATIONS.find((l) => l.id === id);

type Seed = [string, Category, Severity, Status, number, string];
const SEEDS: Seed[] = [
  ["L1", "waterlogging", 4, "Reported", 2, "Knee-deep water near riverside bus stop"],
  ["L1", "waterlogging", 3, "Reported", 6, "Drain overflow after evening rain"],
  ["L1", "waterlogging", 3, "In Progress", 12, "Stagnant water outside primary school"],
  ["L1", "waterlogging", 4, "Reported", 19, "Road submerged at river bend"],
  ["L1", "garbage", 2, "Resolved", 40, "Debris clogging drain grate"],
  ["L1", "waterlogging", 3, "Resolved", 55, "Waterlogging in residential lane 4"],
  ["L2", "garbage", 3, "Reported", 1, "Overflowing bins behind vegetable market"],
  ["L2", "garbage", 3, "In Progress", 5, "Waste pile blocking footpath"],
  ["L2", "garbage", 2, "Reported", 9, "Missed garbage collection for 3 days"],
  ["L2", "garbage", 3, "Resolved", 24, "Plastic waste near fish market"],
  ["L2", "streetlight", 2, "Resolved", 33, "Flickering light near clock tower"],
  ["L3", "pothole", 3, "Reported", 3, "Deep pothole near station entrance"],
  ["L3", "pothole", 2, "In Progress", 11, "Cluster of potholes on left lane"],
  ["L3", "pothole", 3, "Resolved", 37, "Pothole causing two-wheeler skids"],
  ["L3", "streetlight", 2, "Reported", 15, "Dark stretch near taxi stand"],
  ["L4", "water_leak", 3, "Reported", 4, "Pipeline leak flooding colony gate"],
  ["L4", "waterlogging", 3, "Reported", 8, "Water pooling in community park"],
  ["L4", "water_leak", 2, "In Progress", 16, "Continuous leak from main valve"],
  ["L4", "waterlogging", 2, "Resolved", 48, "Seepage on block C road"],
  ["L5", "pothole", 4, "Reported", 7, "Large crater on truck route"],
  ["L5", "water_leak", 3, "Reported", 22, "Burst pipe near factory gate 2"],
  ["L5", "garbage", 2, "In Progress", 14, "Industrial scrap dumped on roadside"],
  ["L5", "pothole", 3, "Resolved", 60, "Broken surface near weighbridge"],
  ["L6", "garbage", 1, "Resolved", 20, "Litter near park benches"],
  ["L6", "streetlight", 2, "Reported", 10, "Two lamps out on jogging track"],
  ["L7", "streetlight", 3, "Reported", 2, "Entire lane dark after 8 PM"],
  ["L7", "streetlight", 2, "Reported", 13, "Exposed wiring on lamp post"],
  ["L7", "streetlight", 2, "In Progress", 26, "Streetlight timer malfunction"],
  ["L7", "garbage", 2, "Resolved", 45, "Garbage near temple entrance"],
  ["L8", "pothole", 1, "Resolved", 30, "Small pothole at residency gate"],
  ["L9", "waterlogging", 3, "Reported", 3, "Canal overflow onto street"],
  ["L9", "garbage", 3, "Reported", 6, "Waste dumped into canal edge"],
  ["L9", "waterlogging", 3, "In Progress", 18, "Waterlogged underpass"],
  ["L9", "garbage", 2, "Resolved", 42, "Floating waste blocking culvert"],
  ["L10", "streetlight", 1, "Resolved", 27, "Lamp out near hostel gate"],
  ["L10", "pothole", 2, "Reported", 21, "Pothole at university crossing"],
];

export const SEED_COMPLAINTS: Complaint[] = SEEDS.map(([loc, cat, sev, status, daysAgo, title], i) => {
  const created = DEMO_ANCHOR - daysAgo * DAY;
  return {
    id: `CS-${String(1001 + i)}`,
    title,
    description: `${title}. Reported by a resident (demonstration data).`,
    category: cat,
    locationId: loc,
    severity: sev,
    status,
    createdAt: new Date(created).toISOString(),
    resolvedAt: status === "Resolved" ? new Date(created + Math.min(daysAgo, 6) * DAY).toISOString() : undefined,
  };
});
