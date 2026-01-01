import { useState, useMemo } from 'react';
import {
    RegularCalendar,
    EventModal,
    type ScheduleEvent,
    type EventFormData
} from 'regular-calendar';
import { useScheduleApi } from './useScheduleApi';
import type { AppSettings } from './useSettings';

interface Props {
    settings: AppSettings;
    additionalEvents?: ScheduleEvent[];
}

export function SmartRegularCalendar({ settings, additionalEvents = [] }: Props) {
    const {
        events,
        resources,
        groups,
        settings: apiSettings,
        loading,
        error,
        createEvent,
        updateEvent,
        deleteEvent,
        personnel,
    } = useScheduleApi();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState<ScheduleEvent | undefined>(undefined);
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);

    // Use only personnel events (additionalEvents) - don't mix with facility events
    const allEvents = useMemo(() => {
        return additionalEvents.map(e => ({
            ...e,
            isAllDay: e.isAllDay ?? e.extendedProps?.isAllDay ?? false
        }));
    }, [additionalEvents]);

    if (error) return <div className="p-4 text-red-500">Error: {error}</div>;
    if (!apiSettings || loading) return <div className="p-4">Loading schedule data...</div>;

    // Merge API settings with local settings
    const mergedSettings = {
        ...apiSettings,
        defaultDuration: 30, // Force 30 minute grid/slot duration
        weekStartsOn: settings.weekStartsOn,
        startTime: settings.businessHoursStart,
        endTime: settings.businessHoursEnd,
        timeZone: settings.timeZone,
    };

    const handleTimeSlotClick = (date: Date) => {
        setSelectedDate(date);
        setSelectedEvent(undefined);
        setIsModalOpen(true);
    };

    const handleEventClick = (event: ScheduleEvent) => {
        setSelectedEvent(event);
        setSelectedDate(undefined);
        setIsModalOpen(true);
    };

    const handleClose = () => {
        setIsModalOpen(false);
        setSelectedEvent(undefined);
        setSelectedDate(undefined);
    };

    const handleSave = async (data: EventFormData) => {
        try {
            if (selectedEvent) {
                await updateEvent(selectedEvent.id, data);
            } else {
                await createEvent(data);
            }
            handleClose();
        } catch (e) {
            console.error('Failed to save event', e);
            // Optionally show error toast
        }
    };

    const handleDelete = async () => {
        if (selectedEvent) {
            try {
                await deleteEvent(selectedEvent.id);
                handleClose();
            } catch (e) {
                console.error('Failed to delete event', e);
            }
        }
    };

    return (
        <>
            <RegularCalendar
                events={allEvents}
                settings={mergedSettings}
                isLoading={loading}
                onEventClick={handleEventClick}
                onTimeSlotClick={handleTimeSlotClick}
                onDateClick={handleTimeSlotClick}
                enablePersistence={true}
                defaultView="week"
                storageKey="regular-calendar-demo-view"
            />


            <EventModal
                isOpen={isModalOpen}
                onClose={handleClose}
                onSave={handleSave}
                onDelete={handleDelete}
                event={selectedEvent}
                defaultStartTime={selectedDate}
                resources={resources}
                groups={groups}
                events={events}
                personnel={personnel}
            />
        </>
    );
}

