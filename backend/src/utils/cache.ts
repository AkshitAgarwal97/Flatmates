/**
 * Lightweight in-memory TTL cache — zero dependencies.
 * Used to cache costly public GET responses (property listings, roommates)
 * so repeated page loads don't hammer MongoDB.
 *
 * Cache is per-process (single Render instance is fine for bootstrap phase).
 * When we scale to multiple instances we swap this for Redis — API is identical.
 */

/**
 * Cache provider interface — implement this for Redis, Memcached, etc.
 * All callsites program against this interface, not the concrete class.
 */
export interface ICacheProvider {
  get<T>(key: string): T | null | Promise<T | null>;
  set<T>(key: string, value: T, ttlSeconds?: number): void | Promise<void>;
  invalidatePrefix(prefix: string): void | Promise<void>;
  clear(): void | Promise<void>;
  readonly size: number;
}

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

class SimpleCache implements ICacheProvider {
  private store = new Map<string, CacheEntry<any>>();
  private maxSize: number;

  constructor(maxSize = 500) {
    this.maxSize = maxSize;
  }

  get<T>(key: string): T | null {
    const entry = this.store.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return null;
    }
    return entry.value as T;
  }

  set<T>(key: string, value: T, ttlSeconds = 60): void {
    // Evict oldest entry if we're at capacity
    if (this.store.size >= this.maxSize) {
      const firstKey = this.store.keys().next().value;
      if (firstKey) this.store.delete(firstKey);
    }
    this.store.set(key, { value, expiresAt: Date.now() + ttlSeconds * 1000 });
  }

  /** Call this whenever data changes (e.g. property created/updated/deleted). */
  invalidatePrefix(prefix: string): void {
    for (const key of this.store.keys()) {
      if (key.startsWith(prefix)) {
        this.store.delete(key);
      }
    }
  }

  clear(): void {
    this.store.clear();
  }

  get size() {
    return this.store.size;
  }
}

// Singleton — shared across all route handlers in this process
const cache = new SimpleCache(500);

export default cache;
