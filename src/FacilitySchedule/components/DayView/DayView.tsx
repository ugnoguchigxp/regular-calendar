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
import { filterEventsByDay, sortEventsByTime } from '../../utils/scheduleHelpers';
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
  // Filter events for the day
  const dayEvents = useMemo(() => {
    const filtered = filterEventsByDay(events, currentDate);
    return sortEventsByTime(filtered);
  }, [events, currentDate]);

  // Indexing for performance
  const eventIndexes = useMemo(() => {
    return createEventIndexes(dayEvents);
  }, [dayEvents]);

  // Group by resource
  const eventsByResource = useMemo(() => {
    const map = new Map<string, ScheduleEvent[]>();

    for (const resource of resources) {
      const resourceEvents = getEventsByResource(resource.id, eventIndexes);
      map.set(resource.id, resourceEvents);
    }

    return map;
  }, [resources, eventIndexes]);

  // Calculate Grid Height
  const startParts = settings.startTime.split(':');
  const endParts = settings.endTime.split(':');
  const startHour = Number(startParts[0] ?? 0);
  const endHour = Number(endParts[0] ?? 23);
  const gridHeight = (endHour - startHour + 1) * DAY_VIEW.SLOT_HEIGHT + DAY_VIEW.HEADER_HEIGHT;

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
                startTime={settings.startTime}
                endTime={settings.endTime}
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
