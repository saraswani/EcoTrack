import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { Bell, Moon, Target, Shield, HelpCircle, LogOut, ChevronRight, Award, Sprout, Trees } from "lucide-react";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/profile")({
  head: () => ({ meta: [{ title: "Profile — EcoTrack" }] }),
  component: Profile,
});

function Profile() {
  const [dark, setDark] = useState(false);
  const [notif, setNotif] = useState(true);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  const badges = [
    { icon: Sprout, label: "Seedling" },
    { icon: Trees, label: "Forest" },
    { icon: Award, label: "Streak 30" },
  ];

  return (
    <AppShell>
      <div className="pt-1">
        <h1 className="text-[28px] font-extrabold tracking-tight text-foreground">Profile</h1>
      </div>

      <section className="mt-5 flex items-center gap-4 rounded-3xl bg-card p-5 shadow-sm">
        <div className="h-16 w-16 rounded-full bg-gradient-to-br from-lime-200 to-green-400 ring-4 ring-secondary" />
        <div className="flex-1">
          <p className="text-lg font-extrabold text-foreground">Alex Rivers</p>
          <p className="text-xs text-muted-foreground">alex@restorative.eco</p>
          <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-secondary px-2.5 py-1 text-[11px] font-semibold text-primary">
            <Award className="h-3 w-3" /> Eco Champion · Lvl 7
          </div>
        </div>
      </section>

      <section className="mt-4 grid grid-cols-3 gap-3">
        {[
          { v: "1,980", l: "XP" },
          { v: "12", l: "Streak" },
          { v: "84", l: "EcoScore" },
        ].map((s) => (
          <div key={s.l} className="rounded-2xl bg-card p-4 text-center shadow-sm">
            <p className="text-xl font-extrabold text-primary">{s.v}</p>
            <p className="text-[11px] text-muted-foreground">{s.l}</p>
          </div>
        ))}
      </section>

      <section className="mt-4 rounded-3xl bg-card p-5 shadow-sm">
        <h2 className="text-base font-bold text-foreground">Badges</h2>
        <div className="mt-3 flex gap-3">
          {badges.map((b) => {
            const Icon = b.icon;
            return (
              <div key={b.label} className="flex flex-1 flex-col items-center gap-2 rounded-2xl bg-secondary/50 py-4">
                <Icon className="h-6 w-6 text-primary" />
                <span className="text-[11px] font-semibold text-primary">{b.label}</span>
              </div>
            );
          })}
        </div>
      </section>

      <section className="mt-4 overflow-hidden rounded-3xl bg-card shadow-sm">
        <Row icon={Target} label="Monthly goal" trailing={<span className="text-xs font-semibold text-primary">1,000 kg</span>} />
        <Toggle icon={Bell} label="Notifications" value={notif} onChange={setNotif} />
        <Toggle icon={Moon} label="Dark mode" value={dark} onChange={setDark} />
        <Row icon={Shield} label="Privacy & data" />
        <Row icon={HelpCircle} label="Help & support" />
      </section>

      <Link to="/" className="mt-4 flex items-center justify-center gap-2 rounded-full bg-muted py-4 text-sm font-semibold text-destructive">
        <LogOut className="h-4 w-4" /> Sign out
      </Link>

      <p className="mt-6 text-center text-xs text-muted-foreground">EcoTrack v1.0 · Made with care 🌱</p>
    </AppShell>
  );
}

function Row({ icon: Icon, label, trailing }: { icon: React.ElementType; label: string; trailing?: React.ReactNode }) {
  return (
    <button className="flex w-full items-center gap-3 border-b border-border px-5 py-4 text-left last:border-b-0 hover:bg-muted/50">
      <div className="grid h-9 w-9 place-items-center rounded-full bg-secondary text-primary">
        <Icon className="h-4 w-4" />
      </div>
      <span className="flex-1 text-sm font-semibold text-foreground">{label}</span>
      {trailing ?? <ChevronRight className="h-4 w-4 text-muted-foreground" />}
    </button>
  );
}

function Toggle({ icon: Icon, label, value, onChange }: { icon: React.ElementType; label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex w-full items-center gap-3 border-b border-border px-5 py-4 last:border-b-0">
      <div className="grid h-9 w-9 place-items-center rounded-full bg-secondary text-primary">
        <Icon className="h-4 w-4" />
      </div>
      <span className="flex-1 text-sm font-semibold text-foreground">{label}</span>
      <button
        onClick={() => onChange(!value)}
        className={`relative h-6 w-11 rounded-full transition-colors ${value ? "bg-primary" : "bg-muted-foreground/30"}`}
        aria-pressed={value}
      >
        <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${value ? "left-[22px]" : "left-0.5"}`} />
      </button>
    </div>
  );
}
