import { useState } from 'react';
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
}

export function SmartRegularCalendar({ settings }: Props) {
    const {
        events,
        resources,
        groups,
        settings: apiSettings,
        loading,
        error,
        createEvent,
        updateEvent,
        deleteEvent
    } = useScheduleApi();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState<ScheduleEvent | undefined>(undefined);
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);

    if (error) return <div className="p-4 text-red-500">Error: {error}</div>;
    if (!apiSettings || loading) return <div className="p-4">Loading schedule data...</div>;

    // Merge API settings with local settings
    const mergedSettings = {
        ...apiSettings,
        weekStartsOn: settings.weekStartsOn,
        startTime: settings.businessHoursStart,
        endTime: settings.businessHoursEnd,
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
                events={events.map(e => ({
                    ...e,
                    // Ensure isAllDay is propagated from extendedProps if missing at root
                    isAllDay: e.isAllDay ?? e.extendedProps?.isAllDay ?? false
                }))}
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
            />
        </>
    );
}
