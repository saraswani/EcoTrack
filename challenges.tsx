import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { Flame, Bike, Droplets, Leaf, ShoppingBag, Trophy, Check, Clock } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/challenges")({
  head: () => ({ meta: [{ title: "Challenges — EcoTrack" }] }),
  component: Challenges,
});

const active = [
  { id: 1, icon: Bike, title: "Bike to work", desc: "Replace 3 car trips this week", progress: 2, total: 3, days: 4, color: "bg-secondary" },
  { id: 2, icon: Droplets, title: "Shorter showers", desc: "Keep showers under 5 min", progress: 5, total: 7, days: 2, color: "bg-secondary" },
];

const explore = [
  { id: 3, icon: ShoppingBag, title: "Plastic-free week", desc: "Avoid single-use plastics for 7 days", points: 120 },
  { id: 4, icon: Leaf, title: "Meatless Mondays", desc: "Go plant-based every Monday", points: 80 },
  { id: 5, icon: Trophy, title: "Zero-waste lunch", desc: "Pack reusable lunch for 5 days", points: 60 },
];

function Challenges() {
  const [joined, setJoined] = useState<number[]>([]);
  return (
    <AppShell>
      <div className="pt-1">
        <h1 className="text-[28px] font-extrabold tracking-tight text-foreground">Challenges</h1>
        <p className="mt-1 text-sm text-muted-foreground">Small actions, real impact.</p>
      </div>

      <section className="mt-5 flex items-center gap-3 rounded-3xl bg-primary p-5 text-primary-foreground shadow-sm">
        <div className="grid h-12 w-12 place-items-center rounded-full bg-white/15">
          <Flame className="h-6 w-6" />
        </div>
        <div>
          <p className="text-2xl font-extrabold leading-none">12-day streak</p>
          <p className="mt-1 text-xs text-primary-foreground/80">Keep going to unlock the Oak badge</p>
        </div>
        <div className="ml-auto rounded-full bg-white/15 px-3 py-1.5 text-xs font-semibold">+340 XP</div>
      </section>

      <section className="mt-6">
        <h2 className="text-base font-bold text-foreground">Active</h2>
        <div className="mt-3 space-y-3">
          {active.map((c) => {
            const Icon = c.icon;
            const pct = (c.progress / c.total) * 100;
            return (
              <div key={c.id} className="rounded-3xl bg-card p-5 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="grid h-11 w-11 place-items-center rounded-full bg-secondary">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-foreground">{c.title}</p>
                    <p className="text-xs text-muted-foreground">{c.desc}</p>
                  </div>
                  <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-[11px] font-semibold text-foreground/70">
                    <Clock className="h-3 w-3" /> {c.days}d
                  </span>
                </div>
                <div className="mt-4 h-2 overflow-hidden rounded-full bg-muted">
                  <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${pct}%` }} />
                </div>
                <div className="mt-2 flex justify-between text-xs text-muted-foreground">
                  <span>{c.progress}/{c.total} completed</span>
                  <span className="font-semibold text-primary">{Math.round(pct)}%</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="mt-6">
        <h2 className="text-base font-bold text-foreground">Explore</h2>
        <div className="mt-3 space-y-3">
          {explore.map((c) => {
            const Icon = c.icon;
            const isJoined = joined.includes(c.id);
            return (
              <div key={c.id} className="flex items-center gap-3 rounded-3xl bg-card p-4 shadow-sm">
                <div className="grid h-11 w-11 place-items-center rounded-full bg-secondary">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="font-bold text-foreground">{c.title}</p>
                  <p className="text-xs text-muted-foreground">{c.desc} · +{c.points} XP</p>
                </div>
                <button
                  onClick={() => setJoined((j) => (j.includes(c.id) ? j : [...j, c.id]))}
                  className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
                    isJoined ? "bg-secondary text-primary" : "bg-primary text-primary-foreground"
                  }`}
                >
                  {isJoined ? (<span className="inline-flex items-center gap-1"><Check className="h-3 w-3" /> Joined</span>) : "Join"}
                </button>
              </div>
            );
          })}
        </div>
      </section>
    </AppShell>
  );
}
