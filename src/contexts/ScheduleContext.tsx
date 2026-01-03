import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useRef,
    useState,
    type ReactNode,
} from "react";
import type {
    EventData,
    ContextResourceAvailability,
    ScheduleApiClient,
    ScheduleContextType,
} from "./types";
import type {
    FacilityScheduleSettings,
    Resource,
    ResourceGroup,
    ScheduleEvent,
    Personnel,
} from "../FacilitySchedule/FacilitySchedule.schema";
import type { ResourceAvailabilityResponse } from "./types";

const ScheduleContext = createContext<ScheduleContextType | undefined>(
    undefined,
);

export function useScheduleContext() {
    const context = useContext(ScheduleContext);
    if (!context) {
        throw new Error(
            "useScheduleContext must be used within a ScheduleProvider",
        );
    }
    return context;
}

export interface ScheduleProviderProps {
    children: ReactNode;
    /** The API client implementation */
    apiClient: ScheduleApiClient;
    /** Optional error handler for mutations */
    onError?: (error: Error) => void;
}

export function ScheduleProvider({
    children,
    apiClient,
    onError,
}: ScheduleProviderProps) {
    // Use passed client
    const apiClientRef = useRef<ScheduleApiClient>(apiClient);

    // Update ref if client instance changes (rare but possible)
    useEffect(() => {
        apiClientRef.current = apiClient;
    }, [apiClient]);

    // Personnel promise cache (per-provider instance)
    const personnelPromiseRef = useRef<Promise<Personnel[]> | null>(null);

    const [events, setEvents] = useState<ScheduleEvent[]>([]);
    const [personnelEvents, setPersonnelEvents] = useState<ScheduleEvent[]>([]);
    const [resources, setResources] = useState<Resource[]>([]);
    const [groups, setGroups] = useState<ResourceGroup[]>([]);
    const [settings, setSettings] = useState<FacilityScheduleSettings | null>(
        null,
    );
    const [personnel, setPersonnel] = useState<Personnel[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Resource availability cache (key: YYYY-MM-DD_view)
    const [resourceAvailabilityCache, setResourceAvailabilityCache] = useState<
        Map<string, ResourceAvailabilityResponse[]>
    >(new Map());

    // Load initial data
    useEffect(() => {
        const loadData = async () => {
            if (!apiClient) {
                console.error("ScheduleProvider: apiClient is undefined. Cannot load data.");
                setLoading(false);
                return;
            }
            try {
                // Fetch config and events
                const configPromise = apiClient.getConfig();
                const eventsPromise = apiClient.getEvents();

                // Personnel (cached promise per provider)
                if (!personnelPromiseRef.current) {
                    personnelPromiseRef.current = apiClient
                        .getPersonnel()
                        .catch((err) => {
                            personnelPromiseRef.current = null;
                            throw err;
                        });
                }

                const [config, eventsData, personnelData] = await Promise.all([
                    configPromise,
                    eventsPromise,
                    personnelPromiseRef.current,
                ]);

                setGroups(config.groups);
                setResources(config.resources);
                setSettings(config.settings);

                // Filter resource-bound events if needed? 
                // Logic from example was: const resourceEvents = eventsData.filter((e) => !!e.resourceId);
                // We will keep it consistent.
                const resourceEvents = eventsData.filter((e) => !!e.resourceId);
                setEvents(resourceEvents);

                setPersonnel(personnelData);
            } catch (err) {
                console.error("Failed to load schedule data", err);
                setError(err instanceof Error ? err.message : "Unknown error");
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [apiClient]);

    // --- Events ---

    const createEvent = useCallback(
        async (data: EventData) => {
            if (!apiClient) {
                console.error("ScheduleProvider: apiClient is undefined. Cannot create event.");
                return;
            }
            try {
                const newEvent = await apiClient.createEvent(data);
                setEvents((prev) => [...prev, newEvent]);
                setPersonnelEvents((prev) => [...prev, newEvent]);
                setResourceAvailabilityCache(new Map()); // Clear cache
            } catch (err) {
                console.error("Failed to create event", err);
                const error = err instanceof Error ? err : new Error(String(err));
                onError?.(error);
                throw error;
            }
        },
        [apiClient],
    );

    const updateEvent = useCallback(
        async (id: string, data: Partial<EventData>) => {
            if (!apiClient) {
                console.error("ScheduleProvider: apiClient is undefined. Cannot update event.");
                return;
            }
            try {
                const updatedEvent = await apiClient.updateEvent(id, data);
                setEvents((prev) => prev.map((e) => (e.id === id ? updatedEvent : e)));
                setPersonnelEvents((prev) =>
                    prev.map((e) => (e.id === id ? updatedEvent : e)),
                );
                setResourceAvailabilityCache(new Map());
            } catch (err) {
                console.error("Failed to update event", err);
                const error = err instanceof Error ? err : new Error(String(err));
                onError?.(error);
                throw error;
            }
        },
        [apiClient],
    );

    const deleteEvent = useCallback(
        async (id: string) => {
            if (!apiClient) {
                console.error("ScheduleProvider: apiClient is undefined. Cannot delete event.");
                return;
            }
            try {
                await apiClient.deleteEvent(id);
                setEvents((prev) => prev.filter((e) => e.id !== id));
                setPersonnelEvents((prev) => prev.filter((e) => e.id !== id));
                setResourceAvailabilityCache(new Map());
            } catch (err) {
                console.error("Failed to delete event", err);
                const error = err instanceof Error ? err : new Error(String(err));
                onError?.(error);
                throw error;
            }
        },
        [apiClient],
    );

    // --- Groups ---

    const createGroup = useCallback(
        async (data: Partial<ResourceGroup>) => {
            const newGroup = await apiClient.createGroup(data);
            setGroups((prev) => [...prev, newGroup]);
            return newGroup;
        },
        [apiClient],
    );

    const updateGroup = useCallback(
        async (id: string, data: Partial<ResourceGroup>) => {
            const updated = await apiClient.updateGroup(id, data);
            setGroups((prev) => prev.map((g) => (g.id === id ? updated : g)));
            return updated;
        },
        [apiClient],
    );

    const deleteGroup = useCallback(
        async (id: string) => {
            await apiClient.deleteGroup(id);
            setGroups((prev) => prev.filter((g) => g.id !== id));
        },
        [apiClient],
    );

    // --- Resources ---

    const createResource = useCallback(
        async (data: Partial<Resource>) => {
            const newResource = await apiClient.createResource(data);
            setResources((prev) => [...prev, newResource]);
            return newResource;
        },
        [apiClient],
    );

    const updateResource = useCallback(
        async (id: string, data: Partial<Resource>) => {
            const updated = await apiClient.updateResource(id, data);
            setResources((prev) => prev.map((r) => (r.id === id ? updated : r)));
            return updated;
        },
        [apiClient],
    );

    const deleteResource = useCallback(
        async (id: string) => {
            await apiClient.deleteResource(id);
            setResources((prev) => prev.filter((r) => r.id !== id));
        },
        [apiClient],
    );

    // --- Personnel ---

    const updatePersonnelPriority = useCallback(
        async (id: string, priority: number) => {
            try {
                const updated = await apiClient.updatePersonnelPriority(id, priority);
                setPersonnel((prev) => {
                    const newList = prev.map((p) => (p.id === id ? updated : p));
                    newList.sort((a, b) => {
                        if (b.priority !== a.priority) return b.priority - a.priority;
                        return a.name.localeCompare(b.name, "ja");
                    });
                    return newList;
                });
            } catch (err) {
                console.error("Failed to update personnel priority", err);
                const error = err instanceof Error ? err : new Error(String(err));
                onError?.(error);
                throw error;
            }
        },
        [apiClient],
    );

    const fetchPersonnelEvents = useCallback(
        async (personnelIds: string[], append = false) => {
            if (!apiClient) {
                console.error("ScheduleProvider: apiClient is undefined. Cannot fetch personnel events.");
                return;
            }
            if (personnelIds.length === 0) {
                if (!append) setPersonnelEvents([]);
                return;
            }

            try {
                const eventsData = await apiClient.getEvents(personnelIds);

                if (append) {
                    setPersonnelEvents((prev) => {
                        const existingIds = new Set(prev.map((e) => e.id));
                        const newEvents = eventsData.filter((e) => !existingIds.has(e.id));
                        return [...prev, ...newEvents];
                    });
                } else {
                    setPersonnelEvents(eventsData);
                }
            } catch (err) {
                console.error("Failed to fetch personnel events", err);
                throw err;
            }
        },
        [apiClient],
    );

    // --- Resource Availability ---

    const getCacheKey = useCallback((date: Date, view: string): string => {
        const d = new Date(date);
        d.setHours(0, 0, 0, 0);
        return `${d.toISOString().split("T")[0]}_${view}`;
    }, []);

    const getResourceAvailabilityFromCache = useCallback(
        (
            date: Date,
            view: "day" | "week" | "month" = "day",
        ): ContextResourceAvailability[] | undefined => {
            const key = getCacheKey(date, view);
            const cached = resourceAvailabilityCache.get(key);
            return cached;
        },
        [resourceAvailabilityCache, getCacheKey],
    );

    const fetchResourceAvailability = useCallback(
        async (
            date: Date,
            view: "day" | "week" | "month" = "day",
        ): Promise<ContextResourceAvailability[]> => {
            const key = getCacheKey(date, view);

            const cached = resourceAvailabilityCache.get(key);
            if (cached) {
                return cached;
            }

            try {
                const availability = await apiClient.getResourceAvailability({
                    date,
                    view,
                });

                setResourceAvailabilityCache((prev) => {
                    const newCache = new Map(prev);
                    newCache.set(key, availability);
                    return newCache;
                });

                return availability;
            } catch (err) {
                console.error("Failed to fetch resource availability", err);
                return [];
            }
        },
        [resourceAvailabilityCache, apiClient, getCacheKey],
    );

    const value: ScheduleContextType = {
        events,
        personnelEvents,
        resources,
        groups,
        settings,
        personnel,
        loading,
        error,
        createEvent,
        updateEvent,
        deleteEvent,
        createGroup,
        updateGroup,
        deleteGroup,
        createResource,
        updateResource,
        deleteResource,
        updatePersonnelPriority,
        fetchPersonnelEvents,
        fetchResourceAvailability,
        getResourceAvailabilityFromCache,
    };

    return (
        <ScheduleContext.Provider value={value}>
            {children}
        </ScheduleContext.Provider>
    );
}
