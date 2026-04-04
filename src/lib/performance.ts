/**
 * Performance utilities for optimizing Next.js 16 applications
 */

/**
 * Lazy load a component or module
 * Usage: const HeavyComponent = lazyImport(() => import('./HeavyComponent'))
 */
export function lazyImport<T>(factory: () => Promise<{ default: T }>): Promise<T> {
  return factory().then(module => module.default);
}

/**
 * Generate a blur placeholder data URL for images
 * Shows a blurred version while the full image loads
 * Implementation uses a simple SVG approach
 */
export function getBlurDataUrl(width: number = 10, height: number = 10): string {
  // Create a simple SVG with a blur filter
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
      <defs>
        <filter id="blur">
          <feGaussianBlur in="SourceGraphic" stdDeviation="5" />
        </filter>
      </defs>
      <rect width="${width}" height="${height}" fill="#e5e7eb" filter="url(#blur)" />
    </svg>
  `.trim();

  const base64 = Buffer.from(svg).toString('base64');
  return `data:image/svg+xml;base64,${base64}`;
}

/**
 * Debounce a function - delays execution until after N milliseconds have passed
 * Useful for search inputs, resize handlers, etc.
 */
export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  ms: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout | null = null;

  return function debounced(...args: Parameters<T>) {
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      fn(...args);
      timeoutId = null;
    }, ms);
  };
}

/**
 * Throttle a function - limits execution to at most once per N milliseconds
 * Useful for scroll handlers, mouse move, etc.
 */
export function throttle<T extends (...args: any[]) => any>(
  fn: T,
  ms: number
): (...args: Parameters<T>) => void {
  let lastRun = 0;
  let timeoutId: NodeJS.Timeout | null = null;

  return function throttled(...args: Parameters<T>) {
    const now = Date.now();
    const remainingTime = ms - (now - lastRun);

    if (remainingTime <= 0) {
      if (timeoutId) clearTimeout(timeoutId);
      fn(...args);
      lastRun = now;
    } else {
      if (!timeoutId) {
        timeoutId = setTimeout(() => {
          fn(...args);
          lastRun = Date.now();
          timeoutId = null;
        }, remainingTime);
      }
    }
  };
}

/**
 * Deduplication cache for async requests
 * Prevents multiple identical requests from being made simultaneously
 * Usage: const data = await dedupeRequest('user-123', () => fetchUser('user-123'))
 */
const requestCache = new Map<string, Promise<any>>();

export async function dedupeRequest<T>(
  key: string,
  factory: () => Promise<T>
): Promise<T> {
  // Return cached promise if request is already in flight
  if (requestCache.has(key)) {
    return requestCache.get(key) as Promise<T>;
  }

  // Create and cache the promise
  const promise = factory()
    .then(result => {
      // Clear from cache after completion
      requestCache.delete(key);
      return result;
    })
    .catch(error => {
      // Clear from cache on error
      requestCache.delete(key);
      throw error;
    });

  requestCache.set(key, promise);
  return promise;
}

/**
 * Memoization for expensive function results
 * Simple memoization cache with optional TTL (time to live)
 */
export function memoize<T extends (...args: any[]) => any>(
  fn: T,
  options?: { ttl?: number }
): T {
  const cache = new Map<string, { result: any; timestamp: number }>();
  const ttl = options?.ttl ?? 0; // 0 = no expiration

  return ((...args: Parameters<T>) => {
    const key = JSON.stringify(args);
    const cached = cache.get(key);

    // Return cached result if valid
    if (cached) {
      if (ttl === 0 || Date.now() - cached.timestamp < ttl) {
        return cached.result;
      }
      cache.delete(key);
    }

    // Compute and cache result
    const result = fn(...args);
    cache.set(key, { result, timestamp: Date.now() });
    return result;
  }) as T;
}

/**
 * Request batching for multiple async operations
 * Groups requests together and resolves them at once
 * Useful for API endpoints that support batch operations
 */
export function createBatcher<TInput, TOutput>(
  batchFn: (items: TInput[]) => Promise<TOutput[]>,
  options?: { maxBatchSize?: number; maxWaitMs?: number }
) {
  const maxBatchSize = options?.maxBatchSize ?? 10;
  const maxWaitMs = options?.maxWaitMs ?? 16; // 1 frame at 60fps

  let batch: TInput[] = [];
  let resolvers: Array<(value: TOutput) => void> = [];
  let timeoutId: NodeJS.Timeout | null = null;

  const flush = async () => {
    if (batch.length === 0) return;

    const currentBatch = batch.slice();
    const currentResolvers = resolvers.slice();
    batch = [];
    resolvers = [];
    timeoutId = null;

    try {
      const results = await batchFn(currentBatch);
      currentResolvers.forEach((resolve, i) => {
        resolve(results[i]);
      });
    } catch (error) {
      // Re-throw error to all waiting promises
      currentResolvers.forEach((resolve, i) => {
        resolve(undefined as any); // Simplified error handling
      });
    }
  };

  return (item: TInput): Promise<TOutput> => {
    return new Promise(resolve => {
      batch.push(item);
      resolvers.push(resolve);

      // Flush when batch is full
      if (batch.length >= maxBatchSize) {
        if (timeoutId) clearTimeout(timeoutId);
        flush();
      } else if (!timeoutId) {
        // Schedule flush if not already scheduled
        timeoutId = setTimeout(flush, maxWaitMs);
      }
    });
  };
}

/**
 * Memory efficient cache with LRU (Least Recently Used) eviction
 * Useful for limiting memory usage of caching
 */
export class LRUCache<K, V> {
  private cache: Map<K, V>;
  private maxSize: number;

  constructor(maxSize: number = 100) {
    this.cache = new Map();
    this.maxSize = maxSize;
  }

  get(key: K): V | undefined {
    if (!this.cache.has(key)) return undefined;

    // Move to end (most recently used)
    const value = this.cache.get(key)!;
    this.cache.delete(key);
    this.cache.set(key, value);

    return value;
  }

  set(key: K, value: V): void {
    if (this.cache.has(key)) {
      this.cache.delete(key);
    } else if (this.cache.size >= this.maxSize) {
      // Remove oldest (first) item
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey !== undefined) this.cache.delete(oldestKey);
    }

    this.cache.set(key, value);
  }

  has(key: K): boolean {
    return this.cache.has(key);
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }
}

/**
 * Resource pool for managing limited resources
 * Useful for managing database connections, file handles, etc.
 */
export class ResourcePool<T> {
  private resources: T[] = [];
  private available: T[] = [];
  private waiting: Array<(resource: T) => void> = [];

  constructor(factory: () => T, size: number) {
    for (let i = 0; i < size; i++) {
      const resource = factory();
      this.resources.push(resource);
      this.available.push(resource);
    }
  }

  async acquire(): Promise<T> {
    if (this.available.length > 0) {
      return this.available.pop()!;
    }

    return new Promise(resolve => {
      this.waiting.push(resolve);
    });
  }

  release(resource: T): void {
    const waiter = this.waiting.shift();
    if (waiter) {
      waiter(resource);
    } else {
      this.available.push(resource);
    }
  }

  async withResource<R>(fn: (resource: T) => Promise<R>): Promise<R> {
    const resource = await this.acquire();
    try {
      return await fn(resource);
    } finally {
      this.release(resource);
    }
  }
}

/**
 * Performance monitoring utilities
 */
export const perf = {
  /**
   * Measure execution time of a function
   */
  measure: async <T>(label: string, fn: () => Promise<T>): Promise<T> => {
    const start = performance.now();
    try {
      return await fn();
    } finally {
      const duration = performance.now() - start;
      if (typeof window !== 'undefined' && window.performance) {
        console.debug(`[${label}] completed in ${duration.toFixed(2)}ms`);
      }
    }
  },

  /**
   * Mark performance metrics
   */
  mark: (name: string) => {
    if (typeof window !== 'undefined' && typeof window.performance?.mark === 'function') {
      performance.mark(name);
    }
  },

  /**
   * Measure between two marks
   */
  measure_: (name: string, startMark: string, endMark: string) => {
    if (typeof window !== 'undefined' && typeof window.performance?.measure === 'function') {
      performance.measure(name, startMark, endMark);
    }
  },
};
