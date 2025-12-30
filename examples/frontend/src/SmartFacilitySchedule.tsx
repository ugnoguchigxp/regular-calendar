import { FacilitySchedule } from 'regular-calendar';
import { useScheduleApi } from './useScheduleApi';
import type { AppSettings } from './useSettings';
import { CustomEventModal } from './CustomEventModal';

interface Props {
    settings: AppSettings;
}

export function SmartFacilitySchedule({ settings }: Props) {
    const { events, resources, groups, settings: apiSettings, loading, error, createEvent, updateEvent, deleteEvent } = useScheduleApi();

    if (error) return <div className="p-4 text-red-500">Error: {error}</div>;
    if (!apiSettings || loading) return <div className="p-4">Loading schedule data...</div>;

    // Merge API settings with local settings
    const mergedSettings = {
        ...apiSettings,
        weekStartsOn: settings.weekStartsOn,
        startTime: settings.businessHoursStart,
        endTime: settings.businessHoursEnd,
    };

    return (
        <FacilitySchedule
            events={events}
            resources={resources}
            groups={groups}
            settings={mergedSettings}
            isLoading={loading}
            onEventCreate={createEvent}
            onEventUpdate={updateEvent}
            onEventDelete={deleteEvent}
            components={{
                EventModal: CustomEventModal
            }}
        />
    );
}
