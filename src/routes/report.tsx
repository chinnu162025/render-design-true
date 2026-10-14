import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { CheckCircle2, Upload } from "lucide-react";
import { useCivic } from "@/lib/civic/store";
import { CATEGORIES, LOCATIONS, SEVERITY_LABELS, type Category, type Severity } from "@/lib/civic/data";
import { PageHeader, Panel } from "@/components/civic/ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/report")({
  head: () => ({
    meta: [
      { title: "Report an Issue — CivicShield AI" },
      { name: "description", content: "Report waterlogging, garbage, potholes, streetlight failures or water leaks." },
      { property: "og:title", content: "Report an Issue — CivicShield AI" },
      { property: "og:description", content: "Submit a civic complaint in seconds." },
    ],
  }),
  component: ReportPage,
});

const selectCls = "h-9 w-full rounded-md border border-input bg-card px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring";
type Errors = Partial<Record<"category" | "title" | "description" | "locationId" | "severity" | "image", string | undefined>>;

function ReportPage() {
  const { addComplaint, risks } = useCivic();
  const [f, setF] = useState({ category: "", title: "", description: "", locationId: "", severity: "" });
  const [image, setImage] = useState<string | undefined>();
  const [errors, setErrors] = useState<Errors>({});
  const [done, setDone] = useState<{ id: string; loc: string } | null>(null);

  const set = (k: keyof typeof f, v: string) => { setF((p) => ({ ...p, [k]: v })); setErrors((e) => ({ ...e, [k]: undefined })); };

  const onFile = (file?: File) => {
    if (!file) return setImage(undefined);
    if (!file.type.startsWith("image/")) return setErrors((e) => ({ ...e, image: "Please choose an image file." }));
    if (file.size > 800_000) return setErrors((e) => ({ ...e, image: "Image must be under 800 KB." }));
    const reader = new FileReader();
    reader.onload = () => { setImage(reader.result as string); setErrors((e) => ({ ...e, image: undefined })); };
    reader.readAsDataURL(file);
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const err: Errors = {};
    if (!f.category) err.category = "Select an issue category.";
    if (f.title.trim().length < 5) err.title = "Title must be at least 5 characters.";
    if (f.title.length > 100) err.title = "Title must be under 100 characters.";
    if (f.description.trim().length < 15) err.description = "Describe the issue in at least 15 characters.";
    if (f.description.length > 1000) err.description = "Description must be under 1000 characters.";
    if (!f.locationId) err.locationId = "Select a location.";
    if (!f.severity) err.severity = "Select a severity.";
    setErrors(err);
    if (Object.keys(err).length) { toast.error("Please fix the highlighted fields."); return; }
    const c = addComplaint({
      category: f.category as Category,
      title: f.title.trim(),
      description: f.description.trim(),
      locationId: f.locationId,
      severity: Number(f.severity) as Severity,
      image,
    });
    toast.success(`Complaint ${c.id} submitted`, { description: "Risk scores have been recalculated." });
    setDone({ id: c.id, loc: c.locationId });
    setF({ category: "", title: "", description: "", locationId: "", severity: "" });
    setImage(undefined);
  };

  const doneRisk = done && risks.find((r) => r.location.id === done.loc);

  return (
    <>
      <PageHeader title="Report an Issue" subtitle="Your report feeds directly into the risk engine for the selected location." />
      {done && doneRisk && (
        <div className="mb-6 flex flex-col gap-2 rounded-xl border border-risk-low/40 bg-risk-low/10 p-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="flex items-center gap-2 text-sm"><CheckCircle2 className="h-4 w-4 text-risk-low" />
            Complaint <b>{done.id}</b> recorded. {doneRisk.location.name} risk is now <b>{doneRisk.score} ({doneRisk.level})</b>.
          </p>
          <Link to="/complaints" className="text-sm font-medium text-teal hover:underline">View in complaints →</Link>
        </div>
      )}
      <Panel className="max-w-3xl">
        <form onSubmit={submit} noValidate className="grid gap-5 sm:grid-cols-2">
          <Field label="Issue category" error={errors.category}>
            <select className={selectCls} value={f.category} onChange={(e) => set("category", e.target.value)}>
              <option value="">Select category</option>
              {CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
            </select>
          </Field>
          <Field label="Location" error={errors.locationId}>
            <select className={selectCls} value={f.locationId} onChange={(e) => set("locationId", e.target.value)}>
              <option value="">Select location</option>
              {LOCATIONS.map((l) => <option key={l.id} value={l.id}>{l.name} ({l.area})</option>)}
            </select>
          </Field>
          <Field label="Complaint title" error={errors.title} className="sm:col-span-2">
            <Input value={f.title} maxLength={100} onChange={(e) => set("title", e.target.value)} placeholder="e.g. Drain overflowing near bus stop" />
          </Field>
          <Field label="Description" error={errors.description} className="sm:col-span-2">
            <Textarea rows={4} value={f.description} maxLength={1000} onChange={(e) => set("description", e.target.value)} placeholder="What did you see, since when, and how is it affecting people?" />
          </Field>
          <Field label="Severity" error={errors.severity}>
            <div className="grid grid-cols-4 gap-2">
              {([1, 2, 3, 4] as Severity[]).map((s) => (
                <button type="button" key={s} onClick={() => set("severity", String(s))}
                  className={`rounded-md border px-2 py-2 text-xs font-medium transition-colors ${f.severity === String(s) ? "border-teal bg-teal/10" : "hover:bg-secondary"}`}>
                  {SEVERITY_LABELS[s]}
                </button>
              ))}
            </div>
          </Field>
          <Field label="Photo (optional)" error={errors.image}>
            <label className="flex h-9 cursor-pointer items-center gap-2 rounded-md border border-dashed px-3 text-sm text-muted-foreground hover:bg-secondary">
              <Upload className="h-4 w-4" />{image ? "Image attached — change" : "Upload image"}
              <input type="file" accept="image/*" className="hidden" onChange={(e) => onFile(e.target.files?.[0])} />
            </label>
          </Field>
          {image && <img src={image} alt="Preview" className="h-32 w-auto rounded-lg border object-cover sm:col-span-2" />}
          <div className="sm:col-span-2"><Button type="submit" className="w-full sm:w-auto">Submit complaint</Button></div>
        </form>
      </Panel>
    </>
  );
}

function Field({ label, error, children, className }: { label: string; error?: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={className}>
      <Label className="mb-1.5 block">{label}</Label>
      {children}
      {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
    </div>
  );
}
