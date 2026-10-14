import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { RotateCcw, Search, X } from "lucide-react";
import { useCivic } from "@/lib/civic/store";
import { CATEGORIES, LOCATIONS, SEVERITY_LABELS, STATUSES, categoryLabel, locationById, type Complaint, type Status } from "@/lib/civic/data";
import { DemoNote, EmptyState, PageHeader, Panel, StatusBadge, fmtDate } from "@/components/civic/ui";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/complaints")({
  head: () => ({
    meta: [
      { title: "Complaint Management — CivicShield AI" },
      { name: "description", content: "Search, filter and update the status of civic complaints." },
      { property: "og:title", content: "Complaint Management — CivicShield AI" },
      { property: "og:description", content: "Track every complaint from report to resolution." },
    ],
  }),
  component: ComplaintsPage,
});

const selectCls = "h-9 rounded-md border border-input bg-card px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring";

function ComplaintsPage() {
  const { complaints, updateStatus, resetDemo } = useCivic();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("");
  const [status, setStatus] = useState("");
  const [loc, setLoc] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);

  const rows = useMemo(() => {
    const s = q.trim().toLowerCase();
    return [...complaints]
      .filter((c) => (!cat || c.category === cat) && (!status || c.status === status) && (!loc || c.locationId === loc))
      .filter((c) => !s || [c.id, c.title, c.description, locationById(c.locationId)?.name].join(" ").toLowerCase().includes(s))
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }, [complaints, q, cat, status, loc]);

  const open = complaints.find((c) => c.id === openId);
  const change = (c: Complaint, s: Status) => { updateStatus(c.id, s); toast.success(`${c.id} marked ${s}`); };

  return (
    <>
      <PageHeader title="Complaint Management" subtitle={`${complaints.length} complaints tracked`}
        actions={<Button variant="outline" size="sm" onClick={() => { resetDemo(); toast("Demonstration data restored"); }}><RotateCcw className="h-4 w-4" />Reset demo data</Button>} />
      <Panel>
        <div className="mb-4 grid gap-3 md:grid-cols-[1fr_auto_auto_auto]">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input className="pl-9" placeholder="Search by ID, title or location" value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
          <select className={selectCls} value={cat} onChange={(e) => setCat(e.target.value)}>
            <option value="">All categories</option>{CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
          </select>
          <select className={selectCls} value={loc} onChange={(e) => setLoc(e.target.value)}>
            <option value="">All locations</option>{LOCATIONS.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
          </select>
          <select className={selectCls} value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">All statuses</option>{STATUSES.map((s) => <option key={s}>{s}</option>)}
          </select>
        </div>
        {rows.length === 0 ? (
          <EmptyState title="No complaints match your filters" text="Try clearing the search or choosing different filters." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-sm">
              <thead>
                <tr className="border-b text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="py-2 pr-3">ID</th><th className="pr-3">Complaint</th><th className="pr-3">Category</th>
                  <th className="pr-3">Location</th><th className="pr-3">Severity</th><th className="pr-3">Date</th><th>Status</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((c) => (
                  <tr key={c.id} className="border-b last:border-0 hover:bg-secondary/40">
                    <td className="py-3 pr-3 font-mono text-xs">{c.id}</td>
                    <td className="pr-3"><button className="text-left font-medium hover:text-teal" onClick={() => setOpenId(c.id)}>{c.title}</button></td>
                    <td className="pr-3">{categoryLabel(c.category)}</td>
                    <td className="pr-3">{locationById(c.locationId)?.name}</td>
                    <td className="pr-3">{SEVERITY_LABELS[c.severity]}</td>
                    <td className="pr-3 whitespace-nowrap">{fmtDate(c.createdAt)}</td>
                    <td>
                      <select aria-label={`Status for ${c.id}`} className={selectCls + " h-8 text-xs"} value={c.status} onChange={(e) => change(c, e.target.value as Status)}>
                        {STATUSES.map((s) => <option key={s}>{s}</option>)}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <p className="mt-3 text-xs text-muted-foreground">Showing {rows.length} of {complaints.length}</p>
      </Panel>
      <div className="mt-6"><DemoNote>Seed complaints are demonstration data. Your changes are saved in this browser.</DemoNote></div>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-navy/50" onClick={() => setOpenId(null)} />
          <div className="relative w-full max-w-lg rounded-xl bg-card p-6 shadow-card">
            <button aria-label="Close" className="absolute right-4 top-4 text-muted-foreground" onClick={() => setOpenId(null)}><X className="h-5 w-5" /></button>
            <p className="font-mono text-xs text-muted-foreground">{open.id}</p>
            <h2 className="mt-1 pr-8 text-xl font-bold">{open.title}</h2>
            <div className="mt-2"><StatusBadge status={open.status} /></div>
            <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <div><dt className="text-xs text-muted-foreground">Category</dt><dd>{categoryLabel(open.category)}</dd></div>
              <div><dt className="text-xs text-muted-foreground">Severity</dt><dd>{SEVERITY_LABELS[open.severity]}</dd></div>
              <div><dt className="text-xs text-muted-foreground">Location</dt><dd>{locationById(open.locationId)?.name}</dd></div>
              <div><dt className="text-xs text-muted-foreground">Reported</dt><dd>{fmtDate(open.createdAt)}</dd></div>
            </dl>
            <p className="mt-4 text-sm">{open.description}</p>
            {open.image && <img src={open.image} alt="Attached" className="mt-4 max-h-56 rounded-lg border" />}
            <div className="mt-5 flex flex-wrap gap-2">
              {STATUSES.map((s) => (
                <Button key={s} size="sm" variant={open.status === s ? "default" : "outline"} onClick={() => change(open, s)}>{s}</Button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
