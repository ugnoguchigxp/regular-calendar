import { useState, useEffect, useCallback } from 'react';
import type { ViewMode } from '../FacilitySchedule.schema';
import { defaultStorage, type StorageAdapter } from '../../utils/StorageAdapter';
import { navigateDate } from '../../utils/dateNavigation';

interface UseScheduleViewOptions {
    defaultView?: ViewMode;
    defaultDate?: Date;
    defaultGroupId?: string | null;
    enablePersistence?: boolean;
    storageKey?: string;
    storage?: StorageAdapter;
    onDateChange?: (date: Date) => void;
    onViewChange?: (view: ViewMode) => void;
    onGroupChange?: (groupId: string | null) => void;
}

export function useScheduleView({
    defaultView = 'day',
    defaultDate = new Date(),
    defaultGroupId = null,
    enablePersistence = false,
    storageKey = 'facility-schedule-view',
    storage = defaultStorage,
    onDateChange,
    onViewChange,
    onGroupChange,
}: UseScheduleViewOptions) {
    // Internal State
    const [internalDate, setInternalDate] = useState(defaultDate);

    const [internalViewMode, setInternalViewMode] = useState<ViewMode>(() => {
        if (enablePersistence) {
            try {
                const saved = storage.getItem(storageKey);
                if (saved && ['day', 'week', 'month'].includes(saved)) {
                    return saved as ViewMode;
                }
            } catch (e) {
                console.warn('Failed to load schedule view from storage', e);
            }
        }
        return defaultView;
    });

    const [internalSelectedGroupId, setInternalSelectedGroupId] = useState<string | null>(defaultGroupId);

    // Persist view changes
    useEffect(() => {
        if (enablePersistence) {
            try {
                storage.setItem(storageKey, internalViewMode);
            } catch (e) {
                console.warn('Failed to save schedule view to storage', e);
            }
        }
    }, [internalViewMode, enablePersistence, storageKey, storage]);

    const setDate = useCallback((date: Date) => {
        if (onDateChange) onDateChange(date);
        setInternalDate(date);
    }, [onDateChange]);

    const setViewMode = useCallback((mode: ViewMode) => {
        if (onViewChange) onViewChange(mode);
        setInternalViewMode(mode);
    }, [onViewChange]);

    const setSelectedGroupId = useCallback((groupId: string | null) => {
        if (onGroupChange) onGroupChange(groupId);
        setInternalSelectedGroupId(groupId);
    }, [onGroupChange]);

    const navigate = useCallback((direction: 'prev' | 'next') => {
        const newDate = navigateDate(internalDate, internalViewMode, direction);
        setDate(newDate);
    }, [internalDate, internalViewMode, setDate]);

    const goToToday = useCallback(() => {
        setDate(new Date());
    }, [setDate]);

    return {
        currentDate: internalDate,
        viewMode: internalViewMode,
        selectedGroupId: internalSelectedGroupId,
        setDate,
        setViewMode,
        setSelectedGroupId,
        navigate,
        goToToday,
    };
}
