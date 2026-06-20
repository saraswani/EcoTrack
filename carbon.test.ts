import { describe, it, expect } from "vitest";
import {
  EMISSION_FACTORS,
  ActivityInputSchema,
  calculateEmissions,
  gradeFor,
  sumEmissions,
  UploadFileSchema,
} from "./carbon";

describe("EMISSION_FACTORS", () => {
  it("includes all categories with positive factors", () => {
    for (const f of Object.values(EMISSION_FACTORS)) {
      expect(f.factor).toBeGreaterThan(0);
      expect(f.unit).toBeTruthy();
      expect(f.source).toBeTruthy();
    }
  });
});

describe("calculateEmissions", () => {
  it("computes electricity correctly (0.42 kg/kWh)", () => {
    expect(calculateEmissions({ category: "electricity", amount: 100 })).toBe(42);
  });
  it("rounds to 2 decimals", () => {
    expect(calculateEmissions({ category: "fuel", amount: 1 })).toBe(2.31);
  });
  it("rejects negative amounts", () => {
    expect(() => calculateEmissions({ category: "fuel", amount: -1 })).toThrow();
  });
  it("rejects non-finite amounts", () => {
    expect(() =>
      calculateEmissions({ category: "fuel", amount: Number.POSITIVE_INFINITY }),
    ).toThrow();
  });
});

describe("ActivityInputSchema", () => {
  it("rejects unknown categories", () => {
    const r = ActivityInputSchema.safeParse({ category: "rocket", amount: 1 });
    expect(r.success).toBe(false);
  });
  it("rejects extreme amounts (>1M)", () => {
    const r = ActivityInputSchema.safeParse({ category: "flight", amount: 2_000_000 });
    expect(r.success).toBe(false);
  });
});

describe("gradeFor", () => {
  it.each([
    [0, "A+"],
    [5, "A+"],
    [20, "A"],
    [50, "B"],
    [100, "C"],
    [500, "D"],
  ])("kg %i → grade %s", (kg, grade) => {
    expect(gradeFor(kg).grade).toBe(grade);
  });
  it("treats NaN safely", () => {
    expect(gradeFor(NaN).grade).toBe("A+");
  });
});

describe("sumEmissions", () => {
  it("sums positive numbers", () => {
    expect(sumEmissions([1.5, 2.25, 0.25])).toBe(4);
  });
  it("ignores invalid entries", () => {
    expect(sumEmissions([1, NaN, -3, Infinity, 2])).toBe(3);
  });
});

describe("UploadFileSchema", () => {
  it("accepts a small JPEG", () => {
    const r = UploadFileSchema.safeParse({ name: "bill.jpg", size: 500_000, type: "image/jpeg" });
    expect(r.success).toBe(true);
  });
  it("rejects oversize files (>10MB)", () => {
    const r = UploadFileSchema.safeParse({ name: "big.pdf", size: 20_000_000, type: "application/pdf" });
    expect(r.success).toBe(false);
  });
  it("rejects unsupported mime types", () => {
    const r = UploadFileSchema.safeParse({ name: "x.exe", size: 100, type: "application/x-msdownload" });
    expect(r.success).toBe(false);
  });
});