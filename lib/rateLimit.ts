/**
 * Simple in-memory sliding-window rate limiter for serverless-ish Node runtimes.
 * Limits are per process instance (enough to blunt casual abuse on a demo deploy).
 */

type Bucket = {
  timestamps: number[];
};

const buckets = new Map<string, Bucket>();

const WINDOW_MS = 60_000;
const MAX_REQUESTS = 10;

function prune(bucket: Bucket, now: number) {
  bucket.timestamps = bucket.timestamps.filter((t) => now - t < WINDOW_MS);
}

export function checkRateLimit(key: string): {
  allowed: boolean;
  retryAfterSeconds: number;
} {
  const now = Date.now();
  let bucket = buckets.get(key);
  if (!bucket) {
    bucket = { timestamps: [] };
    buckets.set(key, bucket);
  }

  prune(bucket, now);

  if (bucket.timestamps.length >= MAX_REQUESTS) {
    const oldest = bucket.timestamps[0] ?? now;
    const retryAfterSeconds = Math.max(
      1,
      Math.ceil((WINDOW_MS - (now - oldest)) / 1000)
    );
    return { allowed: false, retryAfterSeconds };
  }

  bucket.timestamps.push(now);
  return { allowed: true, retryAfterSeconds: 0 };
}

export function clientKeyFromRequest(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0]?.trim() || "unknown";
  }
  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp.trim();
  return "unknown";
}
