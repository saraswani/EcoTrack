/**
 * Carbon footprint calculation library.
 *
 * Pure, deterministic, side-effect-free functions for converting activity
 * data (kWh, liters, km, items) into kilograms of CO₂-equivalent emissions.
 *
 * Emission factors are sourced from EPA (2023) and DEFRA (2023) public
 * datasets and rounded for transparency. All values are kg CO₂e per unit.
 *
 * @packageDocumentation
 */
import { z } from "zod";

export type CategoryId =
  | "electricity"
  | "fuel"
  | "flight"
  | "grocery"
  | "transport";

export interface EmissionFactor {
  readonly id: CategoryId;
  readonly unit: string;
  readonly factor: number;
  readonly source: string;
}

export const EMISSION_FACTORS: Readonly<Record<CategoryId, EmissionFactor>> = {
  electricity: { id: "electricity", unit: "kWh", factor: 0.42, source: "EPA eGRID 2023" },
  fuel: { id: "fuel", unit: "liters", factor: 2.31, source: "DEFRA 2023" },
  flight: { id: "flight", unit: "km", factor: 0.158, source: "DEFRA 2023 short-haul economy" },
  grocery: { id: "grocery", unit: "items", factor: 1.9, source: "Poore & Nemecek 2018 (avg basket)" },
  transport: { id: "transport", unit: "km", factor: 0.21, source: "EPA passenger vehicle 2023" },
} as const;

/** Zod schema for validating user-supplied activity input. */
export const ActivityInputSchema = z.object({
  category: z.enum(["electricity", "fuel", "flight", "grocery", "transport"]),
  amount: z.number().positive().finite().max(1_000_000),
});

export type ActivityInput = z.infer<typeof ActivityInputSchema>;

/**
 * Compute kg of CO₂e for an activity. Throws on invalid input — callers
 * should validate with {@link ActivityInputSchema} when handling untrusted
 * data.
 */
export function calculateEmissions(input: ActivityInput): number {
  const parsed = ActivityInputSchema.parse(input);
  const factor = EMISSION_FACTORS[parsed.category].factor;
  return Math.round(parsed.amount * factor * 100) / 100;
}

export interface Grade {
  readonly grade: "A+" | "A" | "B" | "C" | "D";
  readonly tone: string;
}

/** Map a kg-CO₂ value to a sustainability grade. */
export function gradeFor(kg: number): Grade {
  if (!Number.isFinite(kg) || kg < 0) {
    return { grade: "A+", tone: "bg-secondary text-primary" };
  }
  if (kg < 10) return { grade: "A+", tone: "bg-secondary text-primary" };
  if (kg < 30) return { grade: "A", tone: "bg-secondary text-primary" };
  if (kg < 75) return { grade: "B", tone: "bg-amber-100 text-amber-700" };
  if (kg < 150) return { grade: "C", tone: "bg-orange-100 text-orange-700" };
  return { grade: "D", tone: "bg-red-100 text-red-700" };
}

/** Sum a list of kg values, ignoring non-finite entries. */
export function sumEmissions(values: readonly number[]): number {
  let total = 0;
  for (const v of values) if (Number.isFinite(v) && v > 0) total += v;
  return Math.round(total * 100) / 100;
}

/** Safe file validator for uploaded receipts / bills. */
export const UploadFileSchema = z.object({
  name: z.string().min(1).max(255),
  size: z.number().int().positive().max(10 * 1024 * 1024), // 10 MB
  type: z.string().regex(/^(image\/|application\/pdf)/),
});