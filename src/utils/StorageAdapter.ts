/**
 * Storage abstraction for testability
 *
 * Provides an interface for storage operations that can be mocked in tests.
 * This removes direct dependency on browser's localStorage API.
 */

/**
 * Storage adapter interface
 */
export interface StorageAdapter {
	/**
	 * Retrieve an item from storage
	 * @param key Storage key
	 * @returns The stored value or null if not found
	 */
	getItem(key: string): string | null;

	/**
	 * Store an item in storage
	 * @param key Storage key
	 * @param value Value to store
	 */
	setItem(key: string, value: string): void;

	/**
	 * Remove an item from storage
	 * @param key Storage key
	 */
	removeItem(key: string): void;
}

/**
 * Browser localStorage implementation
 *
 * Default implementation using browser's localStorage API.
 * Should be used in production.
 */
export class BrowserStorage implements StorageAdapter {
	getItem(key: string): string | null {
		if (typeof window === "undefined") {
			return null;
		}
		try {
			return localStorage.getItem(key);
		} catch (e) {
			console.warn(`Failed to get item from localStorage: ${key}`, e);
			return null;
		}
	}

	setItem(key: string, value: string): void {
		if (typeof window === "undefined") {
			return;
		}
		try {
			localStorage.setItem(key, value);
		} catch (e) {
			console.warn(`Failed to set item in localStorage: ${key}`, e);
		}
	}

	removeItem(key: string): void {
		if (typeof window === "undefined") {
			return;
		}
		try {
			localStorage.removeItem(key);
		} catch (e) {
			console.warn(`Failed to remove item from localStorage: ${key}`, e);
		}
	}
}

/**
 * In-memory storage implementation
 *
 * Test-friendly implementation that stores data in memory.
 * Each instance maintains its own isolated storage.
 * Perfect for unit tests where you need independent storage per test.
 *
 * @example
 * ```typescript
 * const storage = new InMemoryStorage();
 * storage.setItem('key', 'value');
 * expect(storage.getItem('key')).toBe('value');
 * ```
 */
export class InMemoryStorage implements StorageAdapter {
	private storage = new Map<string, string>();

	getItem(key: string): string | null {
		return this.storage.get(key) ?? null;
	}

	setItem(key: string, value: string): void {
		this.storage.set(key, value);
	}

	removeItem(key: string): void {
		this.storage.delete(key);
	}

	/**
	 * Clear all items from storage
	 * Useful for test cleanup
	 */
	clear(): void {
		this.storage.clear();
	}

	/**
	 * Get all keys in storage
	 * Useful for test assertions
	 */
	keys(): string[] {
		return Array.from(this.storage.keys());
	}
}

/**
 * Default storage instance
 *
 * Uses BrowserStorage by default. Can be overridden in tests.
 */
export const defaultStorage: StorageAdapter = new BrowserStorage();
