/**
 * ResourceColumn - Component for displaying a single resource column in Day view
 * Ported from PositionColumn.tsx
 */

import { Button } from '@/components/ui/Button';
import { useMemo, useRef } from 'react';
import type { Resource, ScheduleEvent } from '../../FacilitySchedule.schema';
import { hasTimeOverlap } from '../../utils/scheduleHelpers';
import { ScheduleEventCard } from './ScheduleEventCard';

interface ResourceColumnProps {
  resource: Resource;
  events: ScheduleEvent[];
  startTime: string; // "HH:mm"
  endTime: string; // "HH:mm"
  slotHeight: number; // pixels per hour
  onEventClick?: (event: ScheduleEvent) => void;
  onEmptySlotClick?: (resourceId: string, startTime: Date) => void;
}

interface EventWithLayout extends ScheduleEvent {
  column: number;
  totalColumns: number;
}

export function ResourceColumn({
  resource,
  events,
  startTime,
  endTime,
  slotHeight,
  onEventClick,
  onEmptySlotClick,
}: ResourceColumnProps) {
  // Duplicate logic from TimeGrid to ensure alignment
  const startParts = startTime.split(':');
  const endParts = endTime.split(':');
  const startHour = Number(startParts[0] ?? 0);
  const endHour = Number(endParts[0] ?? 23);

  const contentRef = useRef<HTMLDivElement>(null);

  const hours: number[] = [];
  for (let hour = startHour; hour <= endHour; hour++) {
    hours.push(hour);
  }

  const eventsWithLayout = useMemo((): EventWithLayout[] => {
    if (events.length === 0) return [];

    const sorted = [...events].sort((a, b) => a.startDate.getTime() - b.startDate.getTime());
    const groups: ScheduleEvent[][] = [];

    for (const event of sorted) {
      let foundGroup = false;

      for (const group of groups) {
        const overlapsWithGroup = group.some((e) => hasTimeOverlap(e, event));
        if (overlapsWithGroup) {
          group.push(event);
          foundGroup = true;
          break;
        }
      }

      if (!foundGroup) {
        groups.push([event]);
      }
    }

    const result: EventWithLayout[] = [];

    for (const group of groups) {
      if (group.length === 1) {
        const event = group[0];
        if (event) {
          result.push({
            ...event,
            column: 0,
            totalColumns: 1,
          });
        }
      } else {
        const maxColumns = Math.min(group.length, 4);

        for (let i = 0; i < group.length; i++) {
          const event = group[i];
          if (event) {
            result.push({
              ...event,
              column: i % maxColumns,
              totalColumns: maxColumns,
            });
          }
        }
      }
    }

    return result;
  }, [events]);

  function calculateCardPosition(eventWithLayout: EventWithLayout) {
    const event = eventWithLayout;
    const startH = event.startDate.getHours();
    const startM = event.startDate.getMinutes();
    const endH = event.endDate.getHours();
    const endM = event.endDate.getMinutes();

    const hoursFromStart = startH - startHour + startM / 60;

    let durationHours = endH - startH + (endM - startM) / 60;
    if (durationHours < 0) durationHours += 24;

    // No offset needed as this is relative to content container
    const top = hoursFromStart * slotHeight;
    const height = durationHours * slotHeight;

    const widthPercent = 100 / eventWithLayout.totalColumns;
    const leftPercent = (eventWithLayout.column * 100) / eventWithLayout.totalColumns;

    return { top, height, widthPercent, leftPercent };
  }

  function handleColumnClick(e: React.PointerEvent<HTMLDivElement>) {
    if (!onEmptySlotClick) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const clickY = e.clientY - rect.top; // Relative to content container
    const hoursFromStart = Math.max(0, clickY / slotHeight);

    const clickHour = Math.floor(startHour + hoursFromStart);
    const clickMinute = Math.round((hoursFromStart % 1) * 60);

    const clickDate = new Date();
    clickDate.setHours(clickHour, clickMinute, 0, 0);

    onEmptySlotClick(resource.id, clickDate);
  }

  function triggerColumnClickFromHeader() {
    if (!onEmptySlotClick) return;
    const clickDate = new Date();
    clickDate.setHours(startHour, 0, 0, 0);
    onEmptySlotClick(resource.id, clickDate);
  }

  return (
    <div className="flex-1 min-w-[90px] border-r border-border hover:bg-muted/5 flex flex-col">
      {/* Header */}
      <div className="h-[var(--ui-schedule-header-height)] border-b border-border bg-background flex items-center justify-center sticky top-0 z-20 shrink-0">
        <div className="text-center relative">
          <div className="font-semibold text-sm">{resource.name}</div>
          <div className="text-xs text-muted-foreground">{events.length} events</div>
          <Button
            type="button"
            variant="ghost"
            className="sr-only focus:not-sr-only focus:absolute focus:right-2 focus:top-2"
            onClick={(event) => {
              event.stopPropagation();
              triggerColumnClickFromHeader();
            }}
          >
            {`Add event to ${resource.name}`}
          </Button>
        </div>
      </div>

      {/* Content Container */}
      <div
        ref={contentRef}
        className="relative flex-1 w-full cursor-pointer"
        onPointerUp={handleColumnClick}
      >
        {/* Grid Lines Background */}
        <div className="absolute inset-0 z-0 pointer-events-none flex flex-col">
          {hours.map((hour) => (
            <div
              key={hour}
              className="border-b border-border/50 w-full"
              style={{ height: `${slotHeight}px` }}
            />
          ))}
        </div>

        {/* Events - positioned absolutely relative to content container */}
        <div className="relative w-full z-10">
          {eventsWithLayout.map((layoutEvent) => {
            const { top, height, widthPercent, leftPercent } = calculateCardPosition(layoutEvent);
            return (
              <ScheduleEventCard
                key={layoutEvent.id}
                event={layoutEvent}
                top={top}
                height={height}
                widthPercent={widthPercent}
                leftPercent={leftPercent}
                onClick={(e: React.MouseEvent) => {
                  e.stopPropagation();
                  onEventClick?.(layoutEvent);
                }}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
