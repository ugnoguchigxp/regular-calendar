/**
 * WeekView - Week View Component
 * Horizontal: Resources
 * Vertical: Days (7 days)
 * Max 4 events per cell
 */

import { Button } from '@/components/ui/Button';
import { DateDisplay } from '@/components/ui/DateDisplay';

import { useMemo } from 'react';
import type {
  FacilityScheduleSettings,
  Resource,
  ResourceGroup,
  ScheduleEvent,
} from '../../FacilitySchedule.schema';
import { WEEK_VIEW } from '../../constants';
import {
  filterEventsByDateRange,
  filterEventsByResource,
  generateDateRange,
  sortEventsByTime,
} from '../../utils/scheduleHelpers';
import {
  createEventIndexes,
  getDayKey,
  getEventsByDay,
} from '../../utils/scheduleIndexHelpers';
import { isClosedDay } from '../../utils/timeSlotHelpers';

interface WeekViewProps {
  weekStart: Date;
  resources: Resource[];
  events: ScheduleEvent[];
  settings: FacilityScheduleSettings;
  groups?: ResourceGroup[];
  onEventClick?: (event: ScheduleEvent) => void;
  onEmptySlotClick?: (resourceId: string, date: Date) => void;
}

export function WeekView({
  weekStart,
  resources,
  events,
  settings,
  groups = [],
  onEventClick,
  onEmptySlotClick,
}: WeekViewProps) {
  const normalizedWeekStart = useMemo(() => {
    const start = new Date(weekStart);
    start.setHours(0, 0, 0, 0);
    return start;
  }, [weekStart]);

  const weekEndInclusive = useMemo(() => {
    const end = new Date(normalizedWeekStart);
    end.setDate(end.getDate() + 6);
    end.setHours(0, 0, 0, 0);
    return end;
  }, [normalizedWeekStart]);

  const weekEndExclusive = useMemo(() => {
    const end = new Date(weekEndInclusive);
    end.setDate(end.getDate() + 1);
    end.setHours(0, 0, 0, 0);
    return end;
  }, [weekEndInclusive]);

  // Map groups for lookup
  const groupMap = useMemo(() => {
    const map = new Map<string, ResourceGroup>();
    for (const g of groups) {
      map.set(g.id, g);
    }
    return map;
  }, [groups]);

  const weekDays = useMemo(() => {
    return generateDateRange(normalizedWeekStart, weekEndInclusive);
  }, [normalizedWeekStart, weekEndInclusive]);

  const weekEvents = useMemo(() => {
    const filtered = filterEventsByDateRange(events, normalizedWeekStart, weekEndExclusive);
    return sortEventsByTime(filtered);
  }, [events, normalizedWeekStart, weekEndExclusive]);

  const eventIndexes = useMemo(() => {
    return createEventIndexes(weekEvents);
  }, [weekEvents]);

  const eventsByDay = useMemo(() => {
    const map = new Map<string, ScheduleEvent[]>();
    for (const day of weekDays) {
      // Sort: AllDay first, then by time
      const dayEvents = getEventsByDay(day, eventIndexes).sort((a, b) => {
        if (a.isAllDay && !b.isAllDay) return -1;
        if (!a.isAllDay && b.isAllDay) return 1;
        return a.startDate.getTime() - b.startDate.getTime();
      });
      const key = getDayKey(day);
      map.set(key, dayEvents);
    }
    return map;
  }, [weekDays, eventIndexes]);

  const today = useMemo(() => {
    const t = new Date();
    t.setHours(0, 0, 0, 0);
    return t;
  }, []);

  return (
    <div className="flex flex-col h-full">
      {/* Header (Desktop) */}
      <div className="hidden md:block border-b border-border bg-background px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold">
              <DateDisplay date={normalizedWeekStart} variant="date" />
              {' - '}
              {weekDays[6] && <DateDisplay date={weekDays[6]} variant="monthDay" />}
            </h2>
            <div className="text-sm text-muted-foreground mt-1">
              Events: {weekEvents.length} / Resources: {resources.length}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="flex flex-col">
          {/* Header Row (Resources) */}
          <div className="flex border-b border-border bg-background sticky top-0 z-20">
            <div
              className="flex-shrink-0 border-r border-border px-1 py-2"
              style={{ width: `${WEEK_VIEW.DATE_COLUMN_WIDTH}px` }}
            >
              {/* Corner */}
            </div>
            {resources.map((resource) => {
              const group = groupMap.get(resource.groupId);
              return (
                <div
                  key={resource.id}
                  className="flex-1 border-r border-border px-1 py-2 text-center overflow-hidden min-w-[80px]"
                >
                  <div className="font-semibold text-xs leading-tight truncate" title={resource.name}>
                    {resource.name}
                  </div>
                  <div className="text-[10px] text-muted-foreground leading-tight truncate">
                    {group?.name || '-'}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Day Rows */}
          {weekDays.map((day) => {
            const normalizedDay = new Date(day);
            normalizedDay.setHours(0, 0, 0, 0);
            const isToday = normalizedDay.getTime() === today.getTime();
            const isClosed = isClosedDay(day, settings.closedDays);

            const dateCellBgClass = isClosed ? 'bg-muted' : isToday ? 'bg-background' : 'bg-card';
            const scheduleCellBgClass = isClosed
              ? 'bg-muted'
              : isToday
                ? 'bg-background'
                : 'bg-card';
            const scheduleCellInteractiveClass = isClosed
              ? 'cursor-not-allowed opacity-60'
              : 'cursor-pointer hover:bg-accent';

            const dayKey = getDayKey(day);
            const eventsForDay = eventsByDay.get(dayKey) ?? [];

            return (
              <div key={day.toISOString()} className="flex border-b border-border">
                {/* Date Cell */}
                <div
                  className={`flex-shrink-0 border-r border-border px-1 py-2 flex items-center justify-center ${dateCellBgClass}`}
                  style={{
                    width: `${WEEK_VIEW.DATE_COLUMN_WIDTH}px`,
                    height: `${WEEK_VIEW.DAY_CELL_HEIGHT}px`,
                  }}
                >
                  <div className="text-center">
                    <div className="font-semibold text-xs leading-tight whitespace-pre-line">
                      <DateDisplay date={day} variant="compact" />
                    </div>
                    {isClosed && <div className="text-[10px] text-warning mt-1">Off</div>}
                  </div>
                </div>

                {/* Resource Cells */}
                {resources.map((resource) => {
                  const cellEvents = filterEventsByResource(eventsForDay, resource.id);

                  return (
                    <div
                      key={resource.id}
                      className={`relative flex-1 border-r border-border p-0.5 ${scheduleCellBgClass} ${scheduleCellInteractiveClass} transition-colors overflow-hidden min-w-[80px]`}
                      style={{
                        height: `${WEEK_VIEW.DAY_CELL_HEIGHT}px`,
                      }}
                      onPointerUp={() => {
                        if (!isClosed && onEmptySlotClick) {
                          onEmptySlotClick(resource.id, day);
                        }
                      }}
                    >
                      {!isClosed && (
                        <Button
                          type="button"
                          variant="ghost"
                          className="sr-only focus:not-sr-only focus:absolute focus:right-1 focus:top-1"
                          onClick={(event) => {
                            event.stopPropagation();
                            onEmptySlotClick?.(resource.id, day);
                          }}
                        >
                          Add
                        </Button>
                      )}
                      <div className="flex flex-col gap-0 h-full overflow-hidden">
                        {cellEvents.slice(0, WEEK_VIEW.MAX_VISIBLE_EVENTS).map((event) => {
                          const bgColor = event.hasConflict
                            ? 'bg-destructive'
                            : event.color ? '' : 'bg-primary';
                          const customStyle = event.color && !event.hasConflict ? { backgroundColor: event.color } : {};

                          const startTime = event.startDate.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' });

                          return (
                            <button
                              key={event.id}
                              type="button"
                              className={`${bgColor} text-primary-foreground px-1.5 py-0.5 rounded text-sm cursor-pointer hover:brightness-110 transition-colors text-left leading-normal truncate w-full mb-0.5`}
                              style={customStyle}
                              onClick={(e) => {
                                e.stopPropagation();
                                onEventClick?.(event);
                              }}
                              onPointerUp={(e) => {
                                e.stopPropagation();
                              }}
                            >
                              <span className="font-medium">
                                {event.hasConflict && '⚠️ '}
                                {!event.isAllDay && startTime + ' '}
                                {event.title}
                              </span>
                            </button>
                          );
                        })}
                        {cellEvents.length > WEEK_VIEW.MAX_VISIBLE_EVENTS && (
                          <div className="text-[9px] text-muted-foreground text-center">
                            +{cellEvents.length - WEEK_VIEW.MAX_VISIBLE_EVENTS}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
