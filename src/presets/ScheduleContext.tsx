import { createContext, useContext, useState, useEffect, useCallback, useRef, type ReactNode } from 'react';
import type {
    FacilityScheduleSettings,
    Resource,
    ResourceGroup,
    ScheduleEvent
} from '../FacilitySchedule/FacilitySchedule.schema';
import { type ResourceAvailabilityInfo } from '../FacilitySchedule/utils/resourceAvailability';
import type { Personnel } from '../PersonnelPanel/PersonnelPanel.schema';
import { createScheduleApiClient, type ScheduleApiClient } from './api';
import type { ResourceAvailabilityResponse } from './utils/transformBookings';

export interface ScheduleContextType {
    events: ScheduleEvent[];
    personnelEvents: ScheduleEvent[];
    resources: Resource[];
    groups: ResourceGroup[];
    settings: FacilityScheduleSettings | null;
    personnel: Personnel[];
    loading: boolean;
    error: string | null;

    createEvent: (data: any) => Promise<void>;
    updateEvent: (id: string, data: any) => Promise<void>;
    deleteEvent: (id: string) => Promise<void>;

    createGroup: (data: Partial<ResourceGroup>) => Promise<ResourceGroup>;
    updateGroup: (id: string, data: Partial<ResourceGroup>) => Promise<ResourceGroup>;
    deleteGroup: (id: string) => Promise<void>;

    createResource: (data: Partial<Resource>) => Promise<Resource>;
    updateResource: (id: string, data: Partial<Resource>) => Promise<Resource>;
    deleteResource: (id: string) => Promise<void>;

    updatePersonnelPriority: (id: string, priority: number) => Promise<void>;
    fetchPersonnelEvents: (personnelIds: string[], append?: boolean) => Promise<void>;
    fetchResourceAvailability: (date: Date, view?: 'day' | 'week' | 'month') => Promise<ResourceAvailabilityInfo[]>;
    getResourceAvailabilityFromCache: (date: Date, view?: 'day' | 'week' | 'month') => ResourceAvailabilityInfo[] | undefined;
}

const ScheduleContext = createContext<ScheduleContextType | undefined>(undefined);

export function useScheduleContext() {
    const context = useContext(ScheduleContext);
    if (!context) {
        throw new Error('useScheduleContext must be used within a ScheduleProvider');
    }
    return context;
}

export interface ScheduleProviderProps {
    children: ReactNode;
    /** Base URL for API endpoints (default: '/api') */
    apiBaseUrl?: string;
    /** Custom API client for testing or custom implementations */
    apiClient?: ScheduleApiClient;
}

export function ScheduleProvider({
    children,
    apiBaseUrl = '/api',
    apiClient: customApiClient
}: ScheduleProviderProps) {
    // Use custom client or create default
    const apiClientRef = useRef<ScheduleApiClient>(
        customApiClient || createScheduleApiClient(apiBaseUrl)
    );
    const apiClient = apiClientRef.current;

    // Personnel promise cache (per-provider instance, not global)
    const personnelPromiseRef = useRef<Promise<Personnel[]> | null>(null);

    const [events, setEvents] = useState<ScheduleEvent[]>([]);
    const [personnelEvents, setPersonnelEvents] = useState<ScheduleEvent[]>([]);
    const [resources, setResources] = useState<Resource[]>([]);
    const [groups, setGroups] = useState<ResourceGroup[]>([]);
    const [settings, setSettings] = useState<FacilityScheduleSettings | null>(null);
    const [personnel, setPersonnel] = useState<Personnel[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Resource availability cache (key: YYYY-MM-DD_view)
    const [resourceAvailabilityCache, setResourceAvailabilityCache] = useState<Map<string, ResourceAvailabilityResponse[]>>(new Map());

    // Load initial data
    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);

                // Fetch config and events
                const configPromise = apiClient.getConfig();
                const eventsPromise = apiClient.getEvents();

                // Personnel (cached promise per provider)
                if (!personnelPromiseRef.current) {
                    personnelPromiseRef.current = apiClient.getPersonnel().catch(err => {
                        personnelPromiseRef.current = null;
                        throw err;
                    });
                }

                const [config, eventsData, personnelData] = await Promise.all([
                    configPromise,
                    eventsPromise,
                    personnelPromiseRef.current
                ]);

                setGroups(config.groups);
                setResources(config.resources);
                setSettings(config.settings);

                // Filter resource-bound events
                const resourceEvents = eventsData.filter(e => !!e.resourceId);
                setEvents(resourceEvents);

                console.log('Personnel loaded:', personnelData.length, 'people');
                setPersonnel(personnelData);
            } catch (err) {
                console.error('Failed to load schedule data', err);
                setError(err instanceof Error ? err.message : 'Unknown error');
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [apiClient]);

    // --- Events ---

    const createEvent = useCallback(async (data: any) => {
        try {
            const newEvent = await apiClient.createEvent(data);
            setEvents(prev => [...prev, newEvent]);
            setPersonnelEvents(prev => [...prev, newEvent]);
            setResourceAvailabilityCache(new Map()); // Clear cache
        } catch (err) {
            alert('Failed to create event');
        }
    }, [apiClient]);

    const updateEvent = useCallback(async (id: string, data: any) => {
        try {
            const updated = await apiClient.updateEvent(id, data);
            setEvents(prev => prev.map(e => e.id === id ? updated : e));
            setPersonnelEvents(prev => prev.map(e => e.id === id ? updated : e));
            setResourceAvailabilityCache(new Map());
        } catch (err) {
            alert('Failed to update event');
        }
    }, [apiClient]);

    const deleteEvent = useCallback(async (id: string) => {
        try {
            await apiClient.deleteEvent(id);
            setEvents(prev => prev.filter(e => e.id !== id));
            setPersonnelEvents(prev => prev.filter(e => e.id !== id));
            setResourceAvailabilityCache(new Map());
        } catch (err) {
            alert('Failed to delete event');
        }
    }, [apiClient]);

    // --- Groups ---

    const createGroup = useCallback(async (data: Partial<ResourceGroup>) => {
        const newGroup = await apiClient.createGroup(data);
        setGroups(prev => [...prev, newGroup]);
        return newGroup;
    }, [apiClient]);

    const updateGroup = useCallback(async (id: string, data: Partial<ResourceGroup>) => {
        const updated = await apiClient.updateGroup(id, data);
        setGroups(prev => prev.map(g => g.id === id ? updated : g));
        return updated;
    }, [apiClient]);

    const deleteGroup = useCallback(async (id: string) => {
        await apiClient.deleteGroup(id);
        setGroups(prev => prev.filter(g => g.id !== id));
    }, [apiClient]);

    // --- Resources ---

    const createResource = useCallback(async (data: Partial<Resource>) => {
        const newResource = await apiClient.createResource(data);
        setResources(prev => [...prev, newResource]);
        return newResource;
    }, [apiClient]);

    const updateResource = useCallback(async (id: string, data: Partial<Resource>) => {
        const updated = await apiClient.updateResource(id, data);
        setResources(prev => prev.map(r => r.id === id ? updated : r));
        return updated;
    }, [apiClient]);

    const deleteResource = useCallback(async (id: string) => {
        await apiClient.deleteResource(id);
        setResources(prev => prev.filter(r => r.id !== id));
    }, [apiClient]);

    // --- Personnel ---

    const updatePersonnelPriority = useCallback(async (id: string, priority: number) => {
        try {
            const updated = await apiClient.updatePersonnelPriority(id, priority);
            setPersonnel(prev => {
                const newList = prev.map(p => p.id === id ? updated : p);
                newList.sort((a, b) => {
                    if (b.priority !== a.priority) return b.priority - a.priority;
                    return a.name.localeCompare(b.name, 'ja');
                });
                return newList;
            });
        } catch (err) {
            console.error('Failed to update personnel priority', err);
        }
    }, [apiClient]);

    const fetchPersonnelEvents = useCallback(async (personnelIds: string[], append = false) => {
        if (personnelIds.length === 0) {
            if (!append) setPersonnelEvents([]);
            return;
        }

        try {
            const eventsData = await apiClient.getEvents(personnelIds);

            if (append) {
                setPersonnelEvents(prev => {
                    const existingIds = new Set(prev.map(e => e.id));
                    const newEvents = eventsData.filter(e => !existingIds.has(e.id));
                    return [...prev, ...newEvents];
                });
            } else {
                setPersonnelEvents(eventsData);
            }
        } catch (err) {
            console.error('Failed to fetch personnel events', err);
        }
    }, [apiClient]);

    // --- Resource Availability ---

    const getCacheKey = (date: Date, view: string): string => {
        const d = new Date(date);
        d.setHours(0, 0, 0, 0);
        return `${d.toISOString().split('T')[0]}_${view}`;
    };

    const getResourceAvailabilityFromCache = useCallback((date: Date, view: 'day' | 'week' | 'month' = 'day'): ResourceAvailabilityInfo[] | undefined => {
        const key = getCacheKey(date, view);
        const cached = resourceAvailabilityCache.get(key);
        return cached as unknown as ResourceAvailabilityInfo[] | undefined;
    }, [resourceAvailabilityCache]);

    const fetchResourceAvailability = useCallback(async (date: Date, view: 'day' | 'week' | 'month' = 'day'): Promise<ResourceAvailabilityInfo[]> => {
        const key = getCacheKey(date, view);

        const cached = resourceAvailabilityCache.get(key);
        if (cached) {
            console.log(`[ScheduleContext] Using cached availability for ${key}`);
            return cached as unknown as ResourceAvailabilityInfo[];
        }

        try {
            console.log(`[ScheduleContext] Fetching availability for ${key}`);
            const availability = await apiClient.getResourceAvailability({ date, view });

            setResourceAvailabilityCache(prev => {
                const newCache = new Map(prev);
                newCache.set(key, availability);
                return newCache;
            });

            return availability as unknown as ResourceAvailabilityInfo[];
        } catch (err) {
            console.error('Failed to fetch resource availability', err);
            return [];
        }
    }, [resourceAvailabilityCache, apiClient]);

    const value: ScheduleContextType = {
        events, personnelEvents, resources, groups, settings, personnel, loading, error,
        createEvent, updateEvent, deleteEvent,
        createGroup, updateGroup, deleteGroup,
        createResource, updateResource, deleteResource,
        updatePersonnelPriority, fetchPersonnelEvents,
        fetchResourceAvailability, getResourceAvailabilityFromCache,
    };

    return (
        <ScheduleContext.Provider value={value}>
            {children}
        </ScheduleContext.Provider>
    );
}
