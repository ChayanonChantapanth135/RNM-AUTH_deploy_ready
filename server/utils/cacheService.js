/**
 * In-Memory Cache Service with TTL (Time-To-Live) and Pattern Invalidation
 * Provides high-speed data retrieval for semi-static database queries.
 */

class MemoryCache {
  constructor() {
    this.cache = new Map();
  }

  /**
   * Store a value in cache with a TTL (default: 60 seconds)
   * @param {string} key 
   * @param {any} value 
   * @param {number} ttlSeconds 
   */
  set(key, value, ttlSeconds = 60) {
    const expiresAt = Date.now() + ttlSeconds * 1000;
    this.cache.set(key, { value, expiresAt });
  }

  /**
   * Retrieve a value from cache if it exists and has not expired
   * @param {string} key 
   * @returns {any|null}
   */
  get(key) {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return entry.value;
  }

  /**
   * Delete a specific cache key
   * @param {string} key 
   */
  del(key) {
    this.cache.delete(key);
  }

  /**
   * Invalidate cache entries matching a prefix or pattern (e.g., 'roles*', 'user_settings:*')
   * @param {string} patternPrefix 
   */
  delPattern(patternPrefix) {
    for (const key of this.cache.keys()) {
      if (key.startsWith(patternPrefix)) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Clear all cached data
   */
  flush() {
    this.cache.clear();
  }
}

export const memoryCache = new MemoryCache();
export default memoryCache;
