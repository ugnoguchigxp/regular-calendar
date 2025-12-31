/**
 * DayView - Day View Component
 */

import { useMemo } from 'react';
import type {
  FacilityScheduleSettings,
  Resource,
  ScheduleEvent,
} from '../../FacilitySchedule.schema';
import { DAY_VIEW } from '../../constants';
import { sortEventsByTime } from '../../utils/scheduleHelpers';
import { createEventIndexes, getEventsByResource } from '../../utils/scheduleIndexHelpers';
import { ResourceColumn } from './ResourceColumn';
import { TimeGrid } from './TimeGrid';

export interface DayViewProps {
  currentDate: Date; // Renamed from date to match FacilitySchedule props
  resources: Resource[];
  events: ScheduleEvent[];
  settings: FacilityScheduleSettings;
  onEventClick?: (event: ScheduleEvent) => void;
  onEmptySlotClick?: (resourceId: string, startTime: Date) => void;
}

export function DayView({
  currentDate,
  resources,
  events,
  settings,
  onEventClick,
  onEmptySlotClick,
}: DayViewProps) {
  // Calculate Grid Height and Hours
  const startParts = settings.startTime.split(':');
  const endParts = settings.endTime.split(':');
  const startHour = Number(startParts[0] ?? 0);
  const endHour = Number(endParts[0] ?? 23);
  const gridHeight = (endHour - startHour + 1) * DAY_VIEW.SLOT_HEIGHT + DAY_VIEW.HEADER_HEIGHT;

  // Filter events for the day with support for extended hours
  const { allDayEvents, timedEvents } = useMemo(() => {
    // Determine view range
    const viewStart = new Date(currentDate);
    viewStart.setHours(0, 0, 0, 0);

    const viewEnd = new Date(currentDate);
    // If endHour > 23, we extend to next day(s)
    if (endHour > 23) {
      viewEnd.setHours(endHour, 59, 59, 999);
    } else {
      viewEnd.setHours(23, 59, 59, 999);
    }

    const filtered = events.filter((e) => {
      return e.startDate < viewEnd && e.endDate > viewStart;
    });

    const sorted = sortEventsByTime(filtered);

    return {
      allDayEvents: sorted.filter(e => e.isAllDay),
      timedEvents: sorted.filter(e => !e.isAllDay)
    };
  }, [events, currentDate, startHour, endHour]);

  // Indexing for performance
  const eventIndexes = useMemo(() => {
    return createEventIndexes(timedEvents);
  }, [timedEvents]);

  // Group by resource
  const eventsByResource = useMemo(() => {
    const map = new Map<string, ScheduleEvent[]>();

    for (const resource of resources) {
      const resourceEvents = getEventsByResource(resource.id, eventIndexes);
      map.set(resource.id, resourceEvents);
    }

    return map;
  }, [resources, eventIndexes]);

  return (
    <div className="flex flex-col h-full">


      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto">
        <div className="flex" style={{ minHeight: `${gridHeight}px` }}>
          {/* Time Column */}
          <div
            className="sticky left-0 z-30 bg-background"
            style={{ width: `${DAY_VIEW.TIME_COLUMN_WIDTH}px` }}
          >
            <TimeGrid
              startTime={settings.startTime}
              endTime={settings.endTime}
              slotHeight={DAY_VIEW.SLOT_HEIGHT}
            />
          </div>

          {/* Resource Columns */}
          <div className="flex flex-1">
            {resources.map((resource) => (
              <ResourceColumn
                key={resource.id}
                resource={resource}
                events={eventsByResource.get(resource.id) || []}
                allDayEvents={
                  allDayEvents.filter(e => e.resourceId === resource.id)
                }
                startTime={settings.startTime}
                endTime={settings.endTime}
                currentDate={currentDate}
                slotHeight={DAY_VIEW.SLOT_HEIGHT}
                onEventClick={onEventClick}
                onEmptySlotClick={onEmptySlotClick}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
