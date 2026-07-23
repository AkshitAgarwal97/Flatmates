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
declare class SimpleCache implements ICacheProvider {
    private store;
    private maxSize;
    constructor(maxSize?: number);
    get<T>(key: string): T | null;
    set<T>(key: string, value: T, ttlSeconds?: number): void;
    /** Call this whenever data changes (e.g. property created/updated/deleted). */
    invalidatePrefix(prefix: string): void;
    clear(): void;
    get size(): number;
}
declare const cache: SimpleCache;
export default cache;
//# sourceMappingURL=cache.d.ts.map