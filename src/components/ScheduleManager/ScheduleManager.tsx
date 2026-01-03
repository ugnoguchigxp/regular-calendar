import { useState } from "react";
import { RegularCalendar } from "../../RegularCalendar/RegularCalendar";
import type * as RegularCalendarSchema from "../../RegularCalendar/RegularCalendar.schema";
import type { ScheduleEvent } from "../../FacilitySchedule/FacilitySchedule.schema";
import { DefaultEventModal } from "./DefaultEventModal/DefaultEventModal";
import type { SMEventFormData } from "./DefaultEventModal/useEventForm";
import type { ScheduleManagerProps } from "./types";

export function ScheduleManager({
    events,
    resources,
    groups,
    settings,
    isLoading,
    onEventCreate,
    onEventUpdate,
    onEventDelete,
    onToast,
    customFields,
    currentUserId,
    i18n: _i18n,
}: ScheduleManagerProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState<ScheduleEvent | undefined>(
        undefined,
    );
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);

    // Merge API settings with local defaults if needed
    // In this generic component, we rely on passed settings mostly.
    const calendarSettings = {
        ...settings,
        defaultDuration: 30, // Default duration if not specified
        // Ensure all required fields for RegularCalendar settings are present
    } as unknown as RegularCalendarSchema.FacilityScheduleSettings;

    // Cast events to Schema type (they should be compatible)
    const calendarEvents = events as unknown as RegularCalendarSchema.ScheduleEvent[];

    const handleTimeSlotClick = (date: Date) => {
        setSelectedDate(date);
        setSelectedEvent(undefined);
        setIsModalOpen(true);
    };

    const handleEventClick = (event: ScheduleEvent) => {
        // If the event object has different ID structure (e.g. recurrence), 
        // we pass it as is. processing is up to the parent.
        setSelectedEvent(event);
        setSelectedDate(undefined);
        setIsModalOpen(true);
    };

    const handleClose = () => {
        setIsModalOpen(false);
        setSelectedEvent(undefined);
        setSelectedDate(undefined);
    };

    const handleSave = async (data: SMEventFormData) => {
        try {
            if (selectedEvent) {
                await onEventUpdate(selectedEvent.id, data);
                onToast?.("Event updated successfully", "success");
            } else {
                await onEventCreate(data);
                onToast?.("Event created successfully", "success");
            }
            handleClose();
        } catch (e) {
            console.error("Failed to save event", e);
            onToast?.("Failed to save event", "error");
        }
    };

    const handleDelete = async (eventId: string) => {
        try {
            await onEventDelete(eventId);
            onToast?.("Event deleted successfully", "success");
            handleClose();
        } catch (e) {
            console.error("Failed to delete event", e);
            onToast?.("Failed to delete event", "error");
        }
    };

    return (
        <>
            <RegularCalendar
                events={calendarEvents}
                settings={calendarSettings}
                isLoading={isLoading}
                onEventClick={handleEventClick}
                onTimeSlotClick={handleTimeSlotClick}
                onDateClick={handleTimeSlotClick}
                enablePersistence={true}
                defaultView="week"
                storageKey="regular-calendar-view"
            />

            <DefaultEventModal
                isOpen={isModalOpen}
                onClose={handleClose}
                onSave={handleSave}
                onDelete={() => handleDelete(selectedEvent!.id)}
                event={selectedEvent}
                defaultStartTime={selectedDate}
                resources={resources}
                groups={groups}
                events={events}
                currentUserId={currentUserId}
                customFields={customFields}
            />
        </>
    );
}
