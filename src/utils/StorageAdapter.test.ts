import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { BrowserStorage, InMemoryStorage } from './StorageAdapter';

describe('StorageAdapter', () => {
  describe('InMemoryStorage', () => {
    let storage: InMemoryStorage;

    beforeEach(() => {
      storage = new InMemoryStorage();
    });

    it('should set and get item', () => {
      storage.setItem('key1', 'value1');
      expect(storage.getItem('key1')).toBe('value1');
    });

    it('should return null for non-existent key', () => {
      expect(storage.getItem('nonexistent')).toBeNull();
    });

    it('should remove item', () => {
      storage.setItem('key1', 'value1');
      storage.removeItem('key1');
      expect(storage.getItem('key1')).toBeNull();
    });

    it('should clear all items', () => {
      storage.setItem('key1', 'value1');
      storage.setItem('key2', 'value2');
      storage.clear();
      expect(storage.getItem('key1')).toBeNull();
      expect(storage.getItem('key2')).toBeNull();
    });

    it('should return all keys', () => {
      storage.setItem('key1', 'value1');
      storage.setItem('key2', 'value2');
      const keys = storage.keys();
      expect(keys).toEqual(expect.arrayContaining(['key1', 'key2']));
      expect(keys).toHaveLength(2);
    });

    it('should maintain separate storage instances', () => {
      const storage1 = new InMemoryStorage();
      const storage2 = new InMemoryStorage();

      storage1.setItem('key1', 'value1');
      storage2.setItem('key1', 'value2');

      expect(storage1.getItem('key1')).toBe('value1');
      expect(storage2.getItem('key1')).toBe('value2');
    });

    it('should overwrite existing item', () => {
      storage.setItem('key1', 'value1');
      storage.setItem('key1', 'value2');
      expect(storage.getItem('key1')).toBe('value2');
    });
  });

  describe('BrowserStorage', () => {
    let mockLocalStorage: {
      getItem: ReturnType<typeof vi.fn>;
      setItem: ReturnType<typeof vi.fn>;
      removeItem: ReturnType<typeof vi.fn>;
    };

    beforeEach(() => {
      mockLocalStorage = {
        getItem: vi.fn(),
        setItem: vi.fn(),
        removeItem: vi.fn(),
      };
      vi.stubGlobal('localStorage', mockLocalStorage);
    });

    afterEach(() => {
      vi.unstubAllGlobals();
    });

    it('should get item from localStorage', () => {
      mockLocalStorage.getItem.mockReturnValue('test-value');

      const storage = new BrowserStorage();
      const result = storage.getItem('key1');

      expect(mockLocalStorage.getItem).toHaveBeenCalledWith('key1');
      expect(result).toBe('test-value');
    });

    it('should return null when localStorage returns null', () => {
      mockLocalStorage.getItem.mockReturnValue(null);

      const storage = new BrowserStorage();
      const result = storage.getItem('key1');

      expect(result).toBeNull();
    });

    it('should set item to localStorage', () => {
      const storage = new BrowserStorage();
      storage.setItem('key1', 'value1');

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('key1', 'value1');
    });

    it('should remove item from localStorage', () => {
      const storage = new BrowserStorage();
      storage.removeItem('key1');

      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('key1');
    });

    it('should handle localStorage errors gracefully in getItem', () => {
      mockLocalStorage.getItem.mockImplementation(() => {
        throw new Error('Storage error');
      });

      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      const storage = new BrowserStorage();
      const result = storage.getItem('key1');

      expect(consoleWarnSpy).toHaveBeenCalled();
      expect(result).toBeNull();

      consoleWarnSpy.mockRestore();
    });

    it('should handle localStorage errors gracefully in setItem', () => {
      mockLocalStorage.setItem.mockImplementation(() => {
        throw new Error('Storage error');
      });

      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      const storage = new BrowserStorage();

      expect(() => storage.setItem('key1', 'value1')).not.toThrow();
      expect(consoleWarnSpy).toHaveBeenCalled();

      consoleWarnSpy.mockRestore();
    });

    it('should handle localStorage errors gracefully in removeItem', () => {
      mockLocalStorage.removeItem.mockImplementation(() => {
        throw new Error('Storage error');
      });

      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      const storage = new BrowserStorage();

      expect(() => storage.removeItem('key1')).not.toThrow();
      expect(consoleWarnSpy).toHaveBeenCalled();

      consoleWarnSpy.mockRestore();
    });

    it('should return null when window is undefined', () => {
      vi.stubGlobal('window', undefined);

      const storage = new BrowserStorage();
      expect(storage.getItem('key1')).toBeNull();

      expect(() => storage.setItem('key1', 'value1')).not.toThrow();
      expect(() => storage.removeItem('key1')).not.toThrow();

      vi.unstubAllGlobals();
    });
  });
});
