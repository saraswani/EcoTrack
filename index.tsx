import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import earthImg from "@/assets/earth-leaves.jpg";
import { Leaf, Award, QrCode, Users } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "EcoTrack — Measure. Improve. Make Every Action Count." },
      { name: "description", content: "Track your carbon footprint and join a community making a real impact." },
      { property: "og:title", content: "EcoTrack" },
      { property: "og:description", content: "Track your carbon footprint and join a community making a real impact." },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <AppShell>
      <section className="pt-2">
        <div className="overflow-hidden rounded-[28px] bg-gradient-to-b from-secondary/40 to-transparent p-2">
          <img
            src={earthImg}
            alt="Earth surrounded by leaves"
            width={1024}
            height={1024}
            className="aspect-square w-full rounded-[24px] object-cover"
          />
        </div>
        <h1 className="mt-7 text-center text-[34px] font-extrabold leading-[1.1] tracking-tight text-foreground">
          Measure. Improve. <span className="text-primary">Make Every Action Count.</span>
        </h1>
        <p className="mt-4 text-center text-[15px] leading-relaxed text-muted-foreground">
          Track your carbon footprint and join a community making a real impact. Start your journey toward a restorative lifestyle today.
        </p>
        <div className="mt-7 space-y-3">
          <Link
            to="/dashboard"
            className="block w-full rounded-full bg-primary px-6 py-4 text-center text-base font-semibold text-primary-foreground shadow-sm transition hover:opacity-95"
          >
            Calculate My Footprint
          </Link>
          <Link
            to="/auth"
            className="block w-full rounded-full bg-secondary px-6 py-4 text-center text-base font-semibold text-primary transition hover:bg-secondary/80"
          >
            Learn More
          </Link>
        </div>
      </section>

      <section className="mt-10 rounded-3xl bg-card p-5 shadow-sm">
        <div className="flex items-start justify-between">
          <div>
            <span className="inline-block rounded-full bg-secondary px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-primary">
              Live Updates
            </span>
            <h2 className="mt-3 text-lg font-bold text-foreground">Daily Community Impact</h2>
          </div>
          <Leaf className="h-5 w-5 text-primary" />
        </div>
        <div className="mt-4 flex items-end gap-4">
          <div>
            <p className="text-[44px] font-extrabold leading-none text-primary">12.4k</p>
            <p className="mt-1 text-xs text-muted-foreground">tons CO₂</p>
          </div>
          <div className="ml-auto rounded-full bg-secondary/70 px-3 py-2 text-sm font-semibold text-primary">
            +12% vs yest.
          </div>
        </div>
        <p className="mt-3 text-sm text-muted-foreground">Carbon offset by our community today</p>
      </section>

      <section className="mt-4 rounded-3xl bg-muted p-6 text-center">
        <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-card shadow-sm">
          <Award className="h-5 w-5 text-primary" />
        </div>
        <h3 className="mt-3 text-lg font-bold text-foreground">Join Challenges</h3>
        <p className="mt-1 text-sm text-muted-foreground">Compete with friends to reduce plastic waste.</p>
      </section>

      <section className="mt-4 rounded-3xl bg-primary p-6 text-primary-foreground">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold">Instant Insight</h3>
            <p className="mt-2 text-sm text-primary-foreground/80">
              Scan products to see their environmental score instantly.
            </p>
          </div>
          <div className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-white/10">
            <QrCode className="h-7 w-7" />
          </div>
        </div>
      </section>

      <section className="mt-4 flex items-center gap-4 rounded-3xl bg-card p-5 shadow-sm">
        <div className="flex -space-x-3">
          {["from-amber-200 to-rose-300", "from-emerald-200 to-teal-400", "from-lime-200 to-green-400"].map(
            (g, i) => (
              <div
                key={i}
                className={`h-10 w-10 rounded-full bg-gradient-to-br ${g} ring-2 ring-card`}
              />
            ),
          )}
          <div className="grid h-10 w-10 place-items-center rounded-full bg-secondary text-[11px] font-semibold text-primary ring-2 ring-card">
            +2k
          </div>
        </div>
        <div>
          <h3 className="text-base font-bold text-foreground">Local Experts</h3>
          <p className="text-sm text-muted-foreground">Connect with 2,400+ members in your area.</p>
        </div>
        <Users className="ml-auto h-5 w-5 text-muted-foreground" />
      </section>

      <p className="mt-10 text-center text-sm italic text-primary">
        "Nature does not hurry, yet everything is accomplished."
      </p>
    </AppShell>
  );
}
