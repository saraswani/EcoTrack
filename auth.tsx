import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowRight, X, Leaf } from "lucide-react";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Create your account — EcoTrack" },
      { name: "description", content: "Join a community dedicated to a more restorative and mindful lifestyle." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col bg-background">
      <header className="flex items-center justify-between px-5 pt-5">
        <div className="flex items-center gap-2">
          <span className="grid h-7 w-7 place-items-center rounded-full bg-secondary text-primary">
            <Leaf className="h-4 w-4" />
          </span>
          <span className="text-lg font-bold text-primary">EcoTrack</span>
        </div>
        <Link
          to="/"
          className="grid h-9 w-9 place-items-center rounded-full bg-muted text-foreground/70"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </Link>
      </header>

      <div className="mx-5 mt-4 h-1.5 overflow-hidden rounded-full bg-muted">
        <div className="h-full w-1/3 rounded-full bg-primary" />
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          navigate({ to: "/dashboard" });
        }}
        className="flex flex-1 flex-col px-5 pt-10"
      >
        <h1 className="text-[32px] font-extrabold leading-tight tracking-tight text-primary">
          Create your account
        </h1>
        <p className="mt-3 text-[15px] leading-relaxed text-foreground/80">
          Join a community dedicated to a more restorative and mindful lifestyle.
        </p>

        <div className="mt-8 space-y-5">
          <Field
            label="Full Name"
            placeholder="Alex Rivers"
            value={form.name}
            onChange={(v) => setForm({ ...form, name: v })}
          />
          <Field
            label="Email Address"
            placeholder="alex@restorative.eco"
            type="email"
            value={form.email}
            onChange={(v) => setForm({ ...form, email: v })}
          />
          <Field
            label="Password"
            placeholder="••••••••"
            type="password"
            value={form.password}
            onChange={(v) => setForm({ ...form, password: v })}
          />
        </div>

        <button
          type="submit"
          className="mt-10 flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-4 text-base font-semibold text-primary-foreground shadow-sm transition hover:opacity-95"
        >
          Get Started <ArrowRight className="h-4 w-4" />
        </button>
        <p className="mt-6 text-center text-sm text-foreground/80">
          Already have an account?{" "}
          <Link to="/dashboard" className="font-semibold text-primary">
            Sign In
          </Link>
        </p>
      </form>
    </div>
  );
}

function Field({
  label,
  placeholder,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <label className="block">
      <span className="text-xs font-bold uppercase tracking-wider text-foreground">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="mt-2 w-full rounded-2xl bg-muted px-5 py-4 text-base text-foreground outline-none ring-primary/30 placeholder:text-muted-foreground focus:ring-2"
      />
    </label>
  );
}
