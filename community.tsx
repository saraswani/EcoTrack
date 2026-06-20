import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { Trophy, Heart, MessageCircle, Crown, MapPin } from "lucide-react";

export const Route = createFileRoute("/community")({
  head: () => ({ meta: [{ title: "Community — EcoTrack" }] }),
  component: Community,
});

const leaders = [
  { rank: 1, name: "Maya R.", pts: 2480, grad: "from-amber-200 to-rose-300" },
  { rank: 2, name: "Jordan K.", pts: 2210, grad: "from-emerald-200 to-teal-400" },
  { rank: 3, name: "Alex (you)", pts: 1980, grad: "from-lime-200 to-green-400", you: true },
  { rank: 4, name: "Sam P.", pts: 1740, grad: "from-sky-200 to-indigo-300" },
  { rank: 5, name: "Riley T.", pts: 1620, grad: "from-fuchsia-200 to-pink-300" },
];

const feed = [
  { user: "Maya R.", grad: "from-amber-200 to-rose-300", time: "2h", text: "Hit a 30-day plastic-free streak 🌿 small swaps add up!", kg: 18, likes: 42 },
  { user: "Jordan K.", grad: "from-emerald-200 to-teal-400", time: "5h", text: "Biked to work all week — saved 12kg CO₂ and feel amazing.", kg: 12, likes: 27 },
];

function Community() {
  return (
    <AppShell>
      <div className="pt-1">
        <h1 className="text-[28px] font-extrabold tracking-tight text-foreground">Community</h1>
        <p className="mt-1 inline-flex items-center gap-1 text-sm text-muted-foreground">
          <MapPin className="h-3.5 w-3.5" /> Portland · 2,481 members
        </p>
      </div>

      <section className="mt-5 rounded-3xl bg-card p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="inline-flex items-center gap-2 text-base font-bold text-foreground">
            <Trophy className="h-4 w-4 text-primary" /> Leaderboard
          </h2>
          <span className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-primary">This week</span>
        </div>
        <ul className="mt-4 divide-y divide-border">
          {leaders.map((l) => (
            <li key={l.rank} className={`flex items-center gap-3 py-3 ${l.you ? "rounded-2xl bg-secondary/40 px-3" : ""}`}>
              <span className={`w-5 text-center text-sm font-bold ${l.rank === 1 ? "text-primary" : "text-muted-foreground"}`}>
                {l.rank === 1 ? <Crown className="mx-auto h-4 w-4" /> : l.rank}
              </span>
              <div className={`h-9 w-9 rounded-full bg-gradient-to-br ${l.grad}`} />
              <p className="flex-1 text-sm font-semibold text-foreground">{l.name}</p>
              <p className="text-sm font-bold text-primary">{l.pts.toLocaleString()} XP</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-6">
        <h2 className="text-base font-bold text-foreground">Recent wins</h2>
        <div className="mt-3 space-y-3">
          {feed.map((p, i) => (
            <article key={i} className="rounded-3xl bg-card p-5 shadow-sm">
              <header className="flex items-center gap-3">
                <div className={`h-10 w-10 rounded-full bg-gradient-to-br ${p.grad}`} />
                <div>
                  <p className="text-sm font-bold text-foreground">{p.user}</p>
                  <p className="text-xs text-muted-foreground">{p.time} ago</p>
                </div>
                <span className="ml-auto rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-primary">−{p.kg} kg CO₂</span>
              </header>
              <p className="mt-3 text-sm text-foreground/90">{p.text}</p>
              <footer className="mt-4 flex items-center gap-5 text-xs text-muted-foreground">
                <button className="inline-flex items-center gap-1.5 hover:text-primary">
                  <Heart className="h-4 w-4" /> {p.likes}
                </button>
                <button className="inline-flex items-center gap-1.5 hover:text-primary">
                  <MessageCircle className="h-4 w-4" /> Reply
                </button>
              </footer>
            </article>
          ))}
        </div>
      </section>
    </AppShell>
  );
}
