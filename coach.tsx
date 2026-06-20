import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Send, Sparkles } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export const Route = createFileRoute("/coach")({
  head: () => ({ meta: [{ title: "EcoCoach — EcoTrack" }] }),
  component: Coach,
});

type Msg = { id: number; role: "ai" | "me"; text: string };

const seed: Msg[] = [
  { id: 1, role: "ai", text: "Hi Alex! 🌱 I'm your EcoCoach. Want a quick tip to lower your footprint this week?" },
];

const suggestions = [
  "How can I cut my energy use?",
  "Best low-carbon meals?",
  "Tips for plastic-free shopping",
];

const replies: Record<string, string> = {
  energy: "Switch to LED bulbs and unplug idle electronics — that alone can save ~15 kg CO₂/month. Want a 7-day energy plan?",
  meal: "Plant-forward meals like lentil bowls, veggie stir-fries, and chickpea curries cut food emissions by ~60%. I can suggest 3 recipes.",
  plastic: "Bring reusable bags, choose loose produce, and buy in bulk. Glass and aluminum are great swaps. Want a starter shopping list?",
  default: "Great question! A simple win: shift one car trip to bike or transit this week. That's roughly 6 kg CO₂ saved.",
};

function craftReply(input: string) {
  const t = input.toLowerCase();
  if (t.includes("energy") || t.includes("electric")) return replies.energy;
  if (t.includes("meal") || t.includes("food") || t.includes("eat")) return replies.meal;
  if (t.includes("plastic") || t.includes("shop")) return replies.plastic;
  return replies.default;
}

function Coach() {
  const [msgs, setMsgs] = useState<Msg[]>(seed);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs, typing]);

  const send = (text: string) => {
    if (!text.trim()) return;
    const id = Date.now();
    setMsgs((m) => [...m, { id, role: "me", text }]);
    setInput("");
    setTyping(true);
    setTimeout(() => {
      setMsgs((m) => [...m, { id: id + 1, role: "ai", text: craftReply(text) }]);
      setTyping(false);
    }, 900);
  };

  return (
    <div className="mx-auto flex h-screen max-w-md flex-col bg-background">
      <header className="flex items-center gap-3 border-b border-border bg-card px-5 py-4">
        <Link to="/dashboard" className="grid h-9 w-9 place-items-center rounded-full bg-muted">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div className="grid h-10 w-10 place-items-center rounded-full bg-secondary text-primary">
          <Sparkles className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm font-bold text-foreground">EcoCoach</p>
          <p className="text-[11px] text-primary">● Online</p>
        </div>
      </header>

      <div className="flex-1 space-y-3 overflow-y-auto px-5 py-5">
        {msgs.map((m) => (
          <div key={m.id} className={`flex ${m.role === "me" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[80%] rounded-3xl px-4 py-3 text-sm leading-relaxed ${
                m.role === "me"
                  ? "rounded-br-md bg-primary text-primary-foreground"
                  : "rounded-bl-md bg-card text-foreground shadow-sm"
              }`}
            >
              {m.text}
            </div>
          </div>
        ))}
        {typing && (
          <div className="flex justify-start">
            <div className="flex gap-1 rounded-3xl rounded-bl-md bg-card px-4 py-3 shadow-sm">
              {[0, 150, 300].map((d) => (
                <span
                  key={d}
                  className="h-2 w-2 animate-bounce rounded-full bg-primary/60"
                  style={{ animationDelay: `${d}ms` }}
                />
              ))}
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {msgs.length <= 1 && (
        <div className="flex gap-2 overflow-x-auto px-5 pb-2">
          {suggestions.map((s) => (
            <button
              key={s}
              onClick={() => send(s)}
              className="whitespace-nowrap rounded-full bg-secondary px-3 py-1.5 text-xs font-semibold text-primary"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
        className="flex items-center gap-2 border-t border-border bg-card px-4 py-3"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask EcoCoach…"
          className="flex-1 rounded-full bg-muted px-4 py-3 text-sm outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/30"
        />
        <button
          type="submit"
          className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground disabled:opacity-50"
          disabled={!input.trim()}
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
}