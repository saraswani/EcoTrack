import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { Car, Zap, UtensilsCrossed, Trash2, TreePine, PiggyBank, TrendingUp, Sparkles } from "lucide-react";
import { useMemo } from "react";
import { useScannerHistory } from "@/hooks/useScannerHistory";
import { breakdownByBucket, sumEmissions, gradeFor } from "@/lib/carbon";

export const Route = createFileRoute("/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — EcoTrack" }] }),
  component: Dashboard,
});

function Dashboard() {
  const { history } = useScannerHistory();
  const goal = 1000;

  const { footprint, totals, ecoScore, grade } = useMemo(() => {
    const totals = breakdownByBucket(history);
    const footprint = Math.round(sumEmissions(history.map((h) => h.kg)));
    // Eco score: 100 at zero emissions, 0 at goal+. Linear with floor.
    const ecoScore = Math.max(0, Math.min(100, Math.round(100 - (footprint / goal) * 100)));
    const grade = gradeFor(footprint / Math.max(1, history.length || 1)).grade;
    return { footprint, totals, ecoScore, grade };
  }, [history]);

  const pct = Math.min(1, footprint / goal);
  const maxBucket = Math.max(totals.transport, totals.energy, totals.food, totals.waste, 1);

  return (
    <AppShell>
      <div className="pt-1">
        <h1 className="text-[28px] font-extrabold tracking-tight text-foreground">
          Good morning, <span className="text-primary">Alex.</span>
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {history.length === 0
            ? "Scan your first bill or receipt to see live numbers here."
            : `Tracking ${history.length} ${history.length === 1 ? "entry" : "entries"} this month.`}
        </p>
      </div>

      {/* Carbon Footprint */}
      <section className="mt-6 rounded-3xl bg-card p-6 shadow-sm">
        <h2 className="text-center text-base font-bold text-foreground">Carbon Footprint</h2>
        <div className="mx-auto mt-4 grid h-52 w-52 place-items-center">
          <RadialProgress value={pct} />
          <div className="-mt-52 grid h-52 w-52 place-items-center text-center">
            <div>
              <p className="text-[44px] font-extrabold leading-none text-primary tabular-nums">{footprint}</p>
              <p className="mt-1 text-xs text-muted-foreground">kg CO₂/month</p>
            </div>
          </div>
        </div>
        <p className="mt-4 text-center text-sm text-foreground/80">
          {Math.round(pct * 100)}% of your {goal} kg monthly goal · grade {grade}
        </p>
      </section>

      {/* EcoScore */}
      <section className="mt-4 rounded-3xl bg-primary p-6 text-primary-foreground shadow-sm">
        <h2 className="text-xl font-bold">EcoScore</h2>
        <p className="mt-1 text-sm text-primary-foreground/80">Overall Sustainability Grade</p>
        <p className="mt-5 text-[44px] font-extrabold leading-none tabular-nums">
          {ecoScore}<span className="text-xl font-semibold text-primary-foreground/70">/100</span>
        </p>
        <div className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 text-sm font-semibold">
          <TrendingUp className="h-4 w-4" /> {ecoScore >= 80 ? "Excellent" : ecoScore >= 60 ? "Good" : ecoScore >= 40 ? "Improving" : "Needs work"}
        </div>
      </section>

      {/* Impact summary */}
      <section className="mt-4 grid grid-cols-2 gap-3">
        <SummaryCard
          icon={<TreePine className="h-5 w-5 text-primary" />}
          value={Math.max(0, Math.round((goal - footprint) / 21)).toString()}
          label="Trees Saved"
        />
        <SummaryCard
          icon={<PiggyBank className="h-5 w-5 text-primary" />}
          value={`$${Math.max(0, Math.round((goal - footprint) * 0.05))}`}
          label="Saved"
        />
      </section>

      {/* Emissions Breakdown */}
      <section className="mt-4 rounded-3xl bg-card p-5 shadow-sm">
        <h2 className="text-base font-bold text-foreground">Emissions Breakdown</h2>
        <div className="mt-4 space-y-4">
          <Bar icon={<Car className="h-4 w-4" />} label="Transportation" value={Math.round(totals.transport)} pct={totals.transport / maxBucket} />
          <Bar icon={<Zap className="h-4 w-4" />} label="Energy" value={Math.round(totals.energy)} pct={totals.energy / maxBucket} />
          <Bar icon={<UtensilsCrossed className="h-4 w-4" />} label="Food" value={Math.round(totals.food)} pct={totals.food / maxBucket} />
          <Bar icon={<Trash2 className="h-4 w-4" />} label="Waste" value={Math.round(totals.waste)} pct={totals.waste / maxBucket} muted />
        </div>
      </section>

      {/* Monthly progress */}
      <section className="mt-4 rounded-3xl bg-card p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-foreground">Monthly Progress</h2>
          <span className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-primary">
            -8% vs avg
          </span>
        </div>
        <MiniChart />
        <div className="mt-3 grid grid-cols-5 text-center text-xs text-muted-foreground">
          {["Jan", "Feb", "Mar", "Apr", "May"].map((m, i) => (
            <span key={m} className={i === 4 ? "font-bold text-primary" : ""}>
              {m}
            </span>
          ))}
        </div>
      </section>

      <Link
        to="/coach"
        className="fixed bottom-24 right-4 z-40 flex items-center gap-2 rounded-full bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/30 transition hover:scale-105"
      >
        <Sparkles className="h-4 w-4" /> EcoCoach
      </Link>
    </AppShell>
  );
}

function RadialProgress({ value }: { value: number }) {
  const r = 88;
  const c = 2 * Math.PI * r;
  const offset = c * (1 - value);
  return (
    <svg viewBox="0 0 200 200" className="h-52 w-52 -rotate-90">
      <circle cx="100" cy="100" r={r} stroke="var(--secondary)" strokeWidth="14" fill="none" />
      <circle
        cx="100"
        cy="100"
        r={r}
        stroke="var(--primary)"
        strokeWidth="14"
        strokeLinecap="round"
        fill="none"
        strokeDasharray={c}
        strokeDashoffset={offset}
        className="transition-all duration-700"
      />
    </svg>
  );
}

function SummaryCard({ icon, value, label }: { icon: React.ReactNode; value: string; label: string }) {
  return (
    <div className="flex items-center gap-3 rounded-3xl bg-card p-4 shadow-sm">
      <div className="grid h-11 w-11 place-items-center rounded-full bg-secondary">{icon}</div>
      <div>
        <p className="text-lg font-extrabold text-foreground">{value}</p>
        <p className="text-xs text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}

function Bar({
  icon,
  label,
  value,
  pct,
  muted = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  pct: number;
  muted?: boolean;
}) {
  return (
    <div>
      <div className="flex items-center justify-between text-sm">
        <span className="flex items-center gap-2 text-foreground">
          <span className="text-muted-foreground">{icon}</span>
          {label}
        </span>
        <span className="font-semibold text-foreground">{value} kg</span>
      </div>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
        <div
          className={`h-full rounded-full ${muted ? "bg-muted-foreground/50" : "bg-primary"}`}
          style={{ width: `${pct * 100}%` }}
        />
      </div>
    </div>
  );
}

function MiniChart() {
  const points = [70, 55, 60, 45, 38];
  const max = 80;
  return (
    <svg viewBox="0 0 300 100" className="mt-4 h-24 w-full">
      <polyline
        fill="none"
        stroke="var(--primary)"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points
          .map((p, i) => `${(i / (points.length - 1)) * 300},${100 - (p / max) * 90}`)
          .join(" ")}
      />
      {points.map((p, i) => (
        <circle
          key={i}
          cx={(i / (points.length - 1)) * 300}
          cy={100 - (p / max) * 90}
          r={i === points.length - 1 ? 5 : 3}
          fill="var(--primary)"
        />
      ))}
    </svg>
  );
}
