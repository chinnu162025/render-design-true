import { useState, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { LayoutDashboard, BrainCircuit, Map, FilePlus2, ListChecks, BarChart3, ShieldCheck, Menu, X, Shield } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/risk", label: "AI Risk Intelligence", icon: BrainCircuit },
  { to: "/map", label: "Community Risk Map", icon: Map },
  { to: "/report", label: "Report an Issue", icon: FilePlus2 },
  { to: "/complaints", label: "Complaint Management", icon: ListChecks },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/actions", label: "Preventive Actions", icon: ShieldCheck },
] as const;

function NavList({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <nav className="flex flex-col gap-1">
      {NAV.map(({ to, label, icon: Icon }) => (
        <Link
          key={to}
          to={to}
          onClick={onNavigate}
          activeOptions={{ exact: to === "/" }}
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-sidebar-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          activeProps={{ className: "bg-sidebar-accent !text-sidebar-accent-foreground font-medium [&>svg]:text-sidebar-primary" }}
        >
          <Icon className="h-4 w-4" />
          {label}
        </Link>
      ))}
    </nav>
  );
}

function Brand() {
  return (
    <div className="flex items-center gap-2.5">
      <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
        <Shield className="h-5 w-5" />
      </span>
      <div>
        <div className="font-display text-base font-bold text-sidebar-accent-foreground">CivicShield AI</div>
        <div className="text-[11px] text-sidebar-foreground/70">Predictive Community Management</div>
      </div>
    </div>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="min-h-screen bg-background">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col bg-sidebar p-4 lg:flex">
        <div className="mb-8 px-2 pt-2"><Brand /></div>
        <NavList />
        <div className="mt-auto rounded-lg bg-sidebar-accent p-3 text-xs text-sidebar-foreground">
          Rule-based predictive risk engine running on demonstration data.
        </div>
      </aside>

      <header className="sticky top-0 z-30 flex items-center justify-between bg-sidebar px-4 py-3 lg:hidden">
        <Brand />
        <button aria-label="Open menu" onClick={() => setOpen(true)} className="rounded-md p-2 text-sidebar-accent-foreground">
          <Menu className="h-5 w-5" />
        </button>
      </header>
      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-navy/60" onClick={() => setOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-72 bg-sidebar p-4">
            <div className="mb-6 flex items-center justify-between px-2 pt-2">
              <Brand />
              <button aria-label="Close menu" onClick={() => setOpen(false)} className="text-sidebar-accent-foreground"><X className="h-5 w-5" /></button>
            </div>
            <NavList onNavigate={() => setOpen(false)} />
          </div>
        </div>
      )}

      <main className={cn("px-4 py-6 sm:px-6 lg:ml-64 lg:px-10 lg:py-10")}>
        <div className="mx-auto max-w-7xl">{children}</div>
      </main>
    </div>
  );
}
