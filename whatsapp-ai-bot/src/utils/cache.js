import NodeCache from 'node-cache';
import { config } from '../config/env.js';

// Create cache instance with TTL from config
const cache = new NodeCache({
  stdTTL: config.cacheTTL,
  checkperiod: config.cacheTTL * 0.2,
  useClones: false,
});

/**
 * Get a value from cache
 * @param {string} key - Cache key
 * @returns {any} - Cached value or undefined
 */
export function getCached(key) {
  return cache.get(key);
}

/**
 * Set a value in cache
 * @param {string} key - Cache key
 * @param {any} value - Value to cache
 * @param {number} ttl - Optional TTL in seconds
 * @returns {boolean} - Success status
 */
export function setCached(key, value, ttl = null) {
  if (ttl) {
    return cache.set(key, value, ttl);
  }
  return cache.set(key, value);
}

/**
 * Delete a value from cache
 * @param {string} key - Cache key
 * @returns {number} - Number of deleted entries
 */
export function deleteCached(key) {
  return cache.del(key);
}

/**
 * Clear all cache
 */
export function clearCache() {
  cache.flushAll();
}

/**
 * Get cache statistics
 * @returns {Object} - Cache stats
 */
export function getCacheStats() {
  return cache.getStats();
}

export default cache;
