import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { SEED_COMPLAINTS, type Complaint, type Status } from "./data";
import { computeAllRisks, type LocationRisk } from "./risk";

const KEY = "civicshield.complaints.v1";

interface Ctx {
  complaints: Complaint[];
  risks: LocationRisk[];
  addComplaint: (c: Omit<Complaint, "id" | "status" | "createdAt">) => Complaint;
  updateStatus: (id: string, status: Status) => void;
  resetDemo: () => void;
}
const CivicCtx = createContext<Ctx | null>(null);

export function CivicProvider({ children }: { children: ReactNode }) {
  const [complaints, setComplaints] = useState<Complaint[]>(SEED_COMPLAINTS);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setComplaints(JSON.parse(raw));
    } catch { /* ignore */ }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try { localStorage.setItem(KEY, JSON.stringify(complaints)); } catch { /* quota */ }
  }, [complaints, loaded]);

  const risks = useMemo(() => computeAllRisks(complaints), [complaints]);

  const value: Ctx = {
    complaints,
    risks,
    addComplaint: (c) => {
      const maxNum = complaints.reduce((m, x) => Math.max(m, parseInt(x.id.slice(3)) || 0), 1000);
      const full: Complaint = { ...c, id: `CS-${maxNum + 1}`, status: "Reported", createdAt: new Date().toISOString() };
      setComplaints((prev) => [full, ...prev]);
      return full;
    },
    updateStatus: (id, status) =>
      setComplaints((prev) =>
        prev.map((c) => (c.id === id ? { ...c, status, resolvedAt: status === "Resolved" ? new Date().toISOString() : undefined } : c)),
      ),
    resetDemo: () => setComplaints(SEED_COMPLAINTS),
  };
  return <CivicCtx.Provider value={value}>{children}</CivicCtx.Provider>;
}

export function useCivic() {
  const ctx = useContext(CivicCtx);
  if (!ctx) throw new Error("useCivic must be used inside CivicProvider");
  return ctx;
}
