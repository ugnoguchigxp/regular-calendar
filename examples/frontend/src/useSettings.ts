import { useState, useEffect, useCallback } from 'react';
import i18n from './i18n';
import { type AppSettings, DEFAULT_SETTINGS, applyThemeSettings } from 'regular-calendar';

export type { AppSettings };

const STORAGE_KEY = 'regular-calendar-settings';

export function useSettings() {
    const [settings, setSettingsState] = useState<AppSettings>(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
            }
        } catch (e) {
            console.warn('Failed to load settings from localStorage', e);
        }
        return DEFAULT_SETTINGS;
    });

    // Apply settings to document root
    useEffect(() => {
        const root = document.documentElement;
        applyThemeSettings(settings, root);

        // Apply Language (Frontend specific)
        if (settings.language && i18n.language !== settings.language) {
            i18n.changeLanguage(settings.language);
        }

        console.log('[Settings] Applied:', settings);
    }, [settings]);

    // Persist settings
    useEffect(() => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
        } catch (e) {
            console.warn('Failed to save settings to localStorage', e);
        }
    }, [settings]);

    const updateSettings = useCallback((partial: Partial<AppSettings>) => {
        console.log('[useSettings] updateSettings called with:', partial);
        setSettingsState(prev => ({ ...prev, ...partial }));
    }, []);

    const resetSettings = useCallback(() => {
        localStorage.removeItem(STORAGE_KEY); // Force clear
        setSettingsState(DEFAULT_SETTINGS);
        window.location.reload(); // Force reload to ensure clean state
    }, []);

    return { settings, updateSettings, resetSettings };
}
