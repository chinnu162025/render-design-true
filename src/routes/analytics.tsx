import { createFileRoute } from "@tanstack/react-router";
import { Bar, BarChart, CartesianGrid, Cell, Legend, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useCivic } from "@/lib/civic/store";
import { areaComparison, categoryCounts, riskDistribution, weeklyTrend } from "@/lib/civic/stats";
import { DemoNote, PageHeader, Panel, chartColors, riskColorVar } from "@/components/civic/ui";

export const Route = createFileRoute("/analytics")({
  head: () => ({
    meta: [
      { title: "Analytics — CivicShield AI" },
      { name: "description", content: "Complaint trends, category mix, resolution rate, risk distribution and area comparisons." },
      { property: "og:title", content: "Analytics — CivicShield AI" },
      { property: "og:description", content: "Data-driven view of community issues." },
    ],
  }),
  component: AnalyticsPage,
});

const axis = { fontSize: 11, stroke: "var(--muted-foreground)" };

function AnalyticsPage() {
  const { complaints, risks } = useCivic();
  const trend = weeklyTrend(complaints, 12);
  const cats = categoryCounts(complaints);
  const dist = riskDistribution(risks);
  const areas = areaComparison(complaints, risks);
  const resolved = complaints.filter((c) => c.status === "Resolved").length;
  const inProg = complaints.filter((c) => c.status === "In Progress").length;
  const rate = complaints.length ? Math.round((resolved / complaints.length) * 100) : 0;
  const statusData = [
    { name: "Resolved", value: resolved, fill: "var(--risk-low)" },
    { name: "In Progress", value: inProg, fill: "var(--chart-1)" },
    { name: "Reported", value: complaints.length - resolved - inProg, fill: "var(--chart-2)" },
  ];

  return (
    <>
      <PageHeader title="Analytics" subtitle="Patterns across complaints, locations and predicted risk." />
      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title="Complaint trends" subtitle="Last 12 weeks">
          <div className="h-64"><ResponsiveContainer>
            <LineChart data={trend}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="week" {...axis} /><YAxis allowDecimals={false} {...axis} /><Tooltip /><Legend />
              <Line dataKey="reported" stroke="var(--chart-2)" strokeWidth={2} />
              <Line dataKey="resolved" stroke="var(--chart-1)" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer></div>
        </Panel>
        <Panel title="Category distribution">
          <div className="h-64"><ResponsiveContainer>
            <PieChart>
              <Pie data={cats} dataKey="value" nameKey="name" innerRadius={50} outerRadius={90} paddingAngle={2}>
                {cats.map((_, i) => <Cell key={i} fill={chartColors[i]} />)}
              </Pie>
              <Tooltip /><Legend wrapperStyle={{ fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer></div>
        </Panel>
        <Panel title="Resolution rate" subtitle={`${rate}% of all complaints resolved`}>
          <div className="h-64"><ResponsiveContainer>
            <PieChart>
              <Pie data={statusData} dataKey="value" nameKey="name" innerRadius={60} outerRadius={90}>
                {statusData.map((d) => <Cell key={d.name} fill={d.fill} />)}
              </Pie>
              <Tooltip /><Legend wrapperStyle={{ fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer></div>
        </Panel>
        <Panel title="Risk distribution" subtitle="Locations per risk level">
          <div className="h-64"><ResponsiveContainer>
            <BarChart data={dist}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="level" {...axis} /><YAxis allowDecimals={false} {...axis} /><Tooltip />
              <Bar dataKey="count" radius={[6, 6, 0, 0]}>{dist.map((d) => <Cell key={d.level} fill={riskColorVar[d.level]} />)}</Bar>
            </BarChart>
          </ResponsiveContainer></div>
        </Panel>
        <Panel title="Area comparison" className="lg:col-span-2">
          <div className="h-72"><ResponsiveContainer>
            <BarChart data={areas}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="area" {...axis} /><YAxis allowDecimals={false} {...axis} /><Tooltip /><Legend />
              <Bar dataKey="complaints" fill="var(--chart-2)" radius={[6, 6, 0, 0]} />
              <Bar dataKey="unresolved" fill="var(--chart-5)" radius={[6, 6, 0, 0]} />
              <Bar dataKey="avgRisk" name="avg risk score" fill="var(--chart-1)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer></div>
        </Panel>
      </div>
      <div className="mt-6"><DemoNote /></div>
    </>
  );
}
