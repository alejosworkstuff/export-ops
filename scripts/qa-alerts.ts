/**
 * QA, pure alert helpers (no DB).
 * Run: npx tsx scripts/qa-alerts.ts
 */
import assert from "node:assert/strict";
import {
  crossedCeilingThresholds,
  cycleThresholdFromDateKey,
  isInRecategorizationWindow,
  RECATEGORIZATION_WINDOW_DAYS,
} from "../src/lib/alerts-rules";

assert.deepEqual(crossedCeilingThresholds(null), []);
assert.deepEqual(crossedCeilingThresholds(79.9), []);
assert.deepEqual(crossedCeilingThresholds(80), [80]);
assert.deepEqual(crossedCeilingThresholds(94.9), [80]);
assert.deepEqual(crossedCeilingThresholds(95), [80, 95]);
assert.deepEqual(crossedCeilingThresholds(120), [80, 95]);

assert.equal(cycleThresholdFromDateKey("2027-01-01"), 202701);
assert.equal(cycleThresholdFromDateKey("2026-07-01"), 202607);

assert.equal(isInRecategorizationWindow(0), true);
assert.equal(isInRecategorizationWindow(RECATEGORIZATION_WINDOW_DAYS), true);
assert.equal(
  isInRecategorizationWindow(RECATEGORIZATION_WINDOW_DAYS + 1),
  false,
);
assert.equal(isInRecategorizationWindow(-1), false);

console.log("qa-alerts: OK");
