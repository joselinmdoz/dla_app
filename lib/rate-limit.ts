type RateBucket = {
  count: number
  resetAt: number
}

const globalForRateLimit = globalThis as unknown as {
  rateBuckets?: Map<string, RateBucket>
}

function getBuckets() {
  if (!globalForRateLimit.rateBuckets) {
    globalForRateLimit.rateBuckets = new Map<string, RateBucket>()
  }
  return globalForRateLimit.rateBuckets
}

export function consumeRateLimit(input: {
  key: string
  limit: number
  windowMs: number
}) {
  const now = Date.now()
  const buckets = getBuckets()
  const current = buckets.get(input.key)

  if (!current || current.resetAt <= now) {
    buckets.set(input.key, {
      count: 1,
      resetAt: now + input.windowMs,
    })
    return {
      allowed: true,
      remaining: input.limit - 1,
      resetAt: now + input.windowMs,
    }
  }

  if (current.count >= input.limit) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: current.resetAt,
    }
  }

  current.count += 1
  buckets.set(input.key, current)
  return {
    allowed: true,
    remaining: input.limit - current.count,
    resetAt: current.resetAt,
  }
}
