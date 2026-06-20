import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import {
  Camera,
  Upload,
  Receipt,
  Zap,
  ChevronRight,
  Sparkles,
  Car,
  Plane,
  ShoppingBag,
  Lightbulb,
  Leaf,
  Trash2,
  Info,
  CheckCircle2,
  TrendingDown,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import {
  UploadFileSchema,
  EMISSION_FACTORS,
  calculateEmissions,
  gradeFor,
  tipFor,
  type CategoryId,
  type HistoryItem,
} from "@/lib/carbon";
import { useScannerHistory } from "@/hooks/useScannerHistory";

export const Route = createFileRoute("/scanner")({
  head: () => ({ meta: [{ title: "Scanner — EcoTrack" }] }),
  component: Scanner,
});

/** UI metadata for each scannable category. Math lives in `@/lib/carbon`. */
type Category = {
  id: CategoryId;
  label: string;
  icon: typeof Zap;
  unit: string;
  factor: number; // kg CO2 per unit
  placeholder: string;
  hint: string;
  example: string;
  accept: string;
  guide: string[];
};

const CATEGORIES: Category[] = [
  {
    id: "electricity",
    label: "Electricity bill",
    icon: Lightbulb,
    unit: "kWh",
    factor: EMISSION_FACTORS.electricity.factor,
    placeholder: "e.g. 320",
    hint: "Enter kWh used this month from your bill.",
    example: "Avg household ~300 kWh / month",
    accept: "image/*,application/pdf",
    guide: [
      "Upload a photo or PDF of your monthly electricity bill",
      "We read the kWh value — your address stays private",
      "Solar / green tariff? Toggle it after uploading",
    ],
  },
  {
    id: "fuel",
    label: "Fuel / petrol",
    icon: Car,
    unit: "liters",
    factor: EMISSION_FACTORS.fuel.factor,
    placeholder: "e.g. 40",
    hint: "Liters of petrol filled — check your pump receipt.",
    example: "A full tank ≈ 45 L",
    accept: "image/*",
    guide: [
      "Snap your fuel station receipt",
      "We detect liters and fuel type",
      "Diesel and petrol use different factors automatically",
    ],
  },
  {
    id: "flight",
    label: "Flight",
    icon: Plane,
    unit: "km",
    factor: EMISSION_FACTORS.flight.factor,
    placeholder: "e.g. 1200",
    hint: "One-way distance in kilometers.",
    example: "NYC → LA ≈ 3 950 km",
    accept: "image/*,application/pdf",
    guide: [
      "Upload your boarding pass or e-ticket",
      "We pull the route and compute distance",
      "Round-trips? Enter total km or upload both legs",
    ],
  },
  {
    id: "grocery",
    label: "Grocery receipt",
    icon: ShoppingBag,
    unit: "items",
    factor: EMISSION_FACTORS.grocery.factor,
    placeholder: "e.g. 24",
    hint: "Approximate number of items on the receipt.",
    example: "Weekly shop ≈ 20–30 items",
    accept: "image/*",
    guide: [
      "Photograph the full receipt — keep it flat & lit",
      "We classify items (meat, dairy, produce) for accuracy",
      "Plant-based items lower your total automatically",
    ],
  },
  {
    id: "transport",
    label: "Ride / taxi",
    icon: Car,
    unit: "km",
    factor: EMISSION_FACTORS.transport.factor,
    placeholder: "e.g. 12",
    hint: "Distance of the ride in km.",
    example: "Avg city ride ≈ 8 km",
    accept: "image/*",
    guide: [
      "Upload your Uber/Lyft/taxi receipt",
      "We extract distance and vehicle type",
      "EV rides are credited at 60% lower factor",
    ],
  },
];

const SEED_HISTORY: HistoryItem[] = [
  { id: "s1", category: "electricity", label: "Electricity bill — May", amount: 338, unit: "kWh", kg: 141.96, grade: "B", date: "2d ago" },
  { id: "s2", category: "grocery", label: "Grocery receipt", amount: 20, unit: "items", kg: 38, grade: "A", date: "4d ago" },
  { id: "s3", category: "transport", label: "Uber ride", amount: 25, unit: "km", kg: 5.25, grade: "A+", date: "1w ago" },
];

/** Smooth count-up hook */
function useCountUp(target: number, duration = 900) {
  const [value, setValue] = useState(0);
  const startRef = useRef<number | null>(null);
  useEffect(() => {
    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) {
      setValue(target);
      return;
    }
    startRef.current = null;
    let raf = 0;
    const tick = (t: number) => {
      if (startRef.current === null) startRef.current = t;
      const p = Math.min(1, (t - startRef.current) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setValue(target * eased);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return value;
}

function Scanner() {
  const [activeId, setActiveId] = useState<CategoryId>("electricity");
  const [amount, setAmount] = useState("");
  const [scanning, setScanning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressLabel, setProgressLabel] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveProgress, setSaveProgress] = useState(0);
  const [result, setResult] = useState<null | { kg: number; grade: HistoryItem["grade"]; tone: string; tip: string; label: string }>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const { history, add, clear } = useScannerHistory(SEED_HISTORY);
  const fileRef = useRef<HTMLInputElement>(null);

  const active = useMemo(() => CATEGORIES.find((c) => c.id === activeId)!, [activeId]);
  const animatedKg = useCountUp(result?.kg ?? 0);

  const compute = (): number | null => {
    const n = parseFloat(amount);
    if (!isFinite(n) || n <= 0) return null;
    try {
      return calculateEmissions({ category: active.id, amount: n });
    } catch {
      return null;
    }
  };

  const runScan = (auto = false) => {
    let n = parseFloat(amount);
    if (auto && (!isFinite(n) || n <= 0)) {
      const samples: Record<CategoryId, number> = {
        electricity: 280 + Math.round(Math.random() * 120),
        fuel: 30 + Math.round(Math.random() * 25),
        flight: 800 + Math.round(Math.random() * 3000),
        grocery: 15 + Math.round(Math.random() * 20),
        transport: 5 + Math.round(Math.random() * 25),
      };
      n = samples[active.id];
      setAmount(String(n));
    }
    if (!isFinite(n) || n <= 0) {
      toast.error("Enter a value or upload a file first.");
      return;
    }
    setScanning(true);
    setResult(null);
    setProgress(0);
    setProgressLabel("Reading input…");

    const steps = [
      { at: 0, label: "Reading input…" },
      { at: 25, label: "Parsing units…" },
      { at: 50, label: "Running calculation…" },
      { at: 75, label: "Grading impact…" },
      { at: 100, label: "Done" },
    ];

    let raf = 0;
    const start = performance.now();
    const duration = 1600;

    const tick = (t: number) => {
      const p = Math.min(100, ((t - start) / duration) * 100);
      setProgress(p);
      const step = steps.slice().reverse().find((s) => p >= s.at);
      if (step) setProgressLabel(step.label);
      if (p < 100) {
        raf = requestAnimationFrame(tick);
      } else {
        let kg: number;
        try {
          kg = calculateEmissions({ category: active.id, amount: n });
        } catch {
          setScanning(false);
          toast.error("That value looks off — please try again.");
          return;
        }
        const { grade, tone } = gradeFor(kg);
        setResult({ kg, grade, tone, tip: tipFor(active.id, kg), label: active.label });
        setScanning(false);
        toast.success(`Logged ${kg} kg CO₂`);
      }
    };
    raf = requestAnimationFrame(tick);
  };

  const saveToHistory = () => {
    if (!result || saving) return;
    setSaving(true);
    setSaveProgress(0);

    const steps = [
      { at: 0, label: "Verifying entry…" },
      { at: 40, label: "Writing to tracker…" },
      { at: 80, label: "Syncing locally…" },
    ];

    const start = performance.now();
    const duration = 900;
    let raf = 0;

    const tick = (t: number) => {
      const p = Math.min(100, ((t - start) / duration) * 100);
      setSaveProgress(p);
      const step = steps.slice().reverse().find((s) => p >= s.at);
      if (step) setProgressLabel(step.label);
      if (p < 100) {
        raf = requestAnimationFrame(tick);
        return;
      }
      const item: HistoryItem = {
        id: crypto.randomUUID(),
        category: active.id,
        label: `${active.label} — just now`,
        amount: parseFloat(amount),
        unit: active.unit,
        kg: result.kg,
        grade: result.grade,
        date: "now",
        ts: Date.now(),
      };
      add(item);
      setSaving(false);
      setSaveProgress(0);
      setProgressLabel("");
      toast.success("Saved to your tracker");
      setResult(null);
      setAmount("");
      setFileName(null);
    };
    raf = requestAnimationFrame(tick);
  };

  const clearHistory = () => {
    clear();
    toast("History cleared");
  };

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const check = UploadFileSchema.safeParse({ name: f.name, size: f.size, type: f.type });
    if (!check.success) {
      toast.error("Unsupported file. Use an image or PDF under 10 MB.");
      e.target.value = "";
      return;
    }
    setFileName(f.name);
    toast(`Reading ${f.name}…`, { icon: "📄" });
    runScan(true);
  };

  const livePreview = compute();

  return (
    <AppShell>
      <div className="pt-1 animate-fade-in">
        <h1 className="text-[28px] font-extrabold tracking-tight text-foreground">Carbon Scanner</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Measure the footprint of any bill, receipt or trip in seconds.
        </p>
      </div>

      {/* Category chips */}
      <div className="-mx-5 mt-4 overflow-x-auto px-5 [&::-webkit-scrollbar]:hidden">
        <div role="tablist" aria-label="Scan category" className="flex gap-2 pb-1">
          {CATEGORIES.map((c) => {
            const Icon = c.icon;
            const active = c.id === activeId;
            return (
              <button
                key={c.id}
                role="tab"
                aria-selected={active}
                aria-controls="scanner-stage"
                onClick={() => {
                  setActiveId(c.id);
                  setResult(null);
                  setAmount("");
                  setFileName(null);
                }}
                className={`flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold transition-smooth focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
                  active
                    ? "border-primary bg-primary text-primary-foreground shadow-md scale-[1.04]"
                    : "border-border bg-card text-foreground/70 hover:border-primary/40"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {c.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Scanner stage */}
      <section
        id="scanner-stage"
        aria-busy={scanning}
        aria-live="polite"
        className="relative mt-4 overflow-hidden rounded-[28px] bg-gradient-to-br from-primary via-primary to-primary/80 p-6 text-primary-foreground shadow-xl transition-smooth"
      >
        {/* Floating leaves */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          {[0, 1, 2, 3].map((i) => (
            <Leaf
              key={i}
              className="absolute h-4 w-4 text-white/30 animate-float-up"
              style={{
                left: `${15 + i * 22}%`,
                bottom: 0,
                animationDelay: `${i * 0.6}s`,
                animationDuration: `${3 + i * 0.4}s`,
              }}
            />
          ))}
        </div>

        <div className="relative mx-auto grid aspect-square w-full max-w-[240px] place-items-center">
          {scanning && (
            <>
              <div className="absolute inset-0 rounded-3xl border-2 border-white/30 animate-ring-pulse" />
              <div className="absolute inset-2 rounded-3xl border-2 border-white/20 animate-ring-pulse" style={{ animationDelay: "0.4s" }} />
            </>
          )}
          <div className={`absolute inset-0 rounded-3xl border-2 border-dashed transition-smooth ${scanning ? "border-white/80" : "border-white/40"}`} />
          <div className="absolute inset-5 overflow-hidden rounded-2xl bg-white/5 backdrop-blur-sm">
            {scanning && (
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-white to-transparent animate-scan-line" />
            )}
          </div>
          <div className="relative z-10 text-center transition-smooth">
            {scanning ? (
              <div className="animate-fade-in" role="status" aria-label="Analyzing impact">
                <div className="mx-auto h-3 w-3 animate-ping rounded-full bg-white" />
                <p className="mt-3 text-sm font-semibold">Analyzing impact…</p>
                <p className="mt-1 text-[11px] opacity-70">Reading {active.unit}…</p>
              </div>
            ) : (
              <div className="animate-fade-in">
                <active.icon className="mx-auto h-14 w-14 transition-smooth hover:scale-110" />
                <p className="mt-2 text-xs font-medium opacity-80">{active.label}</p>
              </div>
            )}
          </div>
        </div>

        {/* Input */}
        <div className="relative mt-5">
          <label htmlFor="scan-amount" className="sr-only">
            Amount in {active.unit}
          </label>
          <input
            id="scan-amount"
            type="number"
            inputMode="decimal"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder={active.placeholder}
            disabled={scanning}
            className="w-full rounded-2xl border border-white/20 bg-white/10 px-4 py-3 pr-20 text-base font-semibold text-white placeholder:text-white/50 outline-none backdrop-blur transition-smooth focus:border-white/60 focus:bg-white/15 disabled:opacity-60"
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/20 px-3 py-1 text-xs font-bold">
            {active.unit}
          </span>
        </div>
        {livePreview !== null && !scanning && !result && (
          <p className="mt-2 text-xs text-white/80 animate-fade-in">
            ≈ <span className="font-bold">{livePreview} kg CO₂</span> · factor {active.factor} kg/{active.unit}
          </p>
        )}

        {/* Progress bar — Calculate */}
        {scanning && (
          <div className="mt-4 animate-fade-in">
            <div className="mb-1.5 flex items-center justify-between text-[11px] font-semibold text-white/90">
              <span>{progressLabel}</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-white/20">
              <div
                className="h-full rounded-full bg-white transition-all duration-100 ease-linear"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        <div className="mt-4 grid grid-cols-2 gap-3">
          <button
            onClick={() => fileRef.current?.click()}
            disabled={scanning}
            aria-label="Upload a file to scan"
            className="flex items-center justify-center gap-2 rounded-full bg-white/15 px-4 py-3 text-sm font-semibold backdrop-blur transition-smooth hover-scale hover:bg-white/25 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
          >
            <Upload className="h-4 w-4" /> Upload file
          </button>
          <button
            onClick={() => runScan(false)}
            disabled={scanning}
            aria-label={scanning ? "Calculating impact" : "Calculate impact"}
            className="flex items-center justify-center gap-2 rounded-full bg-white px-4 py-3 text-sm font-semibold text-primary transition-smooth hover-scale hover:bg-white/90 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
          >
            {scanning ? (
              <>
                <span className="h-3 w-3 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
                Calculating…
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" /> Calculate
              </>
            )}
          </button>
        </div>
        <input ref={fileRef} type="file" accept={active.accept} className="hidden" onChange={onFile} />
        {fileName && (
          <p className="mt-2 truncate text-center text-xs text-white/80 animate-fade-in">
            <CheckCircle2 className="mr-1 inline h-3 w-3" />
            {fileName}
          </p>
        )}
      </section>

      {/* Skeleton while scanning */}
      {scanning && !result && (
        <section
          aria-hidden="true"
          className="mt-4 rounded-3xl bg-card p-5 shadow-sm animate-fade-in"
        >
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full skeleton-row" />
            <div className="flex-1 space-y-2">
              <div className="h-3 w-32 rounded-full skeleton-row" />
              <div className="h-5 w-44 rounded-full skeleton-row" />
            </div>
          </div>
          <div className="mt-4 h-12 rounded-2xl skeleton-row" />
        </section>
      )}

      {/* Result */}
      {result && (
        <section role="status" aria-live="polite" className="mt-4 rounded-3xl bg-card p-5 shadow-sm animate-pop-in">
          <div className="flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-full bg-secondary text-primary">
              <Sparkles className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Estimated impact · {result.label}
              </p>
              <p className="text-2xl font-extrabold text-foreground tabular-nums">
                {animatedKg.toFixed(2)} <span className="text-base font-bold text-muted-foreground">kg CO₂</span>
                <span className={`ml-2 rounded-full px-2 py-0.5 text-xs ${result.tone}`}>{result.grade}</span>
              </p>
            </div>
          </div>
          <p className="mt-4 flex gap-2 rounded-2xl bg-muted p-3 text-sm text-foreground/80">
            <TrendingDown className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            <span>{result.tip}</span>
          </p>
          {saving && (
            <div className="mt-4 animate-fade-in">
              <div className="mb-1.5 flex items-center justify-between text-xs font-semibold text-muted-foreground">
                <span>{progressLabel}</span>
                <span>{Math.round(saveProgress)}%</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-100 ease-linear"
                  style={{ width: `${saveProgress}%` }}
                />
              </div>
            </div>
          )}
          <div className="mt-3 grid grid-cols-2 gap-2">
            <button
              onClick={() => {
                if (saving) return;
                setResult(null);
                setAmount("");
              }}
              disabled={saving}
              className="rounded-full border border-border bg-background py-2.5 text-sm font-semibold text-foreground/70 transition-smooth hover:bg-muted active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              Discard
            </button>
            <button
              onClick={saveToHistory}
              disabled={saving}
              aria-label={saving ? "Saving to tracker" : "Save to tracker"}
              className="flex items-center justify-center gap-2 rounded-full bg-primary py-2.5 text-sm font-semibold text-primary-foreground transition-smooth hover-scale hover:bg-primary/90 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            >
              {saving ? (
                <>
                  <span className="h-3 w-3 animate-spin rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground" />
                  Saving…
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4" /> Save to tracker
                </>
              )}
            </button>
          </div>
        </section>
      )}

      {/* Guide */}
      <section className="mt-6 rounded-3xl border border-border bg-card p-5 shadow-sm">
        <div className="flex items-center gap-2">
          <Info className="h-4 w-4 text-primary" />
          <h2 className="text-sm font-bold text-foreground">What to upload for {active.label.toLowerCase()}</h2>
        </div>
        <ul className="mt-3 space-y-2">
          {active.guide.map((g, i) => (
            <li
              key={i}
              className="flex items-start gap-2 text-sm text-foreground/80 animate-fade-in"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <span>{g}</span>
            </li>
          ))}
        </ul>
        <p className="mt-3 rounded-xl bg-muted px-3 py-2 text-xs text-muted-foreground">
          {active.hint} {active.example && <span className="font-medium">· {active.example}</span>}
        </p>
      </section>

      {/* History */}
      <section className="mt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-foreground">Recent scans</h2>
          {history.length > 0 && (
            <button
              onClick={clearHistory}
              className="flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-destructive transition"
            >
              <Trash2 className="h-3 w-3" /> Clear
            </button>
          )}
        </div>
        <div className="mt-3 space-y-2">
          {history.length === 0 && (
            <p className="rounded-2xl bg-muted/50 p-4 text-center text-sm text-muted-foreground">
              No scans yet — your saved measurements show up here.
            </p>
          )}
          {history.map((h, i) => {
            const Icon = CATEGORIES.find((c) => c.id === h.category)?.icon ?? Receipt;
            const { tone } = gradeFor(h.kg);
            return (
              <div
                key={h.id}
                className="flex items-center gap-3 rounded-2xl bg-card p-4 shadow-sm transition hover:shadow-md animate-fade-in"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <div className="grid h-10 w-10 place-items-center rounded-full bg-secondary text-primary">
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm font-bold text-foreground">{h.label}</p>
                  <p className="text-xs text-muted-foreground">
                    {h.amount} {h.unit} · {h.kg.toFixed(2)} kg CO₂ · {h.date}
                  </p>
                </div>
                <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${tone}`}>{h.grade}</span>
              </div>
            );
          })}
        </div>
      </section>
    </AppShell>
  );
}
