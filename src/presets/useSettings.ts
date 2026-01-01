import { useState, useEffect, useCallback } from 'react';
import { applyThemeSettings } from '../components/Settings/settingsUtils';
import { type AppSettings, DEFAULT_SETTINGS } from '../types';
import { defaultStorage, type StorageAdapter } from '../utils/StorageAdapter';
export { type AppSettings, DEFAULT_SETTINGS };
export { applyThemeSettings };

const STORAGE_KEY = 'regular-calendar-settings';

export interface UseSettingsOptions {
    /** Custom storage key for localStorage */
    storageKey?: string;
    /** Storage adapter for persistence */
    storage?: StorageAdapter;
    /** Callback to handle language changes (e.g., i18n.changeLanguage) */
    onLanguageChange?: (language: string) => void;
}

export function useSettings(options: UseSettingsOptions = {}) {
    const { storageKey = STORAGE_KEY, storage = defaultStorage, onLanguageChange } = options;

    const [settings, setSettingsState] = useState<AppSettings>(() => {
        try {
            const stored = storage.getItem(storageKey);
            if (stored) {
                return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
            }
        } catch (e) {
            console.warn('Failed to load settings from storage', e);
        }
        return DEFAULT_SETTINGS;
    });

    // Apply settings to document root
    useEffect(() => {
        const root = document.documentElement;
        applyThemeSettings(settings, root);

        // Apply Language via callback (Frontend specific)
        if (onLanguageChange && settings.language) {
            onLanguageChange(settings.language);
        }

        console.log('[useSettings] Applied:', settings);
    }, [settings, onLanguageChange]);

    // Persist settings
    useEffect(() => {
        try {
            storage.setItem(storageKey, JSON.stringify(settings));
        } catch (e) {
            console.warn('Failed to save settings to storage', e);
        }
    }, [settings, storageKey, storage]);

    const updateSettings = useCallback((partial: Partial<AppSettings>) => {
        console.log('[useSettings] updateSettings called with:', partial);
        setSettingsState(prev => ({ ...prev, ...partial }));
    }, []);

    const resetSettings = useCallback(() => {
        storage.removeItem(storageKey); // Force clear
        setSettingsState(DEFAULT_SETTINGS);
        window.location.reload(); // Force reload to ensure clean state
    }, [storageKey, storage]);

    return { settings, updateSettings, resetSettings };
}
