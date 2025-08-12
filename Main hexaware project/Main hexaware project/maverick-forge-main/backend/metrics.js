// Simple in-memory request metrics store for latency and error rate

const FIVE_MINUTES_MS = 5 * 60 * 1000;
const FIFTEEN_MINUTES_MS = 15 * 60 * 1000;

// Store recent request events: { timestampMs, durationMs, isError }
let requestEvents = [];

function pruneOld(nowMs, windowMs) {
  const cutoff = nowMs - Math.max(windowMs, FIFTEEN_MINUTES_MS);
  // Keep at least last 15 minutes to serve multiple windows efficiently
  requestEvents = requestEvents.filter((e) => e.timestampMs >= cutoff);
}

function recordRequest(durationMs, statusCode) {
  const nowMs = Date.now();
  requestEvents.push({ timestampMs: nowMs, durationMs, isError: Number(statusCode) >= 400 });
  pruneOld(nowMs, FIVE_MINUTES_MS);
}

function summarizeWindow(windowMs) {
  const nowMs = Date.now();
  const start = nowMs - windowMs;
  const recent = requestEvents.filter((e) => e.timestampMs >= start);
  const count = recent.length;
  const errorCount = recent.reduce((acc, e) => acc + (e.isError ? 1 : 0), 0);
  const totalLatency = recent.reduce((acc, e) => acc + e.durationMs, 0);
  const avgLatencyMs = count ? totalLatency / count : 0;
  const errorRatePercent = count ? (errorCount / count) * 100 : 0;

  // p95 latency
  let p95LatencyMs = 0;
  if (count) {
    const sorted = recent.map((e) => e.durationMs).sort((a, b) => a - b);
    const idx = Math.max(0, Math.ceil(0.95 * sorted.length) - 1);
    p95LatencyMs = sorted[idx];
  }

  return {
    windowMs,
    requestCount: count,
    requestsPerSecond: windowMs > 0 ? count / (windowMs / 1000) : 0,
    avgLatencyMs,
    p95LatencyMs,
    errorRatePercent,
  };
}

function getMetrics(windowMs) {
  return summarizeWindow(windowMs);
}

module.exports = {
  recordRequest,
  getMetrics,
  constants: {
    FIVE_MINUTES_MS,
    FIFTEEN_MINUTES_MS,
  },
};


