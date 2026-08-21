import { describe, expect, it } from "vitest";
import {
  CEILING_THRESHOLDS,
  crossedCeilingThresholds,
  cycleThresholdFromDateKey,
  isInRecategorizationWindow,
} from "./alerts-rules";

describe("alerts rules", () => {
  it("keeps the documented ceiling thresholds", () => {
    expect(CEILING_THRESHOLDS).toEqual([80, 95]);
  });

  it("returns every crossed threshold, including exact boundaries", () => {
    expect(crossedCeilingThresholds(null)).toEqual([]);
    expect(crossedCeilingThresholds(79.99)).toEqual([]);
    expect(crossedCeilingThresholds(80)).toEqual([80]);
    expect(crossedCeilingThresholds(95)).toEqual([80, 95]);
  });

  it("creates an idempotent cycle key from a date key", () => {
    expect(cycleThresholdFromDateKey("2026-07-01")).toBe(202607);
  });

  it("includes both edges of the recategorization window", () => {
    expect(isInRecategorizationWindow(-1)).toBe(false);
    expect(isInRecategorizationWindow(0)).toBe(true);
    expect(isInRecategorizationWindow(45)).toBe(true);
    expect(isInRecategorizationWindow(46)).toBe(false);
  });
});
