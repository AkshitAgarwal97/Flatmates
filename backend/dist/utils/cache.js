"use strict";
/**
 * Lightweight in-memory TTL cache — zero dependencies.
 * Used to cache costly public GET responses (property listings, roommates)
 * so repeated page loads don't hammer MongoDB.
 *
 * Cache is per-process (single Render instance is fine for bootstrap phase).
 * When we scale to multiple instances we swap this for Redis — API is identical.
 */
Object.defineProperty(exports, "__esModule", { value: true });
class SimpleCache {
    constructor(maxSize = 500) {
        this.store = new Map();
        this.maxSize = maxSize;
    }
    get(key) {
        const entry = this.store.get(key);
        if (!entry)
            return null;
        if (Date.now() > entry.expiresAt) {
            this.store.delete(key);
            return null;
        }
        return entry.value;
    }
    set(key, value, ttlSeconds = 60) {
        // Evict oldest entry if we're at capacity
        if (this.store.size >= this.maxSize) {
            const firstKey = this.store.keys().next().value;
            if (firstKey)
                this.store.delete(firstKey);
        }
        this.store.set(key, { value, expiresAt: Date.now() + ttlSeconds * 1000 });
    }
    /** Call this whenever data changes (e.g. property created/updated/deleted). */
    invalidatePrefix(prefix) {
        for (const key of this.store.keys()) {
            if (key.startsWith(prefix)) {
                this.store.delete(key);
            }
        }
    }
    clear() {
        this.store.clear();
    }
    get size() {
        return this.store.size;
    }
}
// Singleton — shared across all route handlers in this process
const cache = new SimpleCache(500);
exports.default = cache;
//# sourceMappingURL=cache.js.map