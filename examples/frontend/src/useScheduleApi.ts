import { useState, useEffect, useCallback } from 'react';
// Import types directly from source to avoid type resolution issues during dev
// In a real app, these would come from the package d.ts
import type {
    FacilityScheduleSettings,
    Resource,
    ResourceGroup,
    ScheduleEvent
} from '../../../src/FacilitySchedule/FacilitySchedule.schema';
import type { Personnel } from '../../../src/PersonnelPanel/PersonnelPanel.schema';

const API_URL = '/api';

export function useScheduleApi() {
    const [events, setEvents] = useState<ScheduleEvent[]>([]);
    const [personnelEvents, setPersonnelEvents] = useState<ScheduleEvent[]>([]);
    const [resources, setResources] = useState<Resource[]>([]);
    const [groups, setGroups] = useState<ResourceGroup[]>([]);
    const [settings, setSettings] = useState<FacilityScheduleSettings | null>(null);
    const [personnel, setPersonnel] = useState<Personnel[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);
                const configRes = await fetch(`${API_URL}/config`);
                const config = await configRes.json();

                setGroups(config.groups);
                setResources(config.resources);
                setSettings(config.settings);

                const eventsRes = await fetch(`${API_URL}/events`);
                const eventsData = await eventsRes.json();
                const parsedEvents = eventsData.map((e: any) => ({
                    ...e,
                    startDate: new Date(e.startDate),
                    endDate: new Date(e.endDate),
                }));
                setEvents(parsedEvents);

                // Load personnel
                const personnelRes = await fetch(`${API_URL}/personnel`);
                const personnelData = await personnelRes.json();
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
    }, []);

    const createEvent = async (data: any) => {
        try {
            const res = await fetch(`${API_URL}/events`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            const newEvent = await res.json();
            setEvents(prev => [...prev, {
                ...newEvent,
                startDate: new Date(newEvent.startDate),
                endDate: new Date(newEvent.endDate),
            }]);
        } catch (err) {
            alert('Failed to create event');
        }
    };

    const updateEvent = async (id: string, data: any) => {
        try {
            const res = await fetch(`${API_URL}/events/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            const updated = await res.json();
            setEvents(prev => prev.map(e => e.id === id ? {
                ...updated,
                startDate: new Date(updated.startDate),
                endDate: new Date(updated.endDate),
            } : e));
        } catch (err) {
            alert('Failed to update event');
        }
    };

    const deleteEvent = async (id: string) => {
        try {
            await fetch(`${API_URL}/events/${id}`, { method: 'DELETE' });
            setEvents(prev => prev.filter(e => e.id !== id));
        } catch (err) {
            alert('Failed to delete event');
        }
    };

    // --- Groups ---

    const createGroup = async (data: Partial<ResourceGroup>) => {
        try {
            const res = await fetch(`${API_URL}/groups`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            const newGroup = await res.json();
            setGroups(prev => [...prev, newGroup]);
            return newGroup;
        } catch (err) {
            console.error('Failed to create group', err);
            throw err;
        }
    };

    const updateGroup = async (id: string, data: Partial<ResourceGroup>) => {
        try {
            const res = await fetch(`${API_URL}/groups/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            const updated = await res.json();
            setGroups(prev => prev.map(g => g.id === id ? updated : g));
            return updated;
        } catch (err) {
            console.error('Failed to update group', err);
            throw err;
        }
    };

    const deleteGroup = async (id: string) => {
        try {
            await fetch(`${API_URL}/groups/${id}`, { method: 'DELETE' });
            setGroups(prev => prev.filter(g => g.id !== id));
        } catch (err) {
            console.error('Failed to delete group', err);
            throw err;
        }
    };

    // --- Resources ---

    const createResource = async (data: Partial<Resource>) => {
        try {
            const res = await fetch(`${API_URL}/resources`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            const newResource = await res.json();
            setResources(prev => [...prev, newResource]);
            return newResource;
        } catch (err) {
            console.error('Failed to create resource', err);
            throw err;
        }
    };

    const updateResource = async (id: string, data: Partial<Resource>) => {
        try {
            const res = await fetch(`${API_URL}/resources/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            const updated = await res.json();
            setResources(prev => prev.map(r => r.id === id ? updated : r));
            return updated;
        } catch (err) {
            console.error('Failed to update resource', err);
            throw err;
        }
    };

    const deleteResource = async (id: string) => {
        try {
            await fetch(`${API_URL}/resources/${id}`, { method: 'DELETE' });
            setResources(prev => prev.filter(r => r.id !== id));
        } catch (err) {
            console.error('Failed to delete resource', err);
            throw err;
        }
    };

    // --- Personnel ---

    const updatePersonnelPriority = async (id: string, priority: number) => {
        try {
            const res = await fetch(`${API_URL}/personnel/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ priority }),
            });
            const updated = await res.json();
            setPersonnel(prev => {
                const newList = prev.map(p => p.id === id ? updated : p);
                // Re-sort by priority
                newList.sort((a, b) => {
                    if (b.priority !== a.priority) return b.priority - a.priority;
                    return a.name.localeCompare(b.name, 'ja');
                });
                return newList;
            });
        } catch (err) {
            console.error('Failed to update personnel priority', err);
        }
    };

    // Fetch events for selected personnel
    // append = true: add to existing events, false: replace all events
    const fetchPersonnelEvents = useCallback(async (personnelIds: string[], append = false) => {
        if (personnelIds.length === 0) {
            if (!append) {
                setPersonnelEvents([]);
            }
            return;
        }

        try {
            const res = await fetch(`${API_URL}/events?personnelIds=${personnelIds.join(',')}`);
            const eventsData = await res.json();
            const parsedEvents = eventsData.map((e: any) => ({
                ...e,
                startDate: new Date(e.startDate),
                endDate: new Date(e.endDate),
            }));

            if (append) {
                // Append new events, avoiding duplicates by ID
                setPersonnelEvents(prev => {
                    const existingIds = new Set(prev.map(e => e.id));
                    const newEvents = parsedEvents.filter((e: any) => !existingIds.has(e.id));
                    return [...prev, ...newEvents];
                });
            } else {
                setPersonnelEvents(parsedEvents);
            }
        } catch (err) {
            console.error('Failed to fetch personnel events', err);
        }
    }, []);

    return {
        events, personnelEvents, resources, groups, settings, personnel, loading, error,
        createEvent, updateEvent, deleteEvent,
        createGroup, updateGroup, deleteGroup,
        createResource, updateResource, deleteResource,
        updatePersonnelPriority, fetchPersonnelEvents,
    };
}
